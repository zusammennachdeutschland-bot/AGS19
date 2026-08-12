import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  parseAiImportText, 
  SAMPLE_IMPORT_TEMPLATE, 
  SAMPLE_MULTI_SCHEDULE_TEMPLATE, 
  AI_PROMPT_TEMPLATE_AR,
  AI_PROMPT_TEMPLATE_EN,
  AiImportResult 
} from '../utils/aiImportParser';
import { formatGroupScheduleDisplay } from '../utils/scheduleUtils';
import { 
  Bot, Sparkles, Copy, Check, CheckCircle2, AlertTriangle, X, 
  Users, Calendar, Clock, DollarSign, ArrowRight, ShieldCheck, FileText, ChevronRight, MessageSquareCode
} from 'lucide-react';
import { Group } from '../types';

interface AiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup?: (group: Group) => void;
}

export const AiImportModal: React.FC<AiImportModalProps> = ({
  isOpen,
  onClose,
  onSelectGroup
}) => {
  const { addGroup, addStudent, generateGroupScheduleLessons, t, language } = useApp();

  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };


  const [importText, setImportText] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [importedGroup, setImportedGroup] = useState<Group | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const parseResult: AiImportResult = parseAiImportText(importText);

  const handleCopySample = (template: string, type: string) => {
    navigator.clipboard.writeText(template);
    setImportText(template);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmImport = () => {
    if (!parseResult.isValid || !parseResult.group) return;

    const { group, students } = parseResult;

    // Determine session count and package prices based on payment_type and lesson_price
    let sessionCount = 4;
    let pricePerSession = group.lesson_price ?? group.payment_amount;
    let monthlyPackagePrice = group.payment_amount;

    if (group.payment_type === 'per_lesson') {
      sessionCount = 1;
      pricePerSession = group.lesson_price ?? group.payment_amount;
      monthlyPackagePrice = pricePerSession * 4;
    } else if (group.payment_type === '4_lessons') {
      sessionCount = 4;
      pricePerSession = group.lesson_price ?? Math.round(group.payment_amount / 4);
      monthlyPackagePrice = group.payment_amount;
    } else if (group.payment_type === '8_lessons') {
      sessionCount = 8;
      pricePerSession = group.lesson_price ?? Math.round(group.payment_amount / 8);
      monthlyPackagePrice = group.payment_amount;
    } else if (group.payment_type === '12_lessons') {
      sessionCount = 12;
      pricePerSession = group.lesson_price ?? Math.round(group.payment_amount / 12);
      monthlyPackagePrice = group.payment_amount;
    } else if (group.payment_type === 'monthly') {
      sessionCount = 8;
      pricePerSession = group.lesson_price ?? Math.round(group.payment_amount / 8);
      monthlyPackagePrice = group.payment_amount;
    }

    // Standardize group paymentCycle so UI options are selected
    const selectedPaymentCycle = group.payment_type === 'per_lesson' ? 'per_lesson' : 'monthly';

    // 1. Create Group with full multi-schedule & payment fields
    const newGroup = addGroup({
      name: group.name,
      grade: group.grade,
      type: group.type,
      scheduleDays: group.days,
      scheduleTime: group.time,
      schedules: group.schedules,
      scheduleDayTimes: group.dayTimes,
      paymentCycle: selectedPaymentCycle,
      sessionCount,
      monthlyPackagePrice,
      pricePerSession,
      zoomLink: group.type === 'online' ? (group.zoom_link || '') : undefined,
      address: group.type === 'offline' ? (group.address || '') : undefined,
      color: 'indigo'
    });

    // 2. Create Students atomically associated with group
    students.forEach((st) => {
      addStudent({
        name: st.name,
        studentPhone: st.studentPhone || '',
        parentPhone: st.parentPhone,
        parentName: '',
        groupId: newGroup.id,
        grade: group.grade
      });
    });

    // 3. Auto-generate schedule lessons with independent day times
    setTimeout(() => {
      generateGroupScheduleLessons(newGroup.id, group.days, group.time, 4, group.dayTimes, newGroup);
    }, 250);

    setImportedGroup(newGroup);
    setImportedCount(students.length);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setImportText('');
    setIsSuccess(false);
    setImportedGroup(null);
    setImportedCount(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div 
      onClick={handleClose} 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm: pt-[max(24px,env(safe-area-inset-top,24px))] overflow-y-auto font-sans p-0 sm:p-4 pb-0"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-2xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
              <Bot className="w-5 h-5 text-primary-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  {_t('استيراد مجموعة + طلاب (AI Import)', 'Import Group + Students (AI Template)')}
                </h3>
                <span className="bg-primary/30 text-primary-soft border border-primary-border text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md">
                  AI Ready
                </span>
              </div>
              <p className="text-xs text-primary-soft/80">
                {_t('أنشئ المجموعة وجميع الطلاب دفعة واحدة بنص ذكي', 'Create an entire group and all students in one step')}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-white/80 hover:text-white hover:bg-surface/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-4 overflow-y-auto space-y-3 flex-1">

          {isSuccess ? (
            /* SUCCESS RESULT VIEW */
            <div className="py-4 space-y-4 text-center animate-fade-in">
              <div className="w-16 h-16 bg-primary-soft dark:bg-primary-soft text-primary dark:text-primary rounded-full flex items-center justify-center mx-auto shadow-lg ring-8 ring-primary/30 dark:ring-primary/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-text-main">
                  {_t('تم استيراد المجموعة والطلاب بنجاح!', 'Group & Students Imported Successfully!')}
                </h4>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  {language === 'ar' 
                    ? `تم إنشاء المجموعة "${importedGroup?.name}" وإضافة ${importedCount} طالب مع جدول المواعيد تلقائياً.` 
                    : `Created group "${importedGroup?.name}" and added ${importedCount} students with schedule successfully.`}
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-surface-hover/60 border border-surface-border dark:border-surface-border-soft/80 rounded-xl p-4 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-surface-border dark:border-surface-border-soft pb-2">
                  <span className="text-slate-500 font-bold">{_t('اسم المجموعة:', 'Group Name:')}</span>
                  <span className="font-black text-text-main">{importedGroup?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-surface-border dark:border-surface-border-soft pb-2">
                  <span className="text-slate-500 font-bold">{_t('الصف / المرحلة:', 'Grade Level:')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{importedGroup?.grade}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-surface-border dark:border-surface-border-soft pb-2">
                  <span className="text-slate-500 font-bold">{_t('عدد الطلاب:', 'Students Imported:')}</span>
                  <span className="font-extrabold text-primary dark:text-primary">{importedCount} {_t('طلاب', 'Students')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">{_t('المواعيد:', 'Schedule:')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">{importedGroup?.scheduleDays?.join(', ')} @ {importedGroup?.scheduleTime}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {importedGroup && onSelectGroup && (
                  <button
                    onClick={() => {
                      onSelectGroup(importedGroup);
                      handleClose();
                    }}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    <span>{_t('فتح ملف المجموعة', 'View Group Profile')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
                >
                  {_t('إغلاق', 'Close')}
                </button>
              </div>
            </div>
          ) : (
            /* PASTE & PREVIEW FORM VIEW */
            <>
              {/* Instructions Banner */}
              <div className="bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-xl p-3.5 sm:p-4 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 font-bold text-primary dark:text-primary">
                    <Bot className="w-4 h-4 text-primary dark:text-primary shrink-0" />
                    <span>{_t('أوامر للذكاء الاصطناعي (AI Prompt Orders)', 'Copy Prompt / Orders for AI')}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleCopySample(language === 'ar' ? AI_PROMPT_TEMPLATE_AR : AI_PROMPT_TEMPLATE_EN, 'prompt')}
                      className="bg-primary hover:bg-primary-hover text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-xs shrink-0 active:scale-95"
                    >
                      {copied === 'prompt' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{_t('تم نسخ الأوامر!', 'Prompt Copied!')}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquareCode className="w-3.5 h-3.5 text-primary-soft" />
                          <span>{_t('نسخ أوامر ChatGPT / Gemini', 'Copy AI Prompt Orders')}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopySample(SAMPLE_MULTI_SCHEDULE_TEMPLATE, 'multi')}
                      className="bg-surface dark:bg-primary-soft hover:bg-primary-soft dark:hover:bg-primary-hover border border-primary-border dark:border-primary-border text-primary dark:text-primary font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] shadow-2xs shrink-0"
                    >
                      {copied === 'multi' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>{_t('تم النسخ!', 'Copied!')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>{_t('تجربة نموذج جاهز', 'Sample Data')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {_t('اضغط على "نسخ أوامر ChatGPT / Gemini" والصقها في برنامج الذكاء الاصطناعي مع قائمة أسماء طلابك وملاحظات المجموعة، ثم انسخ الرد والصقه في الصندوق بالأسفل مباشرة.', 'Click "Copy AI Prompt Orders" and paste it into ChatGPT/Gemini along with your raw group list/notes. Then copy the AI response and paste it into the box below.')}
                </p>
              </div>

              {/* Textarea Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-text-main flex items-center justify-between">
                  <span>{_t('النص المستورد من الذكاء الاصطناعي:', 'AI Generated Text:')}</span>
                  <span className="text-[11px] text-text-muted/70 font-normal">
                    {_t('يدعم التحقق الفوري بدون أخطاء', 'Strict Zero-Data-Loss Validation')}
                  </span>
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`[GROUP]\nname=Grade 5 A\ngrade=Grade 5\ntype=offline\ndays=Sunday,Wednesday\ntime=18:00\npayment_type=every_4_lessons\npayment_amount=400\n\n[STUDENTS]\nAhmed Mohamed|01012345678\nMohamed Ali|01112345679`}
                  rows={8}
                  className="w-full bg-background dark:bg-background border border-slate-300 dark:border-surface-border rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y"
                />
              </div>

              {/* VALIDATION RESULTS & PREVIEW AREA */}
              {importText.trim() && (
                <div className="space-y-4 pt-2 border-t border-surface-border animate-fade-in">
                  
                  {/* Validation Error Box */}
                  {!parseResult.isValid && parseResult.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          {language === 'ar' 
                            ? `تم إيقاف الاستيراد - يوجد ${parseResult.errors.length} خطأ في البيانات:` 
                            : `Import Blocked - Found ${parseResult.errors.length} validation issue(s):`}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-red-600 dark:text-red-300 space-y-1 pl-1">
                        {parseResult.errors.map((err, idx) => (
                          <li key={idx} className="leading-tight">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Valid Status Badge */}
                  {parseResult.isValid && (
                    <div className="bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-xl p-3 text-xs flex items-center gap-2 text-primary dark:text-primary font-bold">
                      <ShieldCheck className="w-4 h-4 text-primary dark:text-primary shrink-0" />
                      <span>
                        {_t('✓ البيانات سليمة 100% ومجهزة للاستيراد الآمن', '✓ All fields validated successfully. Ready for import.')}
                      </span>
                    </div>
                  )}

                  {/* PREVIEW CARDS */}
                  {parseResult.group && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{_t('معاينة البيانات قبل الاعتماد:', 'Data Preview Before Import:')}</span>
                        <span className="text-slate-500 text-[11px] font-normal">
                          {parseResult.students.length} {_t('طلاب', 'students')}
                        </span>
                      </h4>

                      {/* Group Meta Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-hover/80 p-3 rounded-xl text-xs">
                        <div>
                          <div className="text-[10px] text-text-muted font-medium">
                            {_t('اسم المجموعة', 'Group Name')}
                          </div>
                          <div className="font-black text-text-main truncate">
                            {parseResult.group.name || '—'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted font-medium">
                            {_t('الصف والنوع', 'Grade & Type')}
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                            {parseResult.group.grade} • {parseResult.group.type}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted font-medium">
                            {_t('المواعيد', 'Days & Time')}
                          </div>
                          <div className="font-bold text-primary dark:text-primary truncate" title={formatGroupScheduleDisplay(parseResult.group, language)}>
                            {formatGroupScheduleDisplay(parseResult.group, language)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted font-medium">
                            {parseResult.group.type === 'online' ? _t('رابط زووم', 'Zoom Link') : _t('العنوان / المكان', 'Address')}
                          </div>
                          <div className="font-bold text-primary dark:text-primary truncate" title={parseResult.group.type === 'online' ? parseResult.group.zoom_link : parseResult.group.address}>
                            {parseResult.group.type === 'online' ? (parseResult.group.zoom_link || '—') : (parseResult.group.address || '—')}
                          </div>
                        </div>
                      </div>

                      {/* Student Table Preview */}
                      {parseResult.students.length > 0 && (
                        <div className="border border-surface-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          <table className="w-full text-left rtl:text-right text-xs">
                            <thead className="bg-surface-hover/90 text-slate-600 dark:text-slate-300 font-bold sticky top-0 border-b border-surface-border dark:border-surface-border-soft">
                              <tr>
                                <th className="p-2.5 w-10 text-center">#</th>
                                <th className="p-2.5">{_t('اسم الطالب', 'Student Name')}</th>
                                <th className="p-2.5">{_t('هاتف ولي الأمر (مطلوب)', 'Parent Phone (Req)')}</th>
                                <th className="p-2.5">{_t('هاتف الطالب (اختياري)', 'Student Phone (Opt)')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-surface">
                              {parseResult.students.map((st, i) => (
                                <tr key={i} className="hover:bg-background dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="p-2 text-center text-text-muted/70 text-[11px]">{i + 1}</td>
                                  <td className="p-2 font-extrabold">{st.name}</td>
                                  <td className="p-2 font-mono font-bold text-primary">{st.parentPhone}</td>
                                  <td className="p-2 font-mono text-text-muted">{st.studentPhone || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 bg-background border-t border-surface-border flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-surface-border-soft text-text-main font-bold text-xs hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {_t('إلغاء', 'Cancel')}
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={!parseResult.isValid || !importText.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                parseResult.isValid && importText.trim()
                  ? 'bg-gradient-to-r from-primary to-primary-hover hover:from-primary hover:to-primary-hover text-white active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-text-muted/70 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{_t('تأكيد الاستيراد (Confirm Import)', 'Confirm Import')}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
