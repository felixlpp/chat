/*************
 * redis连接文件 *
 *************/

const redis = require('redis');
const Promise = require('bluebird');
const redisConf = require('../config/datasource.json')[process.env.NODE_ENV]["redis"];
Promise.promisifyAll(redis);

const redisClient = redis.createClient(redisConf.port, redisConf.host);
redisClient.on('connect', () => {
  console.log('connect redis success');
});

module.exports = redisClient;
