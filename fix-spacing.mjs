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
  
  // Replace large paddings
  content = content.replace(/\bp-8\b/g, 'p-5');
  content = content.replace(/\bp-6\b/g, 'p-4');
  content = content.replace(/\bpy-8\b/g, 'py-5');
  content = content.replace(/\bpy-6\b/g, 'py-4');
  
  // Replace large space-y and gaps
  content = content.replace(/\bspace-y-8\b/g, 'space-y-5');
  content = content.replace(/\bspace-y-6\b/g, 'space-y-4');
  content = content.replace(/\bspace-y-5\b/g, 'space-y-3');
  // Be careful with space-y-4, let's make it space-y-3 for density? maybe space-y-4 is fine.
  
  content = content.replace(/\bgap-8\b/g, 'gap-5');
  content = content.replace(/\bgap-6\b/g, 'gap-4');
  content = content.replace(/\bgap-5\b/g, 'gap-3');
  
  // Specific fix for App.tsx main motion div
  if (file.includes('App.tsx')) {
    content = content.replace(/className="space-y-5"/, 'className="space-y-3.5"');
  }

  fs.writeFileSync(file, content);
});
console.log('Fixed spacing');
