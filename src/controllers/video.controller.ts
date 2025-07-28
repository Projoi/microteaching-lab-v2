import Admin from "../models/Admin"
import Student from "../models/Student";
import Video from "../models/Video"
import jwt from "jsonwebtoken"
import Comment from "../models/Comment";
import dotenv from "dotenv"
import { sequelize } from "../models";
import { Op } from "sequelize";
import validator from "validator"
import path from "path";
import fs from 'fs';
import { Request, Response } from 'express';
import { promisify } from 'util';

dotenv.config();

// 👍
export async function GetAllVideos(req, res) {
  try {
    const user = req.admin;

    // --- VALIDASI INPUT QUERY ---
    const rawSearch = req.query.search?.toString() || "";
    const search = validator.escape(rawSearch.toLowerCase());

    const rawCanWatch = req.query.can_watch;
    let canWatch: number | undefined = undefined;

    if (rawCanWatch !== undefined) {
      if (rawCanWatch !== "0" && rawCanWatch !== "1") {
        return res.status(400).json({ message: "`can_watch` must be 0 or 1" });
      }
      canWatch = parseInt(rawCanWatch);
    }

    const rawPage = req.query.page;
    const page = rawPage && !isNaN(parseInt(rawPage)) && parseInt(rawPage) > 0
      ? parseInt(rawPage)
      : 1;

    const rawLimit = req.query.limit;
    const limit = rawLimit && !isNaN(parseInt(rawLimit)) && parseInt(rawLimit) > 0 && parseInt(rawLimit) <= 100
      ? parseInt(rawLimit)
      : 999;

    const offset = (page - 1) * limit;

    // --- CEK ROLE UNTUK AKSES PRIVATE VIDEO ---
    if (canWatch == 0 && user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: only admin can access private videos" });
    }

    // --- BUILD KONDISI WHERE ---
    const where: any = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (canWatch !== undefined) {
      where.can_watch = canWatch;
    } else {
      if (!user || user.role !== "admin") {
        where.can_watch = 1;
      }
    }

    // --- HANYA ADMIN YANG MELIHAT VIDEO TERHAPUS ---
    const paranoid = !(user && user.role === "admin");

    // --- QUERY DATABASE ---
    const { count, rows: videos } = await Video.findAndCountAll({
      where,
      paranoid,
      attributes: {
        exclude: ["AdminId", "updatedAt"],
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM comments WHERE comments.video_id = Video.id)`
            ),
            "total_comment",
          ],
        ],
      },
      include: [
        {
          model: Admin,
          attributes: ["id", "username"],
        },
      ],
      order: [[sequelize.literal("deletedAt IS NULL"), "DESC"],["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      videos,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error.message);
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// 👍
export async function GetVideoById(req, res) {
  try {
    const user = req.admin;
    const videoId = req.params.id;

    const video = await Video.findOne({
      where: { id: videoId },
      paranoid: !(user && user.role === "admin"), // Admin bisa lihat yang sudah dihapus
      attributes: {
        exclude: ["AdminId", "updatedAt"],
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM comments WHERE comments.video_id = Video.id)`
            ),
            "total_comment",
          ],
        ],
      },
      include: [
        {
          model: Admin,
          attributes: ["id", "username"],
        },
      ],
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const json = video.toJSON();

    // --- Cegah akses video private jika bukan admin ---
    if (json.can_watch == 0 && user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: video is private" });
    }

    return res.status(200).json({ video: json });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
}

