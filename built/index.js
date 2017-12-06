"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var healthz_1 = require("./healthz");
var types_1 = require("./types");
module.exports = healthz_1.default;
module.exports.healthz = healthz_1.healthz;
module.exports.Adapter = types_1.Adapter;
module.exports.expressMiddleware = function (def, opts) {
    return function (req, res, next) {
        if (/^\/healthz/.test(req.url)) {
            healthz_1.healthz(def, opts)(req, res);
        }
        else {
            next();
        }
    };
};
//# sourceMappingURL=index.js.map