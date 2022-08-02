import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface ApiEndpoint {
  name: string;
  method: apigateway.Method;
  path: string;
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
  policy: pulumi.Output<aws.iam.Policy>;
}

interface ApiArgs {
  endpoints: ApiEndpoint[];
  tags: { [key: string]: string };
}

const LAMBDA_ASSUME_POLICY_ROLE = JSON.stringify({
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
});

export default class Api extends pulumi.ComponentResource {
  url;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    const tags = args.tags;

    const routes: apigateway.types.input.RouteArgs[] = [];
    for (const endpoint of args.endpoints) {
      const lambdaRole = new aws.iam.Role("lambdaRole", {
        assumeRolePolicy: LAMBDA_ASSUME_POLICY_ROLE,
        tags,
      });
      new aws.iam.RolePolicyAttachment("rolePolicyAttachment", {
        role: lambdaRole,
        policyArn: endpoint.policy.arn,
      });
      const callbackFunction = new aws.lambda.CallbackFunction(endpoint.name, {
        role: lambdaRole,
        callback: endpoint.handler,
        tags,
      });
      routes.push({
        method: endpoint.method,
        path: endpoint.path,
        eventHandler: callbackFunction,
      });
    }

    const api = new apigateway.RestAPI("api", {
      routes,
    });

    this.registerOutputs({
      url: api.url,
    });

    this.url = api.url;
  }
}
