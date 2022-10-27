import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ok } from "./Response";
import { LambdaHandler } from "./Router";

type CorsOptions = {
  allowedOrigins: string[] | "*";
  allowedHeaders: string[];
  allowedMethods: string[];
};

const ORIGIN = "origin";

const ACCESS_CONTROL_REQUEST_METHOD = "access-control-request-method";
const ACCESS_CONTROL_REQUEST_HEADERS = "access-control-request-headers";

const ACCESS_CONTROL_ALLOW_METHODS = "access-control-allow-methods";
const ACCESS_CONTROL_ALLOW_HEADERS = "access-control-allow-headers";
const ACCESS_CONTROL_ALLOW_ORIGIN = "access-control-allow-origin";

export function corsRules(opts: CorsOptions) {
  function isCors(event: APIGatewayProxyEvent) {
    return event.headers[ORIGIN] !== undefined;
  }
  function isAllowedOrigin(event: APIGatewayProxyEvent) {
    if (event.headers[ORIGIN] === undefined) {
      throw Error("Missing Origin header on request.");
    }
    if (opts.allowedOrigins.includes(event.headers[ORIGIN])) {
      return true;
    } else {
      return false;
    }
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
        if (isCors(event)) {
          console.log("Handling CORS");
          if (isAllowedOrigin(event) === false) {
            console.log(`Rejecting invalid origin ${event.headers[ORIGIN]}`);
            return handleInvalid();
          }
          if (isPreflight(event)) {
            console.log("Handling CORS preflight");
            return handlePreflight(event);
          }
          const response = await handler(event);
          return applyResponseHeaders(event, response);
        } else {
          console.log(
            `Non-cors request. Headers = ${JSON.stringify(event.headers)}`
          );
          return await handler(event);
        }
      };
    },
  };
}
