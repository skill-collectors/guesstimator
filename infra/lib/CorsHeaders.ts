import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

const localdevOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const appDomainRegex = /^https:\/\/agile-poker(-dev|-qa)?\.superfun\.link$/;
function isValidDomain(origin: string) {
  return localdevOriginRegex.test(origin) || appDomainRegex.test(origin);
}

export function corsAllowApp(event: APIGatewayProxyEvent): {
  [header: string]: string | number | boolean;
} {
  const origin = event.headers?.origin;
  const method = event.httpMethod;
  if (origin === undefined) {
    console.log(
      `No 'origin' header on request. Headers were: ${JSON.stringify(
        event.headers
      )}`
    );
    return {};
  }
  if (method === undefined) {
    console.log("No method on request");
    return {};
  }
  if (isValidDomain(origin)) {
    return {
      "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "x-api-key",
    };
  } else {
    console.log(`Invalid origin: ${origin}`);
    return {};
  }
}
