import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

const stack = pulumi.getStack()
const subDomain = stack === 'prod' ? 'agile-poker' : `agile-poker-${stack}`
const apexDomain = 'superfun.link'
const domain = `${subDomain}.${apexDomain}`

const tags = { iac: 'pulumi', project: 'agile-poker', stack }

const siteBucket = new aws.s3.Bucket('siteBucket', {
  bucket: domain,
  website: {
    indexDocument: 'index.html'
  },
  tags
})

let hostedZoneId;
if(stack === 'dev') {
  const newZone = new aws.route53.Zone(apexDomain)
  hostedZoneId = newZone.id;
} else {
  const hostedZone = aws.route53.getZone({name: apexDomain})
  hostedZoneId = hostedZone.then(hostedZone => hostedZone.zoneId)
}

const certificate = new aws.acm.Certificate('certificate', {
  domainName: domain,
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

const cdn = new aws.cloudfront.Distribution('cdn', {
  enabled: true,
  aliases: [domain],

  origins: [
    {
      originId: siteBucket.arn,
      domainName: siteBucket.bucketDomainName,
      s3OriginConfig: {
        originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath
      }
    }
  ],

  defaultRootObject: 'index.html',

  defaultCacheBehavior: {
    targetOriginId: siteBucket.arn,

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
  name: domain,
  zoneId: hostedZoneId,
  type: 'A',
  aliases: [{
    name: cdn.domainName,
    zoneId: cdn.hostedZoneId,
    evaluateTargetHealth: true
  }]
})

const bucketPolicy = new aws.s3.BucketPolicy('bucketPolicy', {
  bucket: siteBucket.id, // refer to the bucket created earlier
  policy: pulumi.all([originAccessIdentity.iamArn, siteBucket.arn]).apply(([oaiArn, bucketArn]) => JSON.stringify({
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

export const recordId = record.id
export const bucketName = siteBucket.id
export const bucketPolicyId = bucketPolicy.id
export const contentBucketUri = pulumi.interpolate`s3://${siteBucket.bucket}`
export const contentBucketWebsiteEndpoint = siteBucket.websiteEndpoint
export const distributionId = cdn.id
export const cloudFrontDomain = cdn.domainName
export const targetDomainEndpoint = `https://${domain}/`
