#!/bin/bash

if [ "$(pwd | tail -c 5)" == "/bin" ]; then
  echo "Please run this script from the repo's root directory"
  exit 1
fi

cd client &&

pnpm install &&

pnpm run server-only-off &&
pnpm run db:migrate &&
echo && # just print a new line in the terminal
pnpm run server-only-on &&

cd ..
