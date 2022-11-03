import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { corsRules } from "./CorsPlugin";
import { initRouter } from "./Router";
import { serverError } from "./Response";

/**
 * Creates the main Lambda Function for this REST API.
 */
export function createRouter(tableName: pulumi.Output<string>) {
  return async function (event: APIGatewayProxyEvent) {
    try {
      const corsPlugin = corsRules({
        allowedOrigins: [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://guesstimator-dev.superfun.link",
          "https://guesstimator-qa.superfun.link",
          "https://guesstimator.superfun.link",
        ],
        allowedHeaders: ["x-api-key"],
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      });

      const router = initRouter(tableName.get());

      const main = corsPlugin.applyTo((event) => router.run(event));
      return await main(event);
    } catch (err) {
      return serverError(err, event);
    }
  };
}
