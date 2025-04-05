import { asyncHandler } from "../utils/AsyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadResult, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import fs from 'fs';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new ErrorHandler(404,"User not found");
        }
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
        user.RefreshToken = RefreshToken;
        await user.save();
        return {AccessToken,RefreshToken};
    } catch (error) {
        throw new ErrorHandler(500,"Error while generating access token and refresh token");
        
    }
}

const loginUser = asyncHandler(async (req, res, next) => {
    // Get Data From Body 
    let { email,UserName, Password } = req.body;

    //Validation 
    if (!email && !UserName) {
        throw new ErrorHandler(400, "All fields are required");
    }
    if (!Password) {
        throw new ErrorHandler(400, "Password is required");
    }
    email = email?.trim();
    UserName = UserName?.trim();
    Password = Password?.trim();

    const user = await User.findOne({
        $or: [{ UserName:UserName},{Email:email}]});
    if (!user) {
        throw new ErrorHandler(404, "User not found");
    }

    // Validate Password
    const isPasswordMatch = await user.isPasswordMatch(Password);
    if (!isPasswordMatch) {
        throw new ErrorHandler(401, "Invalid Password");
    }

    // Generate Access Token and Refresh Token
    const {AccessToken,RefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const LoggedInUser = await User.findById(user._id).select("-Password -RefreshToken");
    if (!LoggedInUser) {
        throw new ErrorHandler(500, "Something went wrong");
    }

    const option = {
        httpOnly: true,
        secure : process.env.NODE_ENV === "production",
    }

    res.status(200).cookie("AccessToken",AccessToken,option)
    .cookie("RefreshToken",RefreshToken,option)
    .json(new ApiResponse(200,
       { user:LoggedInUser, AccessToken, RefreshToken},"User logged in successfully"));

})

const RegisterUser = asyncHandler(async (req, res, next) => {
    console.log(req.files);

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
        console.log("User already exist");
        if (req.files?.Avatar[0]?.path) {
            fs.unlinkSync(req.files?.Avatar[0]?.path);
        }
        if (req.files?.CoverImage[0]?.path) {
            fs.unlinkSync(req.files?.CoverImage[0]?.path);
        }
        throw new ErrorHandler(409,"User already exist");
    }
    const LocalAvatarpath = req.files?.Avatar[0]?.path;
    const Localcoverpath = req.files?.CoverImage[0]?.path;
    console.log(LocalAvatarpath,Localcoverpath);
    
    if (!LocalAvatarpath) {
        throw new ErrorHandler(400, "Avatar File is Missing ");
    }
    
    
    // Upload to cloudinary
    
    let Avatar;
    let CoverImage = null;
    try {
        Avatar = await uploadResult(LocalAvatarpath,"avatar");
        console.log("Avatar uploaded",Avatar);
        if (Localcoverpath) {
            CoverImage = await uploadResult(Localcoverpath,"cover");
        }
        
    } catch (error) {
        if (!Avatar) {
            throw new ErrorHandler(500,"Failed To upload Avatar to Clodinary");
        }
        if(!CoverImage){       
            throw new ErrorHandler(500,"Failed To CoverImage to Clodinary");
        }
        
    }
    
    try {
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
    } catch (error) {
        console.log("Error while creating user",error);
        if (Avatar) {
            await deleteFromCloudinary(Avatar.public_id);
        }
        if (CoverImage) {
            await deleteFromCloudinary(CoverImage.public_id);
        }
        throw new ErrorHandler(500,"Something went wrong while creating user and Images were deleted");
    }

})
export { RegisterUser,loginUser };