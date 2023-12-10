import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

export interface DbItem {
  PK: string;
  SK: string;
  updatedOn: string;
}

export interface RoomItem extends DbItem {
  hostKey: string | undefined;
  validSizes: string;
  isRevealed: boolean;
}

export function isRoomItem(object: unknown): object is RoomItem {
  return (
    object !== null &&
    typeof object === "object" &&
    "SK" in object &&
    object.SK === "ROOM"
  );
}

export interface UserItem extends DbItem {
  userId: string;
  username: string | undefined;
  vote: string;
  connectionId: string | undefined;
}

export function isUserItem(object: unknown): object is UserItem {
  return (
    object !== null &&
    typeof object === "object" &&
    "SK" in object &&
    typeof object.SK === "string" &&
    object.SK.startsWith("USER:")
  );
}

export async function query<T>(
  client: DynamoDBDocumentClient,
  params: QueryCommandInput,
  consumer: (item: T) => Promise<void>,
) {
  let output = await client.send(new QueryCommand(params));
  for (const item of output.Items || []) {
    await consumer(item as T);
  }
  while (
    output.LastEvaluatedKey !== undefined &&
    output.LastEvaluatedKey !== null
  ) {
    output = await client.send(
      new QueryCommand({
        ...params,
        ExclusiveStartKey: output.LastEvaluatedKey,
      }),
    );
    for (const item of output.Items || []) {
      await consumer(item as T);
    }
  }
}

export async function scan<T>(
  client: DynamoDBDocumentClient,
  params: ScanCommandInput,
  consumer: (item: T) => Promise<void>,
) {
  let output = await client.send(new ScanCommand(params));
  for (const item of output.Items || []) {
    await consumer(item as T);
  }
  while (
    output.LastEvaluatedKey !== undefined &&
    output.LastEvaluatedKey !== null
  ) {
    output = await client.send(
      new ScanCommand({
        ...params,
        ExclusiveStartKey: output.LastEvaluatedKey,
      }),
    );
    for (const item of output.Items || []) {
      await consumer(item as T);
    }
  }
}

// TODO batchDelete -> call once per item and flushes at 25 and when "done"
/*
const deleteOperation = deleteBatchOperation(this.client, this.tableName));
for await (const item of query(...)) {
  deleteOperation.push(item);
}
deleteOperation.flush();
*/

class BatchOperation<T> {
  client;
  itemHandler;
  accumulator: T[];
  batchSize;

  constructor(
    client: DynamoDBDocumentClient,
    itemHandler: (items: T[]) => Promise<void>,
    batchSize = 25,
  ) {
    this.client = client;
    this.itemHandler = itemHandler;
    this.accumulator = [];
    this.batchSize = batchSize;
  }

  async push(item: T) {
    this.accumulator.push(item);
    if (this.accumulator.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.accumulator.length > 0) {
      await this.itemHandler(this.accumulator);
      this.accumulator.splice(0, this.itemHandler.length);
    }
  }
}

function asRecord(item: unknown): Record<string, unknown> {
  if (typeof item !== "object" || item === null) {
    throw new Error("Input is not an object");
  }

  return Object.entries(item).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );
}
function asRecords(items: unknown[]): Record<string, unknown>[] {
  return items.map(asRecord);
}

export function updateBatchOperation<T extends object>(
  client: DynamoDBDocumentClient,
  tableName: string,
) {
  return new BatchOperation(client, async (items: T[]) => {
    const putRequests =
      items.map((item) => ({
        PutRequest: { Item: item },
      })) || [];
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: asRecords(putRequests),
        },
      }),
    );
  });
}

export function deleteBatchOperation<T extends DbItem>(
  client: DynamoDBDocumentClient,
  tableName: string,
) {
  return new BatchOperation(client, async (items: T[]) => {
    const deleteRequests =
      items.map((item) => ({
        DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
      })) || [];
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      }),
    );
  });
}
