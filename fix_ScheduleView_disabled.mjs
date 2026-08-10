import fs from 'fs';
let code = fs.readFileSync('src/components/ScheduleView.tsx', 'utf8');

code = code.replace(/isConflict/g, "checkTimeConflict(newDate, newTime, rescheduleLesson?.id)");

fs.writeFileSync('src/components/ScheduleView.tsx', code);
