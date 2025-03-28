import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration

(async function() {
    cloudinary.config({ 
        cloud_name: process.env.Clodinary_Cloud_Name, 
        api_key: process.env.Cloudinary_Api_Key, 
        api_secret: process.env.Cloudinary_Secret_Key // Click 'View API Keys' above to copy your API secret
    });
})

const uploadResult = async(LocalPath) =>{
    try {
        if(!LocalPath) return null;
        const result = await cloudinary.uploader.upload(LocalPath,{resource_type:"auto"});
        // return result
        ;
        console.log("File Uploaded on clodinary. File src:"+result.url);
        // Once the  file is uploaded, delete the local file
        fs.unlinkSync(LocalPath);
        return result
    } catch (error) {
        fs.unlinkSync(LocalPath);
        return null
        
    }}
export {uploadResult} 