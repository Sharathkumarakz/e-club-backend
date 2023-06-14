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
const { logOut } = require("./userController");

const clubRegister = async (req, res, next) => {
  try {
    let clubName = req.body.clubName;
    let registerNo = req.body.registerNo;
    let place = req.body.place;
    let securityCode = req.body.securityCode;
    let category = req.body.category;
    let secretory = req.body.secretory
    let treasurer = req.body.treasurer
    const check = await Club.findOne({ clubName: clubName })
    if (check) {
      return res.status(400).send({
        message: "This club name is not available"
      })
    } else {
      const cookie = req.cookies['jwt']
      const claims = jwt.verify(cookie, "TheSecretKey")
      if (!claims) {
        return res.status(401).send({
          message: "UnAuthenticated"
        })
      }
      let presidentActive = await User.findOne({_id:claims._id }).exec()
      let secretoryActive = await User.findOne({ email: secretory }).exec()
      let treasurerActive = await User.findOne({ email: treasurer }).exec()

      if (!presidentActive) {
        return res.status(400).send({
          message: "President not available"
        })
      }
      if (!secretoryActive) {
        return res.status(400).send({
          message: "Secretory not available"
        })
      }
      if (!treasurerActive) {
        return res.status(400).send({
          message: "treasurer not available"
        })
      }
      if(presidentActive.email===secretory ||presidentActive.email===treasurer ){
        return res.status(400).send({
          message: "You get a president role, so you cant be a treasurer or secretory!"
        })
      }
      const changeP = await bcrypt.genSalt(10)
      const hashedcode = await bcrypt.hash(securityCode, changeP)
      const club = new Club({
        clubName: clubName,
        securityCode: hashedcode,
        category: category,
        address: place,
        registerNo: registerNo,
        president: presidentActive._id,
        secretory: secretoryActive._id,
        treasurer: treasurerActive._id
      })
      const added = await club.save();
      res.json({
        message: "success"
      })
    }

  } catch (error) {
    next(error);
  }

}


let joinClub = async (req, res, next) => {
  try {
    let found = await Club.findOne({ clubName: req.body.clubName });
    if(found.category!=req.body.category){
      return res.status(404).send({
        message: "Category failed to match"
      })
    }
    if (found) {
      if (!(await bcrypt.compare(req.body.securityCode, found.securityCode))) {
        return res.status(404).send({
          message: "secretCode is Incorrect"
        }) 
      }else {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "TheSecretKey")
        if (!claims) {
          return res.status(401).send({
            message: "UnAuthenticated"
          })
        }
  
        let existingUser = await User.findOne({
          _id: claims._id,
          clubs: {
            $elemMatch: {
              clubName: req.body.clubName,
              password: req.body.securityCode,
              club:found._id
            },
          },
        });
        if(!existingUser){
          let Update = await User.updateOne(
            {_id:claims._id},
              {$addToSet: {clubs:{$each:[{clubName: req.body.clubName, password:req.body.securityCode,club:found._id}]}}});
        }
        if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString()||found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
          return res.json({ authenticated: true, id: found._id });
        } else {
          return res.json({ notAllowed: true })
        }
      }
    } else {
      return res.status(404).send({
        message: "There is no such club"
      })
    }

  } catch (error) {
    next(error);
  }
}



let joinClub2 = async (req, res, next) => {
  try {
    let found = await Club.findOne({ clubName: req.body.clubName });
    if (found) {
      if (!(await bcrypt.compare(req.body.securityCode, found.securityCode))) {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "TheSecretKey")
        if (!claims) {
          return res.status(401).send({
            message: "UnAuthenticated"
          })
        }
        const result = await User.updateOne(
          { _id:claims._id },
          { $pull: { clubs: { clubName:req.body.clubName } } }
        );
        return res.json({ changed: true })
      }else {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "TheSecretKey")

        if (!claims) {
          return res.status(401).send({
            message: "UnAuthenticated"
          })
        }
  
        if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString()||found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
          return res.json({ authenticated: true, id: found._id });
        } else {
          const result = await User.updateOne(
            { _id:claims._id },
            { $pull: { clubs: { clubName:req.body.clubName } } }
          );
          return res.json({ notAllowed: true })
        }
      }
    } else {
      return res.status(404).send({
        message: "There is no such club"
      })
    }

  } catch (error) {
    next(error);
  }
}

const clubData = async (req, res, next) => {
  try {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, "TheSecretKey")
    if (!claims) {
      return res.status(401).send({
        message: "UnAuthenticated"
      })
    }
    let userdata=await User.findOne({_id:claims._id})
    const  gettingClub= await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer')
     let data=gettingClub 
     let user={id:userdata._id}
    res.send({data: data,user:user})
  } catch (error) {
    next(error);
  }
}


const profilePictureUpdate = async (req, res, next) => {
  images = req.file.filename
  try {
    const updated = await Club.updateOne({ _id: req.params.id }, { $set: { image: images } })
    res.send(updated)
  } catch (err) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}


const addPost = async (req, res, next) => {

  images = req.file.filename
  try {
    const { textFieldName } = req.body;
    const user = JSON.parse(textFieldName);
    let club = await Club.findOne({ _id: req.params.id })
    const post = new Post({
      clubName: club._id,
      caption: user.caption,
      image: images
    })
    const added = await post.save();
    res.send(added)
  } catch (err) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}


