import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
import { migrateFromLocalStorageToIndexedDB } from './services/migrationService';
import { storage } from './services/storageService';
import { useEffect } from 'react';

export default function App() {
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      await migrateFromLocalStorageToIndexedDB();
      const keys = [
        'dl_theme', 'dl_quick_todos', 'dl_language', 'dl_profile',
        'dl_groups', 'dl_students', 'dl_lessons', 'dl_payments',
        'dl_notifications', 'dl_inspiration_settings', 'dl_inspiration_messages',
        'dl_last_backup_time', 'dl_dismissed_dashboard_lessons', 'dl_recently_deleted',
        'dl_active_lesson_session', 'dl_notified_lesson_alerts'
      ];
      
      const data: any = {};
      for (const key of keys) {
        data[key] = await storage.getItem(key);
      }
      setInitialData(data);
    }
    loadData();
  }, []);

  if (!initialData) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><div className="animate-pulse text-slate-500">Lade Daten...</div></div>;
  }

  return (
    <AppProvider initialData={initialData}>
      <MainApp />
    </AppProvider>
  );
}
`;

code = code.replace(
  /export default function App\(\) \{[\s\S]*\}\n$/,
  replacement
);

fs.writeFileSync('src/App.tsx', code);
