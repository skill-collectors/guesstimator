/*
 * This file provides convenience functions to simplify the creation of APIGatewayProxyResult objects.
 */
import { APIGatewayProxyResult } from "aws-lambda";
import { generateId } from "../../utils/KeyGenerator";

function responseOf(
  statusCode: number,
  body: string | object,
  headers?:
    | {
        [header: string]: boolean | number | string;
      }
    | undefined,
): APIGatewayProxyResult {
  let json;
  if (typeof body === "string") {
    json = JSON.stringify({ message: body });
  } else {
    json = JSON.stringify(body);
  }
  return {
    isBase64Encoded: false,
    statusCode,
    body: json,
    headers,
  };
}

/**
 * Creates a successful (200) response.
 *
 * @param body The response body to return to the caller. If this is a string, it will be converted to JSON formatted as {message: [body]}.
 * @returns {APIGatewayProxyResult} The response with the given body and statusCode = 200
 */
export function ok(body: string | object) {
  return responseOf(200, body);
}

/**
 * Creates a 404 (Not Found) response.
 *
 * @param body The response body to return to the caller. If this is a string, it will be converted to JSON formatted as {message: [body]}. Default is "Not found".
 * @returns {APIGatewayProxyResult} The response with the given body and statusCode = 404
 */
export function notFound(body: string | object = "Not found") {
  return responseOf(404, body);
}

/**
 * Creates a 400 (Bad request) response.
 *
 * @param body The response body to return to the caller. If this is a string, it will be converted to JSON formatted as {message: [body]}. Default is "Bad request".
 * @returns {APIGatewayProxyResult} The response with the given body and statusCode = 400
 */
export function clientError(body: string | object = "Bad request") {
  return responseOf(400, body);
}

/**
 * Creates a response for unexpected server errors. In order to avoid exposing
 * information to the client, this function creates a 4 character errorId which
 * is both returned to the caller and logged alongside the full error details.
 *
 * The frontend is still responsible for providing a good user-facing message.
 *
 * @param error The error to handle
 * @param additionalDebugInfo Optional debug info to include.
 * @returns {APIGatewayProxyResult} A response whose body contains the generated error guid and timestamp
 */
export function serverError(error: unknown, additionalDebugInfo: object = {}) {
  const errorId = generateId(4);
  const timestamp = new Date().toISOString();
  console.log({
    timestamp,
    errorId,
    error,
    additionalDebugInfo,
  });
  return responseOf(500, {
    timestamp,
    errorId,
  });
}
