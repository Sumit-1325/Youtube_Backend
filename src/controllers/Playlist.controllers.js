import { asyncHandler } from "../utils/AsyncHandler.js";
import { ErrorHandler } from "../utils/ApiErrorHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

// Creating Playlist 
const Create_Playlist = asyncHandler(async (req, res) => {
  const user = req.User;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized User");
  }

  const { name, Description, VideoId } = req.body;

  console.log("Request Body:", req.body);

  if (!name) {
    throw new ErrorHandler(400, "Playlist name is required");
  }

  if (!Description) {
    throw new ErrorHandler(400, "Playlist Description is required");
  }

  if (!VideoId) {
    throw new ErrorHandler(400, "A Video ID is required to create a playlist");
  }

  // Validate Video ID format
  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ErrorHandler(400, "Invalid Video ID format");
  }

  console.log("Video ID is valid");

  try {
    const newPlaylist = await Playlist.create({
      name,
      Description, // must match the schema (case-sensitive)
      videos: [ new mongoose.Types.ObjectId(VideoId)],
      owner: user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "Playlist created successfully", { newPlaylist }));
  } catch (error) {
    console.error("Error in creating playlist:", error);
    throw new ErrorHandler(500, "Error creating playlist");
  }
});

// Get All Playlists
const Get_All_Playlists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find();
    return res.status(200).json(new ApiResponse(200, "success", {playlists}));
})

const Add_Videos_To_Playlist = asyncHandler(async (req, res) => {
    const { PlayListId, VideoId } = req.body;
    const user = req.User;
    if (!user || !user._id) {
        throw new ErrorHandler(401, "Unauthorized Request - No user data found");
    }

    if (!PlayListId || !VideoId) {
        throw new ErrorHandler(400, "Playlist ID and Video ID are required");
    }

    // Validate IDs
    if (!mongoose.isValidObjectId(PlayListId) || !mongoose.isValidObjectId(VideoId)) {
        throw new ErrorHandler(400, "Invalid Playlist or Video ID format");
    }

    const playList = await Playlist.findById(PlayListId);
    if (!playList) {
        throw new ErrorHandler(404, "Playlist Not Found");
    }

    console.log("Playlist Found");
    const video = await Video.findById(VideoId);
    if (!video) {
        throw new ErrorHandler(404, "Video Not Found");
    }
    if (playList.videos.includes(VideoId)) {
        throw new ErrorHandler(400, "Video already added to playlist");
    }
    console.log("Video Found");
const updatedPlayList = await Playlist.findByIdAndUpdate(PlayListId,{$addToSet:{videos:VideoId}},{new:true})
    return res.status(200).json(new ApiResponse(200, "Video added successfully", { updatedPlayList }));
});



// Edit Playlist
const Edit_Playlist = asyncHandler(async (req, res) => {
    const playlistId = req.body.PlaylistId;
    console.log(playlistId);
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ErrorHandler(404,"Playlist Not Found");
    }
    console.log(playlist);
    playlist.name = req.body.name;
    playlist.Description = req.body.Description;
    await playlist.save();
    return res.status(200).json(new ApiResponse(200, "success", {playlist}));
})

const Delete_Playlist = asyncHandler(async (req, res) => {
  const playlistId = req.body.PlaylistId;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ErrorHandler(404, "Playlist Not Found");
  }

  await playlist.deleteOne(); // 🔥 correct method for deleting document

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", { playlist }));
});



export {Get_All_Playlists , Create_Playlist , Add_Videos_To_Playlist , Edit_Playlist,Delete_Playlist}