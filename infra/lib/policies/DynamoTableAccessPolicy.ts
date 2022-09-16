import * as aws from "@pulumi/aws";

export default function dynamoTableAccessPolicy(
  name: string,
  tableArn: string,
  tags: { [key: string]: string }
) {
  return new aws.iam.Policy(`${name}AccessPolicy`, {
    policy: JSON.stringify({
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
    }),
    tags,
  });
}
