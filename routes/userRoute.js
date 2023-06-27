const express = require("express");
const uRoute = express();




//CONTROLLERS
const userController=require("../controllers/userController")
const clubController=require("../controllers/clubController")
const financeController=require("../controllers/financeController")
const eventsController=require("../controllers/eventController")
const paymentController=require("../controllers/paymentController")
const notificationController=require("../controllers/notificationsController")
const chatController=require("../controllers/chatController")

//USER LOGIN,REGISTRATIONS
uRoute.post('/register',userController.userRegister)
uRoute.post('/gmail/register',userController.mailRegistration)
uRoute.post('/login',userController.userLogin)
uRoute.post('/changePassword',userController.changePassword)

//USER AUTH
uRoute.get('/user',userController.userAuth)

//USER PROFILE RELATED
uRoute.get('/profile',userController.viewProfile)
 uRoute.post('/profile-upload-single',userController.profilePictureUpdate)
uRoute.post('/update/profile',userController.profileUpdating)


//REGISTRATION AND JOINING TO A CLUB
uRoute.post('/register/club',clubController.clubRegister)
uRoute.post('/join/club',clubController.joinClub)
uRoute.post('/profile/join/club',clubController.joinClub2)

//USER CLUB DETAILS
uRoute.get('/club/:id',clubController.clubData)
uRoute.get('/clubdetails/:id',clubController.clubDetails)
uRoute.post('/club/pictureUpdate/:id',clubController.profilePictureUpdate)
uRoute.post('/club/addPost/:id',clubController.addPost)
uRoute.get('/club/posts/:id',clubController.getPosts)
uRoute.post('/club/deletePost/:id',clubController.deletePost)
uRoute.get('/club/roleAuthentication/:id',clubController.userRole)
uRoute.post('/club/addMember/:id',clubController.addMember)
// uRoute.post('/club/members/:id',clubController.getMembers)
uRoute.get('/club/memberslist/:id',clubController.getMembers)
uRoute.post('/club/deleteMember',clubController.deleteMembers)
uRoute.post('/club/editClubProfile/:id',clubController.editClubProfile)
uRoute.post('/club/updateSecurityCode/:id',clubController.updateSecurityCode)
uRoute.post('/club/updateCommitee/:id',clubController.updateCommitee)

//CLUB FINANCE
uRoute.post('/update/finance/:id',financeController.updateFinance)
uRoute.get('/club/financeIncome/:id',financeController.getFinancialDataIncome)
uRoute.get('/club/financeLoss/:id',financeController.getFinancialDataLoss)

//CLUB EVENTS
uRoute.post('/club/addEvent/:id',eventsController.addEvent)
uRoute.get('/club/events/:id',eventsController.getEvents)
uRoute.post('/club/deleteEvent/:id',eventsController.deleteEvent)

//MAIl USER AUTHENTICATION
uRoute.get('/user/:id/verify/:token',userController.verify)
uRoute.get('/user/clubs',userController.getClubs)

//CLUB PAYMENTS
uRoute.post('/club/checkout/:id',paymentController.makePayment)
uRoute.post('/club/stripe/:id',paymentController.setStripe)
uRoute.get('/user/payment/:id',paymentController.getPaymentDetails)

//CLUB NOTIFICATIONS
uRoute.post('/club/notifications/:id',notificationController.sendNotification)
uRoute.get('/club/getNotifications/:id',notificationController.getNotifications)

//CLUB CHAT
uRoute.post('/club/chat/:id',chatController.storeChat)
uRoute.get('/club/chat/:id',chatController.getChat)
uRoute.post('/club/chatJoin/:id',chatController.joiningToChat)
// uRoute.get('/club/chatJoin/:id',chatController.joinedData)
uRoute.get('/club/chatJoin/:id',chatController.joinedData)
uRoute.post('/club/leaveChat/:id',chatController.leaveChat)

//CLUB VIDEO CONFERENCE
uRoute.post('/club/conference/:id',chatController.conferenceSeting)
uRoute.get('/club/conference/:id',chatController.updateConference)

//USER GET ALL CLUBS FOR SEARCH
uRoute.post('/clubs',clubController.getAllClubs)

//USER LOGOUT
uRoute.post('/logout',userController.logOut)

module.exports = uRoute;

