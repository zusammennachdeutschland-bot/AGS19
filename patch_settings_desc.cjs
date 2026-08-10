const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

content = content.replace(
  /<p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0\.5">\s*\{cat\.description\}\s*<\/p>/g,
  ''
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
