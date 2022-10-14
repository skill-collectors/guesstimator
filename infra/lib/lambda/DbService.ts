import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { generateId } from "../utils/KeyGenerator";
import * as aws from "@pulumi/aws";

const ROOM_ID_LENGTH = 6;
const HOST_KEY_LENGTH = 4;

export default class DbService {
  client: DocumentClient;
  tableName: string;

  constructor(tableName: string) {
    const { LOCALSTACK_HOSTNAME } = process.env;
    this.client =
      LOCALSTACK_HOSTNAME !== undefined
        ? new aws.sdk.DynamoDB.DocumentClient({
            endpoint: `http://${LOCALSTACK_HOSTNAME}:4566`,
          })
        : new aws.sdk.DynamoDB.DocumentClient();

    this.tableName = tableName;
  }

  async createRoom() {
    const roomId = generateId(ROOM_ID_LENGTH);
    const hostKey = generateId(HOST_KEY_LENGTH);
    const validSizes = "1 2 3 5 8 13 20 ? ∞";
    const createdOn = new Date().toISOString();
    const isRevealed = false;
    await this.client
      .put({
        TableName: this.tableName,
        Item: {
          PK: `ROOM:${roomId}`,
          hostKey,
          validSizes,
          isRevealed,
          createdOn,
          updatedOn: createdOn,
        },
      })
      .promise();
    console.log(`Created room ${roomId}`);
    return {
      roomId,
      hostKey,
      validSizes,
      isRevealed,
    };
  }
  async getRoom(roomId: string) {
    const getItemResponse = await this.client
      .get({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}` },
      })
      .promise();
    const roomData = getItemResponse.Item;
    if (roomData === undefined) {
      return null;
    }

    console.log(`Got room ${JSON.stringify(roomData)}`);
    const response = {
      roomId,
      validSizes: roomData.validSizes,
      isRevealed: roomData.isRevealed,
    };

    return response;
  }
  async deleteRoom(roomId: string) {
    await this.client
      .delete({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}` },
      })
      .promise();
  }
}
