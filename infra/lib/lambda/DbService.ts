import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { generateId } from "../utils/KeyGenerator";
import * as aws from "@pulumi/aws";
import { deleteBatchOperation, forEach, query, scan } from "./DynamoUtils";

const ROOM_ID_LENGTH = 6;
const HOST_KEY_LENGTH = 4;
const USER_KEY_LENGTH = 4;

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
    };
  }

  async getRoom(roomId: string) {
    const queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ROOM:${roomId}`,
      },
    };
    const roomData:
      | {
          roomId: string | undefined;
          validSizes: string[] | undefined;
          isRevealed: boolean | undefined;
          hostKey: string | undefined;
        }
      | undefined = {
      roomId: undefined,
      validSizes: undefined,
      isRevealed: undefined,
      hostKey: undefined,
    };
    const users: { userKey: string; username?: string; vote?: string }[] = [];
    await forEach(query(this.client, queryParams), async (item) => {
      if (item.SK === "ROOM") {
        roomData.roomId = item.PK.substring("ROOM:".length);
        roomData.validSizes = item.validSizes.split(" ");
        roomData.isRevealed = item.isRevealed;
        roomData.hostKey = item.hostKey;
      } else if (item.SK.startsWith("USER:")) {
        const userKey = item.SK.substring("USER:".length);
        users.push({
          userKey,
          username: item.username,
          vote: item.currentVote,
        });
      } else {
        console.log("Unexpected key pattern: ${item.PK}/${item.SK}");
      }
    });

    if (roomData.roomId === undefined) {
      return null;
    }

    return {
      ...roomData,
      users: Array.from(users.values()),
    };
  }
  async getRoomMetadata(roomId: string) {
    return await this.client
      .get({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
      })
      .promise();
  }
  async addUser(roomId: string, username: string) {
    const room = this.getRoomMetadata(roomId);
    if (room === null) {
      return null;
    }

    const userKey = generateId(USER_KEY_LENGTH);
    const createdOn = new Date().toISOString();
    await this.client
      .put({
        TableName: this.tableName,
        Item: {
          PK: `ROOM:${roomId}`,
          SK: `USER:${userKey}`,
          username,
          vote: "",
          createdOn,
          updatedOn: createdOn,
        },
      })
      .promise();
    console.log(`Added user ${username} with key ${userKey} to room ${roomId}`);
    return {
      roomId,
      username,
      userKey,
    };
  }
  async setCardsRevealed(roomId: string, isRevealed: boolean) {
    const pk = `ROOM:${roomId}`;
    const sk = "ROOM";
    const updatedOn = new Date();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression:
          "set isRevealed = :isRevealed, updatedOn = :updatedOn",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":isRevealed": isRevealed,
          ":updatedOn": updatedOn.toISOString(),
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
    const deleteOperation = deleteBatchOperation(this.client, this.tableName);
    await forEach(query(this.client, queryParams), async (item) => {
      await deleteOperation.push(item);
    });
    await deleteOperation.flush();
  }

  async deleteStaleRooms() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    const cutoffDateString = cutoffDate.toISOString().substring(0, 10);
    console.log(`Scanning for items before ${cutoffDateString}`);

    const queryParams = {
      TableName: this.tableName,
      // ISO dates can be sorted/compared alphanumerically
      FilterExpression: "updatedOn < :cutoffDate",
      ProjectionExpression: "PK",
      ExpressionAttributeValues: {
        ":cutoffDate": cutoffDateString,
      },
    };

    let count = 0;
    await forEach(scan(this.client, queryParams), async (item) => {
      const roomId = item.PK.substring("ROOM:".length);
      await this.deleteRoom(roomId);
      count++;
    });

    return count;
  }
}
