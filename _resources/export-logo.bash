#!/bin/bash

local_path="$(dirname "$0")"

echo "$local_path"

# this script uses imagemagic
# cf. https://imagemagick.org/script/download.php
# `brew install imagemagick`

if [ "$#" -ne 2 ] || ! [ -f "$1" ]
then
  echo "Error - usage: $(basename "$0") <inputFile> <projectName>" >&2
  exit 1
fi

source="$1"
project="$2"

tmp_path="${local_path}/tmp"

mkdir -p "$tmp_path"

logoshadow="${local_path}/logo_shadow.png"

echo "> create ${logoshadow}"

convert -size '1024x1024' xc:none -draw "roundrectangle 0,0,1024,1024,30,30" "${tmp_path}/logo_mask.png"
convert "$source" -matte tmp/logo_mask.png  -compose DstIn  -composite "${tmp_path}/logo_rounded.png"
convert "${local_path}/tmp/logo_rounded.png" \( +clone -background black -shadow 20x20+0+0 \) +swap -background transparent -layers merge +repage "${logoshadow}"

project_path="${local_path}/${project}"

mkdir -p "$project_path"

dest="${project_path}/logo.png"
splash="${project_path}/splash.png"
adaptativeIcon="${project_path}/adaptive-icon.png"
icon="${project_path}/icon.png"
icon512="${project_path}/icon512x512.png"
favpng="${project_path}/favicon.png"
favicon="${project_path}/favicon.ico"

echo "> copy model into \"$project\" directory"
cp "$source" "$dest"

echo "> create ${splash}"
convert "$logoshadow" -resize 408x408 -background transparent -gravity center -extent 1284x2778 "$splash"

echo "> create ${adaptativeIcon}"
convert "$dest" -resize 1024x1024 -quality 95\> "$adaptativeIcon"

echo "> create ${icon}"
convert "$dest" -resize 1024x1024 -quality 95\> "$icon"

echo "> create ${icon}"
convert "$dest" -resize 512x512 -quality 95\> "$icon512"

echo "> create ${favpng}"
convert "$dest" -resize 48x48 -quality 95\> "$favpng"


echo "> create ${favicon}"
convert "$dest" -alpha off -resize 256x256 -define icon:auto-resize="256,128,96,64,48,32,16" "$favicon"

for file in adaptive-icon.png favicon.png icon.png splash.png ; do
  cp "${project_path}/${file}" "${local_path}/../assets/images"
done

# rm -rf "$tmp_path"
