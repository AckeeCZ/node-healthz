import { AdapterOptions } from '../types';
declare const Promise: any;

export default (knex: any, def: AdapterOptions) => {
    return knex.raw('show status')
        .then(() => undefined);
};
