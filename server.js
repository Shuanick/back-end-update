  const express = require('express');
  const mongoose = require('mongoose');
  const userRoutes = require('./routes/users');
  const postRoutes = require('./routes/posts');
  const uploadRoutes = require('./routes/upload');
  const cors = require('cors');
  const path = require('path');
  require('dotenv').config();

  const app = express();
  const port = process.env.PORT || 3000;

  // 连接到 MongoDB
  // mongodb+srv://linshuan880727:<db_password>@nickserver.0wgra.mongodb.net/?retryWrites=true&w=majority&appName=NickServer
  const dbURI = process.env.MONGODB_URI;
  mongoose.connect(dbURI);

  // 检查连接
  mongoose.connection.on('connected', () => {
    console.log(`Connected to ${dbURI}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  app.use(cors({
    // "https://nickproduct2.netlify.app" || 
      origin: 'https://nickproduct2.netlify.app', // 允许此来源的请求
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
      allowedHeaders: ['Content-Type', 'Authorization'] // 允许的标头
  }));

  // 中间件
  app.use(express.json());

  // 设置路由
  app.use('/upload', uploadRoutes);
  app.use('/users', userRoutes);
  app.use('/posts', postRoutes);

  app.get('/', (req, res) => {
    res.send('API2 is running');
  });

  // 启动服务器
  app.listen(3000, () => {
    console.log(`Server running at http://localhost:${port}`);
  });