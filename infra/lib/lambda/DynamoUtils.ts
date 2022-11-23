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
