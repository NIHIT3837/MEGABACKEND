//require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config(
    {
        path:'./.env'
    }
)


// app.on("error", (error)=>{
//     console.log("CAN'T TALK TO DATABASE");
//     throw error;
// })

connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
    } )
})
.catch((error)=>{
    console.log("MONGO DB CONNECTION FAILED HERE", error);
})





























/*
import express from "express"

const app=express();

;(async ()=>{

    try {

        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error)=>{
            console.log("CAN'T TALK TO DATABASE");
            throw error;
        })
        
        app.listen(process.env.PORT, ()=>{
            console.log(`APP IS LISTENING AT PORT ${process.env.PORT}`);
        })


    } catch (error) {
        console.log("ERROR ", error);
    }
}) */