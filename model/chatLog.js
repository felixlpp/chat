const mongoConn = require('../utils/mongodb');
const ObjectId = mongoConn.Schema.Types.ObjectId;

const schema = new mongoConn.Schema({
  receiver: {type: ObjectId, ref: 'users'},                                            // 接收方
  sender: {type: ObjectId, ref: 'users'},                                              // 发送方
  content: {type: String},                                             // 内容
  chatSession: {type: ObjectId, ref: 'chatSessions'},                  // 聊天会话
  sendState: {type: String, enum: ['sending', 'success', 'read', 'unread', 'fail']}, // 发送状态
  isDeleted: {type: Boolean, default: false}
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})
let model = mongoConn.model('chatLogs', schema);

module.exports = model;
