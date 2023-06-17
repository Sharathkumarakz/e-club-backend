const mongoose=require('mongoose');

const chatSchema=new mongoose.Schema({
 
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
      },
      message:{
        type:String,
        required:true
      },
      time:{
        type:Date,
        default:Date.now(),
      }
});

module.exports=mongoose.model("Chat",chatSchema);