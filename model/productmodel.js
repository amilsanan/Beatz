const mongoose = require('mongoose')


let addProductSchema = new mongoose.Schema({
    Name: String,
    Price: String,
    Category:String, 
    //     {type: mongoose.Schema.Types.ObjectId,
    //     ref: 'category'
    // },
    Description: String
},
    {
        timestamps: true
    })


module.exports = mongoose.model('addproduct', addProductSchema)