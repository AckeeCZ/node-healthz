import { Adapter, Health, AdapterOptions, AdapterResult } from '../types';
declare const Promise: any;
declare const process: any;

const tToMs = (pt) => {
    const t = process.hrtime(pt);
    return (t[0] + (t[1] * 1e-9)) * 1e3;
};

export default (fns: Array<() => AdapterResult>, timeout: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        const results = Array.apply(null, new Array(fns.length)).map(()=> ({ health: Health.UNKNOWN, t: process.hrtime() }));
        const respond = () => {
            resolve(results.map(x => {
                return {
                    ...x,
                    t: Array.isArray(x.t)
                        ? `${Math.round(tToMs(x.t))}ms`
                        : x.t,
                    health: x.health === Health.UNKNOWN
                        ? Health.TIMEOUT
                        : x.health,
                };
            }));
        };
        const setResponse = (i, { health, error, result }) => {
            return results[i] = { ...results[i], health, error, result };
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