const getPosts = async (req, res, next) => {
  try {
    const gettingPost = await Post.find({ clubName: req.params.id })
    res.send(gettingPost)
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}

const deletePost = async (req, res, next) => {
  try {
    const deleting = await Post.deleteOne({ _id: req.params.id })
    res.send(deleting)
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}



const userRole = async (req, res, next) => {
  try {
    let found = await Club.findOne({ _id: req.params.id });
    if (found) {
      const cookie = req.cookies['jwt'];
      const claims = jwt.verify(cookie, "TheSecretKey");
      if (!claims) {
        return res.status(401).send({
          message: "UnAuthenticated"
        });
      }
      if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString()||found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
        return res.json({ authenticated: true, id: found._id });
        // return true
      } else {
        return res.json({ notAllowed: true })
        // return false;
      }
    }
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    });
  }
};

const addMember = async (req, res, next) => {
  try {
    let found = await Club.findOne({ _id: req.params.id });
    let userFound = await User.findOne({ email: req.body.member })
    if (!userFound) {
      return res.status(404).send({
        message: "There is no such user"
      })
    }
    if (found.secretory.toString() === userFound._id.toString() || found.treasurer.toString() === userFound._id.toString()||found.president.toString() === userFound._id.toString()) {
      return res.status(404).send({
        message: "You are a main part of this club so, can't add you as a member"
      })
    }
    let isAvailable = await Club.findOne({ _id: req.params.id })
    if (!isAvailable.members.includes(userFound._id)) {
      if (found) {
        let adding = await Club.updateOne({ _id: req.params.id }, { $push: { members: userFound._id } })
        let gettingMember = await Club.findById(req.params.id).populate('members').exec();
        res.send(gettingMember)
      }
    } else {
      return res.status(404).send({
        message: "user already in"
      })
    }
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    });
  }
}





const getMembers = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id).populate('members').exec();
    res.send(club);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
};


const getMemberstest = async (req, res, next) => {
  try {
    const populatedMembers = await Club.findById(req.params.id)
    .populate({
      path: 'members',
      select: '-_id' 
    })
    .lean()
    .select('members');  
    res.send(populatedMembers);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
};


const deleteMembers = async (req, res, next) => {
  try {
    let user=await User.findOne({email:req.body.user})
    let adding = await Club.updateOne({ _id: req.body.club }, { $pull: { members:user._id } })
    const club = await Club.findById(req.body.club).populate('members').exec();
    res.send(club);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
};



const editClubProfile = async (req, res, next) => {
  try {
    const club = await Club.findOne({ _id: req.params.id })
    const clubnameFound = await Club.findOne({ clubName: req.body.clubName })
    if (clubnameFound) {
      if (req.body.clubName === clubnameFound.clubName && clubnameFound.secretory.toString() === club.secretory.toString() && club.president.toString() === clubnameFound.president.toString() && clubnameFound.registerNo === club.registerNo) {
        let update = await Club.updateOne({ _id: req.params.id }, { $set: { clubName: req.body.clubName, about: req.body.about, address:req.body.place, category: req.body.category, registerNo: req.body.regiterNo ,} })
      } else {
        return res.status(401).send({
          message: "Club name is not available"
        });
      }
    } else {
      let update = await Club.updateOne({ _id: req.params.id }, { $set: { clubName: req.body.clubName, about: req.body.about, address:req.body.place, category: req.body.category, registerNo: req.body.regiterNo } })
    }
    const gettingClub = await Club.findOne({ _id: req.params.id })
    const { password, ...data } = await gettingClub.toJSON()
    res.send(data)
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
}

const updateSecurityCode = async (req, res, next) => {
  try {
    let found = await Club.findOne({ _id: req.params.id });
    if (found) {
      if (!(await bcrypt.compare(req.body.securityOld, found.securityCode))) {
        return res.status(404).send({
          message: "secretCode is Incorrect"
        })
      } else {
        const changeP = await bcrypt.genSalt(10)
        const hashedcode = await bcrypt.hash(req.body.securityNew, changeP)
        let update = await Club.updateOne({ _id: req.params.id }, { $set: { securityCode: hashedcode } })
        res.send(update)
      }
    }
  } catch (err) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
}

const updateCommitee = async (req, res, next) => {
  try {
    let president = await User.findOne({ email: req.body.presidentNew })
    if (!president) {
      return res.status(401).send({
        message: "there is no such person for being president"
      });
    }
    let secretory = await User.findOne({ email: req.body.secretoryNew })
    if (!secretory) {
      return res.status(401).send({
        message: "there is no such person for being Secretory"
      });
    }
    let treasurer = await User.findOne({ email: req.body.treasurerNew })
    if (!treasurer) {
      return res.status(401).send({
        message: "there is no such person for being Treasurer"
      });
    }
    let update = await Club.updateOne({ _id: req.params.id }, { $set: { president: president._id, secretory: secretory._id, treasurer: treasurer._id } })
    res.send(update)
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
}

module.exports = {
  clubRegister,
  joinClub,
  clubData,
  profilePictureUpdate,
  addPost,
  getPosts,
  deletePost,
  userRole,
  addMember,
  getMembers,
  deleteMembers,
  editClubProfile,
  updateSecurityCode,
  updateCommitee,
  joinClub2,
  getMemberstest
}
