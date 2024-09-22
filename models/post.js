const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' }, // 參考用戶
  content: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  likedBy: { type: [String], default: [] }
});

module.exports = mongoose.model('Post', postSchema);