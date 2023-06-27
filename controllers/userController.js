
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Token = require('../models/token');
const sendEmail= require('../utils/sendEmail')
const crypto=require('crypto')
const{uploadToCloudinary,removeFromCloudinary} =require('../middlewares/cloudinary')

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
          const userDetails=await User.findOne({email:email})
           const url=`http://localhost:4200/user/${added._id}/verify/${Ttoken.token}`
            await sendEmail(user.email,"Verify Email",url)
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
                    const token = jwt.sign({ _id: user._id }, "TheSecretKey");
                    res.cookie("jwt", token, {
                        httpOnly: true,
                        maxAge: 24 * 60 * 60 * 1000
                    });
                    res.json({
                        message: "success"
                    });
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
               const url=`http://localhost:4200/user/${user._id}/verify/${Ttoken.token}`
                await sendEmail(user.email,"Verify Email",url)
           }
        res.status(400).send({message:"An Email has been sent to your account please Verify"})
        }
        const token = jwt.sign({ _id: user._id }, "TheSecretKey");
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            message: "success"
        });
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
            const token = jwt.sign({ _id: _id }, "TheSecretKey")
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({
                message: "success"
            })
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
            const token = jwt.sign({ _id: _id }, "TheSecretKey")
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({
                message: "success"
            })
        }
    } catch (error) {
        next(error);
    }
}


//TO AUTHENTICATE A USER IS ACTIVE OR NOT
const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
        const user = await User.findOne({ _id: claims._id });
        if(user.isBlocked===true){
            return res.status(404).send({
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
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
        const user = await User.findOne({ _id: claims._id });
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
   
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
     
        const file = req.files.image;
  const userdetails = await User.findOne({ _id: claims._id });
      if(userdetails.imagePublicId){
    await removeFromCloudinary(userdetails.imagePublicId)
      }
  
        const image=await uploadToCloudinary(file.tempFilePath,"users-profile-pictures")
   
        await User.updateOne({ _id: claims._id }, { $set: { image: image.url,imagePublicId:image.public_id} });
    
          const user = await User.findOne({ _id: claims._id });
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
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        const updateFields = {};
        if (name) {
            updateFields.name = name;
        }
        if (address) {
            updateFields.address = address;
        }
        if (about) {
            updateFields.about = about;
        }
        if (phone) {
            updateFields.phone = phone;
        }
        await User.updateOne({ _id: claims._id }, { $set: updateFields });
        let data=await User.findOne({ _id: claims._id },)
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
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }else{
            let clubs = await User.findOne(
                {_id:claims._id}).populate('clubs.club')
                res.send(clubs);
        }
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
               const url=`http://localhost:4200/user/${user._id}/changePassword/${Ttoken.token}`
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
        res.cookie("jwt", "", {
            maxAge: 0
        });
        res.send({ message: "success" });
    } catch (error) {
        next(error);
    }
};


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
   
};

