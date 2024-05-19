// JUST TO VERIFY USER IS THERE OR NOT FOR LOGOUT
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"

import jwt from "jsonwebtoken";


export const verifyJWT=asyncHandler(async (req,_,next)=>{

   try {
     const token=req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
 
     if(!token)
     {
         throw new ApiError(401, "UNAUTHORISED REQUEST WHEN LOGOUT TOKEN")
     }
 
     // VERIFY TOKEN USING JWT
     const decodedToken= jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
 
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user)
     {
         //*****/ TODO DISCUSS ABOUT FRONTEND  *****//
         throw new ApiError(401, "INVALID ACCESS TOKEN")
     }
 
 
     req.user=user;
     next();
   } catch (error) {

    throw new ApiError(401,error?.message || "INVALID ACCESS TOKEN")
    
   }




})