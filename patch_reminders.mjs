import fs from 'fs';
let code = fs.readFileSync('src/hooks/useLessonReminders.ts', 'utf8');
code = code.replace(/localStorage\.getItem/g, "sessionStorage.getItem");
code = code.replace(/localStorage\.setItem/g, "sessionStorage.setItem");
fs.writeFileSync('src/hooks/useLessonReminders.ts', code);
