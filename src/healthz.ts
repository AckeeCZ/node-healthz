import * as express from 'express';
import * as url from 'url';
import knex from './adapters/knex';
import mongoose from './adapters/mongoose';

export interface AdapterOptions {
    type?: AdapterType;
    adapter?: any;
    crucial: boolean;
    customCheck?: Check;
    check?: Check;
    timeout: number;
    ignoreResult: boolean,
}

export type AdapterType = 'knex' | 'mongoose';
export const AdapterType = {
    Knex: 'knex' as AdapterType,
    Mongoose: 'mongoose' as AdapterType,
};

export interface Health {
    tldr: HealthState;
}

export type HealthState = 'OK' | 'NOT_OK' | 'UNKNOWN' | 'TIMEOUT' | 'ERROR';
export const HealthState = {
    OK: 'OK' as HealthState,
    NOT_OK: 'NOT_OK' as HealthState,
    UNKNOWN: 'UNKNOWN' as HealthState,
    TIMEOUT: 'TIMEOUT' as HealthState,
    ERROR: 'ERROR' as HealthState,
};

export interface HealthzDefinition {
    [key: string]: Partial<AdapterOptions>;
};

export interface HealthzOptions {
    timeout: number;
    ignoreResults: boolean,
}

const defaults: HealthzOptions = {
    timeout: 5000,
    ignoreResults: true,
};


const stopwatch = {
    // see https://nodejs.org/api/process.html#process_process_hrtime_time for details
    start: () => {
        return <[number, number]>process.hrtime();
    },
    stop: (te: [number, number]): number => {
        const t = process.hrtime(te);
        return (t[0] + t[1] * 1e-9) * 1e3;
    },
};
const ms = (t: number) => `${Math.round(t)}ms`;

const adapterMap = {
    [AdapterType.Knex]: knex,
    [AdapterType.Mongoose]: mongoose,
};

export type Check = ((adapterOptions: AdapterOptions) => any)
    // | ((adapter: any, adapterOptions: AdapterOptions) => any);

export interface CheckResult {
    name: string;
    result: null | any;
    error: null | string;
    t: null | string | number[];
    health: HealthState,
}

const getChecker = (adapterOptions: Partial<AdapterOptions>, healthzOptions: HealthzOptions) => {
    const adapterOpts: AdapterOptions = {
        timeout: healthzOptions.timeout,
        crucial: false,
        ignoreResult: healthzOptions.ignoreResults,
        ...(adapterOptions || {}),
    };

    const check = (() => {
        if (adapterMap[adapterOptions.type!]) {
            return () => adapterMap[adapterOptions.type!](adapterOptions.adapter, adapterOpts);
        }
        if (adapterOptions.customCheck) {
            return () => adapterOptions.customCheck!(adapterOpts);
        }
        if (adapterOptions.check) {
            return () => adapterOptions.check!(adapterOpts);
        }
        throw new TypeError('Unsupported adapter type and no custom `check` function supplied');
    })();
    if (!adapterOpts.ignoreResult) {
        return check;
    }
    return async () => {
        await check();
        return '<ignored>';
    };
}

const defineHealth = async (definition?: HealthzDefinition, options: Partial<HealthzOptions> = defaults) => {
    const opts: HealthzOptions = {
        ...defaults,
        ...(options || {}),
    };
    const checkers = Object.keys(definition || {})
        .map(key => ({ name: key, check: getChecker(definition![key], opts) }));

    const tStart = stopwatch.start();
    const checkersHealth = await (new Promise(resolve => {
        const results: CheckResult[] = checkers.map(({ name }) => (
            {
                name,
                result: null,
                error: null,
                t: null,
                health: HealthState.UNKNOWN,
                crucial: !!definition![name].crucial,
            }
        ));
    
        const clock = setTimeout(
            () => resolve(
                results.map(result => ({
                    ...result,
                    health: result.health === HealthState.UNKNOWN
                        ? HealthState.TIMEOUT
                        : result.health,
                    t: result.t == null ? ms(stopwatch.stop(tStart)) : result.t,
                }))
            ),
            opts.timeout
        );

        const setResponse = (i: number, health: HealthState, error: string | null, result: any, t: string) => {
            return results[i] = { ...results[i], health, error, result, t };
        }
        Promise.all(
            checkers.map(
                async (checker, i) => {
                    const t = stopwatch.start();
                    let health = HealthState.OK
                    let result = null;
                    let error = null;
                    try {
                        result = await checker.check();
                    } catch (caught) {
                        error = caught.message;
                        health = HealthState.ERROR;
                    }
                    setResponse(i, health, error, result, ms(stopwatch.stop(t)));
                }
            )
        )
            .then(() => {
                clearTimeout(clock);
                resolve(results);
            });
    }) as Promise<CheckResult[]>);
    return {
        tldr: Object.keys(definition!)
            .reduce(
                (status, checker, i) => {
                    const health = checkersHealth[i].health;
                    const crucial = definition![checker].crucial;
                    if (status === HealthState.OK && crucial && health !== HealthState.OK) {
                        return HealthState.NOT_OK;
                    }
                    return status;
                },
                HealthState.OK
            ),
        t: ms(stopwatch.stop(tStart)),
        checkers: checkersHealth
            .reduce(
                (acc, { name, ...rest }) => {
                    acc[name] = rest;
                    return acc;
                },
                {} as any),
        options,
    }
}

export default defineHealth;

export const healthz = <Req extends express.Request, Res extends express.Response>(def: HealthzDefinition, opts?: Partial<HealthzOptions>) => {
    return (req: Req, res: Res) => {
        const query = url.parse(req.url, true).query;
        const specOpts = { ...opts } as Partial<HealthzOptions>;
        if (query && ('timeout' in query)) {
            specOpts.timeout = parseInt(String(query.timeout), 10);
        }
        return defineHealth(def, specOpts)
            .then(result => {
                const statusCode = result.tldr === HealthState.OK
                    ? 200
                    : 500;
                res.writeHead(statusCode, {
                    'Content-type': 'application/json'
                });
                res.write(JSON.stringify(result));
                res.end();
            });
    }
}
