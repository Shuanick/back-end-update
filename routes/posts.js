// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Post = require("../models/post");
require('dotenv').config();

// 設定圖片上傳存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 創建新帖子
router.post("/", upload.single("image"), async (req, res) => {
  const  content  = req.body.content;
  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const imageUrl = req.body.image;
    const newPost = new Post({
      content,
      image: imageUrl,
    });
    await newPost.save();
    res.status(201).json({ message: `Post created successfully`, data: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send("Error creating post: " + error.message);
  }
});


// 獲取所有帖子
  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find();
      res.send(posts);
    } catch (error) {
      res.status(500).send("Error fetching posts: " + error.message);
    }
  });

module.exports = router;
