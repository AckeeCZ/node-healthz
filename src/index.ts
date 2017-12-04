declare const module: any;
declare const exports: any;

import defineHealth, { healthz } from './healthz';

module.exports = defineHealth;

module.exports.healthz = healthz;

// FIXME Remove
// declare const Promise: any;

// healthz({
//     x: { customCheck: () => Promise.resolve('tada') },
//     y: { customCheck: () => new Promise((resolve) => setTimeout(() => resolve(2), 5000)) },
// }, {})
//     .then(console.log)
//     .catch(console.error)
