import {Router} from "express";
import { healthCheck } from "../controllers/HealthCheck.controllers.js";

const router = Router(); 
// /api/v1/healthCheck/test


router.route("/").get(healthCheck);

export default router