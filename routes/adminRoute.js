const express = require("express");
const aRoute = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin=require('../models/admin');


//CONTROLLER
const adminController=require("../controllers/adminController")

//ADMIN LOGIN
aRoute.post('/login',adminController.adminlogin)


//ADMIN AUTH
aRoute.get('/active',adminController.adminIsActive)


//GET CLUBS
aRoute.get('/club',adminController.getClubs)
aRoute.get('/club/leaders/:id',adminController.getClubLeaders)
aRoute.get('/clubDetails/:id',adminController.clubDetails)
aRoute.get('/club/members/:id',adminController.getMembers)


//CLUB BLACKLISTING
aRoute.post('/club/addToBlacklist/:id',adminController.addToBlacklist)
aRoute.get('/club/blacklisted',adminController.blacklisteds)
aRoute.post('/club/removeBlacklist/:id',adminController.removeFromBlacklist)


//GET USERS 
aRoute.get('/users',adminController.getUsers)
aRoute.post('/user/unBlock/:id',adminController.unblockUser)
aRoute.post('/user/block/:id',adminController.blockUser)

//BANNER
aRoute.post('/addBanner',adminController.addBanner)
aRoute.get('/banners',adminController.getBanners)
aRoute.post('/deleteBanner',adminController.deleteBanner)

//DASHBOARD
aRoute.get('/dashboard',adminController.getDashboard)



//ADMIN LOGOUT
aRoute.post('/logout',adminController.logOut)


module.exports = aRoute;
