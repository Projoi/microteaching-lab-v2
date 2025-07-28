import express from "express"
import { AddNewComments, DeleteCommentById, DeleteVideoById, GetAllComments, GetAllVideos, GetVideoById, PostNewVideo, UpdateVideoById } from "../controllers/video.controller"
import { optionalVerifyAdminToken, verifyAdminToken } from "../utils/JWT"
const videoRouter = express.Router()

videoRouter.get("/",optionalVerifyAdminToken, GetAllVideos)
videoRouter.get("/comments", GetAllComments)
videoRouter.get("/:id", optionalVerifyAdminToken, GetVideoById)

videoRouter.post("/", PostNewVideo)
videoRouter.post("/:id/comments", AddNewComments)

videoRouter.put("/:id",verifyAdminToken, UpdateVideoById)

videoRouter.delete("/:id",verifyAdminToken, DeleteVideoById)
videoRouter.delete("/comments", DeleteCommentById)

export default videoRouter