const WebSocket = require("ws");

// 创建一个 WebSocket 服务器，监听 8080 端口
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("新客户端连接");

  // 当接收到消息时
  ws.on("message", (message) => {
    console.log("收到消息: %s", message);
    // 如果收到的是 ping 消息，则发送 pong
    if (message == "ping") {
      ws.send("pong");
    } else {
      // 回复客户端
      ws.send(`收到您的消息: ${message}`);
    }
  });

  // 每当连接关闭时
  ws.on("close", () => {
    console.log("客户端断开连接");
  });


});

console.log("WebSocket 服务器已启动，正在监听 ws://localhost:8080");
