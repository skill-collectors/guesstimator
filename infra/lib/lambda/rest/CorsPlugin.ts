/**
 * This file provides a way to define CORS rules and apply them to a request.
 * Rules are applied globally and not per route.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 *
 * Example usage:
 *
 *   const corsPlugin = corsRules({
 *    allowedOrigins: [
 *      "https://example.com",
 *    ],
 *    allowedHeaders: ["x-custom-header"]
 *    allowedMethods: ["GET", "POST"],
 *  });
 *
 *  const main = corsPlugin.applyTo((event) => actualHandler(event));
 */
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

/**
 * Creates a wrapper function that applies CORS rules on behalf of an inner handler function.
 *
 * @param {CorsOptions} opts - A definition of the allowed origins, headers, and methods.
 * @return {function} A function that applies CORS rules for a route handler.
 */
export function corsRules(opts: CorsOptions) {
  /**
   * Determines whether the request is using CORS. Browsers will always include
   * CORS headers when calling a different domain, but non-browser tools like
   * Curl will not.
   *
   * @param {APIGatewayProxyEvent} event - The event to test
   * @returns true if the event contains an 'Origin' header, false otherwise.
   */
  function isCors(event: APIGatewayProxyEvent) {
    return event.headers[ORIGIN] !== undefined;
  }

  /**
   * Tests whether the given event comes from one of the configured allowed origins.
   *
   * @param {APIGatewayProxyEvent} event - The event to test.
   * @return true if the 'Origin' header matches an allowed origin, false otherwise.
   */
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

  /**
   * Handles CORS requests that do not match allowed origins.
   *
   * @returns {APIGatewayProxyResult} A 200 response with *no* CORS headers (which will cause the browser to block the request).
   */
  function handleInvalid() {
    return ok(""); // When CORS headers are ommitted, the browser will block it.
  }

  /**
   * Tests whether the event is a CORS "preflight" request. A preflight request
   * is an OPTIONS request that detects whether the server understands CORS and
   * will allow the given Origin, method, and headers.
   *
   * @param {APIGatewayProxyEvent} event - The event to test
   * @return true if the event is OPTIONS and specified an allowed method and headers.
   */
  function isPreflight(event: APIGatewayProxyEvent) {
    return (
      event.httpMethod === "OPTIONS" &&
      ACCESS_CONTROL_REQUEST_METHOD in event.headers &&
      ACCESS_CONTROL_REQUEST_HEADERS in event.headers
    );
  }

  /**
   * Applies CORS headers to the request and return 200.
   *
   * @param {APIGatewayProxyEvent} event - A preflight request to apply CORS headers to.
   * @return  {APIGatewayProxyResult} A 200 with no body content and CORS headers applied.
   */
  function handlePreflight(event: APIGatewayProxyEvent) {
    return applyResponseHeaders(event, ok(""));
  }

  /**
   * Applies CORS headers to the response.
   *
   * @param {APIGatewayProxyEvent} event - Used so that we reply with the same Origin and method that was requested.
   * @param {APIGatewayProxyResult} response - The response to add CORS headers to.
   * @return  {APIGatewayProxyResult} The given response with CORS headers applied.
   */
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
    /**
     * Returns a function that will apply CORS handling to a regular handler function.
     *
     * @param {LambdaHandler} A handler to apply CORS logic to
     * @return {LambdaHandler} A new handler that applies CORS and delegates to the given handler to actually complete the request.
     */
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
