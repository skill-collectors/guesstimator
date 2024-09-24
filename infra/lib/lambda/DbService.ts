import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { generateId } from "../utils/KeyGenerator";
import {
  deleteBatchOperation,
  updateBatchOperation,
  query,
  scan,
  isRoomItem,
  isUserItem,
  RoomItem,
  UserItem,
  DbItem,
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
  client: DynamoDBDocumentClient;
  tableName: string;

  constructor(tableName: string) {
    const baseClient = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(baseClient);

    this.tableName = tableName;
  }

  async createRoom() {
    const roomId = generateId(ROOM_ID_LENGTH);
    const hostKey = generateId(HOST_KEY_LENGTH);
    const validSizes = "1 2 3 5 8 13 20 ? ∞";
    const createdOn = new Date().toISOString();
    const isRevealed = false;
    await this.client.send(
      new PutCommand({
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
      }),
    );
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
    // TODO define "RoomItem" and "UserItem" types
    await query(this.client, queryParams, async (item: RoomItem | UserItem) => {
      if (isRoomItem(item)) {
        roomData = {
          roomId: item.PK.substring("ROOM:".length),
          validSizes: item.validSizes.split(" "),
          isRevealed: item.isRevealed,
          hostKey: item.hostKey,
        };
      } else if (isUserItem(item)) {
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
    const output = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `ROOM:${roomId}`, SK: "ROOM" },
      }),
    );
    return output.Item;
  }
  async subscribe(
    roomId: string,
    connectionId: string,
    userKey: string | undefined = undefined,
  ) {
    if (userKey !== undefined) {
      const pk = `ROOM:${roomId}`;
      const sk = `USER:${userKey}`;
      const updatedOn = new Date().toISOString();
      try {
        await this.client.send(
          new UpdateCommand({
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
          }),
        );
        console.log(
          `Subscribed connection ${connectionId} for existing userKey ${userKey} to room ${roomId}`,
        );
        return { userKey };
      } catch (e) {
        if (e instanceof ConditionalCheckFailedException) {
          console.log(
            `Got an unknown (probably stale) user key: ${userKey} for room ${roomId}. This user will be recreated.`,
          );
          // end if (userKey !== undefined)
        } else {
          console.log("Unhandled exception in DbService.subscribe", e);
          throw e;
        }
      }
    }
    userKey ||= generateId(USER_KEY_LENGTH);
    const userId = generateId(USER_KEY_LENGTH);
    const createdOn = new Date().toISOString();
    await this.client.send(
      new PutCommand({
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
      }),
    );
    console.log(
      `Subscribed connection ${connectionId} for new userKey ${userKey} to room ${roomId}`,
    );
    return { userKey };
  }
  async join(roomId: string, userKey: string, username: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
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
      }),
    );
    console.log(`Added user ${username} with key ${userKey} to room ${roomId}`);
    return { username };
  }
  async leave(roomId: string, userKey: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression:
          "SET updatedOn = :updatedOn, username = :username, vote = :vote",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":updatedOn": updatedOn,
          ":username": "",
          ":vote": "",
        },
      }),
    );
    console.log(`User with key ${userKey} in room ${roomId} left`);
  }
  async reconnect(roomId: string, userKey: string, connectionId: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        ConditionExpression: "PK = :pk AND SK = :sk",
        UpdateExpression:
          "SET updatedOn = :updatedOn, username = :username, vote = :vote, connectionId = :connectionId",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
          ":updatedOn": updatedOn,
          ":username": "",
          ":vote": "",
          ":connectionId": connectionId,
        },
      }),
    );
    console.log(`Reconnected user with key ${userKey} in room ${roomId}`);
  }
  async kickUser(roomId: string, userKey: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
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
      }),
    );
    console.log(`Kicked user with key ${userKey} in room ${roomId}`);
  }
  async vote(roomId: string, userKey: string, vote: string) {
    const pk = `ROOM:${roomId}`;
    const sk = `USER:${userKey}`;
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
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
      }),
    );
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
      if (isRoomItem(item)) {
        item.isRevealed = isRevealed;
        item.updatedOn = updatedOn.toISOString();
        await updateOperation.push(item);
      } else if (isUserItem(item) && item.vote != "" && isRevealed == false) {
        // clear votes when hiding cards
        item.vote = "";
        item.updatedOn = updatedOn.toISOString();
        await updateOperation.push(item);
      }
    });
    await updateOperation.flush();
  }

  async setValidSizes(roomId: string, validSizes: string) {
    const pk = `ROOM:${roomId}`;
    const sk = "ROOM";
    const updatedOn = new Date().toISOString();
    await this.client.send(
      new UpdateCommand({
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
      }),
    );
  }

  async deleteUser(roomId: string, userKey: string) {
    const output = await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `ROOM:${roomId}`,
          SK: `USER:${userKey}`,
        },
        ReturnValues: "ALL_OLD",
      }),
    );
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
    await query<RoomItem>(this.client, queryParams, async (item) => {
      await deleteOperation.push(item);
    });
    await deleteOperation.flush();
  }

  async deleteStaleUsers() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    const cutoffDateString = cutoffDate.toISOString().substring(0, 10);
    console.log(`Scanning for users not updated since ${cutoffDateString}`);

    const queryParams = {
      TableName: this.tableName,
      ProjectionExpression: "PK, SK",
      // ISO dates can be sorted/compared alphanumerically
      FilterExpression: "begins_with(SK, :sk) AND updatedOn < :cutoffDate",
      ExpressionAttributeValues: {
        ":sk": "USER:",
        ":cutoffDate": cutoffDateString,
      },
    };

    let count = 0;
    await scan<DbItem>(this.client, queryParams, async (item) => {
      const roomId = item.PK.substring("ROOM:".length);
      const userKey = item.SK.substring("USER:".length);
      await this.deleteUser(roomId, userKey);
      count++;
    });

    return count;
  }

  async deleteStaleRooms() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    const cutoffDateString = cutoffDate.toISOString().substring(0, 10);
    console.log(`Scanning for rooms not updated since ${cutoffDateString}`);

    const queryParams = {
      TableName: this.tableName,
      ProjectionExpression: "PK",
      // ISO dates can be sorted/compared alphanumerically
      FilterExpression: "SK = :sk AND updatedOn < :cutoffDate",
      ExpressionAttributeValues: {
        ":sk": "ROOM",
        ":cutoffDate": cutoffDateString,
      },
    };

    let count = 0;
    await scan<RoomItem>(this.client, queryParams, async (item) => {
      const roomId = item.PK.substring("ROOM:".length);
      await this.deleteRoom(roomId);
      count++;
    });

    return count;
  }

  async resetInactiveRooms() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    const cutoffDateString = cutoffDate.toISOString().substring(0, 10);
    console.log(`Scanning for cards revealed since ${cutoffDateString}`);

    const queryParams = {
      TableName: this.tableName,
      ProjectionExpression: "PK",
      // ISO dates can be sorted/compared alphanumerically
      FilterExpression:
        "SK = :sk AND updatedOn < :cutoffDate AND isRevealed = true",
      ExpressionAttributeValues: {
        ":sk": "ROOM",
        ":cutoffDate": cutoffDateString,
      },
    };

    let count = 0;
    await scan<RoomItem>(this.client, queryParams, async (item) => {
      const roomId = item.PK.substring("ROOM:".length);
      await this.setCardsRevealed(roomId, false);
      count++;
    });

    return count;
  }
}
