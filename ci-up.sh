#!/bin/bash
set -e
top_level=$(git rev-parse --show-toplevel)
cd $top_level

echo "🚀 Starting containers from pre-built images"
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
