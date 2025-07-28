"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MAILER_EMAIL = process.env.MAILER_EMAIL;
const MAILER_PASSWORD = process.env.MAILER_PASSWORD;
// buat transport mailer agar dia bisa mengirim email dari server
// smtp dan post bisa saja berubah tergantung host yang digunakan
exports.default = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: MAILER_EMAIL,
        pass: MAILER_PASSWORD,
    },
});
//# sourceMappingURL=Mailer.js.map