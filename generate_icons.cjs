const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  // Convert SVGs to PNGs
  await sharp('resources/bg.svg').png().toFile('public/bg.png');
  await sharp('resources/fg.svg').png().toFile('public/fg.png');

  const baseImage = 'public/icon.png';
  const bgImage = 'public/bg.png';
  const fgImage = 'public/fg.png';

  const sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
  };

  const adaptiveSizes = {
    'mdpi': 108,
    'hdpi': 162,
    'xhdpi': 216,
    'xxhdpi': 324,
    'xxxhdpi': 432
  };

  for (const [dpi, size] of Object.entries(sizes)) {
    // ic_launcher and ic_launcher_round
    await sharp(baseImage).resize(size, size).toFile(`android/app/src/main/res/mipmap-${dpi}/ic_launcher.png`);
    await sharp(baseImage).resize(size, size).toFile(`android/app/src/main/res/mipmap-${dpi}/ic_launcher_round.png`);
  }

  for (const [dpi, size] of Object.entries(adaptiveSizes)) {
    // foreground and background
    await sharp(fgImage).resize(size, size).toFile(`android/app/src/main/res/mipmap-${dpi}/ic_launcher_foreground.png`);
    await sharp(bgImage).resize(size, size).toFile(`android/app/src/main/res/mipmap-${dpi}/ic_launcher_background.png`);
  }
}

generate().then(() => console.log('Done')).catch(err => console.error(err));
