import { HealthzDef, HealthzOptions } from './types';
declare const defineHealth: (def: HealthzDef, opts?: HealthzOptions) => any;
export default defineHealth;
export declare const healthz: (def: HealthzDef, opts: HealthzOptions) => (req: any, res: any) => any;
