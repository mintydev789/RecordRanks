#!/bin/bash

if [ "$(pwd | tail -c 5)" == "/bin" ]; then
  echo "Please run this script from the repo's root directory"
  exit 1
fi

if [ -z "$1" ] || [ "$1" != "--no-checks" ]; then
  cd client
  rm .env # if a .env file is somehow present in the client directory from previous failed releases, it would make tests fail
  pnpm run check && pnpm run test --bail=1

  if [ $? -gt 0 ]; then
    echo -e "\nPlease make sure all checks and tests pass before publishing a new version"
    exit 2
  fi

  cp ../.env ./
  pnpm run build

  if [ $? -gt 0 ]; then
    rm .env
    echo -e "\nPlease make sure the application can build successfully before publishing a new version"
    exit 3
  fi

  rm .env
  cd ..
fi

cyan='\033[0;36m'
nc='\033[0m' # no color

git tag | sort -t "." -k1,1n -k2,2n -k3,3n | tail
echo -e "\n${cyan}Please give the new version tag:${nc}"
read new_version

echo -e "\n${cyan}Pushing version $new_version to origin...${nc}"
git tag --force --annotate "$new_version" -m "Version $new_version" &&
git push --force origin --tags &&
git push &&

echo -e "\n${cyan}Release new Docker image? (y/N)${nc}" &&
read answer &&

if [ $? == 0 ] && ( [ "$answer" == "y" ] || [ "$answer" == "Y" ] ); then
  ./bin/release-new-image.sh
fi
