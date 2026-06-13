#!/bin/bash

#####################################################
# Script for testing production environment locally #
#####################################################

# $1 - (optional) --cleanup/-c - just bring the containers down without restarting

cd "$(dirname "$0")/.."

docker compose -f docker-compose.rr.yml down

if [[ "$1" != "--cleanup" && "$1" != "-c" ]]; then
  source .env # needed for the build args

  docker build --build-arg NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
               --build-arg NEXT_PUBLIC_PROJECT_NAME="$NEXT_PUBLIC_PROJECT_NAME" \
               --build-arg NEXT_PUBLIC_AUTH_PROVIDERS="$NEXT_PUBLIC_AUTH_PROVIDERS" \
               --build-arg NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL="$NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL" \
               --build-arg NEXT_PUBLIC_MULTITENANCY_ENABLED="$NEXT_PUBLIC_MULTITENANCY_ENABLED" \
               -t "$DOCKER_IMAGE_NAME" ./client &&

  ./bin/apply-db-migrations.sh &&

  docker compose -f docker-compose.rr.yml up
fi
