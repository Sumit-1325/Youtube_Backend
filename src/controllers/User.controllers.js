import { asyncHandler } from "../utils/AsyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadResult } from "../utils/cloudinary.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const RegisterUser = asyncHandler(async (req, res, next) => {
    console.log("Received Request Body:", req.body); // 🔍 Debugging step

    let { FullName, Email, UserName, Password } = req.body;

    if (!FullName || !Email || !UserName || !Password) {
        throw new ErrorHandler(400, "All fields are required");
    }

    FullName = FullName.trim();
    Email = Email.trim();
    UserName = UserName.trim();
    Password = Password.trim();
    
    
    const existUser = await User.findOne({
        $or: [{ UserName:UserName},{Email:Email}]});
        
    if(existUser){
        throw new ErrorHandler(409,"User already exist");
    }
    
    const LocalAvatarpath = req.files?.Avatar[0]?.path;
    const Localcoverpath = req.files?.CoverImage[0]?.path;
    
    if (!LocalAvatarpath) {
        throw new ErrorHandler(400, "Avatar File is Missing ");
    }
    
    
    // Upload to cloudinary
    const Avatar = await uploadResult(LocalAvatarpath);
    let CoverImage = null;
    if (Localcoverpath) {
        CoverImage = await uploadResult(Localcoverpath);
    }
    
    const user = await User.create({
        FullName,
        Email,
        UserName: UserName.toLowerCase(),
        Password,
        Avatar: Avatar.url,
        CoverImage: CoverImage?.url || null
    });


    const CreatedUser = await User.findById(user._id).select("-Password -refreshToken");

    if(!CreatedUser){
        throw new ErrorHandler(500,"Something went wrong");    
    }
    return res.status(201).json(new ApiResponse(201,CreatedUser,"User Registered  Successfully"));

})
export { RegisterUser };