/****************
 * socket相关操作函数 *
 ****************/

const magicConf = require('../utils/magicValue');
const code = magicConf.statusCode;
const magicValue = magicConf.common;
const mongoose = require('mongoose');
const chatLogSchema = require('../model/chatLog');
const chatSessionSchema = require('../model/chatSession');
const ObjectId = mongoose.Types.ObjectId;

class SocketController {
    /**
     * @name registInRedis
     * @author felix
     * @desc 将用户的socket信息注册到redis
     * @param  {[type]}  authData [description]
     * @param  {[type]}  socket   [description]
     * @return {Boolean}          [description]
     */
    async regist(authData, socket, redis) {
      const registInfo = JSON.stringify({
        socketId: socket.id,
        socketRooms: socket.rooms
      })
      // 将这个用户的socket信息存到redis，覆盖上次生成未过期的信息
      await redis.setAsync(authData.userId, registInfo);
      // 设置socket信息的过期时间
      await redis.expireAsync(authData.userId, magicValue.redisExp);
      // 将socketid与此用户的id做一个映射
      await redis.setAsync(socket.id, authData.userId);
      // 设置过期时间
      await redis.expireAsync(socket.id, magicValue.redisExp);
    }

    /**
     * @name   logout
     * @author felix
     * @desc   从redis删除此socket的注册信息
     * @param  {[type]} socket [description]
     * @return {[type]}        [description]
     */
    async logout(socket, redis) {
      const authData = await redis.getAsync(socket.id);
      console.log('this socket logout:', authData);
      console.log(socket.id)
      await redis.delAsync(socket.id, authData);
    }

  /**
   * @name   sendSingleMsg
   * @author felix
   * @desc   发送私聊消息
   * @param  {[object]}  data  [contain: senderId, receiverId, method, msg]
   * @param  {[type]}    redis [redis connected client]
   * @return {Promise}       [description]
   */
  async sendSingleMsg(io, data, socket, redis) {
    // 获取到接收方的socket信息
    let receiverSocketInfo = await redis.getAsync(data.receiverId);
    // 获取发送方的socket信息
    let senderSocketInfo = await redis.getAsync(data.senderId);
    receiverSocketInfo = JSON.parse(receiverSocketInfo);
    senderSocketInfo = JSON.parse(senderSocketInfo);

    // 如果接收方离线
    if (!receiverSocketInfo) {
      data.sendState = 'fail';
      // 返回消息发送结果
      await io.to(senderSocketInfo.socketId).emit('sendMsgFail');
      await this.saveChatLog(data);
    } else {
      let savedMsg = await this.saveChatLog(data);
      // 发送消息给接收方
      let res = await io.to(receiverSocketInfo.socketId).send(savedMsg);
      // 发送消息3s后检查消息发送状态，若仍是'sending',则把'sendState'改为'fail'
      setTimeout(async function() {
        let chatLog = await chatLogSchema.findById(savedMsg._id);
        if (chatLog.sendState === 'sending') {
          chatLog.sendState = 'fail';
          chatLog.save();
        }
      }, magicValue.delayTime)
    }
  }

  async joinGroup() {

  }

  /**
   * @name   sendGroupMsg
   * @author felix
   * @desc   发送群聊消息
   * @param  {[type]}  io    [description]
   * @param  {[type]}  data  [description]
   * @param  {[type]}  redis [description]
   * @return {Promise}       [description]
   */
  async sendGroupMsg(io, data, redis) {

  }

/**
 * @name   createSession
 * @author felix
 * @desc   创建聊天会话
 * @param  {[type]}  sessionInfo [description]
 * @return {Promise}             [description]
 */
  async createSession(sessionInfo) {
      const saveSession = {
          type: saveSession.type,                      // 会话类型
          owner: saveSession.owner || '',              // 群聊的群主
          notice: saveSession.notice || '',            // 群公告
          groupPersons: saveSession.groupPersons || [],// 群成员
      };
      let newSession = await chatSessionSchema(saveSession).save();
      return newSession;
  }

  /**
   * @name   saveChatLog
   * @author felix
   * @desc   保存聊天记录
   * @param  {[type]}  data [description]
   * @return {Promise}      [description]
   */
  async saveChatLog(data) {
      const log = {
          sender: data.senderId,                      // 发送者id
          content: data.content,                      // 聊天内容
          receiver: data.receiverId,                  // 接受者id
          chatSession: data.chatSessionId,            // 聊天会话id
          sendState: 'sending' || data.sendState,     // 发送状态
      }
      let savedLog = await chatLogSchema(log).save();
      return savedLog;
  }

  /**
   * @name   modSendState
   * @author felix
   * @desc   修改聊天记录的发送状态
   * @param  {[type]}  data [description]
   * @return {Promise}      [description]
   */
  async modSendState(data) {
      await chatLogSchema.updateOne({_id: ObjectId(data.logId)}, {
          $set: {
              sendState: data.sendState
          }
      });
  }
}

module.exports = SocketController;
