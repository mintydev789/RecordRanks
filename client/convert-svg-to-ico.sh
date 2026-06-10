#!/bin/sh

cd "$(dirname "$0")"

cyan='\033[0;36m'
nc='\033[0m' # no color

if [ ! -f "$1" ]; then
  echo "Error: icon file not found at $1. Please provide a valid path to the SVG icon file as the first argument."
  exit 1
fi

if [ -n "$2" ]; then
  ico_file_path="$2"
else
  ico_file_path="./app/favicon.ico"
fi

echo -e "${cyan}Creating ICO file at $ico_file_path...${nc}\n"

if [ -f "$ico_file_path" ]; then
  echo "Error: there is already an ICO file at $ico_file_path"
  exit 2
fi

inkscape -w 16 -h 16 -o 16.png "$1" &&
inkscape -w 32 -h 32 -o 32.png "$1" &&
inkscape -w 48 -h 48 -o 48.png "$1" || exit 3

if [ -n "$(command -v magick)" ]; then
  magick 16.png 32.png 48.png "$ico_file_path" || exit 4
elif [ -n "$(command -v convert)" ]; then
  convert 16.png 32.png 48.png "$ico_file_path" || exit 4
else
  echo "Error: ImageMagick not installed"
  exit 5
fi

rm -f 16.png 32.png 48.png
identify "$ico_file_path"

echo -e "\n${cyan}Created ICO file at $ico_file_path${nc}"
