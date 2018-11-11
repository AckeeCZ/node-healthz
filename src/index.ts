import * as express from 'express';
import defineHealth, { healthz, HealthzDefinition, HealthzOptions, AdapterType } from './healthz';

export default healthz;

export {
    AdapterType
}

const expressMiddleware = <
    Req extends express.Request,
    Res extends express.Response,
    Next extends express.NextFunction
>(def: HealthzDefinition , opts?: HealthzOptions) =>
    ((req: Req, res: Res, next: Next) => { 
        if (/^\/healthz/.test(req.url)) {
            healthz(def, opts)(req, res);
        } else {
            next();
        }
    }) as express.RequestHandler

export { healthz, defineHealth, expressMiddleware, };
