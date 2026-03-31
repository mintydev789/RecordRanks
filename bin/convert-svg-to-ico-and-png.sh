#!/bin/bash

if [ ! -d "./client" ]; then
  echo "Error: client directory not found (this script must be run from the project root directory)"
  exit 1
fi

if [ ! -f "$1" ]; then
  echo "Error: icon file not found. Please provide a valid path to the SVG icon file as the first argument."
  exit 2
fi

# Note that the README references these exact file paths
ico_file_path="client/app/favicon.ico"
png_file_path="client/public/favicon.png" 

if [ -f "$ico_file_path" ]; then
  echo "Error: there is already an ICO file at $ico_file_path"
  exit 3
fi

if [ -f png_file_path ]; then
  echo "Error: there is already a PNG file at $png_file_path"
  exit 4
fi

inkscape -w 16 -h 16 -o 16.png "$1" &&
inkscape -w 32 -h 32 -o 32.png "$1"  &&
inkscape -w 48 -h 48 -o 48.png "$1"  &&

magick 16.png 32.png 48.png "$ico_file_path"
rm -f 16.png 32.png 48.png

identify "$ico_file_path"

echo -e "\nCreated $ico_file_path"

inkscape -w 256 -h 256 -o $png_file_path "$1"

echo -e "\nCreated $png_file_path"
