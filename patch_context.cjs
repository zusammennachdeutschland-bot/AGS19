const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const importStatement = `import { syncTodayLessonsToWidget } from '../services/widgetService';\n`;

// Add import after other imports
code = code.replace(/import { translations, TranslationKey } from '\.\.\/i18n\/translations';/, "import { translations, TranslationKey } from '../i18n/translations';\n" + importStatement);

// Find the useEffect that depends on lessons
const oldUseEffect = `  useEffect(() => {
    const timer = setTimeout(() => {
      rebuildAllNotificationSchedules(notificationSettings, lessons, groups, students, payments)
        .then(() => getPendingScheduledNotifications().then(setPendingScheduledNotifications))
        .catch(err => console.warn('Auto notification schedule rebuild error:', err));
    }, 1500);
    return () => clearTimeout(timer);
  }, [lessons.length, students.length, groups.length]);`;

const newUseEffect = `  useEffect(() => {
    const timer = setTimeout(() => {
      rebuildAllNotificationSchedules(notificationSettings, lessons, groups, students, payments)
        .then(() => getPendingScheduledNotifications().then(setPendingScheduledNotifications))
        .catch(err => console.warn('Auto notification schedule rebuild error:', err));
        
      syncTodayLessonsToWidget(lessons).catch(err => console.warn('Widget sync error:', err));
    }, 1500);
    return () => clearTimeout(timer);
  }, [lessons, students.length, groups.length]);`;

if (code.includes(oldUseEffect)) {
  code = code.replace(oldUseEffect, newUseEffect);
  fs.writeFileSync('src/context/AppContext.tsx', code);
  console.log('Patched successfully');
} else {
  // If exact match fails, let's just append a new useEffect right before `return (`
  console.log('Falling back to append new useEffect');
  const fallbackMatch = `  return (\n    <AppContext.Provider`;
  const fallbackUseEffect = `  useEffect(() => {
    syncTodayLessonsToWidget(lessons).catch(console.warn);
  }, [lessons]);\n\n`;
  code = code.replace(fallbackMatch, fallbackUseEffect + fallbackMatch);
  fs.writeFileSync('src/context/AppContext.tsx', code);
}
