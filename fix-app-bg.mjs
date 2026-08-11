import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/bg-slate-100 dark:bg-black/g, 'bg-background');
content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-text-main');
content = content.replace(/bg-surface dark:bg-black/g, 'bg-background');
content = content.replace(/dark:border-slate-900/g, 'dark:border-surface-border');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx background');
