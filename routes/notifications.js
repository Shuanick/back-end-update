const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const userConnections = require("../connection");
require('dotenv').config();

// 創建新通知
router.post("/", async (req, res) => {
  const { user, type, from } = req.body;

  if (!user || !type || !from) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const notification = new Notification({
      user, // 接收通知的用户ID
      type, // 通知类型，例如 "friendRequest"
      from, // 发送请求的用户ID
      createdAt: new Date() // 添加创建时间
    });

    await notification.save(); // 保存通知

    // 如果用户在线，可以通过 WebSocket 发送即时通知
    if (userConnections[user]) {
      userConnections[user].send(JSON.stringify({
        type: "notification",
        notification
      }));
    }

    res.status(201).send(notification); // 返回创建的通知
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).send("Error creating notification");
  }
});

// 获取用户的所有通知
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.send(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Error fetching notifications");
  }
});

module.exports = router;