export async function PostNewVideo(req: Request, res: Response) {
  try {
    // --- [1] Validasi Upload ---
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const videoData: any = req.body;
    let hasVideo = false;
    let hasThumbnail = false;

    for (const file of req.files as Express.Multer.File[]) {
      const ext = path.extname(file.originalname).toLowerCase();
      const filenameLower = file.originalname.toLowerCase();

      const allowedVideoExt = ['.mp4', '.webm', '.mov'];
      const allowedImageExt = ['.jpg', '.jpeg', '.png'];

      // --- [1.1] Cegah file ganda ekstensi: example.mp4.php ---
      const extNameParts = filenameLower.split('.');
      if (extNameParts.length > 2) {
        return res.status(400).json({ message: "Invalid file name or extension" });
      }

      // --- [1.2] Validasi Ekstensi & MIME ---
      if (
        (allowedVideoExt.includes(ext) && file.mimetype.startsWith("video/")) ||
        (allowedImageExt.includes(ext) && file.mimetype.startsWith("image/"))
      ) {
        const fileUrl = `${process.env.BASE_URL || req.protocol + "://" + req.headers.host}/files/uploads/${file.filename}`;

        if (file.mimetype.startsWith("video/") && allowedVideoExt.includes(ext)) {
          videoData.video_link = fileUrl;
          hasVideo = true;
        }

        if (file.mimetype.startsWith("image/") && allowedImageExt.includes(ext)) {
          videoData.thumbnail = fileUrl;
          hasThumbnail = true;
        }
      } else {
        // --- [1.3] Hapus file berbahaya ---
        return res.status(400).json({ message: `Unsupported file type: ${file.originalname}` });
      }
    }

    if (!hasVideo) return res.status(400).json({ message: "Video file is required" });
    if (!hasThumbnail) return res.status(400).json({ message: "Thumbnail image is required" });

    // --- [2] Auth Admin ---
    const accessToken = req.cookies["admin-token"];
    if (!accessToken) return res.status(401).json({ message: "Not Authorized" });

    const decoded: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // --- [3] Simpan video ---
    const createdVideo = await Video.create(videoData);
    await admin.addVideos(createdVideo);

    return res.status(201).json({ message: "Video uploaded successfully", video: createdVideo });
  } catch (error: any) {
    console.error("Video upload error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 👍
export async function UpdateVideoById(req, res) {
  try {
    const videoId = req.params.id;

    // --- [2] Validasi Admin Auth ---
    const admin = req.admin
    if (!admin) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    // --- [3] Ambil Data & Validasi Video ---
    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoData = req.body;

    // --- [4] Handle File Upload (thumbnail only) ---
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.mimetype.includes("image")) {
          const url =
            `${process.env.BASE_URL || req.protocol + "://" + req.headers.host}/files/uploads/${file.filename}`;
          videoData.thumbnail = url;
        }
      }
    }

    // --- [5] Update Video ---
    await video.update(videoData);

    return res.status(200).json({ message: "Video updated", video });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 👍
export async function DeleteVideoById(req, res) {
    const videoId = req.params.id;

    let admin = req.admin
    if (!admin) {
        return res.status(403).json({ message: "Unauthorized: Admin not found" });
    }

    try {
        const video = await Video.findByPk(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        await video.destroy();
        return res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error("DeleteVideoById error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}




export async function GetAllComments(req, res){
    const video_id = req.query.video || ""
    try {
        const COMMENTS = await Comment.findAll({
            attributes: {exclude: ["updatedAt"]},
            order:[["createdAt", "DESC"]]
        })

        let filtered_comment = COMMENTS.filter(post => {
            let post_json = post.toJSON()
            const matchesSearch = post_json.video_id.toLowerCase().includes(video_id.toString().toLowerCase()) 
            return matchesSearch
        })

        res.status(200).json(filtered_comment)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

export async function AddNewComments(req, res){
    const videoId = req.params.id
    const commentData = req.body
    try {
        const VIDEO = await Video.findByPk(videoId)
        if(!VIDEO) return res.status(400).json({message: "video not found"})
        
        // cek lagi sebelum student bisa commnet, apakah dia sudah login apa belum, kalau belum tidak bisa komen
        const accessToken = req.cookies["student-token"]
        if (!accessToken) return res.status(400).json({message: "Not Authorized"})

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function(err, user:any){
        if(err) return res.status(400).json({message: "Not Authorized"})
            Student.findByPk(user.id).then(async function(result){
                await Comment.create({
                    content: commentData.content,
                    video_id: VIDEO.id,
                    student_id: result.id,
                    student_email: result.email
                })
                return res.sendStatus(200)
            })
        });
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

export async function DeleteCommentById(req, res){
    const commentData = req.body
    try {
        const COMMENT = await Comment.findByPk(commentData.comment_id)
        if(!COMMENT) return res.status(400).json({message: "comment not exist"})

        COMMENT.destroy()
        
        return res.sendStatus(200)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}