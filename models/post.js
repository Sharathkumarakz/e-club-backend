const mongoose=require('mongoose');
const { ObjectId } = require("mongodb");
const postSchema=new mongoose.Schema({
      clubName:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
      },
      image:{
        type:String,
        default:null
      },
      caption:{
        type:String,
        default:null
      },
      imagePublicId:{
        type:String,
        default:null
      }
});

module.exports=mongoose.model("Post",postSchema);