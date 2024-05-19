import { mongoose,Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//SARA COMMENTS NHI DE SKATA ISLIYE PAGINATE

const videoSchema=new Schema({


    videoFile:{
        type:String,  // USING THIRD PARTY SERVICE CLOUDINARY SERVICE
        required:true, 
    },

    thumbnail:{     // USING THIRD PARTY SERVICE CLOUDINARY SERVICE
        type:String,
        required:true, 
    },

    title:{
        type:String,
        required:true, 
    },

    description:{
        type:String,
        required:true, 
    },
    duration:{
        type:Number,  // USING THIRD PARTY SERVICE CLOUDINARY SERVICE
        required:true,
    },

    views:{
        type:Number,
        default:0,
    },

    published:{
        type:Boolean,
        default:true,
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);


export const Video=mongoose.model("Video",videoSchema);