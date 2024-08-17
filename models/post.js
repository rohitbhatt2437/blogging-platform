const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    date:{
        type:Date,
        default:Date.now()
    },
    content:String,
    likes:[
        {type:mongoose.Schema.Types.ObjectId, ref:"profile"}
    ]
})

module.exports = mongoose.model('post', postSchema); 