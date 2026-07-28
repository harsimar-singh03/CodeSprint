
const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema =new Schema({
    firstName:{
                type : String,
                required: true,
                maxLength : 20,
                minLength:3
    },
    lastName:{
                type : String,
                maxLength : 20,
                minLength:3
    },
    emailId:{
        type: String,
                required:true,
                unique:true,
                trim: true,
                lowercase:true,
                immutable: true,
    },
    age:{
        type : Number,
        min: 6,
        max : 80
    },
    role : {
        type : String,
        enum : ['user','admin'],
        default:'user'
    },
    problemSolved:{
        type :[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
    },
    password :{
        type:String,
        required : true
    }
},{timestamps : true})


const User = mongoose.model("user",userSchema);
module.exports = User;
