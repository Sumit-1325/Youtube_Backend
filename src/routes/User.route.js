import {Router} from "express";
import { RegisterUser ,loginUser } from "../controllers/User.controllers.js";
import upload from "../middlewares/Multer.js";


const router = Router(); 
// /api/v1/healthCheck/test

router.route("/Register").post(upload.fields([
    { name: "Avatar", maxCount: 1 },
    { name: "CoverImage", maxCount: 1 }
]),
 RegisterUser);


    router.route("/Login").post(
        upload.none(),
        loginUser);

export default router