import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace(
  "            sessionNumber: ((lessons.filter(l => l.groupId === groupId).length + newLessons.length) % (targetGroup.sessionCount || 8)) + 1,",
  "            sessionNumber: (((targetGroup.startingSessionNumber || 1) - 1 + lessons.filter(l => l.groupId === groupId).length + newLessons.length) % (targetGroup.sessionCount || 8)) + 1,"
);
fs.writeFileSync('src/context/AppContext.tsx', code);
