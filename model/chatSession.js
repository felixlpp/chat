const mongoConn = require('../utils/mongodb');
const ObjectId = mongoConn.Schema.Types.ObjectId;

const schema = new mongoConn.Schema({
  owner: {type: String, default: ''},                                             // 群主
  notice: {type: String, default: ''},                                            // 公告
  groupPersons: {type: Array, default: []},                                       // 群成员
  type: {type: String, enum: ['group', 'single'], default: "single"} // group:群聊, single:私聊
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})

let model = mongoConn.model('chatSessions', schema);
module.exports = model;
