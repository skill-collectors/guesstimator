import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface Endpoint {
  routeKey: string;
  localPath: string;
}

interface ApiArgs {
  endpoints: [Endpoint];
  tags: { [key: string]: string };
}

const stack = pulumi.getStack();

function addLambda(
  endpoint: Endpoint,
  lambdaRole: aws.iam.Role,
  apigw: aws.apigatewayv2.Api,
  tags: { [key: string]: string }
) {
  const lambda = new aws.lambda.Function("lambdaFunction", {
    code: new pulumi.asset.FileArchive(endpoint.localPath),
    runtime: "nodejs16.x",
    role: lambdaRole.arn,
    handler: "index.handler",
    tags,
  });

  new aws.lambda.Permission(
    "lambdaPermission",
    {
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      function: lambda,
      sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
    },
    { dependsOn: [apigw, lambda] }
  );

  const [method] = endpoint.routeKey.split(" ");

  const integration = new aws.apigatewayv2.Integration("lambdaIntegration", {
    apiId: apigw.id,
    integrationType: "AWS_PROXY",
    integrationUri: lambda.arn,
    integrationMethod: method,
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH",
  });

  const route = new aws.apigatewayv2.Route("apiRoute", {
    apiId: apigw.id,
    routeKey: endpoint.routeKey,
    target: pulumi.interpolate`integrations/${integration.id}`,
  });

  return route;
}

export default class Api extends pulumi.ComponentResource {
  apigw;
  stage;

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
      tags,
    });

    new aws.iam.RolePolicyAttachment(
      "lambdaRoleAttachment",
      {
        role: lambdaRole,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      },
      tags
    );

    this.apigw = new aws.apigatewayv2.Api("httpApiGateway", {
      protocolType: "HTTP",
      tags,
    });

    const routes = args.endpoints.map((endpoint) =>
      addLambda(endpoint, lambdaRole, this.apigw, tags)
    );

    this.stage = new aws.apigatewayv2.Stage(
      "apiStage",
      {
        apiId: this.apigw.id,
        name: stack,
        routeSettings: routes.map((route) => ({
          routeKey: route.routeKey,
          throttlingBurstLimit: 5000,
          throttlingRateLimit: 10000,
        })),
        autoDeploy: true,
        tags,
      },
      { dependsOn: routes }
    );

    // this.endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;
  }
}
