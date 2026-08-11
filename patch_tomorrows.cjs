const fs = require('fs');

let content = fs.readFileSync('src/components/TomorrowsLessonsWidget.tsx', 'utf-8');

const target = `                {/* Left: Time & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1 text-text-main text-xs font-mono font-bold shrink-0 bg-surface px-2 py-1 rounded-lg border border-surface-border shadow-2xs">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{lesson.time}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </span>
                </div>`;

const replacement = `                {/* Left: Time & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1 text-text-main text-xs font-mono font-bold shrink-0 bg-surface px-2 py-1 rounded-lg border border-surface-border shadow-2xs">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{lesson.time}</span>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {displayName}
                    </span>
                    {lesson.durationMinutes && (
                      <span className="text-[10px] text-text-muted font-medium truncate">
                        {lesson.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/TomorrowsLessonsWidget.tsx', content, 'utf-8');
console.log("Tomorrows patched successfully.");
