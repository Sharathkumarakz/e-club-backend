const mongoose=require('mongoose');
const { ObjectId } = require("mongodb");
const eventSchema=new mongoose.Schema({
    clubName:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
      },
    event:{
        type:String,
        required: true,
    },
    auther:{
        type:String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
      }
});

module.exports=mongoose.model("Event",eventSchema);