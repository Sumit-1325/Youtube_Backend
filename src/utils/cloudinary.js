import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";

// Configuration
dotenv.config({
    path:"./.env"
});

// Configuration


cloudinary.config({ 
    cloud_name: process.env.Clodinary_Cloud_Name, 
    api_key: process.env.Cloudinary_Api_Key, 
    api_secret: process.env.Cloudinary_Secret_Key // Click 'View API Keys' above to copy your API secret
});


const uploadResult = async(LocalPath, fileType) =>{
    console.log(LocalPath);
    let resourceType = 'auto';
    let folder = '';
    if (fileType === 'avatar') {
        folder = 'avatars';
    } else if (fileType === 'cover') {
        folder = 'covers';
    } else if (fileType === 'video') {
        folder = 'video';
        resourceType = 'video';
    } else if(fileType === 'thumbnail'){
        folder = 'thumbnails'
    }else if(fileType === 'image'){
        folder = 'images'
    }
    try {
        console.log("File to be uploaded on cloudinary:",LocalPath);    
        if(!LocalPath) return null;
        const result = await cloudinary.uploader.upload(LocalPath,{
            resource_type:resourceType,
            folder:folder
        });
        // return result
        ;
        console.log("File Uploaded on clodinary. File src:"+result.url);
        // Once the  file is uploaded, delete the local file
        console.log("File deleted from local path:",LocalPath);
        fs.unlinkSync(LocalPath);
        return result
    } catch (error) {
        console.log("Error while deleting from LocalDirectory",error)
        fs.unlinkSync(LocalPath);
        return null
        
    }}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("File deleted from cloudinary.publicId:",publicId);
        return result
        
    } catch (error) {
        console.log("Error while deleting from cloudinary",error)
        return null
        
    }
    
}    

export {uploadResult,deleteFromCloudinary} 