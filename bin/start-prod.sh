#!/bin/bash

##################################################
# Script for (re)starting production environment #
##################################################

# $1 - (optional) --restart/-r - skip apt update and DB dump
# $2 - (optional) --no-backup - skip creating the backup

cd "$(dirname "$0")/.."

source .env
docker pull "$DOCKER_IMAGE_NAME"

if [ "$1" != "--restart" ] && [ "$1" != "-r" ]; then
  # First start

  ./bin/apply-db-migrations.sh &&

  docker compose -f docker-compose.rr.yml up -d
else
  # Restart
  
  if [ "$2" != "--no-backup" ]; then
    ./bin/create-full-backup.sh

    if [ $? -gt 0 ]; then
      echo -e "\n\nBackup failed!"
      exit 2
    fi
  fi

  docker stop rr-nextjs

  if [ "$DISABLE_CADDY_DOCKER_SERVICE" != "true" ]; then
    docker exec -w /etc/caddy rr-caddy caddy reload || exit 3
  fi

  ./bin/apply-db-migrations.sh || exit 4

  if [ "$DISABLE_CADDY_DOCKER_SERVICE" == "true" ]; then
    docker compose -f docker-compose.rr.yml up nextjs -d
  else
    docker compose -f docker-compose.rr.yml up -d
  fi
fi
