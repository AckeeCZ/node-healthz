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
/// <reference types="node" />
var url = require("url");
var customs_1 = require("./adapters/customs");
var types_1 = require("./types");
var knex_1 = require("./adapters/knex");
var adapterTypeMap = (_a = {},
    _a[types_1.Adapter.KNEX] = knex_1.default,
    _a);
var resolveAdapter = function (key, def) {
    if (adapterTypeMap[def.type]) {
        return function () { return adapterTypeMap[def.type](def.adapter, def); };
    }
    if (def.customCheck) {
        return function () { return def.customCheck(def); };
    }
    return null;
};
var defineHealth = function (def, opts) {
    if (opts === void 0) { opts = {}; }
    return customs_1.default(Object.keys(def).map(function (key) { return resolveAdapter(key, def[key]); }), opts.timeout)
        .then(function (results) {
        return {
            result: Object.keys(def).map(function (key, i) {
                return [key, results[i]];
            })
                .reduce(function (acc, _a) {
                var key = _a[0], result = _a[1];
                acc[key] = result;
                return acc;
            }, {}),
            opts: opts,
        };
    });
};
exports.default = defineHealth;
exports.healthz = function (def, opts) {
    return function (req, res) {
        var timeout = url.parse(req.url, true).query.timeout;
        var specOpts = __assign({}, opts);
        if (!isNaN(parseInt(timeout))) {
            specOpts.timeout = parseInt(timeout);
        }
        return defineHealth(def, specOpts)
            .then(function (result) {
            res.writeHead(200, {
                'Content-type': 'application/json'
            });
            res.write(JSON.stringify(result));
            res.end();
        });
    };
};
var _a;
//# sourceMappingURL=healthz.js.map