import re

with open('src/components/LessonControlModal.tsx', 'r') as f:
    content = f.read()

# I will replace the timer section. Let's find the boundaries.
start_marker = "{/* DURING LESSON SECTION: LIVE TIMER & LESSON ACTIONS - ALWAYS VISIBLE */}"
end_marker = "{/* CANCELLATION PROMPT BOX */}"

new_timer = """{/* DURING LESSON SECTION: LIVE TIMER & LESSON ACTIONS - ALWAYS VISIBLE */}
              <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-6 text-center relative overflow-hidden">
                {/* Background ambient glow when timer is running */}
                {isTimerRunning && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[60px] pointer-events-none animate-pulse" />
                )}
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                    <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-primary animate-pulse' : 'text-text-muted/70'}`} />
                    <span>Live Lesson Timer</span>
                  </span>

                  <span className="text-[10px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2 py-1 rounded-md border border-primary-border/30">
                    المدة: {selectedLesson.durationMinutes} دقيقة
                  </span>
                </div>

                {/* Stopwatch Display */}
                <div className="py-6 relative z-10">
                  <div className="flex justify-center">
                    <div className="relative">
                      <span className={`text-6xl sm:text-7xl font-black font-mono tracking-tight transition-all duration-300 ${isTimerRunning ? 'text-primary drop-shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatTimer(timerSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timer & Main Action Buttons */}
                <div className="flex flex-col gap-2.5 relative z-10">
                  <div className="grid grid-cols-2 gap-2.5">
                    {!isTimerRunning ? (
                      <button
                        type="button"
                        onClick={handleStartLesson}
                        className="col-span-2 sm:col-span-1 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{timerSeconds === 0 ? 'بدء الحصة (Start)' : 'استئناف (Resume)'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseLesson}
                        className="col-span-2 sm:col-span-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-white" />
                        <span>إيقاف مؤقت (Pause)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleEndLesson}
                      className={`${isTimerRunning ? 'col-span-2 sm:col-span-1' : 'col-span-2 sm:col-span-1'} bg-surface-hover hover:bg-slate-100 dark:hover:bg-slate-800 text-text-main font-bold text-sm px-5 py-3.5 rounded-xl border border-surface-border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
                    >
                      <Square className="w-4 h-4 text-text-main" />
                      <span>إنهاء (End Lesson)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(!showReportForm)}
                      className="bg-surface-hover hover:bg-slate-100 dark:hover:bg-slate-800 text-text-main font-bold text-xs px-4 py-3 rounded-xl border border-surface-border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-text-main" />
                      <span>{showReportForm ? 'إخفاء التقرير (Hide)' : 'التقرير (Report)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(!showCancelPrompt)}
                      className="bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Ban className="w-4 h-4 text-red-500 dark:text-red-400" />
                      <span>إلغاء (Cancel)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CANCELLATION PROMPT BOX */}"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_timer + content[end_idx + len(end_marker):]
    with open('src/components/LessonControlModal.tsx', 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed to find markers")
