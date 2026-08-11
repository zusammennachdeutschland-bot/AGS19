const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleView.tsx', 'utf-8');

const target = `                            <span className="font-bold text-primary dark:text-primary">
                              Session {lesson.sessionNumber}/{lesson.totalSessionsInPackage}
                            </span>
                            <span>•</span>`;

const replacement = `                            <span className="font-bold text-primary dark:text-primary">
                              Session {lesson.sessionNumber}/{lesson.totalSessionsInPackage}
                            </span>
                            {lesson.durationMinutes && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-slate-600 dark:text-slate-400">
                                  {lesson.durationMinutes} min
                                </span>
                              </>
                            )}
                            <span>•</span>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/ScheduleView.tsx', content, 'utf-8');
console.log("Schedule patched successfully.");
