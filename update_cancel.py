import re

with open('src/components/LessonControlModal.tsx', 'r') as f:
    content = f.read()

start_str = "{showCancelPrompt && ("
end_str = ")}\n\n              {/* AFTER ENDING LESSON: REPORT FORM */}"

start_idx = content.find(start_str)
end_idx = content.find("{/* AFTER ENDING LESSON: REPORT FORM */}")

if start_idx != -1 and end_idx != -1:
    new_cancel = """{showCancelPrompt && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-right space-y-3 animate-fade-in dir-rtl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>تأكيد إلغاء الحصة (Cancel Lesson)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(false)}
                        className="text-red-600/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-red-800 dark:text-red-300">
                      هل أنت متأكد من إلغاء هذه الحصة؟ سيتم توثيق السبب وحفظ الحصة كـ <strong>ملغاة</strong>.
                    </p>

                    <textarea
                      rows={2}
                      value={cancelReasonNote}
                      onChange={(e) => setCancelReasonNote(e.target.value)}
                      placeholder="أدخل سبب إلغاء الحصة (اختياري)..."
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        تراجع
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          cancelLesson(selectedLesson.id, cancelReasonNote);
                          setShowCancelPrompt(false);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>نعم، إلغاء الحصة</span>
                      </button>
                    </div>
                  </div>
                )}

              """
    
    new_content = content[:start_idx] + new_cancel + content[end_idx:]
    with open('src/components/LessonControlModal.tsx', 'w') as f:
        f.write(new_content)
    print("Success cancel block")
else:
    print("Could not find boundaries")
