"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// router untuk view (html), bukan untuk API
// dalam suatu url ingin ditampilkan html yang mana
// root url akan me redirect ke virtuallab
router.get("/", (req, res) => {
    res.redirect("/virtuallab/index.html");
});
// router view untuk student
router.get("/login", (req, res) => {
    res.render("Student-Login");
});
router.get("/daftar", (req, res) => {
    res.render("Student-Daftar");
});
router.get("/videos", CheckIfLoginStudent, (req, res) => {
    res.render("Student-Videos");
});
router.get("/watch", CheckIfLoginStudent, (req, res) => {
    res.render("Student-Watch");
});
router.get("/iframe", CheckIfLoginStudent, (req, res) => {
    res.render("IFRAME");
});
// router view untuk admin
router.get("/admin/login", (req, res) => {
    res.render("Admin-Login");
});
router.get("/admin", CheckIfLogin, (req, res) => {
    res.render("Admin-Home");
});
router.get("/admin/edit", CheckIfLogin, (req, res) => {
    res.render("Admin-Edit");
});
router.get("/admin/upload", CheckIfLogin, (req, res) => {
    res.render("Admin-Upload");
});
// function middleware untuk cek apakah admin sudah login atau belum
// sebelum dia bisa mengakses route tertentu
function CheckIfLogin(req, res, next) {
    const accessToken = req.cookies["admin-token"];
    if (!accessToken)
        return res.redirect("/admin/login");
    try {
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
            if (err)
                return res.redirect("/admin/login");
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// function middleware untuk cek apakah student sudah login atau belum
// sebelum dia bisa mengakses route virtuallab dan video video
function CheckIfLoginStudent(req, res, next) {
    const accessToken = req.cookies["student-token"];
    if (!accessToken)
        return res.redirect("/login");
    try {
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
            if (err)
                return res.redirect("/login");
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = router;
//# sourceMappingURL=webRouter.js.map