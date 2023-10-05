#!/bin/bash

# this script uses imagemagic
# cf. https://imagemagick.org/script/download.php
# `brew install imagemagick`

if [ "$#" -ne 2 ] && [ -f "$1" ]
then
  echo "Error - usage: $0 <inputFile> <projectName>" >&2
  exit 1
fi

source="$1"
project="$2"

mkdir -p tmp
convert -size '1024x1024' xc:none -draw "roundrectangle 0,0,1024,1024,20,20" tmp/logo_mask.png
convert  "$source" -matte tmp/logo_mask.png  -compose DstIn  -composite tmp/logo_rounded.png
convert tmp/logo_rounded.png \( +clone -background black -shadow 20x20+0+0 \) +swap -background transparent -layers merge +repage logo_shadow.png

dest="$project/logo.png"
adaptativeIcon="$project/adaptive-icon.png"
icon="$project/icon.png"
icon512="$project/icon512x512.png"
favpng="$project/favicon.png"
favicon="$project/favicon.ico"

mkdir $project

echo "> copy model into \"$project\" directory"
cp $source $dest

echo "> create ${adaptativeIcon}"
convert $dest -resize 1024x1024 -quality 95\> $adaptativeIcon

echo "> create ${icon}"
convert $dest -resize 1024x1024 -quality 95\> $icon

echo "> create ${icon}"
convert $dest -resize 512x512 -quality 95\> ${icon512}

echo "> create ${favpng}"
convert $dest -resize 48x48 -quality 95\> $favpng


echo "> create favicon.ico"
convert $dest -alpha off -resize 256x256 -define icon:auto-resize="256,128,96,64,48,32,16" $favicon
