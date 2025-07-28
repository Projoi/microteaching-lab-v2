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
exports.CreateTestAdmin = void 0;
// Karena usernya hanya sedikit kebutuhannya, jadi semua di jadikan satu disini antara admin dan siswa
const express_1 = __importDefault(require("express"));
const Admin_1 = __importDefault(require("../models/Admin"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
const RateLimiter_1 = __importDefault(require("../utils/RateLimiter"));
const user_controller_1 = require("../controllers/user.controller");
dotenv.config();
// username dan password untuk admin bisa disesuaikan dari .env
// kalau di .env kosong maka default menjadi admin 123
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123";
const userRouter = express_1.default.Router();
// inisialisasi router get dan post
userRouter.post("/admins/login", RateLimiter_1.default, user_controller_1.AdminLogin);
userRouter.post("/admins/logout", user_controller_1.AdminLogout);
userRouter.get("/students/me", user_controller_1.GetUserData);
userRouter.post("/students/login", RateLimiter_1.default, user_controller_1.StudentLogin);
userRouter.post("/students/register", user_controller_1.StudentRegister);
userRouter.post("/ask-verification", user_controller_1.AskVerification);
userRouter.get("/is-login", user_controller_1.IsLogin);
// membuat akun admin saat pertama menjalankan server
// username password di dapat dari variable diatas
async function CreateTestAdmin() {
    const ADMIN = await Admin_1.default.findOne({ where: { username: ADMIN_USERNAME } });
    if (!ADMIN) {
        Admin_1.default.create({
            username: ADMIN_USERNAME,
            password: await bcrypt_1.default.hash(ADMIN_PASSWORD, 10)
        }).then(() => {
            console.log("Created new admin");
        });
    }
    else {
        console.log("Test admin already exist");
    }
}
exports.CreateTestAdmin = CreateTestAdmin;
exports.default = userRouter;
//# sourceMappingURL=userRoute.js.map