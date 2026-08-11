const fs = require('fs');
let content = fs.readFileSync('src/components/TomorrowsLessonsWidget.tsx', 'utf-8');
const target = `{lesson.durationMinutes && (
                      <span className="text-[10px] text-text-muted font-medium truncate">
                        {lesson.durationMinutes} min
                      </span>
                    )}`;
content = content.replace(target, '');
fs.writeFileSync('src/components/TomorrowsLessonsWidget.tsx', content, 'utf-8');
