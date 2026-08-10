import fs from 'fs';
let code = fs.readFileSync('src/components/AddLessonModal.tsx', 'utf8');

if (!code.includes("import { checkOverlap }")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { checkOverlap } from '../utils/lessonUtils';");
}

const oldCheck = `  // CONFLICT DETECTION ALGORITHM:
  // Check if chosen date + time overlaps with any existing lesson
  const checkConflict = (checkTime: string) => {
    return lessons.some(l => {
      if (l.date !== date) return false;
      return l.time === checkTime;
    });
  };`;

const newCheck = `  // CONFLICT DETECTION ALGORITHM:
  // Check if chosen date + time overlaps with any existing lesson
  const checkConflict = (checkTime: string) => {
    const dummyLesson = { id: 'dummy', date, time: checkTime, durationMinutes };
    return lessons.some(l => checkOverlap(dummyLesson, l));
  };`;

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('src/components/AddLessonModal.tsx', code);
