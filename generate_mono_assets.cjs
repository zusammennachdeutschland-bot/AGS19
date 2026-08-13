const sharp = require('sharp');
const fs = require('fs');

const svgContent = fs.readFileSync('icon_monochrome.svg');

async function build() {
  await sharp(svgContent).resize(1024, 1024).png().toFile('assets/icon-monochrome.png');
  console.log("Mono generated!");
}
build().catch(console.error);
