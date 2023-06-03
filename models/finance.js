const mongoose=require('mongoose');
const { ObjectId } = require("mongodb");
const financeSchema=new mongoose.Schema({
    clubName:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
      },
    name:{
        type:String,
        required:true
      },
      reason:{
        type:String,
        required:true
      },
      amount:{
        type:Number,
        required:true
      },
      date:{
        type:Date,
        required:true
      },   
      status:{
        type:Boolean,
        required:true
      },   
});

module.exports=mongoose.model("Finance",financeSchema);