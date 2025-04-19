import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.model.js";


// we donts use res so intead _ is used its a common practice Thats all 
const verifyJwt  = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token){ 
        throw new ErrorHandler(401,"Unauthorized");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_AccessToken_SECRET);
        const user = await User.findById(decoded._id);
        if(!user){
            throw new ErrorHandler(401,"Unauthorized");
        }
        req.User = user;
        next();
    } catch (error) {
        throw new ErrorHandler(401,error?.message || "Invalid Access Token");
        
    }
    
})

export {verifyJwt};