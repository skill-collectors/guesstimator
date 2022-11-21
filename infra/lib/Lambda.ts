import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import dynamoTableAccessPolicy from "./policies/LambdaPolicy";
import { Callback } from "@pulumi/aws/lambda";

export function buildCallbackFunction<E, R>(
  name: string,
  tableArn: pulumi.Output<string>,
  handler: Callback<E, R>
) {
  const lambdaRole = new aws.iam.Role(`${name}-Role`, {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sts:AssumeRole",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Effect: "Allow",
          Sid: "",
        },
      ],
    }),
  });

  new aws.iam.RolePolicyAttachment(
    `${name}-BasicExecutionRolePolicyAttachment`,
    {
      role: lambdaRole,
      policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
    }
  );

  // Attach policy to allow DB access
  const tableAccessPolicy = tableArn.apply((arn) =>
    dynamoTableAccessPolicy(`${name}-AccessPolicy`, arn)
  );

  new aws.iam.RolePolicyAttachment(`${name}-RolePolicyAttachment`, {
    role: lambdaRole,
    policyArn: tableAccessPolicy.arn,
  });

  const callbackFunction = new aws.lambda.CallbackFunction(`${name}-Function`, {
    role: lambdaRole,
    callback: handler,
  });
  return callbackFunction;
}
