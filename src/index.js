import app from "./app.js";
import dotenv from "dotenv";
import DatabaseConnection from "./db/index.js";

dotenv.config({
    path:"./.env"
})

const port = process.env.PORT || 3000;

DatabaseConnection()
.then(() => app.listen(port, () => console.log(`Server is listening on port ${port} !`)))
.catch((err) => console.log("database connection error"));
