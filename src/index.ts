declare const module: any;
declare const exports: any;

import defineHealth, { healthz } from './healthz';
import { Adapter } from './types';

module.exports = defineHealth;

module.exports.healthz = healthz;

module.exports.Adapter = Adapter;
