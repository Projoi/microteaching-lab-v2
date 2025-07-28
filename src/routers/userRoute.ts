// Karena usernya hanya sedikit kebutuhannya, jadi semua di jadikan satu disini antara admin dan siswa
import express from "express"
import Admin from "../models/Admin"
import bcrypt from "bcrypt"
import * as dotenv from "dotenv";
import limiter from "../utils/RateLimiter";
import { AdminLogin, AdminLogout, AskVerification, GetUserData, IsLogin, StudentLogin, StudentRegister, validateAdminLogin, validateStudentLogin } from "../controllers/user.controller"
dotenv.config();

// username dan password untuk admin bisa disesuaikan dari .env
// kalau di .env kosong maka default menjadi admin 123
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123"

const userRouter = express.Router()

// inisialisasi router get dan post
userRouter.post("/admins/login",limiter, validateAdminLogin, AdminLogin)
userRouter.post("/admins/logout", AdminLogout)

userRouter.get("/students/me", GetUserData)
userRouter.post("/students/login",limiter, validateStudentLogin, StudentLogin)
userRouter.post("/students/register", StudentRegister)

userRouter.post("/ask-verification", AskVerification)
userRouter.get("/is-login", IsLogin)



// membuat akun admin saat pertama menjalankan server
// username password di dapat dari variable diatas
export async function CreateTestAdmin(){
    const ADMIN = await Admin.findOne({where:{username: ADMIN_USERNAME}})
    if(!ADMIN){
        Admin.create({
            username: ADMIN_USERNAME,
            password: await bcrypt.hash(ADMIN_PASSWORD, 10)
        }).then(()=> {
            console.log("Created new admin");
            
        })
    }else{
        console.log("Test admin already exist");
        
    }
}

export default userRouter