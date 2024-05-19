
//STEP -2
// FILE SYSTEM/SERVER PAR UPLOAD HO GYI HAI
// 1 . UPLOAD FILE LOCAL SYSTEM/SERVER TO CLOUDINARY(SERVER)
// 2 . IF SUCCESSFULLY THEN REMOVE FROM SYSTEM'S LOCAL SERVER

import {v2 as cloudinary} from"cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";
import { User } from "../models/user.models.js";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
  
//   console.log("Env file"+ process.env.CLOUDINARY_CLOUD_NAME);

const uploadonCloudinary=async (localFilePath)=>{

    
    try{
        if(!localFilePath) return null;
        // UPLOAD ON CLOUDINARY
        console.log("Cloudinary File "+localFilePath);
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        
        //FILE HAS BEEN SUCCESSFULLY UPLOADED
    })

        console.log('FILE IS UPLOADED ON CLOUDINARY' , response.url);

        fs.unlinkSync(localFilePath);
        
        return response;

        }


    catch(error){

        console.log(error);
        fs.unlinkSync(localFilePath); //REMOVED THE LOCALLY SAVED FILE WHEN UPLOAD OPERATION GET FAILED
        return null;
    }
}

const deletefromCloudinary=async(fileName)=>{

   try {
     if(!fileName)
     {
         throw new ApiError(400, "OLD FILE IS MISSING");
     }
 
     const user = await User.findById(req.user?._id).select(fileName);
     if (!user) {
       throw new ApiError(404, "User not found");
     }
   
     // Extract the public ID of the old avatar from its URL
     const publicId = user.fileName.split("/").pop().split(".")[0];
   
     // Delete the old avatar from Cloudinary using its public ID
     const response=await cloudinary.uploader.destroy(publicId);
 
     return response;
     
   } catch (error) {

    console.log(error);
    
   }
}



export  {uploadonCloudinary,deletefromCloudinary};


