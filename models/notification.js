const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true }, // 收到通知的用户
    type: { type: String, required: true }, // 通知类型，例如 "friendRequest"
    from: { type: String, ref: 'User' }, // 发送通知的用户
    post: { type: String, ref: 'Post' }, // 相关的帖子（可选）
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Notification', notificationSchema);