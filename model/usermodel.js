const mongoose= require('mongoose')


const userSchema= new mongoose.Schema({
    Fullname: String,
    mailid: String,
    password: String,
    confirmpassword:String
})


module.exports= mongoose.model('users',userSchema)