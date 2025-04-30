
import { Router } from "express";
import {
    Get_All_Videos,
    Upload_Video,
} from "../controllers/Video.controllers.js";
import upload from "../middlewares/Multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(Get_All_Videos);
router.route("/Upload").post(
    verifyJwt,
    upload.fields([
      { name: "Video", maxCount: 1 },
      { name: "Thumbnail", maxCount: 1 },
    ]),
    Upload_Video
  );

export default router;