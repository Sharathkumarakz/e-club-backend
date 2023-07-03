
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Admin = require('../models/admin');
const Banner=require('../models/banner')
const{uploadToCloudinary,removeFromCloudinary} =require('../middlewares/cloudinary')
require('dotenv').config()

//ADMIN LOGIN
const adminlogin = async (req, res) => {
    const AdminDetails = await Admin.findOne({ email: req.body.email })
    if (!AdminDetails) {
        return res.status(404).send({
            message: "admin not Found"
        })
    }
    if (!(req.body.password == AdminDetails.password)) {
        return res.status(404).send({
            message: "Password is Incorrect"
        }) 
    }
    const token = jwt.sign({ _id: AdminDetails._id }, process.env.JWT_ADMIN_SECRETKEY)
    res.status(200).json({token});
}


//TO CHECK ADMIN ACTIVE OR NOT
const adminIsActive = async (req, res, next) => {
    try {
            let claim =jwt.verify(req.body.token, process.env.JWT_ADMIN_SECRETKEY) 
                if (claim) {
                    const AdminDetails = await Admin.findOne({ _id: claim._id })
                    const { password, ...data } = await AdminDetails.toJSON()
                    res.send(data)
                } else {
                    return res.status(401).send({
                        message: "UnAuthenticated"
                    })
                }
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO LIST ALL CLUBS
const getClubs = async (req, res, next) => {
    try {
        const allClubs = await Club.find({})
        res.send(allClubs)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}


//TO GET LEADERS OF A CLUB 
const getClubLeaders = async (req, res, next) => {
    try {
        const getClubLeaders = await Club.findOne({ _id: req.params.id }).populate('treasurer').populate('president').populate('secretory').exec();
        res.send(getClubLeaders)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}


//TO GET ALL MEMBERS OF A SPECIFIED CLUB
const getMembers = async (req, res, next) => {
    try {
        const gettingMember = await Club.findOne({ _id: req.params.id }).populate('members').exec();
        res.send(gettingMember)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO ADD CLUB TO BLACKLIST
const addToBlacklist = async (req, res, next) => {
    try {
        await Club.updateOne({ _id: req.params.id }, { $set: { isblacklisted: true } })
        const allClubs = await Club.find({})
        res.send(allClubs)
    } catch (error) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO GET ALL BLACKLISTED CLUBS
const blacklisteds = async (req, res, next) => {
    try {
        const blacklistedClubs = await Club.find({ isblacklisted: true })
        res.send(blacklistedClubs)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO REMOVE CLUBS FROM BLACK LIST
const removeFromBlacklist = async (req, res, next) => {
    try {
        await Club.updateOne({ _id: req.params.id }, { $set: { isblacklisted: false } })
        const blacklistedClubs = await Club.find({ isblacklisted: true })
        res.send(blacklistedClubs)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO GET ALL USERS OF E-CLUB
const getUsers = async (req, res, next) => {
    try {
        const allUsers = await User.find({})
        res.send(allUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO BLOCK A SPECIFIED USER
const blockUser = async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: true } })
        const allUsers = await User.find({})
        res.send(allUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "block user error"
        })
    }
}

//TO UNBLOCK A SPECIFIED USER
const unblockUser = async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })
        const allUsers = await User.find({})
        res.send(allUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "un block user error"
        })
    }
}

//GET DETAILS OF A SPECIFIED CLUB
const clubDetails = async (req, res, next) => {
    try {
        const clubDetails = await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer').populate('activeUsers')
        let data = clubDetails
        res.send({ data: data })
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//ADD BANNER
const addBanner=async (req, res) => {
    try {
          let file=req.files.image
          if(file){
            const image=await uploadToCloudinary(file.tempFilePath,"banner-pictures")
            let banner=new Banner({
            image: image.url,
            imageId:image.public_id,
            about:req.body.bannerText
        })
        let bannerAdded=banner.save()
        res.send(bannerAdded)
          }else{
            return res.status(401).send({
                welcome: "Error with image uloading"
            })
          } 
    } catch (error) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//GET ALL BANNER
const getBanners=async (req,res,next)=>{
    try {
        let banners=await Banner.find({})
        res.send(banners)
    } catch (error) {
        return res.status(401).send({
            welcome: "get banner error"
        })   
    }
}

//DELETE BANNER
const deleteBanner=async (req,res,next)=>{
    try {
        await removeFromCloudinary(req.body.id)
        await Banner.deleteOne({imageId:req.body.id})
        let banners=await Banner.find({})
        res.send(banners)
    } catch (error) {
        return res.status(401).send({
            welcome: "get banner error"
        })   
    }
}

//GET DASHBOARD DETAILS(USER COUNT,CLUB COUNT)
const getDashboard=async (req,res,next)=>{
    try {
        let users=await User.find({}).count()
        let clubs=await Club.find({}).count()
        let data={
            clubs:clubs,
            users:users
        }
        res.send(data)
    } catch (error) {
        return res.status(401).send({
            welcome: "get banner error"
        })   
    }
}



module.exports = {
    adminlogin,
    adminIsActive,
    getClubs,
    getClubLeaders,
    getMembers,
    addToBlacklist,
    blacklisteds,
    removeFromBlacklist,
    getUsers,
    clubDetails,
    blockUser,
    unblockUser,
    addBanner,
    getBanners,
    deleteBanner,
    getDashboard
}
