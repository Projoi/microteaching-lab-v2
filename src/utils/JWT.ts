import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function verifyAdminRoute(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.["admin-token"];
  if (!token) return res.redirect("/admin/login");

  try {
    next();
  } catch (error) {
    return res.redirect("/admin/login");
  }
}

export function verifyStudentRoute(req: Request, res: Response, next: NextFunction) {
  const studentToken = req.cookies?.["student-token"];
  if (!studentToken) return res.redirect("/login");
  
  try {
    next();
  } catch (error) {
    return res.redirect("/login");
  }
}



export function verifyAdminToken(req, res, next) {
    const token = req.cookies["admin-token"];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.admin = decoded; // simpan info admin di request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export function optionalVerifyAdminToken(req, res, next) {
    const token = req.cookies["admin-token"];

    if (!token) {
        return next(); // tidak ada token, lanjut
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.admin = decoded; // token valid, simpan data admin
    } catch (err) {
        // token invalid, abaikan dan lanjut tanpa req.admin
    }

    next();
}

