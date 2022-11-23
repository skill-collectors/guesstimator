import { DocumentClient } from "aws-sdk/clients/dynamodb";

export async function* query(
  client: DocumentClient,
  params: DocumentClient.QueryInput
) {
  let output = await client.query(params).promise();
  for (const item of output.Items || []) {
    yield item;
  }
  while (
    output.LastEvaluatedKey !== undefined &&
    output.LastEvaluatedKey !== null
  ) {
    output = await client
      .query({
        ...params,
        ExclusiveStartKey: output.LastEvaluatedKey,
      })
      .promise();
    for (const item of output.Items || []) {
      yield item;
    }
  }
}

export async function* scan(
  client: DocumentClient,
  params: DocumentClient.ScanInput
) {
  let output = await client.scan(params).promise();
  for (const item of output.Items || []) {
    yield item;
  }
  while (
    output.LastEvaluatedKey !== undefined &&
    output.LastEvaluatedKey !== null
  ) {
    output = await client
      .scan({
        ...params,
        ExclusiveStartKey: output.LastEvaluatedKey,
      })
      .promise();
    for (const item of output.Items || []) {
      yield item;
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

class BatchOperation {
  client;
  itemHandler;
  accumulator: DocumentClient.AttributeMap[];
  batchSize;

  constructor(
    client: DocumentClient,
    itemHandler: (items: DocumentClient.ItemList) => Promise<void>,
    batchSize = 25
  ) {
    this.client = client;
    this.itemHandler = itemHandler;
    this.accumulator = [];
    this.batchSize = batchSize;
  }

  async push(item: DocumentClient.AttributeMap) {
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

export function deleteBatchOperation(
  client: DocumentClient,
  tableName: string
) {
  return new BatchOperation(client, async (items: DocumentClient.ItemList) => {
    const deleteRequests =
      items.map((item) => ({
        DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
      })) || [];
    await client
      .batchWrite({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      })
      .promise();
  });
}
