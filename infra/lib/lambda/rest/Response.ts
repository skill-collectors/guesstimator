import { APIGatewayProxyResult } from "aws-lambda";

export function responseOf(
  statusCode: number,
  body: string | object,
  headers?:
    | {
        [header: string]: boolean | number | string;
      }
    | undefined
): APIGatewayProxyResult {
  let json;
  if (typeof body === "string") {
    json = JSON.stringify({ message: body });
  } else {
    json = JSON.stringify(body);
  }
  return {
    statusCode,
    body: json,
    headers,
  };
}

export function notFound(body: string | object | undefined) {
  if (body === undefined) {
    body = "Not found";
  }
  return responseOf(404, body);
}

export function ok(body: string | object) {
  return responseOf(200, body);
}
