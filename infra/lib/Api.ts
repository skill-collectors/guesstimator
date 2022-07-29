import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface ApiArgs {
  tags: { [key: string]: string };
}

export default class Api extends pulumi.ComponentResource {
  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    const tags = args.tags;
    const lambdaRole = new aws.iam.Role("lambdaRole", {
      assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
            Sid: "",
          },
        ],
      },
    });

    const lambda = new aws.lambda.Function("lambdaFunction", {
      code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./lib/lambda/hello"),
      }),
      runtime: "nodejs16.x",
      role: lambdaRole.arn,
      handler: "index.handler",
      tags,
    });
  }
}
