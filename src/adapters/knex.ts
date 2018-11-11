import { AdapterOptions } from 'healthz';

export default (knex: any, def: AdapterOptions) => {
    return knex.raw('show status');
};
