import { mongoose } from "mongoose";
import { Schema } from "mongoose";
const subscriptionSchema= new Schema({

    subscriber:{

        type:Schema.Types.ObjectId,  // ONE WHO IS SUBSCRIBING
        ref:"User"
    },

    channel:{
        type:Schema.Types.ObjectId, //ONE TO WHOM SUBSBCRIBER IS SUNSCRIBING
        ref:"User"
    }
    
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema);