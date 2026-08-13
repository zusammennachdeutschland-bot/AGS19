const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('icon_monochrome.svg');
const res = 'android/app/src/main/res';
const sizes = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

async function build() {
  for (const [dens, size] of Object.entries(sizes)) {
    const dir = `${res}/mipmap-${dens}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    await sharp(svg).resize(size, size).png().toFile(`${dir}/ic_launcher_monochrome.png`);
  }
}
build().catch(console.error);
