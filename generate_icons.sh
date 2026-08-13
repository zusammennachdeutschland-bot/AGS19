#!/bin/bash
set -e

# Base SVGs
convert resources/bg.svg public/bg.png
convert resources/fg.svg public/fg.png

# For regular icons (combined)
# Keep using public/icon.png for regular and round icons
convert public/icon.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert public/icon.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert public/icon.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert public/icon.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert public/icon.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

cp android/app/src/main/res/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# For foreground (adaptive) -> Use fg.png
convert public/fg.png -resize 108x108 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
convert public/fg.png -resize 162x162 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
convert public/fg.png -resize 216x216 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
convert public/fg.png -resize 324x324 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
convert public/fg.png -resize 432x432 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

# For background (adaptive) -> Use bg.png
convert public/bg.png -resize 108x108 android/app/src/main/res/mipmap-mdpi/ic_launcher_background.png
convert public/bg.png -resize 162x162 android/app/src/main/res/mipmap-hdpi/ic_launcher_background.png
convert public/bg.png -resize 216x216 android/app/src/main/res/mipmap-xhdpi/ic_launcher_background.png
convert public/bg.png -resize 324x324 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_background.png
convert public/bg.png -resize 432x432 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png

echo "Done"
