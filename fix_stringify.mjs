import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace storage.setItem('...', JSON.stringify(var)) with storage.setItem('...', var)
code = code.replace(/storage\.setItem\('([^']+)', JSON\.stringify\((.*?)\)\);/g, "storage.setItem('$1', $2);");

fs.writeFileSync('src/context/AppContext.tsx', code);
