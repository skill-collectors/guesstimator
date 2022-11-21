import { DocumentClient } from "aws-sdk/clients/dynamodb";

const DEFAULT_BATCH_SIZE = 25;

interface Params {
  ExclusiveStartKey?: DocumentClient.Key | undefined;
}

interface Page<T> {
  Items?: T[] | undefined;
  LastEvaluatedKey?: DocumentClient.Key | undefined;
}

export class Pager<
  ItemType,
  ParamType extends Params,
  PageType extends Page<ItemType>
> {
  items: ItemType[];
  supplier;
  params;
  consumer;
  batchSize;

  constructor(
    supplier: (params: ParamType) => Promise<PageType>,
    params: ParamType,
    consumer: (items: ItemType[]) => Promise<void>,
    batchSize = DEFAULT_BATCH_SIZE
  ) {
    this.supplier = supplier;
    this.params = params;
    this.consumer = consumer;
    this.items = [];
    this.batchSize = batchSize;
  }

  async run() {
    let page = await this.supplier(this.params);
    console.log(`Got 1st page with ${page.Items?.length} items`);
    this.push(page);
    while (
      page.LastEvaluatedKey !== undefined &&
      page.LastEvaluatedKey !== null
    ) {
      page = await this.supplier({
        ...this.params,
        ExclusiveStartKey: page.LastEvaluatedKey,
      });
      console.log(
        `Got another page starting at ${page.LastEvaluatedKey} with ${page.Items?.length} items`
      );
      this.push(page);
    }
    await this.flush();
  }

  async push(page: PageType) {
    for (const item of page.Items || []) {
      this.items.push(item);
      if (this.items.length >= this.batchSize) {
        await this.flush();
      }
    }
  }

  async flush() {
    if (this.items.length !== 0) {
      console.log("Flushing items");
      await this.consumer(this.items);
      this.items.splice(0, this.items.length); // truncate
    } else {
      console.log("No items to flush");
    }
  }
}
