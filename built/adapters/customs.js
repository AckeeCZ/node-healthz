"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
exports.default = function (fns, timeout) {
    return new Promise(function (resolve, reject) {
        var results = Array.apply(null, new Array(fns.length)).map(function () { return ({ health: types_1.Health.NOT_OK, t: process.hrtime() }); });
        var respond = function () {
            resolve(results.map(function (x) { return (__assign({}, x)); }));
        };
        var setResponse = function (i, _a) {
            var health = _a.health, error = _a.error, result = _a.result;
            var t = process.hrtime(results[i].t);
            var millis = (t[0] + (t[1] * 1e-9)) * 1e3;
            results[i] = { health: health, error: error, result: result, t: Math.round(millis) + "ms" };
            return results[i];
        };
        var clock = setTimeout(respond, timeout);
        return Promise.all(fns.map(function (fn, i) {
            if (!fn) {
                throw new Error('Check function is not supplied');
            }
            return Promise.resolve(fn())
                .then(function (x) { return setResponse(i, { health: types_1.Health.OK, result: x, error: null }); })
                .catch(function (error) { return setResponse(i, { health: types_1.Health.ERROR, error: error, result: null }); });
        }))
            .then(function () { return respond(); });
    });
};
//# sourceMappingURL=customs.js.map