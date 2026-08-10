import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add initialData to props
code = code.replace(
  "export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {",
  "export const AppProvider: React.FC<{ children: React.ReactNode, initialData: any }> = ({ children, initialData }) => {"
);

// 2. Remove synchronous fresh start (since we do it asynchronously or we can just leave it if it uses localStorage, but better remove or change it)
// Actually we can change localStorage to storage for fresh start, but it's not strictly necessary. Let's comment out the fresh start block for now.
code = code.replace(
  /  if \(typeof window !== 'undefined' && !localStorage\.getItem\('dl_fresh_start_clean_v10'\)\) \{[\s\S]*?localStorage\.setItem\('dl_fresh_start_clean_v10', 'true'\);\n  \}/,
  ""
);

// 3. Replace all useState initializers
// Helper function to replace pattern
function replaceStateInit(varName, storageKey, initialDataFallback) {
  const regexString = `  const \\[${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}\\] = useState<.*?>\\(\\(\\) => \\{[\\s\\S]*?\\}\\);`;
  const regex = new RegExp(regexString);
  const match = code.match(regex);
  if (match) {
    let typeMatch = match[0].match(/useState<(.*?)>\(\(\) => \{/);
    let typeStr = typeMatch ? typeMatch[1] : 'any';
    
    // Specifically handle language and profile cases that have custom logic
    if (varName === 'language') {
      code = code.replace(match[0], `  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = initialData['dl_language'];
    if (saved && ['ar', 'en', 'de'].includes(saved)) return saved as AppLanguage;
    const profileSaved = initialData['dl_profile'];
    if (profileSaved && profileSaved.language && ['ar', 'en', 'de'].includes(profileSaved.language)) {
      return profileSaved.language as AppLanguage;
    }
    return INITIAL_TEACHER_PROFILE.language || 'de';
  });`);
    } else {
      let replacement = `  const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<${typeStr}>(() => {
    const saved = initialData['${storageKey}'];
    return saved !== null && saved !== undefined ? saved : ${initialDataFallback};
  });`;
      code = code.replace(match[0], replacement);
    }
  }
}

replaceStateInit('theme', 'dl_theme', "'light'");
replaceStateInit('todos', 'dl_quick_todos', "[]");
replaceStateInit('profile', 'dl_profile', "INITIAL_TEACHER_PROFILE");
// language handled custom
replaceStateInit('language', 'dl_language', "INITIAL_TEACHER_PROFILE.language || 'de'");

replaceStateInit('groups', 'dl_groups', "INITIAL_GROUPS");
replaceStateInit('students', 'dl_students', "INITIAL_STUDENTS");
replaceStateInit('lessons', 'dl_lessons', "INITIAL_LESSONS");
replaceStateInit('payments', 'dl_payments', "INITIAL_PAYMENT_RECORDS");
replaceStateInit('notifications', 'dl_notifications', "INITIAL_NOTIFICATIONS");

replaceStateInit('inspirationSettings', 'dl_inspiration_settings', "INITIAL_INSPIRATION_SETTINGS");
replaceStateInit('inspirationMessages', 'dl_inspiration_messages', "INITIAL_INSPIRATION_MESSAGES");

replaceStateInit('lastBackupTime', 'dl_last_backup_time', "new Date().toISOString()");
replaceStateInit('dismissedDashboardLessonIds', 'dl_dismissed_dashboard_lessons', "[]");
replaceStateInit('recentlyDeleted', 'dl_recently_deleted', "{ students: [], groups: [], lessons: [] }");
replaceStateInit('activeLessonSession', 'dl_active_lesson_session', "null");
replaceStateInit('notifiedLessonAlerts', 'dl_notified_lesson_alerts', "[]");

// 4. Replace localStorage setItem in useEffects with storage.setItem
code = code.replace(/localStorage\.setItem/g, "storage.setItem");
code = code.replace(/localStorage\.getItem/g, "storage.getItem");
code = code.replace(/localStorage\.removeItem/g, "storage.removeItem");

// We need to import storage
code = code.replace(
  "import { clearActiveLessonNotification } from '../services/notificationService';",
  "import { clearActiveLessonNotification } from '../services/notificationService';\nimport { storage } from '../services/storageService';"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
