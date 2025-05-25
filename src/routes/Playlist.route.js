import {Router} from "express";
import { Get_All_Playlists,Create_Playlist,Add_Videos_To_Playlist,Edit_Playlist } from "../controllers/Playlist.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/Multer.js";
const router = Router();

router.route("/get_Playlists").get(verifyJwt,Get_All_Playlists);
router.route("/Create_Playlist").post(verifyJwt,upload.none(),Create_Playlist);
router.route("/Add_Videos_To_Playlist").post(verifyJwt,upload.none(),Add_Videos_To_Playlist);
router.route("/Edit_Playlist").put(verifyJwt,Edit_Playlist);


export default router