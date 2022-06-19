import * as pulumi from '@pulumi/pulumi'
import { ComponentResourceOptions } from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

interface SvelteAppArgs {
  subDomain: string,
  apexDomain: string,
  tags: {[key: string]: string},
}

export default class SvelteApp extends pulumi.ComponentResource {
  domain: string
  siteBucket: aws.s3.Bucket
  cdn: aws.cloudfront.Distribution

  constructor(name: string, args: SvelteAppArgs, opts?: pulumi.ComponentResourceOptions) {
    super('pkg:index:SvelteApp', name, args, opts)

    this.domain = `${args.subDomain}.${args.apexDomain}`

    const tags = args.tags

    this.siteBucket = new aws.s3.Bucket('siteBucket', {
      bucket: this.domain,
      website: {
        indexDocument: 'index.html'
      },
      tags
    })

    const hostedZone = aws.route53.getZone({name: args.apexDomain})
    const hostedZoneId = hostedZone.then(hostedZone => hostedZone.zoneId)

    const certificate = new aws.acm.Certificate('certificate', {
      domainName: this.domain,
      validationMethod: 'DNS',
      tags
    })

    const certificateValidationDomain = new aws.route53.Record('dnsRecordValidation', {
      name: certificate.domainValidationOptions[0].resourceRecordName,
      zoneId: hostedZoneId,
      type: certificate.domainValidationOptions[0].resourceRecordType,
      records: [certificate.domainValidationOptions[0].resourceRecordValue],
      ttl: 300
    })

    const certificateValidation = new aws.acm.CertificateValidation('certificateValidation', {
      certificateArn: certificate.arn,
      validationRecordFqdns: [certificateValidationDomain.fqdn]
    })

    const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity('originAccessIdentity', {
      comment: 'this is needed to setup s3 polices and make s3 not public.'
    })

    this.cdn = new aws.cloudfront.Distribution('cdn', {
      enabled: true,
      aliases: [this.domain],

      origins: [
        {
          originId: this.siteBucket.arn,
          domainName: this.siteBucket.bucketDomainName,
          s3OriginConfig: {
            originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath
          }
        }
      ],

      defaultRootObject: 'index.html',

      defaultCacheBehavior: {
        targetOriginId: this.siteBucket.arn,

        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
        cachedMethods: ['GET', 'HEAD', 'OPTIONS'],

        forwardedValues: {
          cookies: { forward: 'none' },
          queryString: false
        },

        minTtl: 0,
        defaultTtl: 300,
        maxTtl: 300
      },

      priceClass: 'PriceClass_100',

      restrictions: {
        geoRestriction: {
          restrictionType: 'none'
        }
      },

      viewerCertificate: {
        acmCertificateArn: certificateValidation.certificateArn,
        sslSupportMethod: 'sni-only'
      },

      tags
    })

    const record = new aws.route53.Record('dnsRecord', {
      name: this.domain,
      zoneId: hostedZoneId,
      type: 'A',
      aliases: [{
        name: this.cdn.domainName,
        zoneId: this.cdn.hostedZoneId,
        evaluateTargetHealth: true
      }]
    })

    const bucketPolicy = new aws.s3.BucketPolicy('bucketPolicy', {
      bucket: this.siteBucket.id, // refer to the bucket created earlier
      policy: pulumi.all([originAccessIdentity.iamArn, this.siteBucket.arn]).apply(([oaiArn, bucketArn]) => JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: oaiArn
            }, // Only allow Cloudfront read access.
            Action: ['s3:GetObject'],
            Resource: [`${bucketArn}/*`] // Give Cloudfront access to the entire bucket.
          }
        ]
      }))
    })

    this.registerOutputs({
      recordId: record.id,
      bucketName: this.siteBucket.id,
      bucketPolicyId: bucketPolicy.id,
      contentBucketUri: pulumi.interpolate`s3://${this.siteBucket.bucket}`,
      contentBucketWebsiteEndpoint: this.siteBucket.websiteEndpoint,
      distributionId: this.cdn.id,
      cloudFrontDomain: this.cdn.domainName,
      targetDomainEndpoint: `https://${this.domain}/`,
    })

  }
}
