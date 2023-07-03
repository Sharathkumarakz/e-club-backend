
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Token = require('../models/token');
const Club= require('../models/club');
const sendEmail= require('../utils/sendEmail')
const crypto=require('crypto')
const{uploadToCloudinary,removeFromCloudinary} =require('../middlewares/cloudinary');

require('dotenv').config()



//USER REGISTRATION
const userRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const check = await User.findOne({ email: email });
        if (check) {
            return res.status(400).send({
                message: "Email already exist "
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        const added = await user.save();
        const token=crypto.randomBytes(32).toString("hex")
          const Ttoken= await new Token({
            userId:added._id,
            token:token
          }).save();
           await User.findOne({email:email})
           const url=`${process.env.FRONTEND_URL}/user/${added._id}/verify/${Ttoken.token}`
         sendEmail(user.email,"Verify Email",url)
        res.status(201).send({message:"An Email has been sent to your account please Verify"})
    } catch (error) {
        next(error);
    }
};


//USER LOGIN
const userLogin = async (req, res, next) => {
    try {
        if(req.body.userId){
            const {userId, password,tokenId}=req.body
            const user = await User.findOne({_id:userId });
                    if (!user) {
                        return res.status(404).send({
                            message: "User not found"
                        });
                    } const hashedPassword = await bcrypt.hash(password, 10);
                      let updated=  await User.updateOne({_id:userId},{$set:{verified:true,password:hashedPassword}})
                      await Token.deleteOne({token:tokenId})
                      if (!updated) {
                        return res.status(404).send({
                            message: "User not found"
                        });
                    }
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_USER_SECRETKEY);      
                    res.status(200).json({token});              
        }else{
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(404).send({
                message: "Password is incorrect"
            });
        }
        if(user.isBlocked===true){
            return res.status(404).send({
                message: "You are blocked"
            });  
        }
        if(!user.verified){
           let token=await Token.findOne({userId:user._id}) 
           if(!token){    
            const Ttoken= await new Token({
                userId:user._id,
                token:crypto.randomBytes(32).toString("hex")
              }).save();
               const url=`${process.env.FRONTEND_URL}/user/${user._id}/verify/${Ttoken.token}`
             sendEmail(user.email,"Verify Email",url)
           }
        res.status(400).send({message:"An Email has been sent to your account please Verify"})
        }
        const token = jwt.sign({ _id: user._id },process.env.JWT_USER_SECRETKEY);
         res.status(200).json({token});
        }
    } catch (error) {
        next(error);
    }
};

//SOCIAL LOGIN REGISTRATION AND LOGIN
const mailRegistration = async (req, res, next) => {
    try {
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.sub;
        let image=req.body.picture;
        const check = await User.findOne({ email: email })
        if (check) {
            const { _id } = await check.toJSON();
            const token = jwt.sign({ _id: _id },process.env.JWT_USER_SECRETKEY)
            res.status(200).json({token});
        } else {
            const changeP = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, changeP)
            const user = new User({
                name: name,
                email: email,
                 image:image, 
                password: hashedPassword
            })
            const added = await user.save();
            const { _id } = await added.toJSON();
            const token = jwt.sign({ _id: _id }, process.env.JWT_USER_SECRETKEY)
            res.status(200).json({token});
        }
    } catch (error) {
        next(error);
    }
}


//TO AUTHENTICATE A USER IS ACTIVE OR NOT
const userAuth = async (req, res, next) => {
    try {

        const claims = req.headers?.userId
        const user = await User.findOne({ _id: claims });
        if(user.isBlocked===true){
            return res.status(401).send({
                message: "You are blocked"
            });  
        }
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};


//VIEW PROFILE OF A USER
const viewProfile = async (req, res, next) => {
    try {

        const claims = req.headers?.userId
        const user = await User.findOne({ _id: claims });
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};


//USER PROFILE PICTURE UPDATION
const profilePictureUpdate = async (req, res, next) => {
    try {
        const claims = req.headers?.userId
        const file = req.files.image;
        const userdetails = await User.findOne({ _id: claims });
      if(userdetails.imagePublicId){
    await removeFromCloudinary(userdetails.imagePublicId)
      }
        const image=await uploadToCloudinary(file.tempFilePath,"users-profile-pictures") 
        await User.updateOne({ _id: claims}, { $set: { image: image.url,imagePublicId:image.public_id} });
          const user = await User.findOne({ _id: claims});
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};

//USER PROFILE UDATING 
const profileUpdating = async (req, res, next) => {
    try {
        const { name, address, about, phone } = req.body;
        const claims = req.headers.userId
        await User.updateOne({ _id: claims}, { $set:{name:name,address:address,about:about,phone:phone} });
        let data=await User.findOne({ _id: claims })
        res.send(data);
    } catch (error) {
        next(error);
    }
};

//SOCIAL LOGIN VERIFICATION THROUGH EMAIL
const verify=async(req,res,next)=>{
    try {
        const user=await User.findOne({ _id: req.params.id}) 
        if(!user)return res.status(400).send({message:'invalid Link'})
        const token=await Token.findOne({userId:user._id,token:req.params.token})
        if(!token)return res.status(400).send({message:'invalid Link'})
         await User.updateOne({_id:user._id},{$set:{verified:true}})
         await Token.deleteOne({token:req.params.token})
         res.status(200).send({message:'Verification successful'})
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }
}

// GET CLUBS OF A SPECIFIED USER
const getClubs= async (req, res) => {
    try {
        const claims = req.headers?.userId
            let clubs = await User.findOne(
                {_id:claims}).populate('clubs.club')
                res.send(clubs);
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }
}


//USER CHANGE PASSWORD
const changePassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }  
        if(user.isBlocked===true){
            return res.status(404).send({
                message: "You are blocked"
            });  
        }
           let token=await Token.findOne({userId:user._id}) 
           if(!token){    
            const Ttoken= await new Token({
                userId:user._id,
                token:crypto.randomBytes(32).toString("hex")
              }).save();
               const url=`${process.env.FRONTEND_URL}/user/${user._id}/changePassword/${Ttoken.token}`
              await sendEmail(user.email,"E-club Change Password",url)
           }
        res.status(400).send({message:"An Email has been sent to your account "})
        }
  catch (err) {
    return res.status(404).send({
        message: "Authentication error"
    });
  }
};

//USER LOGOUT
const logOut = async (req, res, next) => {
    try {
        res.send({ message: "success" });
    } catch (error) {
        next(error);
    }
};


const leaveFromClub = async (req, res, next) => {
    try {
     const found =await Club.findOne({_id:req.params.id})
     if(found){
        const claims = req.headers?.userId
     if (found.treasurer.toString() === claims.toString() ){
      await Club.updateOne({_id:found._id},{$set:{treasurer:null}})
      await User.updateOne(
        { _id:claims },
        { $pull: { clubs: { club:found._id } } }
      );
      return res.json({ changed:true });
     
     }else{
      await Club.updateOne({ _id:found._id }, { $pull: { members:claims} })
      await User.updateOne(
        { _id:claims },
        { $pull: { clubs: { club:found._id } } }
      );
      return res.json({ changed:true });
 
    }} }catch (error) {
      
      return res.status(401).send({
        message: "Clubs detail error"
      });
    }}


module.exports = {
    userRegister,
    userLogin,
    userAuth,
    logOut,
    viewProfile,
    profilePictureUpdate,
    profileUpdating,
    mailRegistration,
    verify,
    getClubs,
    changePassword,
    leaveFromClub
   
};

