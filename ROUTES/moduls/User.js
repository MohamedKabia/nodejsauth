const mongoose = require('mongoose')

const userSchema =new  mongoose.Schema({
    name:{
        type: String,
        required:true,
        min:6,
        max:30
    },
    email:{
        type: String,
        required:true,
        max:100
    },
    password:{
        type:String,
        required:true,
        min:8
    },
    rePassword:{
        type:String,
        required:false,
        min:8
    },
    date:{
        type:Date,
        default:Date.now()
    },
    resetpassword:{
        type:String,
        max:12,
        required:false
    }

})

module.exports = mongoose.model('User', userSchema)