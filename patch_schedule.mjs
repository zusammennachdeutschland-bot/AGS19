import fs from 'fs';
let code = fs.readFileSync('src/components/ScheduleView.tsx', 'utf8');

const replacement = `  const hasConflict = (lessonId: string) => {
    return dayConflicts.includes(lessonId);
  };

  const checkTimeConflict = (date: string, time: string, excludeLessonId?: string) => {
    const dummy = { id: 'dummy', date, time, durationMinutes: 60 };
    return lessons.some(l => l.id !== excludeLessonId && checkOverlap(dummy, l));
  };`;

code = code.replace(/  const hasConflict = \(lessonId: string\) => \{\n    return dayConflicts\.includes\(lessonId\);\n  \};/, replacement);

code = code.replace(/hasConflict\(l\.date, l\.time\)/g, 'hasConflict(l.id)');
code = code.replace(/hasConflict\(lesson\.date, lesson\.time\)/g, 'hasConflict(lesson.id)');
code = code.replace(/hasConflict\(newDate, newTime\)/g, 'checkTimeConflict(newDate, newTime, rescheduleLesson?.id)');

fs.writeFileSync('src/components/ScheduleView.tsx', code);
