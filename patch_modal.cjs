const fs = require('fs');
let content = fs.readFileSync('src/components/BackupModal.tsx', 'utf8');
content = content.replace(/  };\n  };\n  const totalRecords/, '  };\n\n  const totalRecords');
fs.writeFileSync('src/components/BackupModal.tsx', content);
