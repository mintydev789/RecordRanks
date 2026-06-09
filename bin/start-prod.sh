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
  
  if [ "$(command -v apt)" != "" ]; then
    sudo apt update &&
    sudo apt dist-upgrade
  fi

  if [ "$2" != "--no-backup" ]; then
    ./bin/create-full-backup.sh

    if [ $? -gt 0 ]; then
      echo -e "\n\nBackup failed!"
      exit 2
    fi
  fi

  docker stop rr-nextjs &&
  docker exec -w /etc/caddy rr-caddy caddy reload &&

  ./bin/apply-db-migrations.sh &&

  docker compose -f docker-compose.rr.yml up -d
fi
