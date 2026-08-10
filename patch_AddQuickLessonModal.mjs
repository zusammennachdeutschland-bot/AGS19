import fs from 'fs';
let code = fs.readFileSync('src/components/AddQuickLessonModal.tsx', 'utf8');

// add checkOverlap
if (!code.includes("import { checkOverlap }")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { checkOverlap } from '../utils/lessonUtils';");
}

// pull in lessons from useApp
code = code.replace(
  "const { addQuickLesson, profile, t } = useApp();",
  "const { addQuickLesson, profile, lessons, t } = useApp();"
);

// add hasConflict logic
const hasConflictCode = `
  const checkConflict = (checkTime: string) => {
    const dummyLesson = { id: 'dummy', date, time: checkTime, durationMinutes: 60 };
    return lessons.some(l => checkOverlap(dummyLesson, l));
  };
  const hasConflict = checkConflict(time);
`;

code = code.replace(
  "const handleSubmit = (e: React.FormEvent) => {",
  hasConflictCode + "\n  const handleSubmit = (e: React.FormEvent) => {"
);

// Show warning in UI
const warningUI = `
          {hasConflict && (
            <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 p-3 rounded-xl text-sm flex items-start gap-2 border border-amber-200 dark:border-amber-800">
              <Zap className="w-5 h-5 flex-shrink-0" />
              <p>Achtung: Es gibt eine Überschneidung mit einer bestehenden Lektion um diese Zeit.</p>
            </div>
          )}
`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-4">[\s\S]*?<div className="space-y-1.5">[\s\S]*?<label[\s\S]*?Date[\s\S]*?<\/div>[\s\S]*?<div className="space-y-1.5">[\s\S]*?<label[\s\S]*?Time[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  (match) => match + warningUI
);

fs.writeFileSync('src/components/AddQuickLessonModal.tsx', code);
