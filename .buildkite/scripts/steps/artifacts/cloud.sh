#!/bin/bash

set -euo pipefail

.buildkite/scripts/bootstrap.sh

source .buildkite/scripts/steps/artifacts/env.sh

echo "--- Build and publish Cloud image"
mkdir -p target

buildkite-agent artifact download "kibana-$FULL_VERSION-linux-x86_64.tar.gz" ./target --build "${KIBANA_BUILD_ID:-$BUILDKITE_BUILD_ID}"

node scripts/build \
  --skip-initialize \
  --skip-generic-folders \
  --skip-platform-folders \
  --skip-archives \
  --docker-images \
  --skip-docker-ubi \
  --skip-docker-ubuntu \
  --skip-docker-contexts

docker load --input target/kibana-cloud-$FULL_VERSION-docker-image.tar.gz

TAG="$FULL_VERSION-$GIT_COMMIT"
KIBANA_BASE_IMAGE="docker.elastic.co/kibana-ci/kibana-cloud:$FULL_VERSION"
KIBANA_TEST_IMAGE="docker.elastic.co/kibana-ci/kibana-cloud:$TAG"

docker tag "$KIBANA_BASE_IMAGE" "$KIBANA_TEST_IMAGE"

echo "$KIBANA_DOCKER_PASSWORD" | docker login -u "$KIBANA_DOCKER_USERNAME" --password-stdin docker.elastic.co
trap 'docker logout docker.elastic.co' EXIT

docker push "$KIBANA_TEST_IMAGE"
docker logout docker.elastic.co

echo "--- Create deployment"
CLOUD_DEPLOYMENT_NAME="kibana-artifacts-$TAG"

LOGS=$(mktemp --suffix ".json")
DEPLOYMENT_SPEC=$(mktemp --suffix ".json")

jq '
  .name = "'$CLOUD_DEPLOYMENT_NAME'" |
  .resources.kibana[0].plan.kibana.docker_image = "'$KIBANA_TEST_IMAGE'" |
  .resources.kibana[0].plan.kibana.version = "'$FULL_VERSION'" |
  .resources.elasticsearch[0].plan.elasticsearch.version = "'$FULL_VERSION'" |
  .resources.enterprise_search[0].plan.enterprise_search.version = "'$FULL_VERSION'" |
  .resources.integrations_server[0].plan.integrations_server.version = "'$FULL_VERSION'"
  ' .buildkite/scripts/steps/cloud/deploy.json > "$DEPLOYMENT_SPEC"

ecctl deployment create --track --output json --file "$DEPLOYMENT_SPEC" &> "$LOGS"
CLOUD_DEPLOYMENT_USERNAME=$(jq -r --slurp '.[]|select(.resources).resources[] | select(.credentials).credentials.username' "$LOGS")
CLOUD_DEPLOYMENT_PASSWORD=$(jq -r --slurp '.[]|select(.resources).resources[] | select(.credentials).credentials.password' "$LOGS")
CLOUD_DEPLOYMENT_ID=$(jq -r --slurp '.[0].id' "$LOGS")
CLOUD_DEPLOYMENT_STATUS_MESSAGES=$(jq --slurp '[.[]|select(.resources == null)]' "$LOGS")

CLOUD_DEPLOYMENT_KIBANA_URL=$(ecctl deployment show "$CLOUD_DEPLOYMENT_ID" | jq -r '.resources.kibana[0].info.metadata.aliased_url')
CLOUD_DEPLOYMENT_ELASTICSEARCH_URL=$(ecctl deployment show "$CLOUD_DEPLOYMENT_ID" | jq -r '.resources.elasticsearch[0].info.metadata.aliased_url')

echo "Kibana: $CLOUD_DEPLOYMENT_KIBANA_URL"
echo "ES: $CLOUD_DEPLOYMENT_ELASTICSEARCH_URL"

function shutdown {
  echo "--- Shutdown deployment"
  ecctl deployment shutdown "$CLOUD_DEPLOYMENT_ID" --force --track --output json &> "$LOGS"
}
trap "shutdown" EXIT

export TEST_KIBANA_PROTOCOL=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_KIBANA_URL').protocol.replace(':', ''))")
export TEST_KIBANA_HOSTNAME=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_KIBANA_URL').hostname)")
export TEST_KIBANA_PORT=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_KIBANA_URL').port)")
export TEST_KIBANA_USERNAME="$CLOUD_DEPLOYMENT_USERNAME"
export TEST_KIBANA_PASSWORD="$CLOUD_DEPLOYMENT_PASSWORD"

export TEST_ES_PROTOCOL=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_ELASTICSEARCH_URL').protocol.replace(':', ''))")
export TEST_ES_HOSTNAME=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_ELASTICSEARCH_URL').hostname)")
export TEST_ES_PORT=$(node -e "console.log(new URL('$CLOUD_DEPLOYMENT_ELASTICSEARCH_URL').port)")
export TEST_ES_USERNAME="$CLOUD_DEPLOYMENT_USERNAME"
export TEST_ES_PASSWORD="$CLOUD_DEPLOYMENT_PASSWORD"

export TEST_BROWSER_HEADLESS=1

# Error: attempted to use the "es" service to fetch Elasticsearch version info but the request failed: ConnectionError: self signed certificate in certificate chain
export NODE_TLS_REJECT_UNAUTHORIZED=0

echo "--- FTR - Reporting"
node --no-warnings scripts/functional_test_runner.js --config x-pack/test/functional/apps/visualize/config.ts --include-tag=smoke --quiet
