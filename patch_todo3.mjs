import fs from 'fs';
let code = fs.readFileSync('src/components/QuickTodoWidget.tsx', 'utf8');
code = code.replace(
  "const { t } = useApp();",
  "const { t, todos, setTodos } = useApp();"
);

code = code.replace(
  /  const \[todos, setTodos\] = useState<TodoItem\[\]>\(\(\) => \{\n    const saved = localStorage\.getItem\('dl_quick_todos'\);\n    return saved \? JSON\.parse\(saved\) : \[\];\n  \}\);\n\n  useEffect\(\(\) => \{\n    localStorage\.setItem\('dl_quick_todos', JSON\.stringify\(todos\)\);\n  \}, \[todos\]\);/,
  ""
);
fs.writeFileSync('src/components/QuickTodoWidget.tsx', code);
