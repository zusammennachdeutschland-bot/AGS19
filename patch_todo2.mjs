import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add context type
code = code.replace(
  "export interface AppContextType {",
  "export interface AppContextType {\n  todos: TodoItem[];\n  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;"
);

// 2. Add state
code = code.replace(
  "  const [activeTab, setActiveTab] = useState<'home'",
  "  const [todos, setTodos] = useState<TodoItem[]>(() => {\n    const saved = localStorage.getItem('dl_quick_todos');\n    return saved ? JSON.parse(saved) : [];\n  });\n\n  useEffect(() => {\n    localStorage.setItem('dl_quick_todos', JSON.stringify(todos));\n  }, [todos]);\n\n  const [activeTab, setActiveTab] = useState<'home'"
);

// 3. Add to provider value
code = code.replace(
  "    <AppContext.Provider value={{",
  "    <AppContext.Provider value={{\n      todos, setTodos,"
);

// 4. Add to exportBackupFile
code = code.replace(
  "      syncQueue: [],\n    };",
  "      syncQueue: [],\n      todos,\n    };"
);

// 5. Add to processBackup
code = code.replace(
  "      setInspirationMessages(backup.inspirationMessages);",
  "      setInspirationMessages(backup.inspirationMessages);\n      if (backup.todos) setTodos(backup.todos);"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
