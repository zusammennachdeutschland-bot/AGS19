import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Basic replacements
  content = content.replace(/\btext-blue-(400|500|600|700)\b/g, 'text-primary');
  content = content.replace(/\bbg-blue-(500|600)\b/g, 'bg-primary');
  content = content.replace(/\bhover:bg-blue-(600|700)\b/g, 'hover:bg-primary-hover');
  
  // Soft backgrounds
  content = content.replace(/\bbg-blue-(50|100)(\/[0-9]+)?\b/g, 'bg-primary-soft');
  content = content.replace(/\bhover:bg-blue-(50|100)(\/[0-9]+)?\b/g, 'hover:bg-primary-soft');
  
  // Text variations
  content = content.replace(/\btext-blue-(800|900)\b/g, 'text-primary-hover');
  content = content.replace(/\btext-blue-(200|300)\b/g, 'text-primary/70');
  
  // Borders
  content = content.replace(/\bborder-blue-(400|500|600)\b/g, 'border-primary');
  content = content.replace(/\bborder-blue-(200|300)\b/g, 'border-primary-border');
  content = content.replace(/\bborder-blue-(100|50)\b/g, 'border-primary-border');
  content = content.replace(/\bhover:border-blue-(500|600)\b/g, 'hover:border-primary');
  
  // Rings
  content = content.replace(/\bfocus:ring-blue-(400|500|600)\b/g, 'focus:ring-primary');
  content = content.replace(/\bring-blue-(400|500|600)\b/g, 'ring-primary');
  
  // Shadows/Glows
  content = content.replace(/\bshadow-blue-(500|400)(\/[0-9]+)?\b/g, 'shadow-primary/50');
  
  // Fill / Stroke for SVG
  content = content.replace(/\bfill-blue-(500|600)\b/g, 'fill-primary');
  content = content.replace(/\bstroke-blue-(500|600)\b/g, 'stroke-primary');
  content = content.replace(/\bfill-blue-50\b/g, 'fill-primary-soft');
  
  fs.writeFileSync(file, content);
});
console.log('Replaced tokens');
