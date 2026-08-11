const fs = require('fs');

let content = fs.readFileSync('src/components/TodaysProgressTimeline.tsx', 'utf-8');

const target = `                      </h4>
                    </div>`;

const replacement = `                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-1 flex-wrap font-medium">
                        {lesson.grade && <span>{lesson.grade}</span>}
                        {lesson.grade && <span>•</span>}
                        <span className="font-semibold text-primary dark:text-primary">
                          Session {lesson.sessionNumber}/{lesson.totalSessionsInPackage}
                        </span>
                        <span>•</span>
                        {lesson.type === 'online' ? (
                          <span className="flex items-center gap-0.5 text-primary dark:text-primary">
                            <Video className="w-2.5 h-2.5" /> {t('next_action_online')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-primary dark:text-primary">
                            <MapPin className="w-2.5 h-2.5" /> {t('next_action_offline')}
                          </span>
                        )}
                        {lesson.durationMinutes && (
                          <>
                            <span>•</span>
                            <span>{lesson.durationMinutes} min</span>
                          </>
                        )}
                      </div>
                    </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/TodaysProgressTimeline.tsx', content, 'utf-8');
console.log("Timeline patched successfully.");
