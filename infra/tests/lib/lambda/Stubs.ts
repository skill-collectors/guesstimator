import { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from "aws-lambda";

export function stubEvent(
  method: string,
  path: string,
  body = "",
  headers: APIGatewayProxyEventHeaders = {}
): APIGatewayProxyEvent {
  return {
    body,
    headers,
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: null, // APIGatewayProxyEventPathParameters | null;
    queryStringParameters: null, // APIGatewayProxyEventQueryStringParameters | null;
    multiValueQueryStringParameters: null, // APIGatewayProxyEventMultiValueQueryStringParameters | null;
    stageVariables: null, // APIGatewayProxyEventStageVariables | null;
    requestContext: {
      accountId: "not used",
      apiId: "not used",
      authorizer: null,
      protocol: "not used",
      httpMethod: "not used",
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: "not used",
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: "not used",
      stage: "not used",
      requestId: "not used",
      requestTimeEpoch: 0,
      resourceId: "not used",
      resourcePath: "not used",
    },
    resource: "not used",
  };
}
