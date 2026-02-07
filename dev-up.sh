#!/bin/bash
set -e

# Compute real values
COMMIT=$(git rev-parse HEAD)
TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

echo "🚀 Starting local dev with commit $COMMIT and tag '$TAG'"

docker-compose -f docker-compose.yml -f docker-compose.local.yml build \
  --build-arg GIT_COMMIT=$COMMIT \
  --build-arg LATEST_TAG=$LATEST_TAG \
  --build-arg GIT_TAG=$TAG

docker-compose -f docker-compose.yml -f docker-compose.local.yml up
