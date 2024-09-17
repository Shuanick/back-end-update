const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 參考用戶
  content: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);