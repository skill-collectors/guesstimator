import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface DatabaseArgs {
  tags: { [key: string]: string };
}

export default class Database extends pulumi.ComponentResource {
  table;

  constructor(
    name: string,
    args: DatabaseArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Database", name, args, opts);

    const tags = args.tags;

    this.table = new aws.dynamodb.Table("table", {
      attributes: [
        {
          name: "PK",
          type: "S",
        },
      ],
      hashKey: "PK",
      billingMode: "PAY_PER_REQUEST",
      tags,
    });

    this.registerOutputs({
      tableArn: this.table.arn,
    });
  }
}
