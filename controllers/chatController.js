const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Chat = require('../models/chat');
const upload = require('../middlewares/multer')
const { ObjectId } = require('mongodb');
const { request } = require('express');


const storeChat=async(req,res,next)=>{
try { 
    const chat = new Chat({
        user:req.body.user,
        room:req.body.room,
        message:req.body.message
    })
    const added = await chat.save();
    res.send(added)
} catch (error) {
    res.status(500).send({message:'Internal Server Error'})
}
}


const getChat=async(req,res,next)=>{
    try { 
     let messages=await Chat.find({room:req.params.id}).sort({date:1}).populate('user')
     res.send(messages)
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }
    }

    const joiningToChat=async(req,res,next)=>{
        try { 
            // console.log(req.body);
            let success = await Club.updateOne(
                { _id:req.body.room },
                { $addToSet: { activeUsers:req.body.user._id } }
              ); 
              
        res.send(success)
         
        } catch (error) {
            res.status(500).send({message:'Internal Server Error'})
        }
        }

        const joinedData=async(req,res,next)=>{
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
                res.status(500).send({message:'Internal Server Error'})
            }
            }


            const   leaveChat =async(req,res,next)=>{
                try { 
                    let success = await Club.updateOne(
                        { _id:req.body.room },
                        { $pull: { activeUsers:req.body.user._id } }
                      ); 
                      
                res.send(success)
                 
                } catch (error) {
                  res.status(500).send({message:'Internal Server Error'})
                }
                }
          
module.exports = {
    storeChat,
    getChat,
    joiningToChat,
    joinedData,
    leaveChat
};
