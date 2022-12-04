const webSocketUrl = import.meta.env.VITE_PUBLIC_WEB_SOCKET_URL;

export class GuesstimatorWebSocket {
  webSocket;
  roomId;
  userKey?: string;
  hostKey?: string;

  constructor(
    roomId: string,
    messageHandler: (this: WebSocket, ev: MessageEvent<unknown>) => unknown,
    errorHandler: (this: WebSocket, ev: Event) => unknown,
    openHandler: (this: WebSocket, ev: Event) => unknown,
    userKey: string | undefined = undefined,
    hostKey: string | undefined = undefined
  ) {
    console.log(`Establishing connection to ${roomId}`);
    this.roomId = roomId;
    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocket.onmessage = messageHandler;
    this.webSocket.onerror = errorHandler;
    this.webSocket.onopen = openHandler;
    this.userKey = userKey;
    this.hostKey = hostKey;
  }

  subscribe() {
    this.webSocket.send(
      JSON.stringify({
        action: "subscribe",
        data: { roomId: this.roomId, userKey: this.userKey },
      })
    );
  }

  join(username: string) {
    if (this.userKey === undefined) {
      throw new Error("Cannot join without a userKey");
    }
    this.webSocket.send(
      JSON.stringify({
        action: "join",
        data: { roomId: this.roomId, userKey: this.userKey, username },
      })
    );
  }

  vote(vote: string) {
    if (this.userKey === undefined) {
      throw new Error("Cannot vote without a userKey");
    }
    this.webSocket.send(
      JSON.stringify({
        action: "vote",
        data: { roomId: this.roomId, userKey: this.userKey, vote },
      })
    );
  }

  reveal() {
    if (this.hostKey === undefined) {
      throw new Error("Cannot reveal cards without a hostKey");
    }
    this.webSocket.send(
      JSON.stringify({
        action: "reveal",
        data: {
          roomId: this.roomId,
          hostKey: this.hostKey,
        },
      })
    );
  }

  reset() {
    if (this.hostKey === undefined) {
      throw new Error("Cannot reset cards without a hostKey");
    }
    this.webSocket.send(
      JSON.stringify({
        action: "reset",
        data: {
          roomId: this.roomId,
          hostKey: this.hostKey,
        },
      })
    );
  }

  close() {
    console.log(`Closing connection`);
    this.webSocket.close();
  }
}
