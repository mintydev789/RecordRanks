#!/bin/bash

if [ "$(pwd | tail -c 5)" == "/bin" ]; then
  echo "Please run this script from the repo's root directory"
  exit 1
fi

match_string='import "server-only";'

cd client &&

# Comment out all "server-only" imports to prevent them messing with Drizzle
find "./" -type f -name "*.ts" -exec sed -i "s/^$match_string$/\/\/ $match_string/" {} + &&

pnpm install &&
pnpm run db:migrate &&
echo && # just print a new line in the terminal

# Uncomment "server-only" imports
find "./" -type f -name "*.ts" -exec sed -i "s/^\/\/ $match_string$/$match_string/" {} + &&

cd ..
