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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ketika server dijalankan akan membuat folder untuk upload & export file kalau belum ada
if (!fs_1.default.existsSync("public/files/uploads")) {
    if (!fs_1.default.existsSync("public/files")) {
        fs_1.default.mkdirSync("public/files");
    }
    if (!fs_1.default.existsSync("public/files/uploads")) {
        fs_1.default.mkdirSync("public/files/uploads");
    }
    if (!fs_1.default.existsSync("public/files/exports")) {
        fs_1.default.mkdirSync("public/files/exports");
    }
}
// setup multer, library untuk mengupload file ke server
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/files/uploads");
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, Date.now() + Math.floor(Math.random() * 99) + 1 + "." + extension);
    },
});
// setup server dan beberapa konfigurasi lainnya
app.set("trust proxy", 1);
app.use((0, multer_1.default)({ storage: storage, limits: { fileSize: 500233290 } }).any());
app.use((0, cors_1.default)({ origin: "*" }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// setup penyimpanan static file, yang nantinya dapat diakses dari view (html, css, js)
app.use("/files", express_1.default.static(path_1.default.join(__dirname, "../public", "files")));
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
// import router yang akan di jadikan API
const models_1 = require("./models");
const webRouter_1 = __importDefault(require("./routers/webRouter"));
const video_router_1 = __importDefault(require("./routers/video.router"));
const userRoute_1 = __importStar(require("./routers/userRoute"));
let PORT = process.env.PORT || 8000;
// ketika server dijalankan akan langsung connect ke database
(0, models_1.connectToDatabase)()
    .then(async () => {
    // inisialisasi router API ingin ditaruh ke url apa
    app.use("/", webRouter_1.default);
    app.use("/api/", userRoute_1.default);
    app.use("/api/videos", video_router_1.default);
    // error handling seperti kalau url tidak ditemukan, dan error lainnya
    app.all("*", (req, res, next) => {
        const err = new Error(`can't find ${req.originalUrl} on the server!`);
        next(err);
    });
    app.use((error, req, res, next) => {
        error.statusCode = error.statusCode || 404;
        error.status = error.status || "error";
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    });
    // listen ke server, agar bisa di akses di port yang sudah di tentukan
    app.listen(PORT, async () => {
        // membuat akun admin ketika pertamakali server di jalankan
        (0, userRoute_1.CreateTestAdmin)();
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Koneksi database gagal:", error);
});
//# sourceMappingURL=server.js.map