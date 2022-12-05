#!/bin/bash

set -e

cd $(dirname $0)

echo "Deploying infrastructure"
cd infra
pulumi stack select dev
pulumi up --refresh --yes

bucketName=$(pulumi stack output -s dev bucketName 2>/dev/null)
distributionId=$(pulumi stack output -s dev distributionId 2>/dev/null)
apiUrl=$(pulumi stack output -s dev apiUrl 2>/dev/null)
apiKey=$(pulumi stack output -s dev --show-secrets apiKey 2>/dev/null)
webSocketUrl=$(pulumi stack output -s dev webSocketUrl 2>/dev/null)

cd ../frontend
echo "Setting env vars"
echo "VITE_PUBLIC_API_URL=${apiUrl}" > .env.development
echo "VITE_PUBLIC_API_KEY=${apiKey}" >> .env.development
echo "VITE_PUBLIC_WEB_SOCKET_URL=${webSocketUrl}" >> .env.development
# .env.production is used by playwright when it runs the app in preview mode
cp .env.development .env.production

echo "Building frontend"
npm run build -- --mode development
echo "Deploying frontend"
aws s3 sync --acl public-read --follow-symlinks --delete build s3://"${bucketName}"
echo "Invalidating cloudfront cache"
aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/'

echo "You can now use 'npm run dev --workspace=frontend' and it will use the 'dev' stack on AWS"

