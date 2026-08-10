import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes("import { checkOverlap }")) {
  code = code.replace("import { INITIAL_TEACHER_PROFILE", "import { checkOverlap } from '../utils/lessonUtils';\nimport { INITIAL_TEACHER_PROFILE");
}

const generateLessonsRegex = /const sessionTime = mergedDayTimes\[dayShort\] \|\| defaultTime \|\| targetGroup\.scheduleTime \|\| '17:00';([\s\S]*?)newLessons\.push\(\{/g;

code = code.replace(generateLessonsRegex, (match, p1) => {
  return `const sessionTime = mergedDayTimes[dayShort] || defaultTime || targetGroup.scheduleTime || '17:00';
          const dummyLesson = { id: 'dummy', date: dateStr, time: sessionTime, durationMinutes: targetGroup.lessonDurationMinutes || 60 };
          
          // Implement overlap detection logic start1 < end2 && start2 < end1 via checkOverlap
          const hasConflict = lessons.some(l => checkOverlap(dummyLesson, l)) || newLessons.some(l => checkOverlap(dummyLesson, l));
          
          if (!hasConflict) {
            newLessons.push({`;
});

// Need to close the if statement for newLessons.push
const pushEndRegex = /address: targetGroup\.address,\n            coordinates: targetGroup\.coordinates,\n          \}\);\n        \}\n      \}\n    \}/g;

code = code.replace(pushEndRegex, `address: targetGroup.address,\n            coordinates: targetGroup.coordinates,\n          });\n          }\n        }\n      }\n    }`);

fs.writeFileSync('src/context/AppContext.tsx', code);
