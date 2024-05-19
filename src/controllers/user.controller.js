import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.models.js";

import { uploadonCloudinary,deletefromCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// STEP 5
const generateAccessTokenandRefreshTokens = async(userId) =>{
  try {
    
      const user = await User.findById(userId)

      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}


const registerUser = asyncHandler( async (req, res) => {

  /* PROBLEM REGISTER A USER

   1. GET USER DETAILS
   2. VALIDATION
   3. CHECK USER ALREADY EXIST OR NOT
   4. CHECK FOR IMAGE AND avatar*
   5. UPLOAD THEM SUCCESSFULLY ON CLOUDINARY AND TAKE RESPONSE(URL)
   6. CREATE USER OBJECT-CREATE ENTRY IN DATABASE
   7. REMOVE PASSWORD AND REFRSH TOKEN
   8. CHECK USER SUCCESSFULLY CREATED
   9. TAKE RESPONSE

   */
    
   //STEP 1
   const {username,email,fullName,password}=req.body

   console.log("email" , email);


   //LITTLE TRIKCY FAST  //STEP 2
   if([username,email,fullName,password].some( (field)=> {field?.trim()===" " }))
   {

    throw new ApiError(400 , "ALL FIELDS ARE REQUIRED");

   }
   /* SIMPLE METHOD FOR BEGINER VALIDATION
   if(fullName==="")
   {
    throw new ApiError(400, "FULLNAME IS REQUIRED");
   }
   */



   // STEP-3
  const existedUser= await User.findOne({
    $or:[{username,email}]

   })


   if(existedUser)
   {
    throw new ApiError(409, "USER WITH EMAIL OR USERNAME ALREADY EXISTED")
   }

   //STEP 4 IMAGES AND avatar  USE MULTER ADD MORE FUNCTIONALITY TO REQ(EXPRESS)
   // MULTER UPLOAD BOTH avatar AND COVERIMAGE ON LOCAL SERVER AND GIVE URL


   const avatarLocalPath= req?.files?.avatar?.[0]?.path;  
   console.log(avatarLocalPath);
   // REQUIRED

   const coverImageLocalPath = res?.files?.coverImage?.[0]?.path

   if(!avatarLocalPath)
   {
    // console.log("Error");
    throw new ApiError(400, "avatar IS REQUIRED");

   }

   //STEP 5 UPLOAD ON CLOUDINARY

   const avatar=await uploadonCloudinary(avatarLocalPath);
   console.log(avatar);

   const coverImage=await uploadonCloudinary(coverImageLocalPath);


   //STEP 6 AGAIN CHECK avatar
   if(!avatar)
   {
    throw new ApiError(400, "avatar IS REQUIRED");
   }

   //STEP 7  PERFOM ENTRY IN DATABASE
   //USER FROM MODEL IS ONLY CONTACTING WITH DATABASE

   const user=await User.create({
    fullName,

    avatar:avatar.url,

    coverImage:coverImage?.url || " ",
    email,
    password,
    username: username.toLowerCase()
   })

   // STEP 8 CHECK WHETHER USER CREATED OR NOT AND THEN REMOVE PASSWORD AND REFRESH TOKEN

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

       if(!createdUser)
       {
        throw new ApiError(500, "SOMTHING WENT WRONG WHILE REGISTERING THE USER")
       }

       // STEP 9 GIVE RESPONSE BY USING APIRESPONSE


       return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
       )




  });


  const loginUser=asyncHandler( async(req,res)=>{

    // STEP 1
    const {username,email,password}=req.body;
    // STEP 2
    if(!(username || email))
    {
      throw new ApiError(400,"USERNAME OR EMAIL IS REQUIRED")
    }

    //STEP 3 FIND USER
    const user = await User.findOne({
      $or: [{username} ,{email} ]
    })

    if(!user)
    {
      throw new ApiError(404,"USER DOES NOT EXIST")
    }

    // STEP 4 USER MIL GYA PASSWORD CHECK KARO


    const ispasswordValid=await user.isPasswordCorrect(password);


    if(!ispasswordValid)
    {
      throw new ApiError(401,"PASSWORD IS INCORRECT || INVALID USER CREDENTIALS")
    }


    //STEP 5 GENERATE BOTH TOKEN


    const {accessToken,refreshToken}=await generateAccessTokenandRefreshTokens(user._id);

    //STEP 6 SAVE TO COOKIES by default:can be modified by frontend

    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken ")


    const options={
      httpOnly:true, // MODIFCATION OF COOKIES BY BACKEND ONLY
      secure:true, 
    }

    //STEP 7
    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken", accessToken,options)
    .json(

      new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken  // ALLOW USER TO STOREIN LOCAL SERVER
      },
    "USER LOGGED IN SUCCESSFULLY")
    )











  })

  const logoutUser=asyncHandler(async(req,res)=>{

    //WE WANT USER OBJECT HERE WE CANT HAVE USERNAME,EMAIL,ETC
    User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken:1
        }
      },
      {
        new: true 
      }
    )

    const options={
      httpOnly:true, // MODIFCATION OF COOKIES BY BACKEND ONLY
      secure:true, 
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{}, "USER LOGGED OUT")); 

  })

  const refreshAccessToken=asyncHandler(async (req,res)=>{

    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if(! incomingRefreshToken)
    {
      throw new ApiError(400,"UNAUTHORISED REQUEST")
    }

    // VERIFY

    try {
      const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
      const user =await User.findById(decodedToken?._id);
  
      if(!user)
      {
        throw new ApiError(401, "INVALID REFRESH TOKEN")
      }
  
      // VERIFY user token and incoming token
  
      if(user?.refreshToken!==incomingRefreshToken)
      {
        throw new ApiError(401,"REFRESH TOKEN EXPIRED OR USED")
  
      }
  
      const options={
        httpOnly:true,
        secure:true,
      }
  
      const {accessToken,newrefreshToken}=await generateAccessTokenandRefreshTokens(user._id);
  
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,options)
      .json(
        new ApiResponse(200,
        {
          accessToken,refreshToken:newrefreshToken
        },"ACCESS TOKEN REFRESHED SUCCESSFULLY")
      )
    } catch (error) {

      throw new ApiError(401, error?.message || "INVALID REFRESH TOKEN" );
      
    }

    
  })


  const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


  const getCurrentUser=asyncHandler(async (req,res)=>{

    return res
    .status(200)
    .json(
      new ApiResponse(200,req.user,"CURRENT USER FETCHED SUCCESSFULLY")
    )
  })


  const updateAccountDetails=asyncHandler(async (req,res)=>{

    const {fullName,email}=req.body;

    if(!fullName && !email)
    {
      throw new ApiError(400, "ALL FIEDLS ARE REQUIRED");
    }

    const user =await User.findByIdAndUpdate(req.user?._id,{

      $set:{
        fullName:req.body.fullName,

        email:req.body.email
      }

    },
  {new :true}).select("-password");

  //const updatedUser = await User.findById(req.user?._id).select("-password");


  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"ACOOUNT DETAILS UPDATED SUCCESSFULLY")
  )





  })


  const updateUserAvatar=asyncHandler(async (req,res)=>{

    const avatarLocalPath=req.file?.path;

    if(!avatarLocalPath)
    {
      throw new ApiError(400, " AVATAR FILE IS MISSING");
    }

    const avatar=await uploadonCloudinary(avatarLocalPath);
    if(!avatar.url)
    {
      throw new ApiError(400, " ERROR WHILE UPLOADING AVATAR ON CLOUDINARY");
    }

   const olddata= await deletefromCloudinary(avatar);

   if(!olddata)
   {
    throw new ApiError(400,"OLD DATA NOT DELETED SUCCESSFULLY");
   }

   console.log("OLD DATA DELETED SUCCESSFULLY");


    const updatedUser=await User.findByIdAndUpdate(req.user?._id,{

      $set:{
        avatar:avatar.url
      }
    },{new:true}).select("-password")
    
    //const updatedUser=await User.findById(req.user?._id).select("-password")

    return res
    .status(200)
    .json(
      new ApiResponse(200,updatedUser,"AVATR UPDATED SUCCESSFULLY")
    )
  })


  const updatedCoverImage=asyncHandler(async (req,res)=>{


    const coverImageLocalPath=req?.file?.path;

    
    if(!coverImageLocalPath)
    {
      throw new ApiError(400, "COVER IMAGE MISSING");
    }

    const coverImage=uploadonCloudinary(coverImageLocalPath);
    if(!coverImage)
    {
      throw new ApiError(400,"ERROR WHILE UPLOADING COVER IMAGE ON CLOUDINARY")
    }

    const response=await deletefromCloudinary(coverImage);

    if(!response)
    {
      throw new ApiError(400,"OLD DATA NOT DELETED SUCCESSFULLY");
    }

    console.log("OLD DATA GONE");

    const user =await User.findByIdAndUpdate(req.user?._id,{
      $set:{
        coverImage:coverImage.url
      }
    },{new:true}).select("-password")


    return res
    .status(200)
    .json(
      new ApiResponse(200,user,"COVER IMAGE UPDATED SUCCESSFULLY")
    );


  })


  //AGGEREGATION PIPELINES

  const getUserChannelProfile=asyncHandler( async (req,res)=>{

    const {username}=req.params;

    if(!username?.trim())
    {
      throw new ApiError(400 , "USERNAME IS MISSING");
    }

    const channel= await User.aggregate([

      //CHECK USER
      {
        $match:{
          username:username
        }
      },
      //CAL SUBSCIBERS THROUGH CHANNEL
      {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      },
      //CAL CHANNEL SUBSCBED TO THROUGH SUBSCRIBERS
      {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"subscribers",
          as:"subscribedTo"
        }
      },

      // ADDING NEW FIELDS COUNT OF SUBSCIBERS,SUBSCRIBEDTO 
      {
        $addFields:{
           //ADD SUBERS COUNT
          subscribersCount:{
            $size:"$subscribers"
          },
          //ADD SUBTO COUNT
          channelsSubscribedToCount:{
            $size:"$subscribedTo"
          },

          //FLAG WHETHER SUBSCRIBED OR NOT
          isSubscribedTo:{

            $cond:{
              if:{$in : [req.user?._id , "$subscribers.subscriber" ]},
              then:true,
              else:false
            }
          }
        }
      },

      {
        $project:{
          fullName:1,
          username:1,
          email:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribedTo:1,
          avatar:1,
          coverImage:1,
        }
      }
    ])

    if(!(channel?.length))
    {
      throw new ApiError(401,"CHANNEL DOES NOT EXIST")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200,channel[0],"User Channel Fetched SuccessFully")
    )







  })


  const getWatchHistory=asyncHandler(async (req,res)=>{

    //const userId=req.user._id;
    // IT DOES NOT GIVE MONGODB ID IT RETURNS STRING WHICH MONGOOSE CONVERT IT INTO ID
    // BUT INSIDE IT DIRECTLY DEAL WITH MONGO DB
      const user = await User.aggregate([
          {
              $match: {
                  _id: new mongoose.Types.ObjectId(req.user._id)
              }
          },
          {
              $lookup: {
                  from: "videos",
                  localField: "watchHistory",
                  foreignField: "_id",
                  as: "watchHistory",
                  pipeline: [
                      {
                          $lookup: {
                              from: "users",
                              localField: "owner",
                              foreignField: "_id",
                              as: "owner",
                              pipeline: [
                                  {
                                      $project: {
                                          fullName: 1,
                                          username: 1,
                                          avatar: 1
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          $addFields:{
                              owner:{
                                  $first: "$owner"
                              }
                          }
                      }
                  ]
              }
          }
      ])
  
      return res
      .status(200)
      .json(
          new ApiResponse(
              200,
              user[0].watchHistory,
              "Watch history fetched successfully"
          )
      )
  })

   


  

  































export {
registerUser,
loginUser,
logoutUser,
refreshAccessToken,
changeCurrentPassword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updatedCoverImage,
getUserChannelProfile,
getWatchHistory
};