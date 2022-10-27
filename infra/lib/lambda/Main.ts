import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { corsRules } from "./rest/CorsPlugin";
import { initRouter } from "./rest/Router";

export function createRouter(tableName: pulumi.Output<string>) {
  return async function (event: APIGatewayProxyEvent) {
    const corsPlugin = corsRules({
      allowedOrigins: [
        "http://localhost",
        "http://127.0.0.1",
        "https://guesstimator-dev.superfun.link",
        "https://guesstimator-qa.superfun.link",
        "https://guesstimator.superfun.link",
      ],
      allowedHeaders: ["x-api-key"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    });

    const router = initRouter(tableName.get());

    const main = corsPlugin.applyTo(router.run);
    return main(event);
  };
}
