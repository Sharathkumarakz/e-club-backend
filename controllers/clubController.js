
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Post = require('../models/post');

const{uploadToCloudinary,removeFromCloudinary} =require('../middlewares/cloudinary')



//REGISTRATION OF A CLUB
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
      let presidentActive = await User.findOne({ _id: claims._id }).exec()
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
      if (presidentActive.email === secretory || presidentActive.email === treasurer) {
        return res.status(400).send({
          message: "You will get a president role, so you cant be a treasurer or secretory!"
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
     await club.save();
      res.json({
        message: "success"
      })
    }
  } catch (error) {
    next(error);
  }
}

//JOINING TO A SPECIFIED CLUB
let joinClub = async (req, res, next) => {
  try {
    let found = await Club.findOne({ clubName: req.body.clubName });
    if (found) {
      if (!(await bcrypt.compare(req.body.securityCode, found.securityCode))) {
        return res.status(404).send({
          message: "secretCode is Incorrect"
        })
      } else {
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
              club: found._id
            },
          },
        });
        if (!existingUser) {
           await User.updateOne(
            { _id: claims._id },
            { $addToSet: { clubs: { $each: [{ clubName: req.body.clubName, password: req.body.securityCode, club: found._id }] } } });
        }
        if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString() || found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
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


//JOINING TO A CLUB FROM USER PROFILE
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
       await User.updateOne(
          { _id: claims._id },
          { $pull: { clubs: { clubName: req.body.clubName } } }
        );
        return res.json({ changed: true })
      } else {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "TheSecretKey")
        if (!claims) {
          
          return res.status(401).send({
            message: "UnAuthenticated"
          })
        }
        
        if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString() || found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
          return res.json({ authenticated: true, id: found._id });
        } else {
         await User.updateOne(
            { _id: claims._id },
            { $pull: { clubs: { clubName: req.body.clubName } } }
          );
          return res.json({ notAllowed: true })
        }
      }
    } else {
      const cookie = req.cookies['jwt']
      const claims = jwt.verify(cookie, "TheSecretKey")
      if (!claims) {  
        return res.status(401).send({
          message: "UnAuthenticated"
        })
      }
     await User.updateOne(
        { _id: claims._id },
        { $pull: { clubs: { clubName: req.body.clubName } } }
      );
      return res.json({ changed: true })
    }
  } catch (error) {
    next(error);
  }
}


//GET CLUB DATA INCLUDING ALL POPULATED  DATAS
const clubData = async (req, res, next) => {
  try {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, "TheSecretKey")
    if (!claims) {
      return res.status(401).send({
        message: "UnAuthenticated"
      })
    }
    let userdata = await User.findOne({ _id: claims._id })
    const gettingClub = await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer').populate('activeUsers')
    let data = gettingClub
    let user = { id: userdata._id }
    res.send({ data: data, user: user })
  } catch (error) {
    next(error);
  }
}



const clubDetails = async (req, res, next) => {
  try {
    const gettingClub = await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer').populate('activeUsers')
    let data = gettingClub
    res.send({ data: data })
  } catch (error) {
    next(error);
  }
}

//TO UPDATE PROFILE PICTUE OF A CLUB
const profilePictureUpdate = async (req, res, next) => {
  try {
    const file = req.files.image;
    const clubdetails = await Club.findOne({ _id:req.params.id});
        if(clubdetails.imagePublicId){
      await removeFromCloudinary(clubdetails.imagePublicId)
        }
    const image=await uploadToCloudinary(file.tempFilePath,"clubs-profile-pictures")
    const updated = await Club.updateOne({ _id: req.params.id }, { $set: { image:image.url,imagePublicId:image.public_id } })
    res.send(updated)
  } catch (err) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}


//TO ADD A POST OF CLUB
const addPost = async (req, res, next) => {
  try {
    const { textFieldName } = req.body;
    const user = JSON.parse(textFieldName);
    const file = req.files.image;
    const image=await uploadToCloudinary(file.tempFilePath,"clubs-post-pictures")
    let club = await Club.findOne({ _id: req.params.id })
    const post = new Post({
      clubName: club._id,
      caption: user.caption,
      image: image.url,
      imagePublicId:image.public_id 
    })
    const added = await post.save();
    res.send(added)
  } catch (err) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}

