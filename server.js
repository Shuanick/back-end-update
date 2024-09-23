const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const uploadRoutes = require("./routes/upload");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// 连接到 MongoDB
// mongodb+srv://linshuan880727:<db_password>@nickserver.0wgra.mongodb.net/?retryWrites=true&w=majority&appName=NickServer
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI);

// 检查连接
mongoose.connection.on("connected", () => {
  console.log(`Connected to ${dbURI}`);
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

app.use(
  cors({
    // "https://nickproduct2.netlify.app" ||
    origin: "https://nickproduct2.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 中間件
app.use(express.json());

// 設置路由
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API2 is running");
});

//創建http
const server = http.createServer(app);

//設置websocket
const wss = new WebSocket.Server({ server });

const userConnections = require('./connection');


// 处理 WebSocket 连接
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `https://${req.headers.host}/`);
  const userId = url.pathname.split('/')[1];

  if (userId) {
    userConnections[userId] = ws;
    console.log(userConnections);
    console.log(`User ${userId} connected.`);

    ws.on("close", () => {
      delete userConnections[userId];
      console.log(`用戶 ${userId} 已斷開連接。`);
    });
  } else {
    console.error("User ID is missing.");
    ws.close();
  }
});

// 启动服务器
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
