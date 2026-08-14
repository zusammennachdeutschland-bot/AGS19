const fs = require('fs');
const path = require('path');

const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.apk', '.zip', '.ttf', '.otf', '.woff', '.woff2', '.mp3', '.mp4', '.wav'];

let hasError = false;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else {
      const ext = path.extname(full).toLowerCase();
      if (exts.includes(ext)) {
        checkFile(full, stat);
      }
    }
  }
}

function checkFile(file, stat) {
  const buf = fs.readFileSync(file);
  
  if (buf.includes(Buffer.from([0xEF, 0xBF, 0xBD]))) {
    console.error(`[ERROR] Corrupted binary file (UTF-8 replacement characters found): ${file}`);
    hasError = true;
    return;
  }
  
  const ext = path.extname(file).toLowerCase();
  let magicMatch = true;
  if (ext === '.png') {
    const magic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    if (buf.length < 8 || !buf.subarray(0, 8).equals(magic)) magicMatch = false;
  } else if (ext === '.jpg' || ext === '.jpeg') {
    if (buf.length < 3 || buf[0] !== 0xFF || buf[1] !== 0xD8 || buf[2] !== 0xFF) magicMatch = false;
  } else if (ext === '.gif') {
    const m1 = Buffer.from('GIF87a');
    const m2 = Buffer.from('GIF89a');
    if (buf.length < 6 || (!buf.subarray(0, 6).equals(m1) && !buf.subarray(0, 6).equals(m2))) magicMatch = false;
  } else if (ext === '.webp') {
    if (buf.length < 12 || !buf.subarray(0, 4).equals(Buffer.from('RIFF')) || !buf.subarray(8, 12).equals(Buffer.from('WEBP'))) magicMatch = false;
  } else if (ext === '.wav') {
    if (buf.length < 12 || !buf.subarray(0, 4).equals(Buffer.from('RIFF')) || !buf.subarray(8, 12).equals(Buffer.from('WAVE'))) magicMatch = false;
  } else if (ext === '.zip' || ext === '.apk') {
    if (buf.length < 4 || !buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
      if (buf.length >= 4 && buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4B, 0x05, 0x06]))) {
        // empty zip
      } else {
        magicMatch = false;
      }
    }
  }
  
  if (!magicMatch) {
    console.error(`[ERROR] Corrupted binary file (invalid magic bytes for ${ext}): ${file}`);
    hasError = true;
  }
}

walk('.');
if (hasError) {
  process.exit(1);
} else {
  console.log("All binary files passed integrity check.");
}
