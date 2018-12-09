const mongoose = require('mongoose');
const dbConfig = require('../config/dataSource.json')[process.env.NODE_ENV];
const mongoConfig = dbConfig.mongodb;

let connectStr = 'mongodb://';
// mongodb主从节点连接配置
if (mongoConfig.replication) {
    if (mongoConfig.user) {
        connectStr += mongoConfig.user + ':' + mongoConfig.pwd + '@';
    }
    mongoConfig.servers.forEach((server)=> {
        connectStr += server.host + ':' + server.port + ',';
    });
    // 去掉连接字符串末尾的逗号
    connectStr = connectStr.substring(0, connectStr.length - 1);
    connectStr += '/' + mongoConfig.db + '?replicaSet=' + mongoConfig.replication;
} else {// 单点mongodb连接配置
    if (mongoConfig.user) {
        connectStr += mongoConfig.user + ':' + mongoConfig.pwd + '@' + mongoConfig.host
          + ':' + mongoConfig.port + '/' + mongoConfig.db;
    } else {
        connectStr += mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.db;
    }
}

// mongodb连接配置
const options = {
  autoIndex: mongoConfig.autoIndex,
  useNewUrlParser: true,
  useCreateIndex: true,
  reconnectInterval: 500, //
  reconnectTries: 30,
}

mongoose.connect(connectStr, options, err => {
    if (err) {
        console.log(err);
        console.log('mongodb 连接失败！');
    }
})
mongoose.connection.on('disconnected', function () {
    console.error('mongodb连接断开，重试中。。。\t');
    mongoose.connect(connectStr, options, err => {
        console.log(err);
      console.log('mongodb 连接失败！');
    })
});
mongoose.connection.on('open', () => {
  console.log('mongodb 连接成功！');
})

module.exports = mongoose;
