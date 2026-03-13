#!/bin/sh

# This script originates from docker/reset.sh in the Supabase repo

if [ "$(pwd | tail -c 5)" == "/bin" ]; then
  echo "Please run this script from the repo's root directory"
  exit 1
fi

set -e

auto_confirm=0

confirm () {
  if [ "$auto_confirm" = "1" ]; then
    return 0
  fi

  printf "Are you sure you want to proceed? (y/N)"
  read -r REPLY
  case "$REPLY" in
    [Yy])
      ;;
    *)
      echo "Script canceled."
      exit 1
      ;;
  esac
}

if [ "$1" = "-y" ]; then
  auto_confirm=1
fi

echo ""
echo "*** WARNING: This will remove all containers and container data ***"
echo ""

confirm

echo "===> Stopping and removing all containers..."

if [ -f ".env" ]; then
  sudo docker compose -f docker-compose.supabase.yml down -v --remove-orphans
else
  echo "Skipping 'docker compose down' because there's no env-file."
fi

echo "===> Cleaning up bind-mounted directories..."
BIND_MOUNTS="./volumes/db/data ./volumes/storage"

for dir in $BIND_MOUNTS; do
  if [ -d "$dir" ]; then
    echo "Removing $dir..."
    confirm
    sudo rm -rf "$dir"
  else
    echo "$dir not found."
  fi
done

echo "Cleanup complete!"
echo ""
