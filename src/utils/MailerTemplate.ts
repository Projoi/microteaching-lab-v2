import transporter from "./Mailer"
import * as dotenv from "dotenv";
dotenv.config();

const MAILER_EMAIL = process.env.MAILER_EMAIL
const MAILER_NAME = process.env.MAILER_NAME

// template send verification email saat student register
export const sendVerificationEmail = async (userEmail, verificationCode) => {
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
        transporter.sendMail({
            from: `"${MAILER_NAME}" <${MAILER_EMAIL}>`, // sender address
            to: userEmail,
            subject: `${verificationCode} adalah kode verifikasi anda`,
            html: emailHTML,
            attachments: [{
              filename: 'logo.png',
              path: './public/img/logo.png',
              cid: 'logo-fkip'
            }]
        });
    } catch (error) {
        console.error(error)
    }
};