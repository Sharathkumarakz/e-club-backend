const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  image:{
    type:String,
    default:null
  },
  imagePublicId:{
    type:String,
    default:null
  },
  address:{
    type:String,
    default:null
  },
  about:{
    type:String,
    default:null
  },
  phone:{
    type:Number,
    default:null
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  verified:{
    type:Boolean,
    default:false
  },
  clubs:[
    {
      clubName:{
        type:String,
        default:null
      },
      password:{
        type:String,
        default:null
      },
      club:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
      } 
    }
  ]

  
});

module.exports=mongoose.model("User",userSchema);