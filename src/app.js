import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"


const app=express();

// METHOD 1 : app.use(cors());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// HANDLE DATA FROM FORM
app.use(express.json({limit:"16kb"}))

// HANDLE DATA FROM URL
app.use(express.urlencoded({extended:true}))

// HANDLE PUBLOIC ASSEST , PDF ,IMAGES
app.use(express.static("public"))

// COOKIEPARSER SECURELY HANDLE COOKIE BY SERVER ON USER BROWSER
app.use(cookieParser());



//ROUTES IMPORT

import {router} from "./routes/user.routes.js";

//ROUTES DECLARATIONS

app.use("/api/v1/users",router);

//http://localhost:8000/api/v1/user/register
                                 //(HERE control goes to router




export default app;
