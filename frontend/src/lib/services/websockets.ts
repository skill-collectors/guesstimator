const webSocketUrl = import.meta.env.VITE_PUBLIC_WEB_SOCKET_URL;

/**
 * A wrapper around a standard WebSocket with convenience methods for
 * interacting with the Guesstimator API.
 */
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
    closeHandler: (this: WebSocket, ev: Event) => unknown,
    userKey: string | undefined = undefined,
    hostKey: string | undefined = undefined,
  ) {
    console.log(`Establishing connection to ${roomId} via ${webSocketUrl}`);
    this.roomId = roomId;
    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocket.onmessage = messageHandler;
    this.webSocket.onerror = errorHandler;
    this.webSocket.onopen = openHandler;
    this.webSocket.onclose = closeHandler;

    this.userKey = userKey;
    this.hostKey = hostKey;
  }

  /**
   * Sends the 'subscribe' action. Should be called shortly after connecting, or
   * perhaps after an unexpected disconnect.
   */
  subscribe() {
    console.log(`Subscribing to ${this.roomId}`);
    this.webSocket.send(
      JSON.stringify({
        action: "subscribe",
        data: { roomId: this.roomId, userKey: this.userKey },
      }),
    );
  }

  /**
   * Sends the 'join' action to associate the current user's key with a username.
   */
  join(username: string) {
    if (this.userKey === undefined) {
      throw new Error("Cannot join without a userKey");
    }
    console.log(`Joining room as ${username}`);
    this.webSocket.send(
      JSON.stringify({
        action: "join",
        data: { roomId: this.roomId, userKey: this.userKey, username },
      }),
    );
  }

  /**
   * Sends a "ping" to keep the web socket open
   */
  ping() {
    console.log(">> PING!");
    this.webSocket.send(
      JSON.stringify({
        action: "ping",
        data: {
          roomId: this.roomId,
          userKey: this.userKey,
        },
      }),
    );
  }
  /**
   * Submits a vote for the user. The user must be joined.
   */
  vote(vote: string) {
    if (this.userKey === undefined) {
      throw new Error("Cannot vote without a userKey");
    }
    console.log(`Sending vote: ${vote}`);
    this.webSocket.send(
      JSON.stringify({
        action: "vote",
        data: { roomId: this.roomId, userKey: this.userKey, vote },
      }),
    );
  }

  /**
   * Leave the room. The page should be reloaded or redirected after calling this.
   */
  leave() {
    if (this.userKey === undefined) {
      throw new Error("Cannot leave without a userKey");
    }
    console.log("Leaving room");
    this.webSocket.send(
      JSON.stringify({
        action: "leave",
        data: { roomId: this.roomId, userKey: this.userKey },
      }),
    );
  }

  /**
   * Sends the 'reveal' action. Caller must be the host.
   */
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
      }),
    );
  }

  /**
   * Hides the cards and clears the votes. Caller must be the host.
   */
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
      }),
    );
  }

  /**
   * Updates the valid sizes for the room
   * @param newSizes New sizes as a space-delimited string
   */
  setValidSizes(newSizes: string) {
    if (this.hostKey === undefined) {
      throw new Error("Cannot update sizes without a hostKey");
    }
    this.webSocket.send(
      JSON.stringify({
        action: "setValidSizes",
        data: {
          roomId: this.roomId,
          hostKey: this.hostKey,
          newSizes,
        },
      }),
    );
  }

  /**
   * Closes the connection. Should only be called when leaving the page.
   */
  close() {
    console.log(`Closing connection`);
    this.webSocket.close();
  }
}
