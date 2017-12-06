import { AdapterOptions } from '../types';
declare const Promise: any;

export default (mongoose: any, def: AdapterOptions) => {
    return new Promise((_resolve, _reject) => {
        mongoose.connection.db.command({ping: 1}, {failFast: true}, err => {
            if (err) {
                return _reject(err);
            }
            return _resolve(true);
        });
    })
        .then(() => undefined);
};
