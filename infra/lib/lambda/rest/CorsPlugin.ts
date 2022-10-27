import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ok } from "./Response";
import { LambdaHandler } from "./Router";

type CorsOptions = {
  allowedOrigins: string[] | "*";
  allowedHeaders: string[];
  allowedMethods: string[];
};

const ORIGIN = "Origin";

const ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method";
const ACCESS_CONTROL_REQUEST_HEADERS = "Access-Control-Request-Headers";

const ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods";
const ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
const ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";

export function corsRules(opts: CorsOptions) {
  function isAllowedOrigin(event: APIGatewayProxyEvent) {
    if (event.headers["Origin"] === undefined) {
      // If the client didn't send an "origin" then they aren't doing CORS
      return true;
    }
    return opts.allowedOrigins.includes(event.headers["Origin"]);
  }

  function handleInvalid() {
    return ok(""); // When CORS headers are ommitted, the browser will block it.
  }

  function isPreflight(event: APIGatewayProxyEvent) {
    return (
      event.httpMethod === "OPTIONS" &&
      ACCESS_CONTROL_REQUEST_METHOD in event.headers &&
      ACCESS_CONTROL_REQUEST_HEADERS in event.headers
    );
  }

  function handlePreflight(event: APIGatewayProxyEvent) {
    return applyResponseHeaders(event, ok(""));
  }

  function applyResponseHeaders(
    event: APIGatewayProxyEvent,
    response: APIGatewayProxyResult
  ) {
    response.headers ||= {}; // default to empty headers if no headers are defined
    response.multiValueHeaders ||= {}; // default to empty headers if no headers are defined
    if (event.headers[ORIGIN] === undefined) {
      throw Error("Missing 'Origin' header on request");
    }
    // The origin should already be validated by isAllowedOrigin
    response.headers[ACCESS_CONTROL_ALLOW_ORIGIN] = event.headers[ORIGIN];
    response.multiValueHeaders[ACCESS_CONTROL_ALLOW_METHODS] =
      opts.allowedMethods;
    response.multiValueHeaders[ACCESS_CONTROL_ALLOW_HEADERS] =
      opts.allowedHeaders;
    return response;
  }

  return {
    applyTo(handler: LambdaHandler): LambdaHandler {
      return async (event: APIGatewayProxyEvent) => {
        if (isAllowedOrigin(event) === false) {
          return handleInvalid();
        }
        if (isPreflight(event)) {
          return handlePreflight(event);
        }
        const response = await handler(event);
        return applyResponseHeaders(event, response);
      };
    },
  };
}
