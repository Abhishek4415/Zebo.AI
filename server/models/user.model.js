//create user schema
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        unique : true,
        required : true
    },
    credits : {
        type : Number,
        default : 100,
        min:0,
    }
}, {timestamps : true}) 

//create model

const User = mongoose.model("User", userSchema)

export default User