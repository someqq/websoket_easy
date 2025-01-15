interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
}

class EventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(...args));
  }
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private heartbeatMessage: string;
  private emitter = new EventEmitter();
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
      this.emitLog("WebSocket连接已建立");
      this.emitter.emit("open");
      this.startHeartbeat();
    };

    this.socket.onclose = (event) => {
      this.emitLog(`WebSocket连接关闭: ${event.reason}`);
      this.emitter.emit("close", event);
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      this.emitLog(`WebSocket连接出错: ${error}`);
      this.emitter.emit("error", error);
      this.reconnect();
    };

    this.socket.onmessage = (message) => {
      this.emitter.emit("message", message);
    };
  }

  private reconnect() {
    let backoffTime: number;

    if (this.useExponentialBackoff) {
      // 使用指数退避
      backoffTime = Math.min(
        Math.pow(this.reconnectIntervalBase, this.retryCount) * 1000, // 退避公式：2^retryCount秒
        this.maxReconnectInterval // 最大重试间隔，防止无限增长
      );
    } else {
      // 使用线性退避
      backoffTime = Math.min(
        this.retryCount * 1000, // 退避公式：retryCount秒
        this.maxReconnectInterval // 最大重试间隔
      );
    }

    this.emitLog(`重连中，等待 ${backoffTime} 毫秒后重试...`);
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
      this.emitLog("WebSocket连接不可用，消息未发送");
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  // 用于触发日志事件
  private emitLog(message: string) {
    this.emitter.emit("log", message);
  }

  // 订阅日志事件
  public onLog(handler: (message: string) => void) {
    this.emitter.on("log", handler);
  }

  // 取消订阅日志事件
  public offLog(handler: (message: string) => void) {
    this.emitter.off("log", handler);
  }
}

export default WebSocketClient;
