/**
 * This plugin ensures that all headers are fully lowercase.
 *
 * The spec says that all headers are case-insensitive: https://www.rfc-editor.org/rfc/rfc7230#section-3.2
 *
 * In practice, we sometimes get "Origin" and other times "origin". Since the AWS SDK provides 'headers' as an object,
 * and object property lookups are case-sensitive, we need to take this extra step to ensure they are all fully lowercase.
 *
 * By running this plugin first, subsequent plugins don't have to worry about it when they look up headers.
 */
import { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from "aws-lambda";
import { LambdaHandler } from "./Router";

export function caseInsensitiveHeaders() {
  return {
    applyTo(handler: LambdaHandler): LambdaHandler {
      return async (event: APIGatewayProxyEvent) => {
        const lowerCaseHeaders: APIGatewayProxyEventHeaders = {};
        for (const header in event.headers) {
          lowerCaseHeaders[header.toLocaleLowerCase()] = event.headers[header];
        }
        event.headers = lowerCaseHeaders;
        const response = await handler(event);
        return response;
      };
    },
  };
}
