import mongoose , { Schema } from "mongoose";
import bcrypt from "bcrypt" 
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    UserName: {
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

    FullName: {
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

// Middle ware activate just Before saving the password , Storing password in hash inside database

userSchema.pre("save", async function(next){

    if(!this.isModified("Password")) return next();

    this.Password = bcrypt.hash(this.Password, 10);

next();
})  

// middle ware to decrept the password

userSchema.methods.isPasswordMatch = async function(Password){
    return await bcrypt.compare(Password,this.Password);
}

userSchema.methods.generateAccessToken = function(){
    // Short lived Access token
    return jwt.sign({
        _id: this._id,
        UserName: this.UserName,
        FullName: this.FullName,
        Email: this.Email
    }, process.env.JWT_AccessToken_SECRET, 
    {expiresIn: process.env.JWT_AccessToken_Expires});
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, process.env.JWT_RefreshToken_SECRET, 
    {expiresIn: process.env.JWT_RefreshToken_Expires});
}

export const User = mongoose.model("User", userSchema);