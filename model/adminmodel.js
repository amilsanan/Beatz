const mongoose= require('mongoose')


const adminSchema= new mongoose.Schema({
    Fullname: String,
    mailid: String,
    password: String,
    confirmpassword:String
})


module.exports= mongoose.model('admin',adminSchema)