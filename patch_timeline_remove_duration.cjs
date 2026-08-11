const fs = require('fs');
let content = fs.readFileSync('src/components/TodaysProgressTimeline.tsx', 'utf-8');
const target = `{lesson.durationMinutes && (
                          <>
                            <span>•</span>
                            <span>{lesson.durationMinutes} min</span>
                          </>
                        )}`;
content = content.replace(target, '');
fs.writeFileSync('src/components/TodaysProgressTimeline.tsx', content, 'utf-8');
