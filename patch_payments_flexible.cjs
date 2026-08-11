const fs = require('fs');

let content = fs.readFileSync('src/components/PaymentsView.tsx', 'utf-8');

const targetBlock = `          {/* Section: Flexible & Prorated Billing (إنهاء الدورة مبكراً والفوترة الجزئية) */}
          <div className="pt-4 border-t border-surface-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-right dir-rtl">
              <div>
                <h3 className="text-sm font-black text-text-main flex items-center justify-end gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>الفوترة الجزئية وإنهاء الدورة مبكراً (Flexible & Prorated Billing)</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-1">
                  يمكنك إنهاء الدورة الحالية للطلاب مبكراً والمطالبة بالدفع بناءً على الحصص التي حضروها فعلياً.
                </p>
              </div>
            </div>

            {filteredInProgressCycles.length === 0 ? (
              <div className="bg-surface-hover/30 p-4 rounded-lg text-center border border-slate-100 dark:border-surface-border/50">
                <p className="text-xs text-text-muted/70 font-medium">لا يوجد طلاب لديهم حصص مكتملة غير مفوترة حالياً تحت الحد الأقصى للدورة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredInProgressCycles.map((item, idx) => (
                  <div key={\`\${item.id}_\${idx}\`} className="bg-surface border border-surface-border p-4 rounded-lg space-y-3 shadow-xs relative text-right dir-rtl">
                    <div className="flex justify-between items-start flex-row-reverse">
                      <div>
                        <h4 className="text-sm font-bold text-text-main">{item.studentName}</h4>
                        <p className="text-[10px] font-bold text-primary mt-0.5">{item.groupName}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-surface-hover p-2.5 rounded-md border border-slate-100 dark:border-surface-border/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">الحصص المكتملة الآن:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{item.lessonDates.length} من {item.cycleLength}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">التكلفة الجزئية الحالية:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-500 font-mono">{item.amountDue} {currency}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-surface-border/60">
                      <button 
                        onClick={() => setProrateModalItem(item)}
                        className="w-full bg-slate-900 dark:bg-primary-soft hover:bg-slate-800 dark:hover:bg-primary-soft/80 text-white dark:text-primary text-xs font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PieChart className="w-4 h-4" />
                        <span>إنهاء الدورة مبكراً الآن والمحاسبة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>`;

const replacementBlock = `          {/* Section: Flexible & Prorated Billing */}
          <div className="pt-4 border-t border-surface-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-text-main flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{_t('الفوترة الجزئية مرنة', 'Flexible & Prorated Billing', 'Flexible Teilabrechnung')}</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-1">
                  {_t('إنهاء الدورة مبكراً والدفع بناءً على الحصص التي حضروها.', 'End the cycle early and charge based on attended lessons.', 'Diesen Zyklus frühzeitig beenden und nach besuchten Lektionen abrechnen.')}
                </p>
              </div>
            </div>

            {filteredInProgressCycles.length === 0 ? (
              <div className="bg-surface-hover/30 p-4 rounded-lg text-center border border-surface-border">
                <p className="text-xs text-text-muted/70 font-medium">{_t('لا توجد حصص مرنة', 'No flexible cycles available.', 'Keine flexiblen Zyklen verfügbar.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredInProgressCycles.map((item, idx) => (
                  <div key={\`\${item.id}_\${idx}\`} className="bg-surface border border-surface-border p-4 rounded-xl space-y-3 shadow-xs relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-text-main">{item.studentName}</h4>
                        <p className="text-[10px] font-bold text-primary mt-0.5">{item.groupName}</p>
                      </div>
                    </div>
                    
                    <div className="bg-surface-hover p-2.5 rounded-lg border border-surface-border/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-muted font-medium">{_t('الحصص المكتملة:', 'Completed Lessons:', 'Abgeschlossene Lektionen:')}</span>
                        <span className="font-bold text-text-main font-mono">{item.lessonDates.length} / {item.cycleLength}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-medium">{_t('التكلفة الحالية:', 'Current Due:', 'Aktueller Betrag:')}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-500 font-mono">{item.amountDue} {currency}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-surface-border/60">
                      <button 
                        onClick={() => setProrateModalItem(item)}
                        className="w-full bg-slate-900 dark:bg-primary-soft hover:bg-slate-800 dark:hover:bg-primary-soft/80 text-white dark:text-primary text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PieChart className="w-4 h-4" />
                        <span>{_t('إنهاء مبكر ومحاسبة', 'End Early & Bill', 'Frühzeitig beenden & abrechnen')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>`;

content = content.replace(targetBlock, replacementBlock);

fs.writeFileSync('src/components/PaymentsView.tsx', content, 'utf-8');
console.log("Updated PaymentsView flexible block");
