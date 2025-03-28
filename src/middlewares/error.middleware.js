import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import mongoose from "mongoose";
const errorMiddleware = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ErrorHandler)) {
        const StatusCode = error.statusCode || error instanceof mongoose.Error ? 500 : 400;

        const Message = error.message || "Something went wrong";

        error = new ErrorHandler(StatusCode, Message, error?. errors || [],error.stack);

    }
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development"? { stack: error.stack }: {})
    }

    res.status(error.statusCode).json(response);

};

export { errorMiddleware };