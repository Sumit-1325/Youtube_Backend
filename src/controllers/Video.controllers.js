import { asyncHandler } from "../utils/AsyncHandler.js";
// import {User} from "../models/user.model.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import fs from 'fs';


const Upload_Video =  asyncHandler(async (req, res, next) => {
    let {Title, Description } = req.body
    const UserDetails = req.User
    if (!Title) {
        throw new ErrorHandler(400, "Tittle Required"); 
    }
    Title = Title.trim();
    Description = Description?.trim();
    const VideoFile = req.files?.Video[0]?.path;
    const Thumbnail = req.files?.Thumbnail[0]?.path;
    if (!VideoFile) {
        throw new ErrorHandler(400, "Video File Required"); 
    }
    if (!Thumbnail) {
        throw new ErrorHandler(400, "Thumbnail File Required");
    }

    // UPload Files on cloudinary
    try {
        VideoFile= await uploadResult(VideoFile,"video");
        console.log("Video uploaded",Avatar);
        if (Localcoverpath) {
            Thumbnail = await uploadResult(Thumbnail,"thumbnail");
        }
        
    } catch (error) {
        if (!VideoFile) {
            throw new ErrorHandler(500,"Failed To upload VideoFile to Clodinary");
        }
        if(!Thumbnail){       
            throw new ErrorHandler(500,"Failed To Upload Thumbnail to Clodinary");
        }
        
    }
})


