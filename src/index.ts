import * as express from 'express';
import defineHealth, { healthz } from './healthz';
import { Adapter, HealthzDef, HealthzOptions } from './types';

export default healthz;

const expressMiddleware = <
    Req extends express.Request,
    Res extends express.Response,
    Next extends express.NextFunction
>(def: HealthzDef, opts: HealthzOptions) =>
    (req: Req, res: Res, next: Next) => { 
        if (/^\/healthz/.test(req.url)) {
            healthz(def, opts)(req, res);
        } else {
            next();
        }
    }

export { healthz, Adapter, defineHealth, expressMiddleware, };

