import * as aws from "@pulumi/aws";

export default function lambdaPolicy(
  name: string,
  tableArn: string,
  webSocketGatewayArn?: string
) {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "ListAndDescribe",
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Sid: "SpecificTable",
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: tableArn,
      },
    ],
  };
  if (webSocketGatewayArn !== undefined) {
    policy.Statement.push({
      Sid: "WebSocketPublish",
      Effect: "Allow",
      Action: ["execute-api:*"],
      Resource: webSocketGatewayArn,
    });
  }
  return new aws.iam.Policy(name, {
    policy: JSON.stringify(policy),
  });
}
