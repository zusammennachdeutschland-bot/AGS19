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
  
  // Replace large margins
  content = content.replace(/\bmt-8\b/g, 'mt-5');
  content = content.replace(/\bmb-8\b/g, 'mb-5');
  content = content.replace(/\bmt-6\b/g, 'mt-4');
  content = content.replace(/\bmb-6\b/g, 'mb-4');
  
  // Replace large single padding
  content = content.replace(/\bpt-8\b/g, 'pt-5');
  content = content.replace(/\bpb-8\b/g, 'pb-5');
  content = content.replace(/\bpt-6\b/g, 'pt-4');
  content = content.replace(/\bpb-6\b/g, 'pb-4');
  
  // Maybe also 5 -> 3
  // content = content.replace(/\bmt-5\b/g, 'mt-3');
  // content = content.replace(/\bmb-5\b/g, 'mb-3');
  
  fs.writeFileSync(file, content);
});
console.log('Fixed margins');
