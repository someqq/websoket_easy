import {WebSocketClient} from './src';

const wsClient = new WebSocketClient({
  url: "ws://example.com",
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  heartbeatMessage: "ping",
});

// 订阅日志事件
wsClient.onLog((message) => {
  console.log("日志输出:", message);
});

// 发送消息
wsClient.sendMessage("Hello, WebSocket!");

// 关闭连接
wsClient.close();

// 取消订阅日志事件
// wsClient.offLog();
