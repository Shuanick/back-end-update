// routes/posts.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const { Storage } = require('@google-cloud/storage');

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
  const storage = new Storage({
    keyFilename: process.env.GOOGLE_CLOUD_KEYFILE //modified
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
      resolve(publicUrl);
    });
    blobStream.end(file.buffer);
  });
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