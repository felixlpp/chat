const mongoConn = require('../utils/mongodb');
const ObjectId = mongoConn.Schema.Types.ObjectId;

const schema = new mongoConn.Schema({
    nickname: {type: String, required: true, unique:true},
    phone: {type: String, required: true, unique: true},
    sex: {type: String, enum: ['0', '1'], required: true}, // 女：'0',男：'1'
    isDeleted: {type: Boolean, default: false}
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
})

let model = mongoConn.model('users', schema);

module.exports = model;