//GET ALL POSTS OF A SPECIFIED CLUB
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

//TO DELETE A SPECIFIED POST
const deletePost = async (req, res, next) => {
  try {

    const postDetails = await Post.findOne({ _id: req.params.id })
    if(postDetails.imagePublicId){
      await removeFromCloudinary(postDetails.imagePublicId)
        }
    let deleting=await Post.deleteOne({ _id: req.params.id })
    res.send(deleting)
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    })
  }
}


// TO GET ROLE OF A USER IN A SPECIFIED CLUB
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
      if (found.secretory.toString() === claims._id.toString() || found.treasurer.toString() === claims._id.toString() || found.president.toString() === claims._id.toString() || found.members.includes(claims._id)) {
        return res.json({ authenticated: true, id: found._id });
      } else {
        return res.json({ notAllowed: true })
      }
    }
  } catch (error) {
    return res.status(401).send({
      welcome: "UnAuthenticated"
    });
  }
};


//AD A MEMBER TO A CLUB
const addMember = async (req, res, next) => {
  try {
    let found = await Club.findOne({ _id: req.params.id });
    let userFound = await User.findOne({ email: req.body.member })
    if (!userFound) {
      return res.status(404).send({
        message: "There is no such user"
      })
    }
    if (found.secretory.toString() === userFound._id.toString() || found.treasurer.toString() === userFound._id.toString() || found.president.toString() === userFound._id.toString()) {
      return res.status(404).send({
        message: "You are a main part of this club so, can't add you as a member"
      })
    }
    let isAvailable = await Club.findOne({ _id: req.params.id })
    if (!isAvailable.members.includes(userFound._id)) {
      if (found) {
        await Club.updateOne({ _id: req.params.id }, { $push: { members: userFound._id } })
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



//GET MEMBER OF A SPECIFIED CLUB
const getMembers = async (req, res, next) => {
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

//TO DELETE A SPECIFIED CLUB
const deleteMembers = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.user })
    await Club.updateOne({ _id: req.body.club }, { $pull: { members: user._id } })
    const club = await Club.findById(req.body.club).populate('members').exec();
    res.send(club);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
};

//TO EDIT CLUB PROFILE
const editClubProfile = async (req, res, next) => {
  try {
    const club = await Club.findOne({ _id: req.params.id })
    const clubnameFound = await Club.findOne({ clubName: req.body.clubName })
    if (clubnameFound) {
      if (req.body.clubName === clubnameFound.clubName && clubnameFound.secretory.toString() === club.secretory.toString() && club.president.toString() === clubnameFound.president.toString() && clubnameFound.registerNo === club.registerNo) {
        await Club.updateOne({ _id: req.params.id }, { $set: { clubName: req.body.clubName, about: req.body.about, address: req.body.place, category: req.body.category, registerNo: req.body.regiterNo, } })
      } else {
        return res.status(401).send({
          message: "Club name is not available"
        });
      }
    } else {
     await Club.updateOne({ _id: req.params.id }, { $set: { clubName: req.body.clubName, about: req.body.about, address: req.body.place, category: req.body.category, registerNo: req.body.regiterNo } })
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


//UPDATE CLUB SECURITY CODE
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

//CHANGE COMMITEE
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


//TO GET ALL CLUBSLIST
const getAllClubs = async (req, res, next) => {
  try {
    const regex = new RegExp(req.body.name, 'i');
    if (req.body.name.trim().length === 0) {
      return res.status(401).send({
        message: "Clubs detail error"
      });
    }
    const clubs = await Club.find({ clubName: regex });
    if(clubs){
      res.send(clubs);
    }else{
      return res.status(401).send({
        message: "Clubs detail error"
      });
    }
  } catch (error) {
    return res.status(401).send({
      message: "Clubs detail error"
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
  deleteMembers,
  editClubProfile,
  updateSecurityCode,
  updateCommitee,
  joinClub2,
  getMembers,
  clubDetails,
  getAllClubs
}
