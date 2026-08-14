const sharp = require('sharp');
const fs = require('fs');

async function build() {
  const iconSvg = fs.readFileSync('icon.svg');
  
  await sharp(iconSvg).resize(512, 512).png().toFile('public/icon.png');
  await sharp(iconSvg).resize(192, 192).png().toFile('public/apple-touch-icon.png');
  await sharp(iconSvg).resize(32, 32).png().toFile('public/favicon.png');
  
  const sizes = [48, 72, 96, 128, 192, 256, 512];
  for (const size of sizes) {
    await sharp(iconSvg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
  }
  
  console.log("Public assets rebuilt!");
}
build().catch(console.error);
