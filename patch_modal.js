const fs = require('fs');
let content = fs.readFileSync('src/components/BackupModal.tsx', 'utf8');
content = content.replace(/            <button[\s\S]*?Verify Integrity[\s\S]*?<\/button>/, '');
fs.writeFileSync('src/components/BackupModal.tsx', content);
