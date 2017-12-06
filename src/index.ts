declare const module: any;
declare const exports: any;

import defineHealth, { healthz } from './healthz';
import { Adapter, HealthzDef, HealthzOptions } from './types';

module.exports = defineHealth;

module.exports.healthz = healthz;

module.exports.Adapter = Adapter;

module.exports.expressMiddleware = (def: HealthzDef, opts: HealthzOptions) =>
    (req, res, next) => {
        if (/^\/healthz/.test(req.url)) {
            healthz(def, opts)(req, res);
        } else {
            next();
        }
    };
