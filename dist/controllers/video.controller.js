"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCommentById = exports.AddNewComments = exports.GetAllComments = exports.DeleteVideoById = exports.UpdateVideoById = exports.PostNewVideo = exports.GetVideoById = exports.GetAllActiveVideos = exports.GetAllVideos = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const Student_1 = __importDefault(require("../models/Student"));
const Video_1 = __importDefault(require("../models/Video"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Comment_1 = __importDefault(require("../models/Comment"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
dotenv_1.default.config();
// function API untuk mendapatkan semua video dari database
async function GetAllVideos(req, res) {
    try {
        // fitur search dari client request berdasarkan query ?search=...
        const search = req.query.search || "";
        // dapatkan semua video dari database dan exclude beberapa field yang tidak diperlukan
        // namun combine dengan database admin untuk tau siapa yang upload video
        const VIDEOS = await Video_1.default.findAll({
            attributes: {
                exclude: ["AdminId", "updatedAt"],
                include: [
                    [models_1.sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.video_id = Video.id)'), "total_comment"]
                ]
            },
            include: [{ model: Admin_1.default, attributes: ["id", "username"] }]
        });
        // filtervideo berdasarkan search dari user
        let filtered_video = VIDEOS.filter(post => {
            let post_json = post.toJSON();
            const matchesSearch = post_json.title.toLowerCase().includes(search.toString().toLowerCase());
            return matchesSearch;
        });
        return res.status(200).json(filtered_video);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.GetAllVideos = GetAllVideos;
async function GetAllActiveVideos(req, res) {
    try {
        const VIDEOS = await Video_1.default.findAll({
            where: { can_watch: 1 },
            attributes: {
                exclude: ["AdminId", "updatedAt"],
                include: [
                    [models_1.sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.video_id = Video.id)'), "total_comment"]
                ]
            },
            include: [{ model: Admin_1.default, attributes: ["id", "username"] }]
        });
        console.log(VIDEOS);
        return res.status(200).json(VIDEOS);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.GetAllActiveVideos = GetAllActiveVideos;
async function GetVideoById(req, res) {
    try {
        const VIDEOS = await Video_1.default.findByPk(req.params.id);
        return res.status(200).json(VIDEOS);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.GetVideoById = GetVideoById;
async function PostNewVideo(req, res) {
    const videoData = req.body;
    try {
        // handle file video yang diupload, buat linknya untuk mengakses video
        // yang linknya disimpan ke dalam API
        if (req.files.length !== 0) {
            req.files.forEach(file => {
                if (file.mimetype.includes("video")) {
                    videoData.video_link = `${req.protocol + "://" + req.get("host")}/files/uploads/${file.filename}`;
                }
                if (file.mimetype.includes("image")) {
                    videoData.thumbnail = `${req.protocol + "://" + req.get("host")}/files/uploads/${file.filename}`;
                }
            });
        }
        else {
            return res.status(400).json({ message: "file not uploaded" });
        }
        // saat upload video cek lagi dan lagi apakah user sudah login apa blm?
        const accessToken = req.cookies["admin-token"];
        if (!accessToken)
            return res.status(400).json({ message: "Not Authorized" });
        try {
            jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
                if (err)
                    return res.status(400).json({ message: "Not Authorized" });
                Admin_1.default.findByPk(user.id).then(function (admin) {
                    if (!admin)
                        return res.status(400).json({ message: "user not found" });
                    Video_1.default.create(videoData).then(async (createdVideo) => {
                        // tambahkan video ke admin (one admin have many video)
                        await admin.addVideos(createdVideo);
                        return res.sendStatus(200);
                    });
                });
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.PostNewVideo = PostNewVideo;
async function UpdateVideoById(req, res) {
    const videoId = req.params.id;
    const videoData = req.body;
    try {
        if (req.files.length !== 0) {
            req.files.forEach(file => {
                if (file.mimetype.includes("image")) {
                    videoData.thumbnail = `${req.protocol + "://" + req.get("host")}/files/uploads/${file.filename}`;
                }
            });
        }
        const VIDEO = await Video_1.default.findByPk(videoId);
        if (!VIDEO)
            return res.status(400).json({ message: "video not found" });
        await VIDEO.update(videoData);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.UpdateVideoById = UpdateVideoById;
async function DeleteVideoById(req, res) {
    const videoId = JSON.parse(req.body.id);
    try {
        await Video_1.default.destroy({
            where: { id: videoId }
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.DeleteVideoById = DeleteVideoById;
async function GetAllComments(req, res) {
    const video_id = req.query.video || "";
    try {
        const COMMENTS = await Comment_1.default.findAll({
            attributes: { exclude: ["updatedAt"] },
            order: [["createdAt", "DESC"]]
        });
        let filtered_comment = COMMENTS.filter(post => {
            let post_json = post.toJSON();
            const matchesSearch = post_json.video_id.toLowerCase().includes(video_id.toString().toLowerCase());
            return matchesSearch;
        });
        res.status(200).json(filtered_comment);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.GetAllComments = GetAllComments;
async function AddNewComments(req, res) {
    const videoId = req.params.id;
    const commentData = req.body;
    try {
        const VIDEO = await Video_1.default.findByPk(videoId);
        if (!VIDEO)
            return res.status(400).json({ message: "video not found" });
        // cek lagi sebelum student bisa commnet, apakah dia sudah login apa belum, kalau belum tidak bisa komen
        const accessToken = req.cookies["student-token"];
        if (!accessToken)
            return res.status(400).json({ message: "Not Authorized" });
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
            if (err)
                return res.status(400).json({ message: "Not Authorized" });
            Student_1.default.findByPk(user.id).then(async function (result) {
                await Comment_1.default.create({
                    content: commentData.content,
                    video_id: VIDEO.id,
                    student_id: result.id,
                    student_email: result.email
                });
                return res.sendStatus(200);
            });
        });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.AddNewComments = AddNewComments;
async function DeleteCommentById(req, res) {
    const commentData = req.body;
    try {
        const COMMENT = await Comment_1.default.findByPk(commentData.comment_id);
        if (!COMMENT)
            return res.status(400).json({ message: "comment not exist" });
        COMMENT.destroy();
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.DeleteCommentById = DeleteCommentById;
//# sourceMappingURL=video.controller.js.map