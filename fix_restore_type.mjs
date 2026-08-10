import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  restoreBackup: (customJson?: string) => boolean;  importBackupFile: (customJson?: string) => boolean;  exportBackupFile: () => void;",
  "  restoreBackup: (customJson?: string) => Promise<boolean>;\n  importBackupFile: (customJson?: string) => Promise<boolean>;\n  exportBackupFile: () => void;"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
