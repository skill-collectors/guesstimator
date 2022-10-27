#!/bin/bash

set -e

logGroups="$(awslocal logs describe-log-groups --query 'logGroups[*].logGroupName' | jq -r '.[]')"

while IFS= read -r logGroup; do
  logStreams="$(awslocal logs describe-log-streams --log-group-name ${logGroup} --query 'logStreams[*].logStreamName' --limit 50 | jq -r '.[]')"
  while IFS= read -r logStream; do
    awslocal logs get-log-events --log-group-name "${logGroup}" --log-stream-name "${logStream}"
  done <<< "${logStreams}"
done <<< "${logGroups}"

