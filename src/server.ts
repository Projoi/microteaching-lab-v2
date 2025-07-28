import express from "express";
import fs from "fs"
import path from "path";
import multer from 'multer';
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config();

const app = express();

// ketika server dijalankan akan membuat folder untuk upload & export file kalau belum ada
if (!fs.existsSync("public/files/uploads")) {
  if (!fs.existsSync("public/files")) {
    fs.mkdirSync("public/files");
  }
  if (!fs.existsSync("public/files/uploads")) {
    fs.mkdirSync("public/files/uploads");
  }
  if (!fs.existsSync("public/files/exports")) {
    fs.mkdirSync("public/files/exports");
  }
}

// setup multer, library untuk mengupload file ke server
const storage = multer.diskStorage({
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
app.set("trust proxy",1);
app.use(multer({ storage: storage, limits: { fileSize: 500_233_290 } }).any());
app.use(cors({origin: "*"}));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup penyimpanan static file, yang nantinya dapat diakses dari view (html, css, js)
app.use("/files", express.static(path.join(__dirname, "../public", "files")));
app.use("/", express.static(path.join(__dirname, "../public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// import router yang akan di jadikan API
import { connectToDatabase } from "./models";
import webRouter from "./routers/webRouter";
import videoRouter from "./routers/video.router";
import userRouter, { CreateTestAdmin } from "./routers/userRoute";

let PORT = process.env.PORT || 8000;

// ketika server dijalankan akan langsung connect ke database
connectToDatabase()
  .then(async() => {
    // inisialisasi router API ingin ditaruh ke url apa
    app.use("/", webRouter);
    app.use("/api/", userRouter);
    app.use("/api/videos", videoRouter);

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
      CreateTestAdmin()
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Koneksi database gagal:", error);
  });
