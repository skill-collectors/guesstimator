import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import helloHandler from "./lambda/hello";

interface ApiArgs {
  tags: { [key: string]: string };
}

export default class Api extends pulumi.ComponentResource {
  url;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    const tags = args.tags;

    const lambdaRole = new aws.iam.Role("lambdaRole", {
      assumeRolePolicy: JSON.stringify({
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
      }),
      tags,
    });

    const lambdaPolicy = new aws.iam.Policy("lambdaPolicy", {
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "ListAndDescribe",
            Effect: "Allow",
            Action: [
              "dynamodb:List*",
              "dynamodb:DescribeReservedCapacity*",
              "dynamodb:DescribeLimits",
              "dynamodb:DescribeTimeToLive",
            ],
            Resource: "*",
          },
          {
            Sid: "SpecificTable",
            Effect: "Allow",
            Action: [
              "dynamodb:BatchGet*",
              "dynamodb:DescribeStream",
              "dynamodb:DescribeTable",
              "dynamodb:Get*",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:BatchWrite*",
              "dynamodb:Delete*",
              "dynamodb:Update*",
              "dynamodb:PutItem",
            ],
            Resource: "arn:aws:dynamodb:*:*:table/*", // TODO use table arn
          },
        ],
      }),
      tags,
    });

    new aws.iam.RolePolicyAttachment("rolePolicyAttachment", {
      role: lambdaRole,
      policyArn: lambdaPolicy.arn,
    });

    const helloFunction = new aws.lambda.CallbackFunction("hello-handler", {
      role: lambdaRole,
      callback: helloHandler,
      tags,
    });

    const api = new apigateway.RestAPI("api", {
      routes: [
        {
          path: "/",
          method: "GET",
          eventHandler: helloFunction,
        },
      ],
    });

    this.registerOutputs({
      url: api.url,
    });

    // locally this is https://<apiId>.execute-api.localhost.localstack.cloud:4566/stage/
    this.url = api.url;
  }
}
