const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userConnections = require("../connection");

//新增好友請求
const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

router.post("/:username/friend-request", async (req, res) => {
  const { username } = req.params; // 被加好友的用戶名
  const requesterUsername = req.body.requesterUsername; // 發起請求的用戶名

  try {
    const user = await findUserByUsername(username);
    const requester = await findUserByUsername(requesterUsername);

    if (!user || !requester) return res.status(404).send("User not found");

    // 檢查請求是否已經存在
    if (user.friendRequests.includes(requester.username)) {
      return res.status(400).send("Friend request already exists");
    }

    // 添加好友請求
    user.friendRequests.push(requester.username);
    await user.save();

    res.status(200).send({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).send("Error sending friend request");
  }
});

//刪除好友請求
router.delete("/:username/friend-request", async (req, res) => {
  const { username } = req.params;
  const requesterUsername = req.body.requesterUsername;

  try {
    const user = await findUserByUsername(username);
    const requester = await findUserByUsername(requesterUsername);
    if (!user || !requester) return res.status(404).send("User not found");

    // 檢查請求是否存在
    if (!user.friendRequests.includes(requester.username)) {
      return res.status(404).send("Friend request not found");
    }

    // 移除好友請求
    user.friendRequests = user.friendRequests.filter(
      (req) => req !== requester.username
    );
    await user.save();
    res.status(200).send({ message: "Friend request canceled" });
  } catch (error) {
    res.status(500).send("Error canceling friend request");
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send("Error fetching users: " + error.message);
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (error) {
    res.status(500).send("Error fetching user profile: " + error.message);
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("username and password are required");
  }

  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user: " + error.message);
  }
});

router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { introduction } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: userId }, // 根據username查找資料
      { introduction }, // 只更新簡介
      { new: true } // 返回更新后的資料
    );

    if (!updatedUser) return res.status(404).send("User not found");
    res.send(updatedUser);
  } catch (error) {
    res.status(500).send("Error updating user: " + error.message);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Invalid username or password");

    if (user.password !== password)
      return res.status(401).send("Invalid username or password"); // 直接比较明文密码
    const token = generateToken(user);
    res.send({ token });
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
});
const secretKey = crypto.randomBytes(32).toString("hex");
const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });
};

module.exports = router;
