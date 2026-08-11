const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleView.tsx', 'utf-8');
const target = `{lesson.durationMinutes && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-slate-600 dark:text-slate-400">
                                  {lesson.durationMinutes} min
                                </span>
                              </>
                            )}`;
content = content.replace(target, '');
fs.writeFileSync('src/components/ScheduleView.tsx', content, 'utf-8');
