import mongoose , { Schema } from "mongoose";

const userSchema = new Schema({
    usernaeme: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
            trim : true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim : true,
        index: true
    },
    Password: {
        type: String,
        required: [true, "Password is required"],
        trim : true
    },

    fullname: {
        type: String,
        trim : true,
        required: true,
        index: true
    },

    avatar: {
        type: String, //cloudinary Url 
        trim : true
    },
    
    coverImage: {
        type: String, //clodinary Url
    },
    WatchHistory : [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken : {
        type: String
    }
},
{  timestamps: true }

);


export const User = mongoose.model("User", userSchema);