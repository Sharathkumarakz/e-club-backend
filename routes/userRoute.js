const express = require("express");
const uRoute = express();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


const User = require('../models/user');

const upload=require('../middlewares/multer')


const userController=require("../controllers/userController")
const clubController=require("../controllers/clubController")
const financeController=require("../controllers/financeController")
const eventsController=require("../controllers/eventController")

uRoute.post('/register',userController.userRegister)


uRoute.post('/gmail/register',userController.mailRegistration)


uRoute.post('/login',userController.userLogin)

uRoute.get('/user',userController.userAuth)

uRoute.post('/logout',userController.logOut)

uRoute.get('/profile',userController.viewProfile)


uRoute.post('/profile-upload-single',upload.single('image'),userController.profilePictureUpdate)

uRoute.post('/update/profile',userController.profileUpdating)

uRoute.post('/register/club',clubController.clubRegister)

uRoute.post('/join/club',clubController.joinClub)

uRoute.post('/profile/join/club',clubController.joinClub2)

uRoute.get('/club/:id',clubController.clubData)


uRoute.post('/club/pictureUpdate/:id',upload.single('image'),clubController.profilePictureUpdate)

uRoute.post('/club/addPost/:id',upload.single('image'),clubController.addPost)

uRoute.get('/club/posts/:id',clubController.getPosts)

uRoute.get('/club/deletePost/:id',clubController.deletePost)

uRoute.get('/club/roleAuthentication/:id',clubController.userRole)

uRoute.post('/club/addMember/:id',clubController.addMember)



uRoute.post('/club/members/:id',clubController.getMembers)
uRoute.post('/club/memberslist/:id',clubController.getMemberstest)

uRoute.post('/club/deleteMember',clubController.deleteMembers)

uRoute.post('/club/editClubProfile/:id',clubController.editClubProfile)

uRoute.post('/club/updateSecurityCode/:id',clubController.updateSecurityCode)

uRoute.post('/club/updateCommitee/:id',clubController.updateCommitee)

uRoute.post('/update/finance/:id',financeController.updateFinance)

uRoute.get('/club/finance/:id',financeController.getFinancialData)

uRoute.post('/club/addEvent/:id',eventsController.addEvent)

uRoute.get('/club/events/:id',eventsController.getEvents)

uRoute.post('/club/deleteEvent/:id',eventsController.deleteEvent)

uRoute.get('/user/:id/verify/:token',userController.verify)

uRoute.get('/user/clubs',userController.getClubs)


// uRoute.post('/user/verified/:id',userController.verified)
module.exports = uRoute;