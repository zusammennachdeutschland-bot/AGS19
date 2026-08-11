const fs = require('fs');
let content = fs.readFileSync('src/components/SessionHistoryView.tsx', 'utf-8');
const target = `{lesson.durationMinutes && (
                        <span className="text-text-muted/70">• {lesson.durationMinutes} min</span>
                      )}`;
content = content.replace(target, '');
fs.writeFileSync('src/components/SessionHistoryView.tsx', content, 'utf-8');
