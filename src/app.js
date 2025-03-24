import express from "express";
import cors from "cors";

const app = express();

//middleware to tell who can the database 
app.use(
    cors({
    origin:process.env.CLIENT_URL,
    credentials: true
}));

//Express Middleware 
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb"}));
app.use(express.static("public"));

//import routes 
import HealthChek from "./routes/HealthCheck.route.js";

//routes
app.use("/api/v1/healthCheck", HealthChek);

export default app;