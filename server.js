/****************************
 * @description 服务启动文件 *
*****************************/

const Tool =  require('./utils/common');
const tool =  new Tool();
const redis = require('./utils/redis');
const magicConf = require('./utils/magicValue');
const Controller = require('./controller/socket');
const controller = new Controller();

const code = magicConf.statusCode;
const magicValue = magicConf.common;
const io = require('socket.io')(3003);

/**
 * 校验token中间件，校验失败直接返回错误
 */
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  // 校验token
  tool.checkToken(token, socket, next);
})

io.on('connect', (socket) => {
  console.log('--------------connected-------------');
  console.log(socket.id);
  io.to(socket.id).send('welcome');
  const authData = tool.parseToken(socket.handshake.query.token);
  // 将这次socket连接的信息注册到redis
  controller.regist(authData, socket, redis);

  socket.on('message', data => {
    console.log(`server receive msg: ${JSON.stringify(data)}`);
    // 分发请求
    switch (data.method) {
        // 发送私聊消息
        case 'sendSingleMsg':
            controller.sendSingleMsg(io, data, socket, redis);
            break;
        // 加入群聊
        case 'joinGroup':
            controller.joinGroup();
            break;
        // 发送群聊消息
        case 'sendGroupMsg':
            controller.sendGroupMsg(io, data, redis);
            break;
        default:
            io.to(socket.id).send('unknow method');
            break;
    }
  })

  // 接收方成功收到消息后触发'modSendState'事件,修改此条消息的发送状态
  socket.on('modSendState', (data) => {
      console.log('------------------modSendState------------------');
      controller.modSendState(data);
  })

  socket.on('error', (err) => {
    console.log('---------------error--------------');
    console.log(err);
  })

  socket.on('disconnect', async (reason) => {
    console.log('-------------disconnect-----------');
    // 删除这个socket的注册信息
    await controller.logout(socket, redis);
  });
})
