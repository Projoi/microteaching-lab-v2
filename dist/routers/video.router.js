"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("../controllers/video.controller");
const videoRouter = express_1.default.Router();
videoRouter.get("/", video_controller_1.GetAllVideos);
videoRouter.get("/active", video_controller_1.GetAllActiveVideos);
videoRouter.get("/comments", video_controller_1.GetAllComments);
videoRouter.get("/:id", video_controller_1.GetVideoById);
videoRouter.post("/", video_controller_1.PostNewVideo);
videoRouter.post("/:id/comments", video_controller_1.AddNewComments);
videoRouter.put("/:id", video_controller_1.UpdateVideoById);
videoRouter.delete("/", video_controller_1.DeleteVideoById);
videoRouter.delete("/comments", video_controller_1.DeleteCommentById);
exports.default = videoRouter;
//# sourceMappingURL=video.router.js.map