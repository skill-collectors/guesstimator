import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { createMainRestFunction } from "./lambda/rest/Main";
import Database from "./Database";
import { buildCallbackFunction } from "./Lambda";

export interface ApiArgs {
  subDomain?: string;
  apexDomain?: string;
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
    const callbackFunction = buildCallbackFunction(
      `${name}-RestFunction`,
      args.database.table.arn,
      createMainRestFunction(args.database.table.name)
    );

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

    // These are created just so that CORS headers are included in the response
    addGatewayResponse(api.api.id, "429", "QUOTA_EXCEEDED");
    addGatewayResponse(api.api.id, "429", "THROTTLED");
    addGatewayResponse(api.api.id, "403", "INVALID_API_KEY");
    addGatewayResponse(api.api.id, "403", "MISSING_AUTHENTICATION_TOKEN");
    addGatewayResponse(api.api.id, "404", "RESOURCE_NOT_FOUND");
    addGatewayResponse(api.api.id, "400", "DEFAULT_4XX");
    addGatewayResponse(api.api.id, "500", "DEFAULT_5XX");

    const apiKey = addApiUsagePlan();
    this.apiKey = apiKey.value;

    if (args.apexDomain === undefined || args.subDomain === undefined) {
      this.url = api.url;
    } else {
      this.url = addDomainName(args.subDomain, args.apexDomain);
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

      new aws.apigateway.BasePathMapping(`${name}-BasePathMapping`, {
        restApi: api.api.id,
        stageName: api.stage.stageName,
        domainName: apiDomainName.domainName,
      });

      const url = apiDomainName.domainName.apply(
        (domain) => `https://${domain}`
      );
      return url;
    }

    function addGatewayResponse(
      restApiId: pulumi.Output<string>,
      statusCode: string,
      responseType: string
    ) {
      new aws.apigateway.Response(`${name}-GatewayResponse-${responseType}`, {
        restApiId: api.api.id,
        responseType,
        statusCode,
        responseTemplates: {
          "application/json": JSON.stringify({
            message: "$context.error.messageString",
            type: "$context.error.responseType",
            statusCode,
            resourcePath: "$context.resourcePath",
          }),
        },
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
        },
      });
    }
  }
}
