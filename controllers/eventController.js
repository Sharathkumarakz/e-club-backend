
const jwt = require('jsonwebtoken');
const Club = require('../models/club');
const Event = require('../models/events');



//TO ADD AN EVENT
const addEvent = async (req, res, next) => {
  try {
    const claims = req.headers?.userId
    let clubData = await Club.findOne({ _id: req.params.id })
    if (claims.toString() === clubData.president.toString()) {
      const event = new Event({
        clubName: clubData._id,
        event: req.body.text,
        auther: "-President"
      })
      const added = await event.save();
      let events = await Event.find({ clubName: clubData._id }).sort({ date: 1 })
      res.send(events);
    } else {
      const event = new Event({
        clubName: clubData._id,
        event: req.body.text,
        auther: "-Secretory"
      })
      const added = await event.save();
      res.send(added);
    }
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
}


// TO GET EVENTS OF A SPECIFIED CLUB
const getEvents = async (req, res, next) => {
  try {
    let events = await Event.find({ clubName: req.params.id }).sort({ date: -1 })
    res.send(events);
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated"
    });
  }
}

//DELETE A SPECIFIED EVENT
const deleteEvent = async (req, res, next) => {
  try {
    let updated = await Event.deleteOne({ _id: req.body.id })
    res.send(updated);
  } catch (updated) {
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
