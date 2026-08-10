import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "interface AppContextType {\n  // Navigation & Theme & Language",
  "interface AppContextType {\n  todos: any[];\n  setTodos: any;\n  // Navigation & Theme & Language"
);

code = code.replace(
  "    <AppContext.Provider value={{",
  "    <AppContext.Provider value={{\n      todos, setTodos,"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
