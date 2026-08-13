const sharp = require('sharp');
const fs = require('fs');

const svgContent = fs.readFileSync('icon.svg');
const fgSvgContent = fs.readFileSync('icon_foreground.svg');

if (!fs.existsSync('assets')) fs.mkdirSync('assets');

async function build() {
  await sharp(svgContent).resize(1024, 1024).png().toFile('assets/icon.png');
  await sharp(fgSvgContent).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
  // Background solid color #ffffff
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toFile('assets/icon-background.png');
  // Splash screen: full screen white with logo
  await sharp(svgContent).resize(2732, 2732, { fit: 'contain', background: '#ffffff' }).png().toFile('assets/splash.png');
  
  // Splash screen dark mode (same logo but maybe dark bg? User didn't ask for dark, let's keep it white/light)
  await sharp(svgContent).resize(2732, 2732, { fit: 'contain', background: '#ffffff' }).png().toFile('assets/splash-dark.png');
  console.log("Assets generated!");
}

build().catch(console.error);
