import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { generateId } from "../utils/KeyGenerator";
import * as aws from "@pulumi/aws";
import {
  deleteBatchOperation,
  updateBatchOperation,
  query,
  scan,
} from "./DynamoUtils";

const ROOM_ID_LENGTH = 6;
const HOST_KEY_LENGTH = 4;
const USER_KEY_LENGTH = 4;

export interface Room {
  roomId: string;
  validSizes: string[];
  isRevealed: boolean;
  hostKey?: string;
}

export interface User {
  userKey?: string;
  userId: string;
  username?: string;
  hasVote: boolean;
  vote?: string;
  connectionId?: string;
}

export interface RoomData extends Room {
  users: User[];
}

export class DbService {
  client: DocumentClient;
  tableName: string;

  constructor(tableName: string) {
    this.client = new aws.sdk.DynamoDB.DocumentClient();

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

  async getRoom(roomId: string): Promise<RoomData | null> {
    const queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ROOM:${roomId}`,
      },
    };
    let roomData: Room | undefined;
    const users: User[] = [];
    await query(this.client, queryParams, async (item) => {
      if (item.SK === "ROOM") {
        roomData = {
          roomId: item.PK.substring("ROOM:".length),
          validSizes: item.validSizes.split(" "),
          isRevealed: item.isRevealed,
          hostKey: item.hostKey,
        };
      } else if (item.SK.startsWith("USER:")) {
        const userKey = item.SK.substring("USER:".length);
        users.push({
          userKey: userKey,
          userId: item.userId,
          username: item.username,
          hasVote: item.vote !== "",
          vote: item.vote,
          connectionId: item.connectionId,
        });
      } else {
        console.log("Unexpected key pattern: ${item.PK}/${item.SK}");
      }
    });

    if (roomData === undefined) {
      return null;
    }

    return {
      ...roomData,
      users,
    };
  }
  async getRoomMetadata(roomId: string) {
    const output = await this.client
      .get({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
      })
      .promise();
    return output.Item;
  }
  async subscribe(
    roomId: string,
    connectionId: string,
    userKey: string | undefined = undefined,
  ) {
    if (userKey === undefined) {
      const userKey = generateId(USER_KEY_LENGTH);
      const userId = generateId(USER_KEY_LENGTH);
      const createdOn = new Date().toISOString();
      await this.client
        .put({
          TableName: this.tableName,
          Item: {
            PK: `ROOM:${roomId}`,
            SK: `USER:${userKey}`,
            userId,
            connectionId,
            username: "",
            vote: "",
            createdOn,
            updatedOn: createdOn,
          },
        })
        .promise();
      console.log(
        `Subscribed connection ${connectionId} for new userKey ${userKey} to room ${roomId}`,
      );
    } else {
      const pk = `ROOM:${roomId}`;
      const sk = `USER:${userKey}`;
      const updatedOn = new Date().toISOString();
      await this.client
        .update({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
          ConditionExpression: "PK = :pk AND SK = :sk",
          UpdateExpression:
            "set connectionId = :connectionId, updatedOn = :updatedOn",
          ExpressionAttributeValues: {
            ":pk": pk,
            ":sk": sk,
            ":connectionId": connectionId,
            ":updatedOn": updatedOn,
          },
        })
        .promise();
      console.log(
        `Subscribed connection ${connectionId} for existing userKey ${userKey} to room ${roomId}`,
      );
    }
    return { userKey };
  }
  async join(roomId: string, userKey: string, username: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression: "set username = :username, updatedOn = :updatedOn",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":username": username,
          ":updatedOn": updatedOn,
        },
      })
      .promise();
    console.log(`Added user ${username} with key ${userKey} to room ${roomId}`);
    return { username };
  }
  async kickUser(roomId: string, userKey: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression:
          "SET updatedOn = :updatedOn, username = :username, vote = :vote REMOVE connectionId",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":updatedOn": updatedOn,
          ":username": "",
          ":vote": "",
        },
      })
      .promise();
    console.log(`Kicked user with key ${userKey} in room ${roomId}`);
  }
  async vote(roomId: string, userKey: string, vote: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression: "set vote = :vote, updatedOn = :updatedOn",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":vote": vote,
          ":updatedOn": updatedOn,
        },
      })
      .promise();
  }
  async setCardsRevealed(roomId: string, isRevealed: boolean) {
    const updatedOn = new Date();

    const queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ROOM:${roomId}`,
      },
    };
    const updateOperation = updateBatchOperation(this.client, this.tableName);
    await query(this.client, queryParams, async (item) => {
      if (item.SK === "ROOM") {
        item.isRevealed = isRevealed;
        item.updatedOn = updatedOn.toISOString();
        updateOperation.push(item);
      } else if (item.SK.startsWith("USER:") && isRevealed == false) {
        // clear votes when hiding cards
        item.vote = "";
        item.updatedOn = updatedOn.toISOString();
        updateOperation.push(item);
      }
    });
    await updateOperation.flush();
  }

  async setValidSizes(roomId: string, validSizes: string) {
    const pk = `ROOM:${roomId}`;
    const sk = "ROOM";
    const updatedOn = new Date().toISOString();
    await this.client
      .update({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression:
          "SET updatedOn = :updatedOn, validSizes = :validSizes",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":updatedOn": updatedOn,
          ":validSizes": validSizes,
        },
      })
      .promise();
  }

  async deleteUser(roomId: string, userKey: string) {
    const output = await this.client
      .delete({
        TableName: this.tableName,
        Key: {
          PK: `ROOM:${roomId}`,
          SK: `USER:${userKey}`,
        },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    return output.Attributes;
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
    await query(this.client, queryParams, async (item) => {
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
    await scan(this.client, queryParams, async (item) => {
      const roomId = item.PK.substring("ROOM:".length);
      await this.deleteRoom(roomId);
      count++;
    });

    return count;
  }
}
