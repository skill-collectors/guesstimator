#!/bin/bash

set -e

# This gives us an absolute path to the root of the project
rootDir="$(cd $(dirname ${0}); pwd)"

outputDir=build

echo "Deploying infrastructure"
cd ${rootDir}/infra
pulumi stack select dev
pulumi up -y

bucketName=$(pulumi stack output -s dev bucketName 2>/dev/null)
distributionId=$(pulumi stack output -s dev distributionId 2>/dev/null)

cd ${rootDir}/frontend
echo "Building frontend"
npm run build
echo "Deploying frontend"
aws s3 sync --acl public-read --follow-symlinks --delete ${outputDir} s3://"${bucketName}"
echo "Invalidating cloudfront cache"
aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/'
