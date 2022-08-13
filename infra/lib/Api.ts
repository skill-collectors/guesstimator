import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface ApiEndpoint {
  name: string;
  method: apigateway.Method;
  path: string;
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
  policy: pulumi.Output<aws.iam.Policy>;
}

interface ApiArgs {
  subDomain: string;
  apexDomain: string;
  endpoints: ApiEndpoint[];
  tags: { [key: string]: string };
}

const LAMBDA_ASSUME_POLICY_ROLE = JSON.stringify({
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
});

export default class Api extends pulumi.ComponentResource {
  domain;
  url;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    this.domain = `${args.subDomain}.${args.apexDomain}`;

    const tags = args.tags;

    const routes: apigateway.types.input.RouteArgs[] = [];
    for (const endpoint of args.endpoints) {
      const lambdaRole = new aws.iam.Role(`${name}${endpoint.name}Role`, {
        assumeRolePolicy: LAMBDA_ASSUME_POLICY_ROLE,
        tags,
      });
      new aws.iam.RolePolicyAttachment(
        `${name}${endpoint.name}RolePolicyAttachment`,
        {
          role: lambdaRole,
          policyArn: endpoint.policy.arn,
        }
      );
      const callbackFunction = new aws.lambda.CallbackFunction(
        `${name}${endpoint.name}Function`,
        {
          role: lambdaRole,
          callback: endpoint.handler,
          tags,
        }
      );
      routes.push({
        method: endpoint.method,
        path: endpoint.path,
        eventHandler: callbackFunction,
      });
    }

    const api = new apigateway.RestAPI(`${name}Api`, {
      routes,
    });

    const hostedZone = aws.route53.getZone({ name: args.apexDomain });
    const hostedZoneId = hostedZone.then((hostedZone) => hostedZone.zoneId);

    const certificate = new aws.acm.Certificate(`${name}Certificate`, {
      domainName: this.domain,
      validationMethod: "DNS",
      tags,
    });

    const certificateValidationDomain = new aws.route53.Record(
      `${name}DnsValidationRecord`,
      {
        name: certificate.domainValidationOptions[0].resourceRecordName,
        zoneId: hostedZoneId,
        type: certificate.domainValidationOptions[0].resourceRecordType,
        records: [certificate.domainValidationOptions[0].resourceRecordValue],
        ttl: 300,
      },
      tags
    );

    const certificateValidation = new aws.acm.CertificateValidation(
      `${name}CertificateValidation`,
      {
        certificateArn: certificate.arn,
        validationRecordFqdns: [certificateValidationDomain.fqdn],
      }
    );

    const apiDomainName = new aws.apigateway.DomainName(`${name}DomainName`, {
      certificateArn: certificateValidation.certificateArn,
      domainName: this.domain,
      tags,
    });
    new aws.route53.Record(`${name}DnsRecord`, {
      zoneId: hostedZoneId,
      type: "A",
      name: this.domain,
      aliases: [
        {
          name: apiDomainName.cloudfrontDomainName,
          evaluateTargetHealth: false,
          zoneId: apiDomainName.cloudfrontZoneId,
        },
      ],
    });

    new aws.apigateway.BasePathMapping(
      `${name}BasePathMapping`,
      {
        restApi: api.api.id,
        stageName: api.stage.stageName,
        domainName: apiDomainName.domainName,
      },
      tags
    );

    this.url = api.url;
  }
}
