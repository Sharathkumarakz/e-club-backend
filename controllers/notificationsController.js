const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Finance=require('../models/finance');
const Notification= require('../models/notifications');
const { ObjectId } = require('mongodb');
const sendEmail= require('../utils/sendEmail')

const sendNotification=async (req,res,next) => {
    try {
        const club=await Club.findOne({_id:req.params.id}).populate('president').populate('secretory').populate('treasurer')
        const notification = new Notification({
            clubId:club._id,
            message:req.body.text
        })
        const added = await notification.save();
        const populatedMembers = await Club.findById(req.params.id)
    .populate({
      path: 'members',
      select: '-_id' 
    })
    .lean()
    .select('members'); 
    await sendEmail(club.president.email, "Notification from E-club "+`${club.clubName}`, req.body.text);
    await sendEmail(club.secretory.email, "Notification from E-club "+`${club.clubName}`, req.body.text);
    await sendEmail(club.treasurer.email, "Notification from E-club "+`${club.clubName}`, req.body.text);
    async function sendEmails() {
        for (const member of populatedMembers.members) {
          await sendEmail(member.email, "Notification from E-club "+`${club.clubName}`, req.body.text);
        }
      }
      sendEmails();
      res.status(201).send({message:"Notification send Successfully"})
     } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
   }
}

const getNotifications=async (req, res,next) => {
    try {
        let notification=await Notification.find({clubId:req.params.id}).sort({_id:-1})
        console.log(notification);
         res.send(notification)  
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})        
    }
}
module.exports = {
    sendNotification,
    getNotifications
  }