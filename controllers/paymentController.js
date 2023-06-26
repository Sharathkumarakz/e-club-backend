
const Club = require('../models/club');
const Finance=require('../models/finance');

//TO MAKE PAYMENT WIH STRIPE
const makePayment=async(req,res,next)=>{
    console.log("yaaaaaaaaaaaaaaaaaaaaaaaaa");
    try {
        const check = await Club.findOne({_id:req.params.id});
        const finance = new Finance({
            clubName:check._id,
            name:req.body.name,
            reason:req.body.reason,
            amount: req.body.amount,
            date:Date.now(),
            status:true,
            stripeId:req.body.stripeToken.id,
            paymentMethod:"stripe"
        })
        const added = await finance.save();
        res.send(added._id)
    } catch (error) {
        return res.status(404).send({
            message: "payment failed"
        });
    }
}


//GET ALL PAYMENT DETAIS OF A SPEIFIED CLUB
const getPaymentDetails=async(req,res,next)=>{
    try {
     let update=await Finance.findOne({_id:req.params.id}).populate('clubName')
     res.send(update)
    } catch (error) {
        return res.status(404).send({
            message: "payment failed"
        });
    }
}

//TO SET STRIPE ID BY THE TREASURER
const setStripe=async(req,res,next)=>{
    try {
     let update=await Club.updateOne({_id:req.params.id},{$set:{stripe:req.body.stripe}})
     res.send({update})
    } catch (error) {
        return res.status(404).send({
            message: "payment failed"
        });
    }
}

module.exports = {
    makePayment,
    setStripe,
    getPaymentDetails
  }
  