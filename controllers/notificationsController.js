
const Club = require('../models/club');
const Notification = require('../models/notifications');
const sendEmail = require('../utils/sendEmail')
const sendBulk = require('../utils/bulkMail')

//TO SENT NOFIFICATION FOR ALL USERS OF A SPECIFIED CLUB BY IT'S LEADERS
const sendNotification = async (req, res, next) => {
  try {
    const club = await Club.findOne({ _id: req.params.id }).populate('president').populate('secretory').populate('treasurer')
    const notification = new Notification({
      clubId: club._id,
      message: req.body.text
    })
    await notification.save();
    const populatedMembers = await Club.findById(req.params.id)
      .populate({
        path: 'members',
        select: '-_id'
      })
      .lean()
      .select('members');
     sendEmail(club.president.email, "Notification from E-club " + `${club.clubName}`, req.body.text);
     sendEmail(club.secretory.email, "Notification from E-club " + `${club.clubName}`, req.body.text);
     sendEmail(club.treasurer.email, "Notification from E-club " + `${club.clubName}`, req.body.text);
    const emailAddresses = [];
    for (const member of populatedMembers.members) {
      emailAddresses.push(member.email);
    }
     sendBulk(emailAddresses, "Notification from E-club " + `${club.clubName}`, req.body.text);
    res.status(201).send({ message: "Notification send Successfully" })
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

//TO GET ALL NOTIFICATIONS OF A SPECIFIED CLUB
const getNotifications = async (req, res, next) => {
  try {
    let notification = await Notification.find({ clubId: req.params.id }).sort({ _id: -1 })
    res.send(notification)
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
}

module.exports = {
  sendNotification,
  getNotifications
}