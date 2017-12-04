"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (knex, def) {
    return Promise.resolve()
        .then(function () {
        if (def.customCheck) {
            return def.customCheck(def);
        }
        return knex.raw('show status');
    })
        .then(function (result) {
        if (def.customCheck) {
            return result;
        }
        return 1;
    });
};
//# sourceMappingURL=knex.js.map