import mongoose , { Schema } from "mongoose";
import mongooseAggregatePaginate  from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videoFile : {
        type: String,//cloundinary url
        required: true
    },
    Thumbnail : {
        type: String, // cloudinary Url
        required: true
    },
    Title : {
        type: String,
        required: true
    },
    Description : {
        type: String,
        required: true
    },
    Duration : {
        type: Number,
        required: true
    },
    Views : {
        type: Number,
        default: 0
    },
    IsPublished : {
        type: Boolean,
        default: true
    },
   Owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
   }

},
{timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);