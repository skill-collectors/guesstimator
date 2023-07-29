import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { createMainWebSocketFunction } from "./lambda/websockets/Main";
import Database from "./Database";
import { buildCallbackFunction } from "./Lambda";
import lambdaPolicy from "./policies/LambdaPolicy";

export interface ApiArgs {
  database: Database;
}

export default class WebSocketApi extends pulumi.ComponentResource {
  invokeUrl;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("pkg:index:Api", name, args, opts);

    const webSocketApi = new aws.apigatewayv2.Api(`${name}-Gateway`, {
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.action",
    });

    const policy = pulumi
      .all([args.database.table.arn, webSocketApi.executionArn])
      .apply(([tableArn, gatewayExecutionArn]) => {
        return lambdaPolicy(
          `${name}-WebSocketLambda-Policy`,
          tableArn,
          gatewayExecutionArn,
        );
      });
    const webSocketCallback = buildCallbackFunction(
      `${name}-Lambda`,
      createMainWebSocketFunction(args.database.table.name),
      policy,
    );

    const lambdaIntegration = new aws.apigatewayv2.Integration(
      `${name}-LambdaIntegration`,
      {
        apiId: webSocketApi.id,
        integrationType: "AWS_PROXY",
        contentHandlingStrategy: "CONVERT_TO_TEXT",
        description: "WebSocket Lambda",
        integrationMethod: "POST",
        integrationUri: webSocketCallback.invokeArn,
        passthroughBehavior: "WHEN_NO_MATCH",
      },
    );

    const routes = ["$default", "$connect", "$disconnect"].map((routeKey) => {
      const route = new aws.apigatewayv2.Route(
        `${name}-Route-${routeKey.substring(1)}`, // remove $ prefix
        {
          apiId: webSocketApi.id,
          routeKey,
          target: pulumi.interpolate`integrations/${lambdaIntegration.id}`,
        },
      );
      if (routeKey === "$default") {
        new aws.apigatewayv2.RouteResponse(
          `${name}-Route-${routeKey.substring(1)}`,
          {
            apiId: webSocketApi.id,
            routeId: route.id,
            routeResponseKey: routeKey,
          },
        );
      }
      return route;
    });

    const deployment = new aws.apigatewayv2.Deployment(
      `${name}-Deployment`,
      {
        apiId: webSocketApi.id,
      },
      {
        dependsOn: routes,
      },
    );

    const stage = new aws.apigatewayv2.Stage(`${name}-Stage`, {
      name: "stage",
      apiId: webSocketApi.id,
      deploymentId: deployment.id,
      defaultRouteSettings: {
        throttlingBurstLimit: 1000,
        throttlingRateLimit: 500,
      },
      routeSettings: routes.map((route) => ({
        routeKey: route.routeKey,
        throttlingBurstLimit: 1000,
        throttlingRateLimit: 500,
      })),
    });

    new aws.lambda.Permission(
      "lambdaPermission",
      {
        action: "lambda:InvokeFunction",
        principal: "apigateway.amazonaws.com",
        function: webSocketCallback,
        sourceArn: pulumi.interpolate`${webSocketApi.executionArn}/*/*`,
      },
      { dependsOn: [webSocketApi, webSocketCallback] },
    );

    this.invokeUrl = stage.invokeUrl;
  }
}
