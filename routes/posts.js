// routes/posts.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const os = require('os');

// 設定圖片上傳存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 創建新帖子
router.post('/', upload.single('image'), async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).send('Content is required');
  }

  try {
    const imageUrl = req.file ? await uploadImageToGCS(req.file) : null;
    const newPost = new Post({
      content,
      image: imageUrl
    });
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Error creating post: ' + error.message);
  }
});

async function uploadImageToGCS(file) {
  const bucketName = 'nick_product_bucket';
  const base64Key = process.env.GOOGLE_CLOUD_KEYFILE;//
  const keyFilePath = path.join(os.tmpdir(), 'service-account-file.json');//
  try{
  fs.writeFileSync(keyFilePath, Buffer.from(base64Key, 'base64'));//
  const storage = new Storage({
    keyFilename: keyFilePath //modified
  });
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(Date.now() + path.extname(file.originalname));
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      fs.unlinkSync(keyFilePath); //清理臨時文件
      resolve(publicUrl);
    });
    blobStream.end(file.buffer);
  });
}catch(err){
  throw new Error('Failed to upload image to GCS: ' + err.message);
}
}

// 獲取所有帖子
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (error) {
    res.status(500).send('Error fetching posts: ' + error.message);
  }
});

module.exports = router;