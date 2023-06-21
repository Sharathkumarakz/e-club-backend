const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Post = require('../models/post');
const Event = require('../models/events');
const Admin = require('../models/admin');
const upload = require('../middlewares/multer')
const { ObjectId } = require('mongodb');
const { request } = require('express');



//ADMIN LOGIN
const adminlogin = async (req, res) => {
    const GettingUser = await Admin.findOne({ email: req.body.email })
    if (!GettingUser) {
        return res.status(404).send({
            message: "User not Found"
        })
    }
    if (!(req.body.password == GettingUser.password)) {
        return res.status(404).send({
            message: "Password is Incorrect"
        })
    }
    const token = jwt.sign({ _id: GettingUser._id }, "TheSecretKeyofAdmin")
    res.cookie("jwtAdmin", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    })
    res.json({
        message: "success"
    })
}


//TO CHECK ADMIN ACTIVE OR NOR
const adminIsActive = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwtAdmin']
        const claims = jwt.verify(cookie, "TheSecretKeyofAdmin")
        if (!claims) {
            return res.status(401).send({
                message: "UnAuthenticated"
            })
        } else {
            const GettingUser = await Admin.findOne({ _id: claims._id })
            const { password, ...data } = await GettingUser.toJSON()
            res.send(data)
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
        const GettingClub = await Club.find({})
        res.send(GettingClub)
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
        let updated = await Club.updateOne({ _id: req.params.id }, { $set: { isblacklisted: true } })
        const GettingClub = await Club.find({})
        res.send(GettingClub)
    } catch (error) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO GET ALL BLACKLISTED CLUBS
const blacklisteds = async (req, res, next) => {
    try {
        const GettingClub = await Club.find({ isblacklisted: true })
        res.send(GettingClub)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO REMOVE CLUBS FROM BLACK LIST
const removeFromBlacklist = async (req, res, next) => {
    try {
        const updating = await Club.updateOne({ _id: req.params.id }, { $set: { isblacklisted: false } })
        const GettingClub = await Club.find({ isblacklisted: true })
        res.send(GettingClub)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO GET ALL USERS OF E-CLUB
const getUsers = async (req, res, next) => {
    try {
        const geettingUsers = await User.find({})
        res.send(geettingUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO BLOCK A SPECIFIED USER
const blockUser = async (req, res, next) => {
    try {
        const update = await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: true } })
        const geettingUsers = await User.find({})
        res.send(geettingUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//TO UNLOCK A SPECIFIED USER
const unblockUser = async (req, res, next) => {
    try {
        const update = await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })
        const geettingUsers = await User.find({})
        res.send(geettingUsers)
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
        })
    }
}

//ADMIN LOGOUT
const logOut = async (req, res, next) => {
    try {
        res.cookie("jwtAdmin", "", {
            maxAge: 0
        });
        res.send({ message: "success" });
    } catch (error) {
        next(error);
    }
};


const clubDetails = async (req, res, next) => {
    try {
        const gettingClub = await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer').populate('activeUsers')
        let data = gettingClub
        res.send({ data: data })
    } catch (err) {
        return res.status(401).send({
            welcome: "UnAuthenticated"
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
    logOut
}
