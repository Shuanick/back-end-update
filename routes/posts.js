// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/post");
require('dotenv').config();

// 設定圖片上傳存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.patch("/:id", async (req, res) => {
  const { likedBy } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { likedBy }, { new: true }); 
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.json({ message: "Post updated successfully", data: post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Error updating post: " + error.message);
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  const  content  = req.body.content;
  const id = req.body.user;
  const likedBy = req.body.likedBy;
  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const imageUrl = req.body.image;
    const newPost = new Post({
      user : id,
      content,
      image: imageUrl,
      likedBy: likedBy,
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
