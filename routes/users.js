const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 註冊

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (error) {
    res.status(500).send("Error fetching user profile: " + error.message);
  }
});

router.post('/register', async (req, res) => {
  const { username , password } = req.body;

  if (!username || !password) {
    return res.status(400).send('username and password are required');
  }

  try {
    const user = new User({ username, password });
    console.log(user);
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// 登入
router.post('/login', async (req, res) => {
  const { username , password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send('Invalid username or password');

    if (user.password !== password) return res.status(401).send('Invalid username or password'); // 直接比较明文密码
    const token = generateToken(user);
    res.send({ token });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});
const secretKey = crypto.randomBytes(32).toString('hex');
const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, secretKey, {
    expiresIn: '1h'
  });
};

module.exports = router;