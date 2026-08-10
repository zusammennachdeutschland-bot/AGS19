import fs from 'fs';
let code = fs.readFileSync('src/components/QuickTodoWidget.tsx', 'utf8');
code = code.replace(
  "const { t, todos, setTodos } = useApp();",
  `const { t } = useApp();
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('dl_quick_todos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dl_quick_todos', JSON.stringify(todos));
  }, [todos]);`
);
fs.writeFileSync('src/components/QuickTodoWidget.tsx', code);
