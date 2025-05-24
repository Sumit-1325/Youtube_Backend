
import { Router } from "express";
import {
    Get_All_Videos,
    Upload_Video,
    Search_Video_By_Id,
    Update_Video,
    Delete_Video
} from "../controllers/Video.controllers.js";
import upload from "../middlewares/Multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/Search/:VideoId").get(Search_Video_By_Id);
router.route("/get_All_Videos").get(Get_All_Videos);
router.route("/Upload").post(
    verifyJwt,
    upload.fields([
      { name: "Video", maxCount: 1 },
      { name: "Thumbnail", maxCount: 1 },
    ]),
    Upload_Video
  );

  router.route("/UpdateVideo/:VideoId").put(
    verifyJwt,
    upload.fields([
      { name: "Video", maxCount: 1 },
    ]),
    Update_Video
  );

  router.route("/DeleteVideo/:VideoId").delete(
    verifyJwt,
    upload.fields([
      { name: "Video", maxCount: 1 },
    ]),
    Delete_Video
  );



export default router;