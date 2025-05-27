import { Router } from "express";
import {Create_Comment,Get_All_Comments,Edit_Comment,Delete_Comment} from "../controllers/Comment.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import  upload from "../middlewares/Multer.js";


const router = Router();

router.route("/Create_Comment/:VideoId").post(verifyJwt,upload.none(),Create_Comment);
router.route("/Get_All_Comments/:VideoId").get(Get_All_Comments);
router.route("/Edit_Comment/:VideoId/:CommentId").put(verifyJwt,upload.none(),Edit_Comment);
router.route("/Delete_Comment/:VideoId/:CommentId").delete(verifyJwt,upload.none(),Delete_Comment);
export default router