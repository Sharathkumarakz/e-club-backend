
// const express=require('express');

// const mongoose=require('mongoose');

// const cors=require('cors');

// const cookieParser=require('cookie-parser');

// const app= express();

// let multer  = require('multer')

// require('dotenv').config()


// //------------------------------------------

//  const http =require('http').createServer(app);


// const io = require('socket.io')(http, {
//     cors: {
//       origin: 'http://localhost:4200', 
//       methods: ['GET', 'POST'], 
//       allowedHeaders: ['Authorization', 'Content-Type'], 
//       credentials: true 
//     }
//   });


// io.on('connection',(socket)=>{
//     console.log('Some user is Connected');

// })
// http.listen(3000,()=>{
//     console.log('Listening On *:3000');
// })



//------------------------------------------


// app.use(cors({
//     credentials:true,
//     origin:['http://localhost:4200']
// }));

// app.use(cookieParser());

// app.use(express.json());
// app.use('/public/user_images', express.static('public/user_images'));

// mongoose.connect(process.env.DB,{
//     useNewUrlParser:true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log('connection sucsessful')
//     app.listen(5000,()=>{
//         console.log("app is listening 5000 port");
//     })
//   }).catch((error) => {
//     console.log('somthing wrong', error)
//   })

//   const userRoute=require('./routes/userRoute');
//   app.use("/",userRoute); 

//   const adminRoute=require('./routes/adminRoute');
// const { log } = require('console');

//   app.use("/admin",adminRoute); 









const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
  }
});

app.use(cors({
  credentials: true,
  origin: ['http://localhost:4200']
}));

app.use(cookieParser());
app.use(express.json());
app.use('/public/user_images', express.static('public/user_images'));
//----------------------------------------
io.on('connection', (socket) => {
  console.log('Some user is connected');

  socket.on('join',function(data){
  socket.join(data.room)
  console.log(data.user,'joined to the room',data.room);
  socket.broadcast.to(data.room).emit('newUserJoined',{user:data.user,message:'joining '})
  })

  socket.on('leave',function(data){
    console.log(data.user,'left to the room',data.room);
    socket.broadcast.to(data.room).emit('leftRoom',{user:data.user,message:'leaving '})
    socket.leave(data.room)
    })

    socket.on('message',function(data){
     io.in(data.room).emit('newMessage',{user:data.user,message:data.message,time:Date.now()})
    })
});

const userRoute = require('./routes/userRoute');
app.use("/", userRoute);

const adminRoute = require('./routes/adminRoute');
app.use("/admin", adminRoute);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connection successful');
  http.listen(PORT, () => {
    console.log(`App and Socket.IO server are listening on port ${PORT}`);
  });
}).catch((error) => {
  console.log('Something went wrong', error);
});
