import { AdapterOptions } from '../types';
declare const Promise: any;

export default (knex: any, def: AdapterOptions) => {
    return Promise.resolve()
        .then(() => {
            if (def.customCheck) {
                return def.customCheck(def);
            }
            return knex.raw('show status');
        })
        .then((result) => {
            if (def.customCheck) {
                return result;
            }
            return 1;
        });
};
