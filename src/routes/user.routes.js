import { Router } from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar, 
    updatedCoverImage,
    updateAccountDetails, 
    getUserChannelProfile,
    getWatchHistory, 

} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();

router.route("/register").post(

    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1

        }
    ]),
    
    registerUser);


 router.route('/login').post(loginUser);

 //verifyJ
 //SECURED ROUTES
 router.route('/logout').post( verifyJWT ,logoutUser); // MIDDWARE INJECTED 

 router.route('/refreshToken').post(refreshAccessToken);
 router.route('/changePassword').post(verifyJWT,changeCurrentPassword);
 router.route('/currentUser').get(verifyJWT, getCurrentUser);

 router.route('/updateAccountDetails').patch(verifyJWT,updateAccountDetails);
 // PATCH OTHERWISE ALL GET UPADTED


 router.route('/avatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

 router.route('/coverImage').patch(verifyJWT , upload.single("coverImage"),updatedCoverImage);


 //WHEN PARAMS
 router.route('/c/:username').get(verifyJWT,getUserChannelProfile);

 router.route('/watchHistory').get(verifyJWT,getWatchHistory);






export  {router};