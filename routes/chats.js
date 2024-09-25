const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");
const userConnections = require("../connection");

router.post("/", async (req, res) => {
  const { sender, reciever, content, participants } = req.body;

  try {
    // 查找或创建聊天记录
    let chat = await Chat.findOne({ participants: { $all: participants } });

    if (!chat) {
      chat = new Chat({ participants, messages: [] });
    }

    // 添加新消息
    const newMessage = { sender, reciever, content };
    chat.messages.push(newMessage);
    await chat.save(); // 保存聊天记录

    const latestMessage = chat.messages[chat.messages.length - 1];

    if (userConnections[sender] && userConnections[reciever]) {
      userConnections[sender].send(
        JSON.stringify({
          type: "message",
          latestMessage,
        })
      );
      userConnections[reciever].send(
        JSON.stringify({
          type: "message",
          latestMessage,
        })
      );
    }

    res.status(201).json(chat); // 返回创建的聊天记录
  } catch (error) {
    console.error("保存消息时出错:", error);
    res.status(500).json({ message: "发送消息时出错" });
  }
});

router.get("/:currentId", async (req, res) => {
  const { currentId } = req.params;
  try {
    // 查找包含 currentId 的所有聊天记录
    const chats = await Chat.find({
      participants: currentId,
    });

    res.status(200).json(chats); // 返回聊天记录
  } catch (error) {
    console.error("获取聊天记录时出错:", error);
    res.status(500).json({ message: "获取聊天记录时出错" });
  }
});

module.exports = router;
