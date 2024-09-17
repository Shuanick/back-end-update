const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

// 註冊
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Name, email, and password are required');
  }

  try {
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('Invalid email or password');

    user.comparePassword(password, (err, isMatch) => {
      if (err) return res.status(500).send('Error logging in: ' + err.message);
      if (!isMatch) return res.status(401).send('Invalid email or password');

      res.send('Login successful');
    });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

module.exports = router;