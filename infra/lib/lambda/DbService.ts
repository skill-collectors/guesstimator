import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { generateId } from "../utils/KeyGenerator";
import * as aws from "@pulumi/aws";
import { Pager } from "./Pager";

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
          SK: "ROOM",
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
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
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
  async setCardsRevealed(roomId: string, isRevealed: boolean) {
    const roomData = await this.getRoom(roomId);
    if (roomData === null) {
      return;
    }
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
        UpdateExpression: "set isRevealed = :isRevealed",
        ExpressionAttributeValues: {
          ":isRevealed": isRevealed,
        },
      })
      .promise();
  }

  async deleteRoom(roomId: string) {
    const queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ROOM:${roomId}`,
      },
    };
    const supplier = async (params: DocumentClient.QueryInput) =>
      await this.client.query(params).promise();
    const consumer = async (items: DocumentClient.ItemList) => {
      const deleteRequests =
        items.map((item) => ({
          DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
        })) || [];
      await this.client
        .batchWrite({
          RequestItems: {
            [this.tableName]: deleteRequests,
          },
        })
        .promise();
    };

    const pager = new Pager(supplier, queryParams, consumer);
    await pager.run();
  }
}
