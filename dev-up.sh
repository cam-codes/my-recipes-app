#!/bin/bash
set -e

top_level=$(git rev-parse --show-toplevel)
# Compute real values
GIT_COMMIT=$(git rev-parse HEAD)
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

echo "🚀 Starting local dev with commit '$GIT_COMMIT' and tag '$GIT_TAG' and latest tag: '$LATEST_TAG'"

docker compose -f $top_level/docker-compose.yml -f $top_level/docker-compose.local.yml build --no-cache \
  --build-arg GIT_COMMIT=$GIT_COMMIT \
  --build-arg GIT_TAG=$GIT_TAG \
  --build-arg VITE_GA_MEASUREMENT_ID=G-HJCLBNRY59 \
  --build-arg LATEST_TAG=$LATEST_TAG

docker compose -f $top_level/docker-compose.yml -f $top_level/docker-compose.local.yml up -d
