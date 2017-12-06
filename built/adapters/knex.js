"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (knex, def) {
    return knex.raw('show status')
        .then(function () { return undefined; });
};
//# sourceMappingURL=knex.js.map