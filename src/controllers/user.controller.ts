import Admin from "../models/Admin"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Student from "../models/Student"
import Verification from "../models/UtilsVerification"
import { sendVerificationEmail } from "../utils/MailerTemplate"
import dotenv from "dotenv"
import { body, validationResult } from "express-validator"

dotenv.config();

export const validateAdminLogin = [
    body('username').trim().escape().isString().notEmpty(),
    body('password').trim().isString().notEmpty()
];

export const validateStudentLogin = [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isString().notEmpty().withMessage('Password wajib diisi')
];




export async function AdminLogin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ where: { username } });

        // Gunakan pesan umum agar tidak bocor info username valid
        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const accessToken = jwt.sign(
            { id: admin.id, role: admin.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" } // Atur sesuai kebutuhan
        );

        res.cookie("admin-token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 hari
        });

        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("AdminLogin error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function AdminLogout(req, res) {
    try {
        res.clearCookie("admin-token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export async function StudentLogin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validasi gagal', errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ where: { email } });
        if (!student) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const payload = { id: student.id };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('student-token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({ message: 'Login berhasil', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server' });
    }
}


// function API apabila client meminta verification code kepada server
export async function AskVerification(req, res){
    const loginData = req.body
    const verification_code = generateRandomNumber()
    try {
        // cek apakah email yang diinput user sudah ada di database?
        // karena email unique, tidak boleh ada email kembar dalam aplikasi
        const EMAIL = await Student.findOne({where:{email: loginData.email}})
        if(EMAIL) return res.status(400).json({message: "email already exist"})

        // cari dalam database verification apakah email pernah meminta verifikasi?
        const VERIFICATION = await Verification.findOne({where:{email: loginData.email}})
        // kalau belum pernah buatkan row baru yang berisi email dan verification code
        if(!VERIFICATION){
            Verification.create({
                email: loginData.email,
                verification_code: verification_code
            }).then(function(){
                // kirim verification code ke email
                sendVerificationEmail(loginData.email, verification_code)
                // return request berupa message saja, jangan taruh verif code disini, bisa di exploit
                return res.status(200).json({
                    message: "kode verifikasi dikirim ke email yang tertera"
                })
            })
        }else{
            // kalau sudah pernah update berdasarkan email yang sudah ada
            VERIFICATION.update({
                verification_code: verification_code
            }).then(function(){
                // kirim verification code ke email
                sendVerificationEmail(loginData.email, verification_code)
                // return request berupa message saja, jangan taruh verif code disini, bisa di exploit
                return res.status(200).json({
                    message: "kode verifikasi dikirim ke email yang tertera"
                })
            })
        }
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

// function API untuk cek verification code sekaligus meregister student ke database
export async function StudentRegister(req, res){
    const loginData = req.body
    try {
        // cek database verification berdasarkan email yang terhubung dengan verification code yang tersimpan sebelumnya
        const VERIFICATION = await Verification.findOne({where:{email: loginData.email}})
        if(!VERIFICATION) return res.status(400).json({message: "?? you never ask for verification code"})

        // kalau verification code salah / tidak sesuai dengan yang di database
        if(VERIFICATION.verification_code !== loginData.verification_code){
            return res.status(400).json({message: "kode verifikasi salah"})
        }else if(VERIFICATION.verification_code == loginData.verification_code){
            // kalau input verif code benar, maka buat data student dan hash passwordnya
            loginData.password = await bcrypt.hash(loginData.password, 10)
            Student.create(loginData).then(function(){
                return res.status(200).json({message: "berhasil mendaftarkan akun anda, silahkan login kembali"})
            })
        }
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

// function API untuk mendapatkan data user namun tidak melalui id
// melainkan dari token yang tersimpan dalam cookies, jadi lebih aman

export async function GetUserData(req, res) {
  const adminToken = req.cookies["admin-token"];
  const studentToken = req.cookies["student-token"];
  const token = adminToken || studentToken;

  if (!token) {
    return res.status(401).json({ message: "Not Authorized: No token found" });
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Not Authorized: Invalid token" });
      }

      let userData = null;

      if (adminToken) {
        return res.status(200).json({ role: "admin", email: "admin@admin.admin" });
      }

      if (studentToken) {
        userData = await Student.findByPk(decoded.id, {
          attributes: { exclude: ["password"] },
        });
        if (!userData) return res.status(404).json({ message: "Student not found" });
        return res.status(200).json({ role: "student", ...userData.toJSON() });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}


// API untuk di virtual lab, cek kalau dia sudah login atau belum
// kalau belum harus login dulu sebelum masuk ke virtual lab
export async function IsLogin(req, res){
    const accessToken = req.cookies["student-token"]
    if (!accessToken) return res.status(400).json({message: "Not Authorized"})
      try {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function(err, user){
            if(err) return res.status(400).json({message: "Not Authorized"})
            return res.status(200).json("verified")
        });
      } catch (error) {
        return res.status(500).json({message: error.message})
      }
}














function generateRandomNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
}