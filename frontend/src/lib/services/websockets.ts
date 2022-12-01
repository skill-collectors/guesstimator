const webSocketUrl = import.meta.env.VITE_PUBLIC_WEB_SOCKET_URL;

export function connect() {
  return new WebSocket(webSocketUrl);
}

export function disconnect(webSocket: WebSocket | null) {
  if (webSocket !== null) {
    webSocket.close();
  }
}
