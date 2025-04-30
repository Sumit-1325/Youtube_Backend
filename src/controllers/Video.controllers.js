import { asyncHandler } from "../utils/AsyncHandler.js";
// import {User} from "../models/user.model.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadResult, deleteFromCloudinary } from "../utils/cloudinary.js";


// get all videos On the Based on Title 
const Get_All_Videos = asyncHandler(async (req, res, next) => {
    const {Title } = req.body
    const videos = await Video.find({Title});
    return res.status(200).json(new ApiResponse(200, "success", {videos}));
})

// upload video and Upload video in cloudinary 
const Upload_Video = asyncHandler(async (req, res, next) => {
    let { Title, Description } = req.body;
    const UserDetails = req.User;

    if (!Title) {
        throw new ErrorHandler(400, "Title Required");
    }

    Title = Title.trim();
    Description = Description?.trim();

    // Get local file paths
    const localVideoPath = req.files?.Video?.[0]?.path;
    const localThumbnailPath = req.files?.Thumbnail?.[0]?.path;

    if (!localVideoPath) {
        throw new ErrorHandler(400, "Video File Required");
    }
    if (!localThumbnailPath) {
        throw new ErrorHandler(400, "Thumbnail File Required");
    }

    let uploadedVideo = null;
    let uploadedThumbnail = null;
    try {
        // Upload to cloud
        uploadedVideo = await uploadResult(localVideoPath, "video");
        console.log("uploadedVideo",uploadedVideo.url);
        
        uploadedThumbnail = await uploadResult(localThumbnailPath, "thumbnail");

        // Ensure upload returned URLs
        if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
            throw new ErrorHandler(500, "Cloudinary upload failed");
        }

        // Save to DB
        const video = await Video.create({
            Title,
            Description,
            VideoFile: uploadedVideo.url,
            Thumbnail: uploadedThumbnail.url,
            Owner: UserDetails._id
        });
        return res.status(200).json(new ApiResponse(200, "success", { video }));
    } catch (error) {
        console.error("Upload error:", error);
        if(uploadedVideo) await deleteFromCloudinary(uploadedVideo.url,"video");
        if(uploadedThumbnail) await deleteFromCloudinary(uploadedThumbnail.url,"thumbnail");
        throw new ErrorHandler(500, "Failed to upload video or thumbnail");
    }
});



// searching By Video Id
const Search_Video_By_Id = asyncHandler(async (req, res, next) => {
    const {VideoId } = req.params
    const videos = await Video.find({_id:VideoId});
    return res.status(200).json(new ApiResponse(200, "success", {videos}));
})

//Update Video 
const Update_Video = asyncHandler(async (req, res, next) => {
    const {VideoId } = req.params
    const {Title} = req.body
    const {Description} = req.body
    const video = await Video.findById(VideoId);
    if(!Video){
        throw new ErrorHandler(404,"Video Not Found");
    }
    if(!video.Owner === req.User._id){
        throw new ErrorHandler(401,"You Cant Update This VideoDetails");
    }
    try {
        if(Title &&  Description === null){
            video.Title = Title?.trim();
            await video.save();
        }
        if(Description && Title === null){
            video.Description = Description?.trim();
            await video.save();
        }
        if(Description && Title){
            video.Description = Description?.trim();
            video.Title = Title?.trim();
            await video.save(); 
        }
        return res.status(200).json(new ApiResponse(200, "success", {video}));
    } catch (error) {
        throw new ErrorHandler(500,"Error While Updating VideoDetails ");
        
    }
})

//Delete Video 
const Delete_Video = asyncHandler(async (req, res, next) => {
    try {
        const {VideoId } = req.params
        const video = await Video.findById(VideoId);
        if(!video){
            throw new ErrorHandler(404,"Video Not Found");
        }
        if(! video.Owner === req.User._id){
            throw new ErrorHandler(401,"You Cant Delete This VideoDetails");
        }
        await deleteFromCloudinary(video.videoFile,"video");
        await video.remove();
        return res.status(200).json(new ApiResponse(200, "success", {video}));
    } catch (error) {
        throw new ErrorHandler(500,"Error While Deleting Video ");
        
    }
})

export {Get_All_Videos,Upload_Video,Search_Video_By_Id,Update_Video,Delete_Video}