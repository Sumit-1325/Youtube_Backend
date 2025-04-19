import {Router} from "express";
import { RegisterUser ,loginUser,logoutUser } from "../controllers/User.controllers.js";
import upload from "../middlewares/Multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

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
    
    //Secured Routes

    router.route("/Logout").post(verifyJwt,logoutUser);

export default router