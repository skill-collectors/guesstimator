import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { corsRules } from "./CorsPlugin";
import { initRouter, LambdaHandler } from "./Router";
import { serverError } from "./Response";
import { caseInsensitiveHeaders } from "./CaseInsensitiveHeadersPlugin";

/**
 * Creates the main Lambda Function for this REST API.
 */
export function createMainRestFunction(tableName: pulumi.Output<string>) {
  return async function (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    try {
      const corsPlugin = corsRules({
        allowedOrigins: [
          "http://localhost:5173", // 5173 = localdev port
          "http://127.0.0.1:5173",
          "http://localhost:3001", // 3001 = preview port
          "http://127.0.0.1:3001",
          "https://guesstimator-dev.superfun.link",
          "https://guesstimator-qa.superfun.link",
          "https://guesstimator.superfun.link",
        ],
        allowedHeaders: ["x-api-key"],
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      });

      const router = initRouter(tableName.get());

      const plugins = [caseInsensitiveHeaders(), corsPlugin];

      // reduceRight will ensure that plugins run in the order they are defined in the array
      // so caseInsensitiveHeaders runs before corsPlugin
      const main = plugins.reduceRight(
        (handler: LambdaHandler, plugin) => plugin.applyTo(handler),
        async (event) => {
          try {
            return await router.run(event);
          } catch (err) {
            // Catch here to apply CORS if we can
            return await new Promise((resolve) =>
              resolve(serverError(err, event)),
            );
          }
        },
      );

      return await main(event);
    } catch (err) {
      // No CORS applied in this case
      return await new Promise((resolve) => resolve(serverError(err, event)));
    }
  };
}
