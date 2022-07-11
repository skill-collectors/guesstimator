import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
export default async function handleDocument(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const route = event.pathParameters?.route;
  const body = event.body ? JSON.parse(event.body) : null;

  console.log("Received body: ", body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      route,
      affirmation: "Nice job, you've done it! :D",
      requestBodyEcho: body,
    }),
  };
}
