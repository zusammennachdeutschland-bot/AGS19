import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "      value={{\n        theme,",
  "      value={{\n        todos,\n        setTodos,\n        theme,"
);
fs.writeFileSync('src/context/AppContext.tsx', code);
