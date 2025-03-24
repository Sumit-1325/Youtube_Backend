import moongoose from "mongoose";
import { DB_Name } from "../constants.js";

const DatabaseConnection = async () => {
    try {
        const connection_instance = await moongoose.connect(`${process.env.DB_URL}/${DB_Name}`);
        console.log(`Database connected ! DB_Host:${connection_instance.connection.host}`);
    } catch (error) {
        console.log("Database connection error");
        exit(1);
    }
}

export default DatabaseConnection