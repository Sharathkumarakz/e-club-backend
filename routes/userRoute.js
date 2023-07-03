const express = require("express");
const uRoute = express();




//CONTROLLERS
const userController=require("../controllers/userController")
const clubController=require("../controllers/clubController")
const financeController=require("../controllers/financeController")
const eventsController=require("../controllers/eventController")
const paymentController=require("../controllers/paymentController")
const notificationController=require("../controllers/notificationsController")
const chatController=require("../controllers/chatController");
const { userAuthentication } = require("../middlewares/auth");

//USER LOGIN,REGISTRATIONS
uRoute.post('/register',userController.userRegister)
uRoute.post('/gmail/register',userController.mailRegistration)
uRoute.post('/login',userController.userLogin)
uRoute.post('/changePassword',userController.changePassword)

//USER AUTH
uRoute.get('/user',userAuthentication,userController.userAuth)

//USER PROFILE RELATED
uRoute.get('/profile',userAuthentication,userController.viewProfile)
 uRoute.post('/profile-upload-single',userAuthentication,userController.profilePictureUpdate)
uRoute.post('/update/profile',userAuthentication,userController.profileUpdating)


//REGISTRATION,LEAVING AND JOINING TO A CLUB
uRoute.post('/register/club',userAuthentication,clubController.clubRegister)
uRoute.post('/join/club',userAuthentication,clubController.joinClub)
uRoute.post('/profile/join/club',userAuthentication,clubController.joinClubFromProfile)
uRoute.get('/leaveClub/:id',userAuthentication,userController.leaveFromClub)


//USER CLUB DETAILS
uRoute.get('/club/:id',userAuthentication,clubController.clubData)
uRoute.get('/clubdetails/:id',clubController.clubDetails)
uRoute.post('/club/pictureUpdate/:id',userAuthentication,clubController.profilePictureUpdate)
uRoute.post('/club/addPost/:id',userAuthentication,clubController.addPost)
uRoute.get('/club/posts/:id',clubController.getPosts)
uRoute.post('/club/deletePost/:id',userAuthentication,clubController.deletePost)
uRoute.get('/club/roleAuthentication/:id',userAuthentication,clubController.userRole)
uRoute.post('/club/addMember/:id',userAuthentication,clubController.addMember)
uRoute.get('/club/memberslist/:id',clubController.getMembers)
uRoute.post('/club/deleteMember',userAuthentication,clubController.deleteMembers)
uRoute.post('/club/editClubProfile/:id',userAuthentication,clubController.editClubProfile)
uRoute.post('/club/updateSecurityCode/:id',userAuthentication,clubController.updateSecurityCode)
uRoute.post('/club/updateCommitee/:id',userAuthentication,clubController.updateCommitee)

//CLUB FINANCE
uRoute.post('/update/finance/:id',userAuthentication,financeController.updateFinance)
uRoute.get('/club/financeIncome/:id',userAuthentication,financeController.getFinancialDataIncome)
uRoute.get('/club/financeLoss/:id',userAuthentication,financeController.getFinancialDataLoss)

//CLUB EVENTS
uRoute.post('/club/addEvent/:id',userAuthentication,eventsController.addEvent)
uRoute.get('/club/events/:id',userAuthentication,eventsController.getEvents)
uRoute.post('/club/deleteEvent/:id',userAuthentication,eventsController.deleteEvent)

//MAIl USER AUTHENTICATION
uRoute.get('/user/:id/verify/:token',userController.verify)
uRoute.get('/user/clubs',userAuthentication,userController.getClubs)

//CLUB PAYMENTS
uRoute.post('/club/checkout/:id',userAuthentication,paymentController.makePayment)
uRoute.post('/club/stripe/:id',userAuthentication,paymentController.setStripe)
uRoute.get('/user/payment/:id',userAuthentication,paymentController.getPaymentDetails)

//CLUB NOTIFICATIONS
uRoute.post('/club/notifications/:id',userAuthentication,notificationController.sendNotification)
uRoute.get('/club/getNotifications/:id',userAuthentication,notificationController.getNotifications)

//CLUB CHAT
uRoute.post('/club/chat/:id',userAuthentication,chatController.storeChat)
uRoute.get('/club/chat/:id',userAuthentication,chatController.getChat)
uRoute.post('/club/chatJoin/:id',userAuthentication,chatController.joiningToChat)
// uRoute.get('/club/chatJoin/:id',chatController.joinedData)
uRoute.get('/club/chatJoin/:id',userAuthentication,chatController.joinedData)
uRoute.post('/club/leaveChat/:id',userAuthentication,chatController.leaveChat)

//CLUB VIDEO CONFERENCE
uRoute.post('/club/conference/:id',userAuthentication,chatController.conferenceSeting)
uRoute.get('/club/conference/:id',userAuthentication,chatController.updateConference)

//USER GET ALL CLUBS FOR SEARCH
uRoute.post('/clubs',userAuthentication,clubController.getAllClubs)

//USER LOGOUT
uRoute.post('/logout',userController.logOut)

module.exports = uRoute;

