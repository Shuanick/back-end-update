const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // 发送者的 userId
  reciever: { type: String, required: true },
  content: { type: String, required: true }, // 消息内容
  timestamp: { type: Date, default: Date.now }, // 消息时间戳
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // 存储参与者的 userId，例如 [userIdA, userIdB]
  messages: [messageSchema] // 存储消息记录
});

module.exports = mongoose.model('Chat', chatSchema);