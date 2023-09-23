export class ConnectionGoneError extends Error {
  connectionId;

  constructor(connectionId: string) {
    super(`Connection ${connectionId} is gone.`);
    Object.setPrototypeOf(this, ConnectionGoneError.prototype);

    this.connectionId = connectionId;
  }
}
