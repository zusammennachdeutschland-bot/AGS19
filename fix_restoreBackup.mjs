import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  restoreBackup: (customJson?: string) => Promise<boolean>;\n",
  ""
);

fs.writeFileSync('src/context/AppContext.tsx', code);
