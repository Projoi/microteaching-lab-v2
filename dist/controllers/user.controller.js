"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsLogin = exports.GetUserData = exports.StudentRegister = exports.AskVerification = exports.StudentLogin = exports.AdminLogout = exports.AdminLogin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Student_1 = __importDefault(require("../models/Student"));
const UtilsVerification_1 = __importDefault(require("../models/UtilsVerification"));
const MailerTemplate_1 = require("../utils/MailerTemplate");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// function API untuk cek login admin
async function AdminLogin(req, res) {
    // data yang didapat dari request client disimpan ke dalam variable
    const loginData = req.body;
    try {
        // cek apakah input username dari client ada di database admin?
        const ADMIN = await Admin_1.default.findOne({ where: { username: loginData.username } });
        if (!ADMIN)
            return res.status(400).json({ message: "user not found" });
        // cek apakah input password dari client sama dengan password yang sudah di hash di database?
        const match = await bcrypt_1.default.compare(loginData.password, ADMIN.password);
        if (!match)
            return res.status(400).json({ message: "wrong username and password combination" });
        // buat token kalau memang semua data login cocok untuk sertifikat itu benar dia
        const accessToken = jsonwebtoken_1.default.sign({ id: ADMIN.id }, process.env.ACCESS_TOKEN_SECRET);
        res.cookie('admin-token', accessToken, { httpOnly: true });
        return res.status(200).json(accessToken);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.AdminLogin = AdminLogin;
async function AdminLogout(req, res) {
    try {
        // hapus token dalam cookie agar sesi login dia diakhiri
        res.clearCookie("admin-token");
        res.json({ message: "cookie cleared" });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.AdminLogout = AdminLogout;
// function API untuk cek login student, kurang lebih sama dengan admin
async function StudentLogin(req, res) {
    const loginData = req.body;
    try {
        const STUDENT = await Student_1.default.findOne({ where: { email: loginData.email } });
        if (!STUDENT)
            return res.status(400).json({ message: "user not found" });
        const match = await bcrypt_1.default.compare(loginData.password, STUDENT.password);
        if (!match)
            return res.status(400).json({ message: "wrong username and password combination" });
        const accessToken = jsonwebtoken_1.default.sign({ id: STUDENT.id }, process.env.ACCESS_TOKEN_SECRET);
        res.cookie('student-token', accessToken, { maxAge: 9000000, httpOnly: true });
        return res.status(200).json(accessToken);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.StudentLogin = StudentLogin;
// function API apabila client meminta verification code kepada server
async function AskVerification(req, res) {
    const loginData = req.body;
    const verification_code = generateRandomNumber();
    try {
        // cek apakah email yang diinput user sudah ada di database?
        // karena email unique, tidak boleh ada email kembar dalam aplikasi
        const EMAIL = await Student_1.default.findOne({ where: { email: loginData.email } });
        if (EMAIL)
            return res.status(400).json({ message: "email already exist" });
        // cari dalam database verification apakah email pernah meminta verifikasi?
        const VERIFICATION = await UtilsVerification_1.default.findOne({ where: { email: loginData.email } });
        // kalau belum pernah buatkan row baru yang berisi email dan verification code
        if (!VERIFICATION) {
            UtilsVerification_1.default.create({
                email: loginData.email,
                verification_code: verification_code
            }).then(function () {
                // kirim verification code ke email
                (0, MailerTemplate_1.sendVerificationEmail)(loginData.email, verification_code);
                // return request berupa message saja, jangan taruh verif code disini, bisa di exploit
                return res.status(200).json({
                    message: "kode verifikasi dikirim ke email yang tertera"
                });
            });
        }
        else {
            // kalau sudah pernah update berdasarkan email yang sudah ada
            VERIFICATION.update({
                verification_code: verification_code
            }).then(function () {
                // kirim verification code ke email
                (0, MailerTemplate_1.sendVerificationEmail)(loginData.email, verification_code);
                // return request berupa message saja, jangan taruh verif code disini, bisa di exploit
                return res.status(200).json({
                    message: "kode verifikasi dikirim ke email yang tertera"
                });
            });
        }
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.AskVerification = AskVerification;
// function API untuk cek verification code sekaligus meregister student ke database
async function StudentRegister(req, res) {
    const loginData = req.body;
    try {
        // cek database verification berdasarkan email yang terhubung dengan verification code yang tersimpan sebelumnya
        const VERIFICATION = await UtilsVerification_1.default.findOne({ where: { email: loginData.email } });
        if (!VERIFICATION)
            return res.status(400).json({ message: "?? you never ask for verification code" });
        // kalau verification code salah / tidak sesuai dengan yang di database
        if (VERIFICATION.verification_code !== loginData.verification_code) {
            return res.status(400).json({ message: "kode verifikasi salah" });
        }
        else if (VERIFICATION.verification_code == loginData.verification_code) {
            // kalau input verif code benar, maka buat data student dan hash passwordnya
            loginData.password = await bcrypt_1.default.hash(loginData.password, 10);
            Student_1.default.create(loginData).then(function () {
                return res.status(200).json({ message: "berhasil mendaftarkan akun anda, silahkan login kembali" });
            });
        }
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.StudentRegister = StudentRegister;
// function API untuk mendapatkan data user namun tidak melalui id
// melainkan dari token yang tersimpan dalam cookies, jadi lebih aman
async function GetUserData(req, res) {
    // dapatkan token dari cookies
    const accessToken = req.cookies["student-token"];
    // cek apakah token tersebut ada atau tidak
    if (!accessToken)
        return res.status(400).json({ message: "Not Authorized" });
    try {
        // verify token apakah token itu valid atau tidak
        // berdasarkan secret yang tersimpan dalam .env ACCESS_TOKEN_SECRET
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
            if (err)
                return res.status(400).json({ message: "Not Authorized" });
            // exclude password dari API
            let USER = await Student_1.default.findByPk(user.id, { attributes: { exclude: ["password"] } });
            return res.status(200).json(USER);
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.GetUserData = GetUserData;
// API untuk di virtual lab, cek kalau dia sudah login atau belum
// kalau belum harus login dulu sebelum masuk ke virtual lab
async function IsLogin(req, res) {
    const accessToken = req.cookies["student-token"];
    if (!accessToken)
        return res.status(400).json({ message: "Not Authorized" });
    try {
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
            if (err)
                return res.status(400).json({ message: "Not Authorized" });
            return res.status(200).json("verified");
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.IsLogin = IsLogin;
function generateRandomNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
}
//# sourceMappingURL=user.controller.js.map