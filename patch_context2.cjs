const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const appImport = `import { App as CapacitorApp } from '@capacitor/app';\n`;
if (!code.includes('@capacitor/app')) {
  code = code.replace(/import \{ storage \} from '\.\.\/services\/storageService';/, appImport + "import { storage } from '../services/storageService';");
}

const urlListener = `
  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
      if (data.url.includes('ags19://lesson/')) {
        const lessonId = data.url.split('ags19://lesson/')[1];
        if (lessonId && lessonId !== 'null') {
           const lesson = lessons.find(l => l.id === lessonId);
           if (lesson) openLessonControl(lesson);
        }
      }
    });
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [lessons]);
`;

code = code.replace(/return \(\n    <AppContext\.Provider/, urlListener + "\n  return (\n    <AppContext.Provider");
fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Patched AppContext.tsx with url listener successfully');
