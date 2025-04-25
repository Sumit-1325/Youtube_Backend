import { asyncHandler } from "../utils/AsyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadResult, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import fs from 'fs';
import JWT from "jsonwebtoken";
import mongoose from "mongoose";

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

const RegisterUser = asyncHandler(async (req, res ) => {
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

const loginUser = asyncHandler(async (req, res ) => {
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

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const RefreshToken = req.cookies.RefreshToken || req.body.RefreshToken;
    if (!RefreshToken) {
        throw new ErrorHandler(401, "Refresh token not found");
    }
    const decoded_token = JWT.verify
    (RefreshToken, process.env.JWT_SECRET); 
    
    // After this in User model in Refresh token we have user Id so using That to Find the user in database 

   try {
     const user = await User.findById(decoded_token?._id);
     if (!user) {
         throw new ErrorHandler(401, "Invalid Refresh Token");
     }     
     
     if (RefreshToken !== user?.RefreshToken) {
         throw new ErrorHandler(401, "Invalid Refresh Token");
     }
     const options = {
         httpOnly: true,
         secure : process.env.NODE_ENV === "production",
     }
     const AccessToken = user.generateAccessToken();
     res.status(200).cookie("AccessToken",AccessToken,options)
     .json(new ApiResponse(200,{AccessToken},"Access token refreshed successfully"));
     

   } catch (error) {
     throw new ErrorHandler(500,"Something went wrong while refreshing access token");
   }
    });

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                RefreshToken: undefined,
            },
        },
        {new: true}
    );

    const options = {
        httpOnly: true,
        secure : process.env.NODE_ENV === "production",
    }

    return res
    .status(200)
    .clearCookie("AccessToken",options)
    .clearCookie("RefreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"));
})


const ChangeCurrentPassword = asyncHandler(async (req, res) => {
    const { CurrentPassword, NewPassword } = req.body;
    const user = await User.findById(req.User?._id);
    const isPasswordMatch = await user.isPasswordMatch(CurrentPassword);
    if (!isPasswordMatch) {
        throw new ErrorHandler(401, "Invalid Current Password");
    }

    user.Password = NewPassword;
    await user.save();
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,req.User,"User fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {FullName,Email} = req.body;
    if(!FullName || !Email){
        throw new ErrorHandler(400,"FullName Or Email required");
    }
    const user = await User.findByIdAndUpdate(req.User?._id,
        {
        $set: {
            FullName:FullName,
            Email:Email
        },
    },
        {new: true}
    ).select("-Password","-RefreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"));    
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const LocalPath = req.file.path;
    if (!LocalPath) {
        throw new ErrorHandler(400,"Avatar required For Update");
    }

    const result = await uploadResult(LocalPath,"avatar");

    if (!result.url) {
        throw new ErrorHandler(500,"Something went wrong while updating avatar");
    }

    const user = await User.findByIdAndUpdate(req.User?._id,
        {
        $set: {
            Avatar:result.url
        },
    },
        {new: true}
    ).select("-Password","-RefreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    Localcoverpath = req.file.path;
    if (!Localcoverpath) {
        throw new ErrorHandler(400,"Cover Image required For Update");
    }

    const result = await uploadResult(Localcoverpath,"cover");

    if (!result.url) {
        throw new ErrorHandler(500,"Something went wrong while updating cover image");
    }

    const user = await User.findByIdAndUpdate(req.User?._id,
        {
        $set: {
            CoverImage:result.url
        },
    },
        {new: true}
    ).select("-Password","-RefreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image updated successfully"));
})
    
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {UserName} = req.params
    if(!UserName?.trim()){
        throw new ErrorHandler(400,"Username required");
    }
    const channel = await User.aggregate( 
    [
        {
            $match: {
                UserName: UserName?.toLowerCase()
            }
        },
        {
            $Lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "Channel",
                as: "Subscribers"  //chaneel of the user where he/she has many subscribers
            }
        },
        {
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "Subscriber",
                as: "Subscribed To" //Channel where user susbcribe to 
            }
        },
        {
            $addFields: {
                SubscriptionTo_Count : {
                    $size: "$Subscribed To" 
                },
                Subscribers_Count : {
                    $size: "$Subscribers"
                },
                isSubscribed : {
                    $cond: {
                        if: {
                            $in: [req.User?._id,"$Subscribed To.Subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {  //Project only Necessary data 
            $project: {
                UserName: 1,
                Email:1,
                FullName: 1,
                Avatar: 1,
                CoverImage: 1,
                SubscriptionTo_Count: 1,
                Subscribers_Count: 1,
                isSubscribed: 1
            }
        }
    ])
    if(!channel?.length){
        throw new ErrorHandler(404,"Channel not found");
    }
    
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        channel[0],
        "Channel profile fetched successfully"
    ));
})


    const getWatchHistory = asyncHandler(async (req, res) => {
        const user = await User.aggregate([
            {
                $match: { _id: new ObjectId(req.User?._id) },
            },
            {
                $lookup: {
                    from: "Videos",
                    localField: "WatchHistory",
                    foreignField: "_id",
                    as: "WatchHistory",
                    pipeline: [
                        {        
                            $lookup:{
                                from: "Users",
                                localField: "Owner",
                                foreignField: "_id",
                                as: "Owner",
                                pipeline: [
                                    {
                                        $project: {
                                            UserName: 1,
                                            FullName: 1,
                                            Avatar: 1,
                                        }
                                    }
                                ]
                            }
                        } ,
                        {
                            $addFields: {
                                Owner: {
                                    $first: "$Owner"
                                }   
                            }
                        }
                    ]
                },
            },
        
                
        ])  
        
        return res
        .status(200)
        .json(new ApiResponse(200,user[0]?.WatchHistory,"Watch History Fetched Successfully"));
})

export { RegisterUser,loginUser,RefreshAccessToken,logoutUser,ChangeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory }