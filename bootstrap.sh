#!/bin/bash

set -e

function verifyAll() {
	local hasAll="true"
	while [[ $# -gt 0 ]]; do
		if ! command -v $1 > /dev/null; then
			echo "You need '$1' installed to run this script."
			hasAll="false"
		fi
		shift
	done
	if [[ "${hasAll}" == "false" ]]; then
		echo "Please install the software listed above and re-run the script."
	fi

}

verifyAll npm python3 docker pulumi aws

npm install --workspaces

python3 -m ensurepip
python3 -m pip install localstack
python3 -m pip install awscli-local

