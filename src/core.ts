import mitt from "mitt";

interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private heartbeatMessage: string;
  private emitter = mitt();
  // 指数退避重连
  private retryCount = 0; // 重试次数
  private maxReconnectInterval = 30000; // 最大重试间隔，单位是毫秒
  private reconnectIntervalBase = 2; // 退避基数，通常是 2
  // 是否启动指数退避
  private useExponentialBackoff = true;

  constructor(private options: WebSocketOptions) {
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.heartbeatInterval = options.heartbeatInterval || 25000;
    this.heartbeatMessage = options.heartbeatMessage || "ping";
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.options.url);

    this.socket.onopen = () => {
      console.log("WebSocket连接已建立");
      this.emitter.emit("open");
      this.startHeartbeat();
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket连接关闭", event);
      this.emitter.emit("close", event);
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket连接出错", error);
      this.emitter.emit("error", error);
      this.reconnect();
    };

    this.socket.onmessage = (message) => {
      this.emitter.emit("message", message);
    };
  }

  private reconnect() {
    // 计算指数退避时间，最初的间隔是 1 秒，之后的间隔依次加倍
    const backoffTime = Math.min(
      Math.pow(this.reconnectIntervalBase, this.retryCount) * 1000, // 退避公式：2^retryCount秒
      this.maxReconnectInterval // 最大重试间隔，防止无限增长
    );

    console.log(`重连中，等待 ${backoffTime} 毫秒后重试...`);

    setTimeout(() => {
      this.connect(); // 重新尝试连接
      this.retryCount++; // 增加重试次数
    }, backoffTime);
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(this.heartbeatMessage);
      }
    }, this.heartbeatInterval);
  }

  public sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket连接不可用，消息未发送");
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  // // 给外部提供一个方法来订阅事件
  // public on(event: string, handler: Function) {
  //   this.emitter.on(event, handler);
  // }

  // // 取消订阅事件
  // public off(event: string, handler: Function) {
  //   this.emitter.off(event, handler);
  // }
}

export default WebSocketClient;
