import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  restoreBackup: (customJson?: string) => boolean;\n  importBackupFile: (customJson?: string) => boolean;",
  "  restoreBackup: (customJson?: string) => Promise<boolean>;\n  importBackupFile: (customJson?: string) => Promise<boolean>;"
);

code = code.replace(
  "const restoreBackup = (customJson?: string): boolean => {",
  "const restoreBackup = async (customJson?: string): Promise<boolean> => {"
);
code = code.replace(
  "return importBackupFile(customJson);",
  "return await importBackupFile(customJson);"
);

code = code.replace(
  "const importBackupFile = (customJson?: string): boolean => {",
  "const importBackupFile = async (customJson?: string): Promise<boolean> => {"
);

code = code.replace(
  "const sourceStr = customJson || storage.getItem('dl_local_backup_data');",
  "const sourceStr = customJson || await storage.getItem('dl_local_backup_data');"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
