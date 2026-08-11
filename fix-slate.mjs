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
  
  content = content.replace(/border-slate-100 dark:border-slate-900\/80/g, 'border-surface-border');
  content = content.replace(/border-slate-100 dark:border-slate-900/g, 'border-surface-border');
  content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-900/g, 'hover:bg-surface-hover');
  content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-surface-hover');
  content = content.replace(/bg-slate-50 dark:bg-slate-900/g, 'bg-background');
  content = content.replace(/bg-slate-100 dark:bg-slate-900/g, 'bg-background');
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-surface-hover');
  
  // Also fix Recharts colors!
  if (file.includes('ReportsView.tsx')) {
    content = content.replace(/fill="#10B981"/g, 'fill="var(--color-primary)"');
    content = content.replace(/stroke="#94a3b8"/g, 'stroke="var(--color-text-muted)"');
    content = content.replace(/fill="#EF4444"/g, 'fill="var(--color-text-muted)"'); 
    // we make the other color text-muted instead of red, or maybe surface-border
  }

  // Forms
  // "Improve input focus states. Accent-colored borders and shadows."
  content = content.replace(/focus:border-blue-500/g, 'focus:border-primary');
  content = content.replace(/focus:ring-blue-500\/20/g, 'focus:ring-primary/20');
  
  fs.writeFileSync(file, content);
});
console.log('Fixed leftover slates and Recharts');
