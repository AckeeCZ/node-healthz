"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (mongoose, def) {
    return new Promise(function (_resolve, _reject) {
        var db = mongoose.connection
            ? mongoose.connection.db // prev versions
            : mongoose.db; // current versions
        db.command({ ping: 1 }, { failFast: true }, function (err) {
            if (err) {
                return _reject(err);
            }
            return _resolve(true);
        });
    })
        .then(function () { return undefined; });
};
//# sourceMappingURL=mongoose.js.map