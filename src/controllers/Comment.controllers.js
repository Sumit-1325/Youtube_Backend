import { asyncHandler } from "../utils/AsyncHandler.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";


const Create_Comment = asyncHandler(async (req, res) => {
  const user = req.User;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized User");
  }

  const  {comment} = req.body;
  const VideoId = req.params.VideoId;
  if (!VideoId) {
    throw new ErrorHandler(400, "Video ID is required");
  }

  if (!comment) {
    throw new ErrorHandler(400, "Comment is required");
  }
  

  // Validate Video ID format
  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ErrorHandler(400, "Invalid Video ID format");
  }
  console.log(VideoId);
 console.log("Video ID is valid");
  try {
      const NewComment = await Comment.create({
        video: VideoId,
        Comment : comment,
        owner: user._id
      });
      const video = await Video.findById(VideoId);
      if (!video) {
          throw new ErrorHandler(404, "Video Not Found");
      }
      return res.status(200).json(new ApiResponse(200, "success", { NewComment }));
  }
  catch (error) {
      throw new ErrorHandler(500, "Error While Creating Comment");
  }
})

const Get_All_Comments = asyncHandler(async (req, res) => {
  const {VideoId} = req.params
  const comments = await Comment.find({video:VideoId});
  return res.status(200).json(new ApiResponse(200, "success", { comments }));
})

const Edit_Comment = asyncHandler(async (req, res) => {
    const user = req.User;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized User");
    }
  
    const VideoId = req.params.VideoId;
    const CommentId = req.params.CommentId;
    const  {comment} = req.body;
    if (!VideoId) {
      throw new ErrorHandler(400, "Video ID is required");
    }
    if(!CommentId){
      throw new ErrorHandler(400, "Comment Not Found"); 
    }
  
    if (!comment) {
      throw new ErrorHandler(400, "Comment is required");
    }
    await Comment.findOneAndUpdate(
      { _id: CommentId },
      { Comment: comment },
      { new: true }
    );
    const comments = await Comment.find({video:VideoId});
    return res.status(200).json(new ApiResponse(200, "success", { comments }));
})

const Delete_Comment = asyncHandler(async (req, res) => {
    const user = req.User;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized User");
    }
  
    const VideoId = req.params.VideoId;
    const CommentId = req.params.CommentId;
    if (!VideoId) {
      throw new ErrorHandler(400, "Video ID is required");
    }
    if(!CommentId){
      throw new ErrorHandler(400, "Comment Not Found"); 
    }
    await Comment.findByIdAndDelete(CommentId);
    const comments = await Comment.find({video:VideoId});
    return res.status(200).json(new ApiResponse(200, "success", { comments }));
  })

export {Create_Comment,Get_All_Comments,Edit_Comment,Delete_Comment}