"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var healthz_1 = require("./healthz");
module.exports = healthz_1.default;
module.exports.healthz = healthz_1.healthz;
// FIXME Remove
// declare const Promise: any;
// healthz({
//     x: { customCheck: () => Promise.resolve('tada') },
//     y: { customCheck: () => new Promise((resolve) => setTimeout(() => resolve(2), 5000)) },
// }, {})
//     .then(console.log)
//     .catch(console.error)
//# sourceMappingURL=index.js.map