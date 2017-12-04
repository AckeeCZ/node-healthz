import { Adapter, Health, AdapterOptions, AdapterResult } from '../types';
declare const Promise: any;

export default (fns: Array<() => AdapterResult>, timeout: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        const results = Array.apply(null, new Array(fns.length)).map(()=> ({ health: Health.NOT_OK, t: process.hrtime() }));
        const respond = () => {
            resolve(results.map(x => ({ ...x })));
        };
        const setResponse = (i, { health, error, result }) => {
            let t = process.hrtime(results[i].t);
            const millis = (t[0] + (t[1] * 1e-9)) * 1e3;
            results[i] = { health, error, result, t: `${Math.round(millis)}ms`};
            return results[i];
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
