/// <reference types="node" />
declare const Promise: any;

import * as url from 'url';
import customs from './adapters/customs';
import { Adapter, Health, AdapterOptions, AdapterResult, HealthzDef, HealthzOptions } from './types';
import knex from './adapters/knex';

const adapterTypeMap = {
    [Adapter.KNEX]: knex,
};

const resolveAdapter = (key: string, def: AdapterOptions): (() => AdapterResult) => {
    if (adapterTypeMap[def.type]) {
        return () => adapterTypeMap[def.type](def.adapter, def);
    }
    if (def.customCheck) {
        return () => def.customCheck(def);
    }
    return null;
};

const defineHealth = (def: HealthzDef, opts: HealthzOptions = {}): any => {
    return customs(
            Object.keys(def).map(key => resolveAdapter(key, def[key])),
            opts.timeout
        )
        .then(results => {
            return {
                result: Object.keys(def).map((key, i) => {
                    return [key, results[i]];
                })
                    .reduce((acc, [key, result]) => {
                        acc[key] = result;
                        return acc;
                    }, {}),
                opts,
            }
        });
};

export default defineHealth;

export const healthz = (def: HealthzDef, opts: HealthzOptions) => {
    return (req, res) => {
        const { timeout } = url.parse(req.url, true).query;
        const specOpts = { ...opts };
        if (!isNaN(parseInt(timeout))) {
            specOpts.timeout = parseInt(timeout);
        }
        return defineHealth(def, specOpts)
            .then(result => {
                res.writeHead(200, {
                    'Content-type': 'application/json'
                });
                res.write(JSON.stringify(result));
                res.end();
            });
    }
}
