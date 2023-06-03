const express = require("express");
const aRoute = express();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const adminController=require("../controllers/adminController")

const User = require('../models/user');
const Admin=require('../models/admin');


aRoute.post('/login',adminController.adminlogin)

aRoute.get('/active',adminController.adminIsActive)

aRoute.get('/club',adminController.getClubs)

aRoute.get('/club/leaders/:id',adminController.getClubLeaders)


aRoute.get('/club/members/:id',adminController.getMembers)

aRoute.post('/club/addToBlacklist/:id',adminController.addToBlacklist)

aRoute.get('/club/blacklisted',adminController.blacklisteds)

aRoute.post('/club/removeBlacklist/:id',adminController.removeFromBlacklist)

aRoute.get('/users',adminController.getUsers)


aRoute.post('/user/unBlock/:id',adminController.unblockUser)

aRoute.post('/user/block/:id',adminController.blockUser)


aRoute.post('/logout',adminController.logOut)


module.exports = aRoute;
