#!/bin/bash

set -e

rootDir="$(cd $(dirname ${0}); pwd)"

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
		exit 1
	fi

}

verifyAll npm python3 docker pulumi aws ruby

cd ${rootDir}

npm install --workspaces

python3 -m ensurepip
python3 -m pip install localstack
python3 -m pip install awscli-local

gem install bundler jekyll
cd ${rootDir}/docs
bundle install
cd ${rootDir}
