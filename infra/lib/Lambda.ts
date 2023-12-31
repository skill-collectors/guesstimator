import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Callback, Runtime } from "@pulumi/aws/lambda";
import { Policy } from "@pulumi/aws/iam";

// If we put this in Pulumi.yaml it can't be read by unit tests.
// This is a known limitation in the Pulumi API that you can't
// mock config values :-(
const runtime: Runtime = "nodejs18.x";

export function buildCallbackFunction<E, R>(
  name: string,
  handler: Callback<E, R>,
  policy: pulumi.Output<Policy>,
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
    },
  );

  // Attach policy
  new aws.iam.RolePolicyAttachment(`${name}-RolePolicyAttachment`, {
    role: lambdaRole,
    policyArn: policy.apply((p) => p.arn),
  });

  const callbackFunction = new aws.lambda.CallbackFunction(`${name}-Function`, {
    role: lambdaRole,
    runtime,
    callback: handler,
  });
  return callbackFunction;
}
