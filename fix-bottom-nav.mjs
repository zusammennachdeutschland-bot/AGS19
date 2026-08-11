import fs from 'fs';
let content = fs.readFileSync('src/components/BottomNav.tsx', 'utf-8');

content = content.replace(/dark:bg-blue-400\/15/g, 'dark:bg-primary-soft');
content = content.replace(/dark:bg-blue-950\/40/g, 'dark:bg-primary-soft');

fs.writeFileSync('src/components/BottomNav.tsx', content);
console.log('Fixed BottomNav');
