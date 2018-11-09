import { Adapter, Health, AdapterOptions, AdapterResult } from '../types';
declare const Promise: any;
declare const process: any;

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

export default (fns: Array<() => AdapterResult>, timeout: number): Promise<any> => {
    return new Promise((resolve: any, reject: any) => {
        const results = new Array(fns.length).fill(0)
            .map(() => (
                {
                    health: Health.UNKNOWN,
                    t: stopwatch.start()
                }
            ));

        const respond = () => {
            resolve(results.map(x => {
                return {
                    ...x,
                    t: Array.isArray(x.t)
                        ? `${Math.round(stopwatch.stop(x.t))}ms`
                        : `${Math.round(x.t)}ms`,
                    health: x.health === Health.UNKNOWN
                        ? Health.TIMEOUT
                        : x.health,
                };
            }));
        };
        const setResponse = (i, { health, error, result }) => {
            return results[i] = { ...results[i], health, error, result, t: stopwatch.stop(results[i].t) };
        };
        const clock = setTimeout(respond, timeout);
        return Promise.all(
            fns.map((fn, i) => {
                if (!fn) {
                    throw new Error('Check function is not supplied');
                }
                return Promise.resolve(fn())
                    .then((x) => setResponse(i, { health: Health.OK, result: x, error: null }))
                    .catch((error) => setResponse(i, { health: Health.ERROR, error, result: null }))
            })
        )
            .then(() => respond());
    });
};
