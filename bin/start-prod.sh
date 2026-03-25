#!/bin/bash

##################################################
# Script for (re)starting production environment #
##################################################

# $1 - (optional) --restart/-r - skip apt update and DB dump
# $2 - (optional) --no-backup - skip creating the backup

if [ "$(pwd | tail -c 5)" == "/bin" ]; then
  echo "Please run this script from the repo's root directory"
  exit 1
fi

source .env
sudo docker pull "$DOCKER_IMAGE_NAME"

if [ "$1" != "--restart" ] && [ "$1" != "-r" ]; then
  # First start

  ./bin/apply-db-migrations.sh &&

  sudo docker compose -f docker-compose.rr.yml up -d
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

  sudo docker stop rr-nextjs &&
  sudo docker exec -w /etc/caddy rr-caddy caddy reload &&

  ./bin/apply-db-migrations.sh &&

  sudo docker compose -f docker-compose.rr.yml up -d
fi
