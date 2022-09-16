#!/bin/bash

set -e

cd $(dirname $0)

echo "Deploying infrastructure"
cd infra
pulumi stack select dev
pulumi up -y

bucketName=$(pulumi stack output -s dev bucketName 2>/dev/null)
distributionId=$(pulumi stack output -s dev distributionId 2>/dev/null)

cd ../frontend
echo "Building frontend"
npm run build
echo "Deploying frontend"
aws s3 sync --acl public-read --follow-symlinks --delete build s3://"${bucketName}"
echo "Invalidating cloudfront cache"
aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/'

