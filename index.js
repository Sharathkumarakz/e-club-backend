
                  // E-CLUB 


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);
const fileUpload=require('express-fileupload');
require('dotenv').config()

//SOCKET
const io = require('socket.io')(http, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
  }
});

//FILE UPLOAD
app.use(fileUpload({
  useTempFiles:true
}))

//CORS
app.use(cors({
  credentials: true,
  origin: [`${process.env.FRONTEND_URL}`]
}));

app.use(cookieParser());
app.use(express.json());
app.use('/public/user_images', express.static('public/user_images'));

//SOCKETS USE
io.on('connection', (socket) => {
  console.log('Some user is connected');

  socket.on('join',function(data){
  socket.join(data.room)
  socket.broadcast.to(data.room).emit('newUserJoined',{user:data.user,message:'joining '})
  })

  socket.on('leave',function(data){
    socket.broadcast.to(data.room).emit('leftRoom',{user:data.user,message:'leaving '})
    socket.leave(data.room)
    })

    socket.on('message',function(data){
     io.in(data.room).emit('newMessage',{user:data.user,message:data.message,time:Date.now()})
    })
   }
);

//USER ROUTE
const userRoute = require('./routes/userRoute');
app.use("/", userRoute);

//ADMIN ROUTE
const adminRoute = require('./routes/adminRoute');
app.use("/admin", adminRoute);

//PORT LISTENING
const PORT = process.env.PORT || 5000;

//MONGOS, SOCKET CONNECTION
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
