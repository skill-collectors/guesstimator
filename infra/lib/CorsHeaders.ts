import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

const localdevOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const appDomainRegex = /^https:\/\/agile-poker-(dev|qa|prod)\.superfun\.link$/;
function isValidDomain(origin: string) {
  return localdevOriginRegex.test(origin) || appDomainRegex.test(origin);
}

export function corsAllowApp(event: APIGatewayProxyEvent):
  | {
      [header: string]: string | number | boolean;
    }
  | undefined {
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
      "Access-Control-Allow-Methods": method,
      "Access-Control-Allow-Origin": origin,
    };
  } else {
    console.log(`Invalid origin: ${origin}`);
    return {};
  }
}
