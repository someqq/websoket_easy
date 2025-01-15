export interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
}
