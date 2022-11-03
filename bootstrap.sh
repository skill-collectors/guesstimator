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
ensureInstalled python3 "to install and work with localstack to stub AWS services locally." "https://www.python.org/downloads/"
ensureInstalled docker "to run the localstack container." "https://docs.docker.com/get-docker/"
ensureInstalled pulumi "to deploy the infrastructure (even locally)." "https://www.pulumi.com/docs/get-started/install/"
ensureInstalled gem "to preview the documentation locally. This is important because many contributions will require documentation updates and you will need to verify that your changes are formatted correctly. Gem is part of the Ruby installation." "https://www.ruby-lang.org/en/downloads/"

cd ${rootDir}

npm install --workspaces

python3 -m ensurepip
python3 -m pip install --upgrade pip
python3 -m pip install --upgrade localstack
python3 -m pip install --upgrade awscli-local
python3 -m pip install --upgrade pulumi-local

gem install bundler jekyll
cd ${rootDir}/docs
bundle install
cd ${rootDir}

cd ${rootDir}/frontend
npx playwright install
cd ${rootDir}

cd ${rootDir}/infra
pulumi plugin install resource aws v4.30.0 # required by @pulumi/aws-apigateway. If you update this, also update cd.yml
docker images localstack/localstack -f dangling=true -q | xargs --no-run-if-empty docker rmi # Remove old versions
localstack update all
localstack start -d
pulumilocal up --refresh --yes
cd ${rootDir}

npm run check-all

echo "To run the app locally, run './deploy-local.sh' followed by 'npm run dev --workspace=frontend'"

