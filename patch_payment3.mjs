import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "paymentType: bundleSize > 1 ? 'package_bundle' : 'single_lesson',",
  "paymentType: bundleSize > 1 ? 'package_bundle' : 'lesson_fee',"
);

code = code.replace(
  "  todos?: TodoItem[];\n}",
  "  todos?: any[];\n}"
);

code = code.replace(
  "export interface AppContextType {\n  todos: TodoItem[];",
  "export interface AppContextType {\n  todos: any[];"
);

code = code.replace(
  "  const [todos, setTodos] = useState<TodoItem[]>",
  "  const [todos, setTodos] = useState<any[]>"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
