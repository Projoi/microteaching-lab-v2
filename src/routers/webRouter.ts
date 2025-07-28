import express, {Response, Request, NextFunction} from "express";
import { verifyAdminRoute, verifyStudentRoute } from "../utils/JWT";

const router = express.Router();
// router untuk view (html), bukan untuk API
// dalam suatu url ingin ditampilkan html yang mana

// root url akan me redirect ke virtuallab
router.get("/", verifyStudentRoute, (req:Request, res:Response) => {
  res.redirect(process.env.VIRTUAL_PATH ?? "/virtuallab/index.htm")
});

// router view untuk student
router.get("/login", (req:Request, res:Response) => {
  res.render("Student-Login");
});
router.get("/daftar", (req:Request, res:Response) => {
  res.render("Student-Daftar");
});

/* Student Authenticated Page */
router.get("/videos", verifyStudentRoute, (req:Request, res:Response) => {
  res.render("Student-Videos");
});
router.get("/watch", verifyStudentRoute, (req:Request, res:Response) => {
  res.render("Student-Watch");
});
// router.get("/iframe", verifyStudentRoute, (req:Request, res:Response) => {
//   res.render("IFRAME");
// });





router.get("/admin/login", (req:Request, res:Response) => {
  res.render("Admin-Login");
});

/* Admin Authenticated Page */
router.get('/admin', verifyAdminRoute, (req, res) => {
    res.render('Admin-Home', { activePage: 'konten' });
});
router.get("/admin/edit", verifyAdminRoute, (req:Request, res:Response) => {
  res.render("Admin-Edit", { activePage: 'konten' });
});
router.get('/admin/upload', verifyAdminRoute, (req, res) => {
    res.render('Admin-Upload', { activePage: 'upload' });
});



export = router;
