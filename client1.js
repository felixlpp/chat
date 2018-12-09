const Tool = require('./utils/common');
const tool = new Tool();
const io = require('socket.io-client');

tool.generateToken({userId: '5bce8cd556efd6703f7c2a43'})
  .then(token => {
    console.log(`generate token: ${token}`);
    const socket = io('http://127.0.0.1:3003',{
      transports: ['websocket'],
      query: {
        token
      }
    });
    socket.on('connect', (io) => {
      console.log('connect to server');
    })
    socket.send({
      senderId: "5bce8cd556efd6703f7c2a43",
      receiverId: "5bce909056efd6703f7c2a4f",
      method: 'sendSingleMsg',
      msg: "hello"
    })
    socket.on('message', (msg) => {
        console.log(msg);
    })
    socket.on('error', (err) => {
      console.log(err);
    })
    socket.on('connect_error', (error) => {
      console.log(3333333333);
      console.log(error);
    })
})
