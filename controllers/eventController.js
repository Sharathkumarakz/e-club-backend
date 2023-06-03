const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Post = require('../models/post');
const Event = require('../models/events');
const upload = require('../middlewares/multer')
const { ObjectId } = require('mongodb');
const { request } = require('express');



const addEvent=async (req,res,next)=>{
    try {
      const cookie = req.cookies['jwt'];
      const claims = jwt.verify(cookie, "TheSecretKey");
       let clubData=await Club.findOne({_id:req.params.id})
       if(claims._id.toString()===clubData.president.toString()){
        const event = new Event({
          clubName:clubData._id,
           event:req.body.text,
           auther:"-President"
      })
      const added = await event.save();
      let events=await Event.find({clubName:clubData._id}).sort({date:1})
      res.send(events);
       }else{
        const event = new Event({
          clubName:clubData._id,
           event:req.body.text,
           auther:"-Secretory"
      })
      const added = await event.save();
      let events=await Event.find({clubName:clubData._id}).sort({date:-1})
      res.send(events);
       }
  
    } catch (error) {
      return res.status(401).send({
        message: "Unauthenticated"
      });
    }
  }
  
  const getEvents=async (req,res,next)=>{
    try {
      let events=await Event.find({clubName:req.params.id}).sort({date:-1})
      res.send(events);
    } catch (error) {
      return res.status(401).send({
        message: "Unauthenticated"
      });
    }
  }

  const deleteEvent=async (req,res,next)=>{
    try {
        console.log(req.body);
        console.log(req.params.id);
      let updating=await Event.deleteOne({_id:req.body.id})
      let events=await Event.find({clubName:req.params.id}).sort({date:-1})
      res.send(events);
    } catch (error) {
      return res.status(401).send({
        message: "Unauthenticated"
      });
    }
  }


module.exports = {
    addEvent,
    getEvents,
    deleteEvent,
  }
  