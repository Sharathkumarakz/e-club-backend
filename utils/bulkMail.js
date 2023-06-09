const nodemailer = require('nodemailer');
require('dotenv').config()


//SENDING BULK MAIL TO ALL CLUB MEMBERS BY ITS LEADERS
module.exports= async(email,subject,text)=>{
   try {
     const transport=nodemailer.createTransport({
        host:process.env.HOST,
        service:process.env.SERVICE,
        port:Number(process.env.EMAIL_PORT),
        secure:Boolean(process.env.SECURE),
        auth:{
            user:process.env.USER,
            pass:process.env.PASS
        }
     })
     await transport.sendMail({
        from: process.env.USER,
        to: null,
        cc:email, // Array of CC email addresses
        subject: subject,
        text: text
    });
     console.log('email send successfully')
   } catch (error) {
    console.log('email not send');
    console.log(error);
   }  
}