"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// limiter untuk tiap request per ip user, (1 user bisa mengakses sebuah API sebanyak x dalam y menit)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: { error: 'Terlalu banyak permintaan dari alamat IP ini, silakan coba lagi nanti.' },
});
module.exports = limiter;
//# sourceMappingURL=RateLimiter.js.map