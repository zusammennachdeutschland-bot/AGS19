const fs = require('fs');

let content = fs.readFileSync('src/components/SessionHistoryView.tsx', 'utf-8');

const target = `                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                      <span>{t('lesson_session_num')} ({lesson.sessionNumber || 1} / {lesson.totalSessionsInPackage || 8})</span>
                      {lesson.studentName && isGroup && (
                        <span className="text-text-muted/70">• {t('daily_stats_student')}: {lesson.studentName}</span>
                      )}
                    </div>`;

const replacement = `                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                      <span>{t('lesson_session_num')} ({lesson.sessionNumber || 1} / {lesson.totalSessionsInPackage || 8})</span>
                      {lesson.durationMinutes && (
                        <span className="text-text-muted/70">• {lesson.durationMinutes} min</span>
                      )}
                      {lesson.studentName && isGroup && (
                        <span className="text-text-muted/70">• {t('daily_stats_student')}: {lesson.studentName}</span>
                      )}
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/SessionHistoryView.tsx', content, 'utf-8');
console.log("History patched successfully.");
