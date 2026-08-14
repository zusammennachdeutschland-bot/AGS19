const sharp = require('sharp');
const fs = require('fs');

async function build() {
  if (!fs.existsSync('assets')) fs.mkdirSync('assets');
  
  const iconSvg = fs.readFileSync('icon.svg');
  const fgSvg = fs.readFileSync('icon_foreground.svg');
  const monoSvg = fs.readFileSync('icon_monochrome.svg');
  
  await sharp(iconSvg).resize(1024, 1024).png().toFile('assets/icon.png');
  await sharp(fgSvg).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toFile('assets/icon-background.png');
  
  await sharp(iconSvg).resize(2732, 2732, { fit: 'contain', background: '#ffffff' }).png().toFile('assets/splash.png');
  await sharp(iconSvg).resize(2732, 2732, { fit: 'contain', background: '#ffffff' }).png().toFile('assets/splash-dark.png');
  
  await sharp(monoSvg).resize(1024, 1024).png().toFile('assets/icon-monochrome.png');
  
  console.log("Assets rebuilt!");
}
build().catch(console.error);
