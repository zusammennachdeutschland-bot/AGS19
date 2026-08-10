import fs from 'fs';
let code = fs.readFileSync('src/components/ScheduleView.tsx', 'utf8');

const oldButton = `<button
                onClick={handleSaveReschedule}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-xs"
              >`;

const newButton = `const isConflict = checkTimeConflict(newDate, newTime, rescheduleLesson?.id);
              <button
                onClick={handleSaveReschedule}
                disabled={isConflict}
                className={\`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-xs \${isConflict ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}\`}
              >`;

code = code.replace(oldButton, newButton.replace('const isConflict = checkTimeConflict(newDate, newTime, rescheduleLesson?.id);\n              ', ''));

fs.writeFileSync('src/components/ScheduleView.tsx', code);
