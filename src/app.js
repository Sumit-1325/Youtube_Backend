import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());


//middleware to tell who can accesss the database 
app.use(
    cors({
    origin:process.env.CLIENT_URL,
    credentials: true
}));

//Express Middleware 
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

//import routes 
import HealthChek from "./routes/HealthCheck.route.js";
import UserRouter from "./routes/User.route.js";
import {errorMiddleware} from "./middlewares/error.middleware.js";

//routes
app.use("/api/v1/healthCheck", HealthChek);
app.use("/api/v1/Users", UserRouter);


app.use(errorMiddleware);
export default app;