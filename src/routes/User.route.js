import { Router } from "express";
import {
  ChangeCurrentPassword,
  RefreshAccessToken,
  RegisterUser,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/User.controllers.js";
import upload from "../middlewares/Multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
// /api/v1/healthCheck/test

//UnSecured Routes

router.route("/Register").post(
  upload.fields([
    { name: "Avatar", maxCount: 1 },
    { name: "CoverImage", maxCount: 1 },
  ]),
  RegisterUser
);

router.route("/Refresh-Token").post(RefreshAccessToken);

router.route("/Login").post(upload.none(), loginUser);

//Secured Routes
router.route("/Logout").post(verifyJwt, logoutUser);
router.route("/ChangePassword").post(verifyJwt,upload.none(), ChangeCurrentPassword);
router.route("/current-User").get(verifyJwt,getCurrentUser);
router.route("/c/:UserName").get(verifyJwt, getUserChannelProfile);
router.route("/update-Account").patch(verifyJwt,upload.none(),updateAccountDetails);
router.route("/update-Avatar").patch(verifyJwt,upload.single("Avatar"),updateUserAvatar);
router.route("/update-CoverImage").patch(verifyJwt,upload.single("CoverImage"),updateUserCoverImage);
router.route("/history").get(verifyJwt,getWatchHistory);


export default router;
