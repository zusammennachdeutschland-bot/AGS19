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
  
  // Surfaces
  content = content.replace(/\bbg-white dark:bg-slate-900\b/g, 'bg-surface');
  content = content.replace(/\bbg-slate-50 dark:bg-slate-800/g, 'bg-surface-hover');
  content = content.replace(/\bbg-slate-100 dark:bg-slate-800/g, 'bg-surface-hover');
  content = content.replace(/\bbg-slate-50 dark:bg-slate-900/g, 'bg-background');
  content = content.replace(/\bbg-white dark:bg-slate-950/g, 'bg-surface');
  
  content = content.replace(/\bbg-white\b/g, 'bg-surface');
  content = content.replace(/\bdark:bg-slate-900\b/g, 'dark:bg-surface');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-background');
  content = content.replace(/\bdark:bg-slate-950\b/g, 'dark:bg-background');
  
  // Borders
  content = content.replace(/\bborder-slate-200 dark:border-slate-800\b/g, 'border-surface-border');
  content = content.replace(/\bborder-slate-200\/50 dark:border-slate-700\/50\b/g, 'border-surface-border-soft');
  content = content.replace(/\bborder-slate-200\b/g, 'border-surface-border');
  content = content.replace(/\bdark:border-slate-800\b/g, 'dark:border-surface-border');
  content = content.replace(/\bdark:border-slate-700\b/g, 'dark:border-surface-border-soft');
  
  // Text
  content = content.replace(/\btext-slate-800 dark:text-slate-100\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-900 dark:text-white\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-800 dark:text-white\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-700 dark:text-slate-200\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-700 dark:text-slate-300\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-600 dark:text-slate-400\b/g, 'text-text-muted');
  content = content.replace(/\btext-slate-500 dark:text-slate-400\b/g, 'text-text-muted');
  content = content.replace(/\btext-slate-500 dark:text-slate-500\b/g, 'text-text-muted');
  content = content.replace(/\btext-slate-400\b/g, 'text-text-muted/70');
  
  // App.tsx body class
  if (file.includes('App.tsx') || file.includes('index.html')) {
     // special rules if needed
  }

  // Consistent corner radius (rounded-xl to rounded-2xl or standardized)
  // We'll replace standard cards rounded-xl to rounded-2xl to feel more premium, but maybe standardizing is enough.
  // Actually, replacing generic classes could be dangerous if they break layout. Let's stick to colors first.

  fs.writeFileSync(file, content);
});
console.log('Replaced surface tokens');
