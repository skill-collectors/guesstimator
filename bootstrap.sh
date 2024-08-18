#!/bin/bash

set -e

rootDir="$(cd $(dirname ${0}); pwd)"

function ensureInstalled() {
  local cmd="${1}"
  local reason="${2}"
  local installUrl="${3}"
  echo -n "Checking for ${cmd}..."
  if command -v "${cmd}" > /dev/null; then
    echo "Found!"
  else
    echo "Not found!"
    echo "You need to install '${cmd}' ${reason}. Go to ${installUrl} to install it."
    exit 1
  fi
}

# If you update this list, also update getting-started.md
ensureInstalled npm "to manage project dependencies and run tests. NPM is part of Node." "https://nodejs.org/en/download/"
ensureInstalled pulumi "to deploy the infrastructure (even locally)." "https://www.pulumi.com/docs/get-started/install/"

cd ${rootDir}

npm install --workspaces

cd ${rootDir}/frontend
npx playwright install
cd ${rootDir}

cd ${rootDir}/infra
pulumi plugin install resource aws v4.30.0 # required by @pulumi/aws-apigateway. If you update this, also update cd.yml

pulumi login
pulumi stack init dev || echo "Ignoring stack init failure. It probably already exists."
pulumi up --refresh --yes
cd ${rootDir}

npm run check-all

echo "To run the app locally, run './deploy-local.sh' followed by 'npm run dev --workspace=frontend'"
