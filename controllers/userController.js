const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const upload = require('../middlewares/multer');
const { ObjectId } = require('mongodb');

const userRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const check = await User.findOne({ email: email });
        if (check) {
            return res.status(400).send({
                message: "Email is already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        const added = await user.save();
        const { _id } = await added.toJSON();
        const token = jwt.sign({ _id: _id }, "TheSecretKey");
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            message: "success"
        });
    } catch (error) {
        next(error);
    }
};

const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(404).send({
                message: "Password is incorrect"
            });
        }
        if(user.isBlocked===true){
            return res.status(404).send({
                message: "You are blocked"
            });  
        }
        const token = jwt.sign({ _id: user._id }, "TheSecretKey");
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            message: "success"
        });
    } catch (error) {
        next(error);
    }
};


const mailRegistration = async (req, res, next) => {
    try {
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.sub;
        //  let image=req.body.picture;
        const check = await User.findOne({ email: email })
        console.log("here");
        if (check) {
            //create jwt token
            const { _id } = await check.toJSON();
            const token = jwt.sign({ _id: _id }, "TheSecretKey")
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({
                message: "success"
            })

        } else {
            const changeP = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, changeP)

            const user = new User({
                name: name,
                email: email,
                // image:image, 
                password: hashedPassword
            })
            const added = await user.save();
            //create jwt token
            const { _id } = await added.toJSON();
            const token = jwt.sign({ _id: _id }, "TheSecretKey")
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({
                message: "success"
            })
        }

    } catch (error) {

        next(error);

    }

}

const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
        const user = await User.findOne({ _id: claims._id });
        if(user.isBlocked===true){
            return res.status(404).send({
                message: "You are blocked"
            });  
        }
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};

const logOut = async (req, res, next) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0
        });
        res.send({ message: "success" });
    } catch (error) {
        next(error);
    }
};

const viewProfile = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
        const user = await User.findOne({ _id: claims._id });
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};

const profilePictureUpdate = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        if (!claims) {
            return res.status(401).send({
                message: "Unauthenticated"
            });
        }
        const images = req.file.filename;
        await User.updateOne({ _id: claims._id }, { $set: { image: images } });
        const user = await User.findOne({ _id: claims._id });
        const { password, ...data } = await user.toJSON();
        res.send(data);
    } catch (err) {
        return res.status(401).send({
            message: "Unauthenticated"
        });
    }
};

const profileUpdating = async (req, res, next) => {
    try {
        const { name, address, about, phone } = req.body;
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "TheSecretKey");
        const updateFields = {};
        if (name) {
            updateFields.name = name;
        }
        if (address) {
            updateFields.address = address;
        }
        if (about) {
            updateFields.about = about;
        }
        if (phone) {
            updateFields.phone = phone;
        }
        await User.updateOne({ _id: claims._id }, { $set: updateFields });
        res.json({
            message: "success"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    userRegister,
    userLogin,
    userAuth,
    logOut,
    viewProfile,
    profilePictureUpdate,
    profileUpdating,
    mailRegistration
};

