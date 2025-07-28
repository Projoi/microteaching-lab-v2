"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const Mailer_1 = __importDefault(require("./Mailer"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MAILER_EMAIL = process.env.MAILER_EMAIL;
const MAILER_NAME = process.env.MAILER_NAME;
// template send verification email saat student register
const sendVerificationEmail = async (userEmail, verificationCode) => {
    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          .header{
              font-size: 20px;
              font-weight: 800;
              margin: 2rem 0;
          }
          .body{
              padding: 2rem;
              background-color: #e0e0e0;
          }
          .email-container{
            padding: 2rem; width: 45%; margin: 0 auto; background-color: white; border-radius: 16px;
          }
          @media only screen and (max-width: 800px) {
            .email-container {
              width: 100%;
              border-radius: 0;
              padding: 1rem;
            }
            .body{
              padding: 0;
            }
          }
        </style>
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      
      <body class="body">
        <div class="email-container">
            <div style="background-color: #a881ba; padding: .25rem 0; margin: 0 auto 2rem; display: flex; justify-content: center;">
                <img src="cid:logo-fkip" width="60px" style="margin:auto; text-align:center" alt="">
            </div>
            <p>Berikut kode verifikasi anda. Segera masukan kode verifikasi sebelum masa berlaku habis</p>
            <p class="header" style="color: #4a4a4a">${verificationCode}.</p>
            <p style="font-size: .9rem; color: #4a4a4a; margin:0">Virtual Tour, FKIP</p>
            <p style="font-size: .9rem; color: #4a4a4a; font-weight: 600;">Universitas Terbuka</p>
        </div>
      </body>
    </html>
    `;
    try {
        Mailer_1.default.sendMail({
            from: `"${MAILER_NAME}" <${MAILER_EMAIL}>`,
            to: userEmail,
            subject: `${verificationCode} adalah kode verifikasi anda`,
            html: emailHTML,
            attachments: [{
                    filename: 'logo.png',
                    path: './public/img/logo.png',
                    cid: 'logo-fkip'
                }]
        });
    }
    catch (error) {
        console.error(error);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=MailerTemplate.js.map