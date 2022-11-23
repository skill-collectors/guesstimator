import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { generateId } from "../utils/KeyGenerator";
import * as aws from "@pulumi/aws";
import { Pager } from "./Pager";
import { query } from "./DynamoUtils";

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
      validSizes,
      isRevealed,
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
    let roomData: object | undefined = undefined;
    const users: { username: string; userKey: string }[] = [];
    const votes: { username: string; currentVote: string }[] = [];
    for await (const item of query(this.client, queryParams)) {
      if (item.SK === "ROOM") {
        roomData = {
          roomId,
          validSizes: item.validSizes,
          isRevealed: item.isRevealed,
          hostKey: item.hostKey,
        };
      } else if (item.SK.startsWith("USERS:")) {
        const userKey = item.SK.substring("USERS:".length);
        users.push({
          username: item.username,
          userKey,
        });
      } else if (item.SK.startsWith("VOTES:")) {
        votes.push({
          username: item.username,
          currentVote: item.currentVote,
        });
      } else {
        console.log("Unexpected key pattern: ${item.PK}/${item.SK}");
      }
    }

    if (roomData === undefined) {
      return null;
    }

    return {
      ...roomData,
      users,
      votes,
    };
  }
  async addUser(roomId: string, username: string) {
    const room = this.getRoom(roomId);
    if (room === null) {
      return null;
    }

    const userKey = generateId(USER_KEY_LENGTH);
    await this.client
      .put({
        TableName: this.tableName,
        Item: {
          PK: `ROOM:${roomId}`,
          SK: `USERS:${userKey}`,
          username,
        },
      })
      .promise();
    console.log(`Added user ${username} with key ${userKey} to room ${roomId}`);
    return {
      roomId,
      userKey,
    };
  }
  async setCardsRevealed(roomId: string, isRevealed: boolean) {
    const roomData = await this.getRoom(roomId);
    if (roomData === null) {
      return;
    }
    const updatedOn = new Date();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
        UpdateExpression:
          "set isRevealed = :isRevealed, updatedOn = :updatedOn",
        ExpressionAttributeValues: {
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
    const supplier = async (params: DocumentClient.QueryInput) => {
      return await this.client.query(params).promise();
    };
    const consumer = async (items: DocumentClient.ItemList) => {
      const deleteRequests =
        items.map((item) => ({
          DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
        })) || [];
      console.log(`Batch deleting ${items.length} items from room ${roomId}`);
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

    const staleRooms: string[] = [];
    const supplier = async (params: DocumentClient.QueryInput) => {
      return await this.client.scan(params).promise();
    };
    const consumer = async (items: DocumentClient.ItemList) => {
      items
        .map((item) => item.PK.substring("ROOM:".length)) // trim 'ROOM:' prefix
        .forEach((roomId) => staleRooms.push(roomId));
    };

    const pager = new Pager(supplier, queryParams, consumer);
    await pager.run();
    console.log(`Got ${staleRooms.length} stale rooms to delete`);
    for (const roomId of staleRooms) {
      await this.deleteRoom(roomId);
    }
    return staleRooms.length;
  }
}
