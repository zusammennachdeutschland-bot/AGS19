const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('icon.svg');
const dir = 'public/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

const sizes = [48, 72, 96, 128, 192, 256, 512];

async function build() {
  for (const size of sizes) {
    await sharp(svg).resize(size, size).png().toFile(`${dir}/icon-${size}.png`);
  }
  await sharp(svg).resize(192, 192).png().toFile(`public/apple-touch-icon.png`);
  await sharp(svg).resize(32, 32).png().toFile(`public/favicon.png`);
}
build().catch(console.error);
