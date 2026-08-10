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
      color: 'indigo'
    });

    // 2. Create Students atomically associated with group
    students.forEach((st) => {
      addStudent({
        name: st.name,
        studentPhone: st.phone,
        parentPhone: st.phone,
        parentName: '',
        groupId: newGroup.id,
        grade: group.grade
      });
    });

    // 3. Auto-generate schedule lessons with independent day times
    generateGroupScheduleLessons(newGroup.id, group.days, group.time, 4, group.dayTimes, newGroup);

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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pt-[max(24px,env(safe-area-inset-top,24px))] overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
              <Bot className="w-5 h-5 text-purple-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  {language === 'ar' ? 'استيراد مجموعة + طلاب (AI Import)' : 'Import Group + Students (AI Template)'}
                </h3>
                <span className="bg-purple-500/30 text-purple-100 border border-purple-300/30 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md">
                  AI Ready
                </span>
              </div>
              <p className="text-xs text-purple-100/80">
                {language === 'ar' ? 'أنشئ المجموعة وجميع الطلاب دفعة واحدة بنص ذكي' : 'Create an entire group and all students in one step'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {isSuccess ? (
            /* SUCCESS RESULT VIEW */
            <div className="py-6 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تم استيراد المجموعة والطلاب بنجاح!' : 'Group & Students Imported Successfully!'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {language === 'ar' 
                    ? `تم إنشاء المجموعة "${importedGroup?.name}" وإضافة ${importedCount} طالب مع جدول المواعيد تلقائياً.` 
                    : `Created group "${importedGroup?.name}" and added ${importedCount} students with schedule successfully.`}
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-bold">{language === 'ar' ? 'اسم المجموعة:' : 'Group Name:'}</span>
                  <span className="font-black text-slate-900 dark:text-white">{importedGroup?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-bold">{language === 'ar' ? 'الصف / المرحلة:' : 'Grade Level:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{importedGroup?.grade}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-bold">{language === 'ar' ? 'عدد الطلاب:' : 'Students Imported:'}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{importedCount} {language === 'ar' ? 'طلاب' : 'Students'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">{language === 'ar' ? 'المواعيد:' : 'Schedule:'}</span>
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
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    <span>{language === 'ar' ? 'فتح ملف المجموعة' : 'View Group Profile'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            /* PASTE & PREVIEW FORM VIEW */
            <>
              {/* Instructions Banner */}
              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3.5 sm:p-4 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>{language === 'ar' ? 'أوامر للذكاء الاصطناعي (AI Prompt Orders)' : 'Copy Prompt / Orders for AI'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleCopySample(language === 'ar' ? AI_PROMPT_TEMPLATE_AR : AI_PROMPT_TEMPLATE_EN, 'prompt')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-xs shrink-0 active:scale-95"
                    >
                      {copied === 'prompt' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{language === 'ar' ? 'تم نسخ الأوامر!' : 'Prompt Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquareCode className="w-3.5 h-3.5 text-purple-100" />
                          <span>{language === 'ar' ? 'نسخ أوامر ChatGPT / Gemini' : 'Copy AI Prompt Orders'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopySample(SAMPLE_MULTI_SCHEDULE_TEMPLATE, 'multi')}
                      className="bg-white dark:bg-indigo-900/80 hover:bg-indigo-100 dark:hover:bg-indigo-800 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] shadow-2xs shrink-0"
                    >
                      {copied === 'multi' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span>{language === 'ar' ? 'تجربة نموذج جاهز' : 'Sample Data'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {language === 'ar' 
                    ? 'اضغط على "نسخ أوامر ChatGPT / Gemini" والصقها في برنامج الذكاء الاصطناعي مع قائمة أسماء طلابك وملاحظات المجموعة، ثم انسخ الرد والصقه في الصندوق بالأسفل مباشرة.'
                    : 'Click "Copy AI Prompt Orders" and paste it into ChatGPT/Gemini along with your raw group list/notes. Then copy the AI response and paste it into the box below.'}
                </p>
              </div>

              {/* Textarea Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{language === 'ar' ? 'النص المستورد من الذكاء الاصطناعي:' : 'AI Generated Text:'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {language === 'ar' ? 'يدعم التحقق الفوري بدون أخطاء' : 'Strict Zero-Data-Loss Validation'}
                  </span>
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`[GROUP]\nname=Grade 5 A\ngrade=Grade 5\ntype=offline\ndays=Sunday,Wednesday\ntime=18:00\npayment_type=every_4_lessons\npayment_amount=400\n\n[STUDENTS]\nAhmed Mohamed|01012345678\nMohamed Ali|01112345679`}
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
                />
              </div>

              {/* VALIDATION RESULTS & PREVIEW AREA */}
              {importText.trim() && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                  
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
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {language === 'ar' 
                          ? '✓ البيانات سليمة 100% ومجهزة للاستيراد الآمن' 
                          : '✓ All fields validated successfully. Ready for import.'}
                      </span>
                    </div>
                  )}

                  {/* PREVIEW CARDS */}
                  {parseResult.group && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{language === 'ar' ? 'معاينة البيانات قبل الاعتماد:' : 'Data Preview Before Import:'}</span>
                        <span className="text-slate-500 text-[11px] font-normal">
                          {parseResult.students.length} {language === 'ar' ? 'طلاب' : 'students'}
                        </span>
                      </h4>

                      {/* Group Meta Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl text-xs">
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'ar' ? 'اسم المجموعة' : 'Group Name'}
                          </div>
                          <div className="font-black text-slate-900 dark:text-white truncate">
                            {parseResult.group.name || '—'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'ar' ? 'الصف' : 'Grade'}
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {parseResult.group.grade || '—'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'ar' ? 'المواعيد' : 'Days & Time'}
                          </div>
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 truncate" title={formatGroupScheduleDisplay(parseResult.group, language)}>
                            {formatGroupScheduleDisplay(parseResult.group, language)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'ar' ? 'نظام المحاسبة' : 'Payment System'}
                          </div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            {parseResult.group.payment_type} ({parseResult.group.payment_amount})
                            {parseResult.group.lesson_price ? ` [${parseResult.group.lesson_price}/lesson]` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Student Table Preview */}
                      {parseResult.students.length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                <th className="p-2.5 w-10 text-center">#</th>
                                <th className="p-2.5">{language === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                                <th className="p-2.5">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                              {parseResult.students.map((st, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="p-2 text-center text-slate-400 text-[11px]">{i + 1}</td>
                                  <td className="p-2 font-extrabold">{st.name}</td>
                                  <td className="p-2 font-mono text-slate-600 dark:text-slate-400">{st.phone}</td>
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
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={!parseResult.isValid || !importText.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                parseResult.isValid && importText.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{language === 'ar' ? 'تأكيد الاستيراد (Confirm Import)' : 'Confirm Import'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
