import fs from 'fs';
let code = fs.readFileSync('src/components/LessonControlModal.tsx', 'utf8');

code = code.replace(/  const timerStartKey = (.*?);\n/g, '');
code = code.replace(/  const timerAccumulatedKey = (.*?);\n/g, '');

fs.writeFileSync('src/components/LessonControlModal.tsx', code);
