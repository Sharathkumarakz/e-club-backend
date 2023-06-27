
const Club = require('../models/club');
const Chat = require('../models/chat');


//TO STORE CHAT DATA
const storeChat = async (req, res, next) => {
    try {
        const chat = new Chat({
            user: req.body.user,
            room: req.body.room,
            message: req.body.message,
            time:Date.now()
        })
        const chatAdded = await chat.save();
        res.send(chatAdded)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}


//TO GET CHAT OF A SPECIFIED CLUB
const getChat = async (req, res, next) => {
    try {  
        let getAllChat = await Chat.find({ room: req.params.id }).sort({ date: 1 }).populate('user')
        res.send(getAllChat)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

//ADDING USER IN ACTIVE MEMBERS LIST
const joiningToChat = async (req, res, next) => {
    try {
        let success = await Club.updateOne(
            { _id: req.body.room },
            { $addToSet: { activeUsers: req.body.user._id } }
        );
        res.send(success)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}


//TO GET ALL ACTIVE USERS FOR CHAT
const joinedData = async (req, res, next) => {
    try {
        const populatedMembers = await Club.findById(req.params.id)
            .populate({
                path: 'activeUsers',
                select: '-_id',
                options: { lean: true } // Add options to enable lean population
            })
            .lean()
            .select('activeUsers');
        res.send(populatedMembers);
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}


//TO REMOVE USER FROM ACTIVE USER LIST
const leaveChat = async (req, res, next) => {
    try {
        let success = await Club.updateOne(
            { _id: req.body.room },
            { $pull: { activeUsers: req.body.user._id } }
        );
        res.send(success)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

//TO SEND VIDEO CONFERENCE LINK TO OTHER USERS
const conferenceSeting = async (req, res, next) => {
    try {
        let clubUpdate = await Club.updateOne({ _id: req.params.id }, { $set: { conference: req.body.text } })
        res.send(clubUpdate)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

//TO REMOVE VIDEO CONFERENCE LINK
const updateConference = async (req, res, next) => {
    try {
        let clubUpdate = await Club.updateOne({ _id: req.params.id }, { $set: { conference: null } })
        res.send(clubUpdate)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

module.exports = {
    storeChat,
    getChat,
    joiningToChat,
    joinedData,
    leaveChat,
    conferenceSeting,
    updateConference
};
