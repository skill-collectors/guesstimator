import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export default class Database extends pulumi.ComponentResource {
  table;

  constructor(
    name: string,
    args: Record<string, never> = {},
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Database", name, args, opts);

    const tags = args.tags;

    this.table = new aws.dynamodb.Table(`${name}-Table`, {
      attributes: [
        {
          name: "PK",
          type: "S",
        },
        {
          name: "SK",
          type: "S",
        },
      ],
      hashKey: "PK",
      rangeKey: "SK",
      billingMode: "PAY_PER_REQUEST",
      tags,
    });

    this.registerOutputs({
      tableArn: this.table.arn,
    });
  }
}
