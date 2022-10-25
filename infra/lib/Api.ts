import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { createRouter } from "./lambda/Router";
import Database from "./Database";
import dynamoTableAccessPolicy from "./policies/LambdaPolicy";

export interface ApiArgs {
  subDomain: string;
  apexDomain: string | null;
  database: Database;
}

export default class Api extends pulumi.ComponentResource {
  url;
  apiKey;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    // Create lambda role with basic execution policy
    const callbackFunction = buildCallbackFunction();

    const api = new apigateway.RestAPI(`${name}-Api`, {
      routes: [
        {
          method: "OPTIONS",
          path: "/{proxy+}",
          eventHandler: callbackFunction,
          apiKeyRequired: false,
        },
        {
          method: "GET",
          path: "/{proxy+}",
          eventHandler: callbackFunction,
          apiKeyRequired: true,
        },
        {
          method: "POST",
          path: "/{proxy+}",
          eventHandler: callbackFunction,
          apiKeyRequired: true,
        },
        {
          method: "PUT",
          path: "/{proxy+}",
          eventHandler: callbackFunction,
          apiKeyRequired: true,
        },
        {
          method: "DELETE",
          path: "/{proxy+}",
          eventHandler: callbackFunction,
          apiKeyRequired: true,
        },
      ],
    });

    const apiKey = addApiUsagePlan();
    this.apiKey = apiKey.value;

    if (args.apexDomain === null) {
      this.url = api.url;
    } else {
      const apiDomainName = addDomainName(args.subDomain, args.apexDomain);
      new aws.apigateway.BasePathMapping(`${name}-BasePathMapping`, {
        restApi: api.api.id,
        stageName: api.stage.stageName,
        domainName: apiDomainName.domainName,
      });
      this.url = apiDomainName.domainName.apply(
        (domain) => `https://${domain}`
      );
    }

    function buildCallbackFunction() {
      const lambdaRole = new aws.iam.Role(`${name}-ProxyRole`, {
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
        `${name}-ProxyBasicExecutionRolePolicyAttachment`,
        {
          role: lambdaRole,
          policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
        }
      );

      // Attach policy to allow DB access
      const tableAccessPolicy = args.database.table.arn.apply((arn) =>
        dynamoTableAccessPolicy(`${name}-AccessPolicy`, arn)
      );

      new aws.iam.RolePolicyAttachment(`${name}-ProxyRolePolicyAttachment`, {
        role: lambdaRole,
        policyArn: tableAccessPolicy.arn,
      });

      const callbackFunction = new aws.lambda.CallbackFunction(
        `${name}-ProxyFunction`,
        {
          role: lambdaRole,
          callback: createRouter(args.database.table.name),
        }
      );
      return callbackFunction;
    }

    function addApiUsagePlan() {
      const apiKey = new aws.apigateway.ApiKey(`${name}-GlobalApiKey`, {
        name: `${name}-GlobalApiKey`,
        description: "Global API Key",
        enabled: true,
      });

      const usagePlan = new aws.apigateway.UsagePlan(`${name}-UsagePlan`, {
        description: "Global Usage Plan",
        apiStages: [
          {
            apiId: api.api.id,
            stage: api.stage.stageName,
          },
        ],
        quotaSettings: {
          limit: 5000000,
          period: "MONTH",
        },
        throttleSettings: {
          burstLimit: 1000,
          rateLimit: 500,
        },
      });

      new aws.apigateway.UsagePlanKey(`${name}-UsagePlanKey`, {
        keyId: apiKey.id,
        keyType: "API_KEY",
        usagePlanId: usagePlan.id,
      });

      return apiKey;
    }

    function addDomainName(subDomain: string, apexDomain: string) {
      const fullDomain = `${subDomain}.${apexDomain}`;

      const hostedZone = aws.route53.getZone({ name: apexDomain });
      const hostedZoneId = hostedZone.then((hostedZone) => hostedZone.zoneId);

      const certificate = new aws.acm.Certificate(`${name}-Certificate`, {
        domainName: fullDomain,
        validationMethod: "DNS",
      });

      const certificateValidationDomain = new aws.route53.Record(
        `${name}-DnsValidationRecord`,
        {
          name: certificate.domainValidationOptions[0].resourceRecordName,
          zoneId: hostedZoneId,
          type: certificate.domainValidationOptions[0].resourceRecordType,
          records: [certificate.domainValidationOptions[0].resourceRecordValue],
          ttl: 300,
        }
      );

      const certificateValidation = new aws.acm.CertificateValidation(
        `${name}-CertificateValidation`,
        {
          certificateArn: certificate.arn,
          validationRecordFqdns: [certificateValidationDomain.fqdn],
        }
      );

      const apiDomainName = new aws.apigateway.DomainName(
        `${name}-DomainName`,
        {
          certificateArn: certificateValidation.certificateArn,
          domainName: fullDomain,
        }
      );
      new aws.route53.Record(`${name}-DnsRecord`, {
        zoneId: hostedZoneId,
        type: "A",
        name: fullDomain,
        aliases: [
          {
            name: apiDomainName.cloudfrontDomainName,
            evaluateTargetHealth: false,
            zoneId: apiDomainName.cloudfrontZoneId,
          },
        ],
      });
      return apiDomainName;
    }
  }
}
