import { mongoose,Schema } from "mongoose";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";


const userSchema=new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },

    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },

    avatar:{
        type:String, // USING THIRD PARTY SERVICE CLOUDINARY SERVICE
        required:true,
    },

    coverImage:{
        type:String, // USING THIRD PARTY SERVICE CLOUDINARY SERVICE
    },

    watchHistory:{
        // AUR BY CREATING ANOTHER MINI-SCHEMA
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },

    password:{
        // CHALLENGE HERE HOW TO COMAPRE WITH ENCRYPTED ONE
        type:String,
        required:[true, ' PASSWORD IS REQUIRED']
    },

    refreshToken:{
        type:String,
    }
    
},{timestamps:true});

//MIDDLEWARE HOOKS
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// MIDDLEWARE METHODS

// FOR PASSWORDS CHECKING

userSchema.methods.isPasswordCorrect=async function(password)
{
    return await bcrypt.compare(password,this.password);
}

// FOR GENERATING ACCESS TOKEN
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// FOR GENERATING REFRESH TOKEN STORED IN DATABASE WITH LESS
userSchema.methods.generateRefreshToken=function(){

    return jwt.sign({

        _id:this.id,


    },
      
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)

}





export const User=mongoose.model("User",userSchema);

