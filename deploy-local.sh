#!/bin/bash

set -e

cd $(dirname $0)

echo "Deploying infrastructure locally"
cd infra
pulumilocal up --yes

apiUrl=$(pulumi stack output apiUrl 2>/dev/null)
apiKey=$(pulumi stack output --show-secrets apiKey 2>/dev/null)

cd ../frontend
echo "Setting env vars"
# Output is
# https://<appId>.execute-api.<region>.amazonaws.com/<stageId>/
# But Localstack actually accepts calls at:
# http://<apiId>.execute-api.localhost.localstack.cloud:4566/<stageId>/<path>
localUrl=${apiUrl/execute-api.*.amazonaws.com/execute-api.localhost.localstack.cloud:4566}
# Remove trailing slash
localUrl=${localUrl%/}
echo "VITE_PUBLIC_API_URL=${localUrl}" > .env.development
echo "VITE_PUBLIC_API_KEY=${apiKey}" >> .env.development

echo "You can now use 'npm run dev --workspace=frontend' and it will use localstack"

