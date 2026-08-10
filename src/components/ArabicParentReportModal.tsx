import React, { useState, useEffect } from 'react';
import { Lesson, Student, TeacherProfile, AttendanceStatus } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, Copy, Check, Send, Phone, MessageSquare, Sparkles, Award, 
  FileText, CheckCircle2, AlertTriangle, HelpCircle, Edit3, Share2, Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArabicParentReportModalProps {
  lesson: Lesson;
  student?: Student;
  profile: TeacherProfile;
  onClose: () => void;
  onSaveReport?: (arabicReportText: string, updatedFields?: Record<string, any>) => void;
}

export const ARABIC_PERFORMANCE_OPTIONS = [
  'ممتاز',
  'جيد جداً',
  'جيد',
  'مقبول',
  'يحتاج متابعة',
  'يحتاج مذاكرة أكثر',
  'يحتاج تركيز أكثر',
  'شارك بشكل ممتاز',
  'متحسن عن الحصص السابقة'
];

export const ARABIC_HOMEWORK_OPTIONS = [
  'أكمل الواجب بالكامل',
  'أكمل جزء من الواجب',
  'لم يكمل الواجب',
  'الواجب ممتاز',
  'يحتاج تحسين في الواجب'
];

export const ARABIC_QUICK_NOTES = [
  'يرجى المتابعة اليومية.',
  'يرجى مراجعة الكلمات الجديدة.',
  'يرجى التدريب على الإملاء.',
  'يرجى حل الواجب قبل الحصة القادمة.',
  'الطالب متحسن بشكل ملحوظ.',
  'الطالب يحتاج مزيداً من التركيز.',
  'مستوى الطالب ممتاز.'
];

export interface ArabicTemplate {
  id: string;
  title: string;
  badge: string;
  text: string;
}

export const ARABIC_MESSAGE_TEMPLATES: ArabicTemplate[] = [
  {
    id: 'excellent',
    title: 'طالب ممتاز',
    badge: '🌟 ممتاز',
    text: 'السلام عليكم ورحمة الله وبركاته،\n\nأداء الطالب اليوم ممتاز، وكان متفاعلاً طوال الحصة وحقق نتائج جيدة. نشكركم على المتابعة المستمرة.'
  },
  {
    id: 'very_good',
    title: 'طالب جيد جداً',
    badge: '👍 جيد جداً',
    text: 'السلام عليكم ورحمة الله وبركاته،\n\nمستوى الطالب جيد جداً اليوم، ونوصي بالاستمرار في المراجعة المنزلية للحفاظ على هذا المستوى.'
  },
  {
    id: 'needs_followup',
    title: 'يحتاج متابعة',
    badge: '⚠️ يحتاج متابعة',
    text: 'السلام عليكم ورحمة الله وبركاته،\n\nالطالب يحتاج إلى بعض المتابعة والمراجعة الإضافية خلال الفترة القادمة، ونرجو الاهتمام بحل الواجبات والتدريب المنتظم.'
  },
  {
    id: 'homework_missing',
    title: 'عدم أداء الواجب',
    badge: '❌ الواجب ناقص',
    text: 'السلام عليكم ورحمة الله وبركاته،\n\nلم يتم استكمال الواجب المطلوب، لذا نرجو متابعة الطالب والتأكد من إنجاز الواجب قبل الحصة القادمة.'
  },
  {
    id: 'improvement',
    title: 'ملاحظة تحسن',
    badge: '📈 تحسن ملحوظ',
    text: 'السلام عليكم ورحمة الله وبركاته،\n\nهناك تحسن ملحوظ في مستوى الطالب مقارنة بالفترة السابقة، ونأمل الاستمرار بنفس المستوى من المتابعة والالتزام.'
  }
];

export const ArabicParentReportModal: React.FC<ArabicParentReportModalProps> = ({
  lesson,
  student,
  profile,
  onClose,
  onSaveReport
}) => {
  const { students, groups } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'templates' | 'preview'>('quick');

  // Find students associated with this lesson or group
  const groupStudents = lesson.groupId 
    ? students.filter(s => s.groupId === lesson.groupId) 
    : [];

  const isGroupLesson = Boolean(lesson.groupId) || groupStudents.length > 0;
  const [isBulkMode, setIsBulkMode] = useState<boolean>(groupStudents.length > 1);

  const initialResolvedStudent = student || 
    students.find(s => (lesson.studentId && s.id === lesson.studentId) || (lesson.studentName && s.name.trim().toLowerCase() === lesson.studentName.trim().toLowerCase())) || 
    (groupStudents.length > 0 ? groupStudents[0] : undefined);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialResolvedStudent?.id || ''
  );

  const activeStudent = students.find(s => s.id === selectedStudentId) || initialResolvedStudent;

  // Find active group for package vs unit determination
  const activeGroup = (lesson.groupId ? groups.find(g => g.id === lesson.groupId) : undefined) ||
    (activeStudent?.groupId ? groups.find(g => g.id === activeStudent.groupId) : undefined);

  // Determine if this is per-lesson / per-unit ("by unit") vs package (4, 8, 12 format)
  const isGroupPerSession = activeGroup 
    ? (activeGroup.paymentModel === 'per_session' || activeGroup.paymentCycle === 'per_lesson' || activeGroup.sessionCount === 1)
    : false;

  const isStudentPerSession = (!isBulkMode && activeStudent)
    ? (activeStudent.paymentPlan === 'per_lesson' || activeStudent.bundleSize === 1)
    : false;

  const isPerSession = isGroupPerSession || isStudentPerSession || lesson.totalSessionsInPackage === 1;
  const hasPackage = !isPerSession;

  // Helper to resolve group/student package size (4, 8, 12, etc.)
  const getGroupOrStudentPackageSize = (): number => {
    if (activeGroup && activeGroup.sessionCount && activeGroup.sessionCount > 1) {
      return activeGroup.sessionCount;
    }
    if (activeGroup?.paymentCycle) {
      if (activeGroup.paymentCycle === '4_lessons') return 4;
      if (activeGroup.paymentCycle === '8_lessons') return 8;
      if (activeGroup.paymentCycle === '12_lessons') return 12;
    }
    if (!isBulkMode && activeStudent) {
      if (activeStudent.bundleSize && activeStudent.bundleSize > 1) return activeStudent.bundleSize;
      if (activeStudent.paymentPlan === '4_lessons') return 4;
      if (activeStudent.paymentPlan === '8_lessons') return 8;
      if (activeStudent.paymentPlan === '12_lessons') return 12;
    }
    if (lesson.totalSessionsInPackage && lesson.totalSessionsInPackage > 1) {
      return lesson.totalSessionsInPackage;
    }
    return 8;
  };

  const parentName = isBulkMode 
    ? 'أولياء الأمور المحترمين'
    : (activeStudent?.parentName || lesson.quickParentName || 'ولي الأمر المحترم');

  const rawParentPhone = isBulkMode
    ? ''
    : (activeStudent?.parentPhone || lesson.quickParentPhone || activeStudent?.studentPhone || lesson.quickStudentPhone || '');
    
  const parentPhone = rawParentPhone.trim();
  const studentName = isBulkMode
    ? (lesson.groupName || lesson.title || 'المجموعة')
    : (activeStudent?.name || lesson.studentName || lesson.groupName || lesson.title);

  // Attendance state
  const [studentAttendance, setStudentAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    if (lesson.report?.studentAttendance) {
      return { ...lesson.report.studentAttendance };
    }
    const initialAtt: Record<string, AttendanceStatus> = {};
    if (lesson.groupId && groupStudents.length > 0) {
      groupStudents.forEach(st => {
        initialAtt[st.id] = lesson.report?.attendanceStatus || 'present';
      });
    }
    return initialAtt;
  });

  const [overallAttendance, setOverallAttendance] = useState<AttendanceStatus>(
    lesson.report?.attendanceStatus || 'present'
  );

  const getStudentAttendanceStatus = (stId: string): AttendanceStatus => {
    if (studentAttendance[stId]) return studentAttendance[stId];
    return overallAttendance;
  };

  // Session number & total package sessions state
  const [sessionNum, setSessionNum] = useState<number>(lesson.sessionNumber || 1);
  const [totalSessions, setTotalSessions] = useState<number>(() => {
    if (lesson.totalSessionsInPackage && lesson.totalSessionsInPackage > 1) return lesson.totalSessionsInPackage;
    return getGroupOrStudentPackageSize();
  });

  useEffect(() => {
    if (lesson.sessionNumber) setSessionNum(lesson.sessionNumber);
    if (hasPackage) {
      const syncedSize = getGroupOrStudentPackageSize();
      setTotalSessions(syncedSize);
    }
  }, [
    lesson.sessionNumber, 
    lesson.totalSessionsInPackage, 
    lesson.groupId, 
    selectedStudentId, 
    activeGroup?.sessionCount, 
    activeGroup?.paymentCycle,
    activeStudent?.bundleSize, 
    activeStudent?.paymentPlan, 
    hasPackage
  ]);

  // Form selections
  const [performance, setPerformance] = useState<string>(
    lesson.report?.arabicPerformance || 'ممتاز'
  );
  const [homeworkOption, setHomeworkOption] = useState<string>(
    lesson.report?.arabicHomeworkOption || 'أكمل الواجب بالكامل'
  );
  const [dictationScore, setDictationScore] = useState<string>(
    lesson.report?.dictationScore || '10 / 10'
  );
  const [examScore, setExamScore] = useState<string>(
    lesson.report?.arabicExamScore || '20 / 20'
  );
  const [homeworkRequired, setHomeworkRequired] = useState<string>(
    lesson.report?.arabicHomeworkRequired || lesson.report?.homeworkTitle || 'مراجعة درس اليوم وحفظ الكلمات الجديدة'
  );
  const [selectedNotes, setSelectedNotes] = useState<string[]>(
    lesson.report?.arabicParentNotes ? lesson.report.arabicParentNotes.split('\n') : ['مستوى الطالب ممتاز.']
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    lesson.report?.arabicTemplateMessage ? 'custom' : 'excellent'
  );
  const [customTemplateText, setCustomTemplateText] = useState<string>(
    lesson.report?.arabicTemplateMessage || ARABIC_MESSAGE_TEMPLATES[0].text
  );

  // Editable generated report
  const [finalGeneratedText, setFinalGeneratedText] = useState<string>('');
  const [isManualEdited, setIsManualEdited] = useState<boolean>(false);

  // Toggle quick note selection
  const toggleQuickNote = (note: string) => {
    setSelectedNotes(prev => 
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  // Select template
  const handleSelectTemplate = (tmpl: ArabicTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setCustomTemplateText(tmpl.text);
  };

  // Generate complete Arabic parent report text dynamically
  useEffect(() => {
    if (isManualEdited) return;

    const dateFormatted = lesson.date ? lesson.date.split('-').reverse().join('/') : '';

    let attendanceArabic = '';
    if (!isBulkMode && activeStudent) {
      const stAtt = getStudentAttendanceStatus(activeStudent.id);
      attendanceArabic = stAtt === 'present' ? 'حاضر ✅' : stAtt === 'late' ? 'متأخر ⚠️' : 'غائب ❌';
    } else if (isGroupLesson && groupStudents.length > 0) {
      const presentCount = groupStudents.filter(st => getStudentAttendanceStatus(st.id) === 'present').length;
      const lateCount = groupStudents.filter(st => getStudentAttendanceStatus(st.id) === 'late').length;
      const absentCount = groupStudents.filter(st => getStudentAttendanceStatus(st.id) === 'absent').length;

      if (presentCount === groupStudents.length) {
        attendanceArabic = 'حاضر للجميع ✅';
      } else if (absentCount === groupStudents.length) {
        attendanceArabic = 'غائب للجميع ❌';
      } else if (lateCount === groupStudents.length) {
        attendanceArabic = 'متأخر للجميع ⚠️';
      } else {
        attendanceArabic = `${presentCount} حاضر ✅ | ${lateCount} متأخر ⚠️ | ${absentCount} غائب ❌`;
      }
    } else {
      attendanceArabic = overallAttendance === 'present' ? 'حاضر ✅' : overallAttendance === 'late' ? 'متأخر ⚠️' : 'غائب ❌';
    }

    const notesCombined = selectedNotes.length > 0 ? selectedNotes.join('\n• ') : 'لا توجد ملاحظات إضافية.';

    const templateContent = selectedTemplateId === 'custom' 
      ? customTemplateText 
      : (ARABIC_MESSAGE_TEMPLATES.find(t => t.id === selectedTemplateId)?.text || customTemplateText);

    const sessionInfoPart = hasPackage 
      ? ` | الحصة رقم (${sessionNum} من ${totalSessions})` 
      : '';

    let generated = '';

    if (isBulkMode && groupStudents.length > 0) {
      generated = `تقرير ولي الأمر - تقرير الحصة الجماعية 📊
----------------------------------
👥 المجموعة: ${studentName} (${groupStudents.length} طلاب)
👨‍🏫 المعلم: أ. ${profile.displayName}
📅 التاريخ: ${dateFormatted}${sessionInfoPart}

📌 الحضور والغياب للمجموعة: ${attendanceArabic}
🌟 أداء المجموعة اليوم: ${performance}
✍️ درجة الإملاء: ${dictationScore}
📝 درجة الاختبار: ${examScore}
📖 وضع الواجب الحالي: ${homeworkOption}
📚 الواجب المنزلي القادم: ${homeworkRequired || 'لا يوجد'}

💬 ملاحظات المعلم لأولياء الأمور:
• ${notesCombined}

✉️ الرسالة الموجهة لأولياء الأمور:
${templateContent}

مع تحيات،
أ. ${profile.displayName} - معلم اللغة الألمانية 🇩🇪`;
    } else {
      generated = `تقرير ولي الأمر - تقرير الحصة 📊
----------------------------------
👤 الطالب: ${studentName}
👨‍🏫 المعلم: أ. ${profile.displayName}
📅 التاريخ: ${dateFormatted}${sessionInfoPart}

📌 الحضور والغياب: ${attendanceArabic}
🌟 أداء الطالب اليوم: ${performance}
✍️ درجة الإملاء: ${dictationScore}
📝 درجة الاختبار: ${examScore}
📖 وضع الواجب الحالي: ${homeworkOption}
📚 الواجب المنزلي القادم: ${homeworkRequired || 'لا يوجد'}

💬 ملاحظات المعلم لولي الأمر:
• ${notesCombined}

✉️ الرسالة الموجهة لولي الأمر:
${templateContent}

مع تحيات،
أ. ${profile.displayName} - معلم اللغة الألمانية 🇩🇪`;
    }

    setFinalGeneratedText(generated);
  }, [
    isBulkMode,
    performance, 
    homeworkOption, 
    dictationScore, 
    examScore, 
    homeworkRequired, 
    selectedNotes, 
    selectedTemplateId, 
    customTemplateText, 
    lesson, 
    profile, 
    isManualEdited,
    studentName,
    activeStudent,
    studentAttendance,
    overallAttendance,
    groupStudents.length,
    sessionNum,
    totalSessions,
    hasPackage
  ]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(finalGeneratedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    const phoneToUse = parentPhone || lesson.quickParentPhone || lesson.quickStudentPhone || (groupStudents[0]?.parentPhone || groupStudents[0]?.studentPhone || '');
    const encodedText = encodeURIComponent(finalGeneratedText);
    const cleanPhone = phoneToUse.replace(/[^0-9+]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
    confetti({ particleCount: 50, spread: 40 });

    if (onSaveReport) {
      onSaveReport(finalGeneratedText, {
        attendanceStatus: overallAttendance,
        studentAttendance,
        sessionNumber: sessionNum,
        totalSessionsInPackage: totalSessions,
        arabicPerformance: performance,
        arabicHomeworkOption: homeworkOption,
        dictationScore,
        arabicExamScore: examScore,
        arabicHomeworkRequired: homeworkRequired,
        arabicParentNotes: selectedNotes.join('\n'),
        arabicTemplateMessage: customTemplateText,
        arabicFullGeneratedReport: finalGeneratedText
      });
    }
  };

  const sendWhatsAppToStudentParent = (stStudent: Student) => {
    const rawP = stStudent.parentPhone || stStudent.studentPhone || '';
    const cleanPhone = rawP.replace(/[^0-9+]/g, '');
    if (!cleanPhone) {
      alert(`لا يوجد رقم هاتف مسجل لولي أمر الطالب ${stStudent.name}`);
      return;
    }
    const pName = stStudent.parentName || 'ولي الأمر المحترم';
    const stAtt = getStudentAttendanceStatus(stStudent.id);
    const stAttArabic = stAtt === 'present' ? 'حاضر ✅' : stAtt === 'late' ? 'متأخر ⚠️' : 'غائب ❌';

    let msg = finalGeneratedText;
    if (isBulkMode) {
      msg = `السلام عليكم ${pName} 👋\nإليكم تقرير الحصة الجماعية الخاصة بالطالب/ة (${stStudent.name}):\n\n📌 حالة حضور الطالب: ${stAttArabic}\n\n${finalGeneratedText}`;
    }

    const encodedText = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    confetti({ particleCount: 35, spread: 40 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-right font-sans">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between text-slate-800 dark:text-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>تقرير ولي الأمر (باللغة العربية)</span>
                {isBulkMode && (
                  <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 font-black px-2 py-0.5 rounded-md">تقرير جماعي 👥</span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                {studentName} • {parentName} {!isBulkMode && parentPhone ? `(${parentPhone})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bulk / Individual Report Type Switcher Banner */}
        {isGroupLesson && groupStudents.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 border-b border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
            <span className="font-bold text-slate-800 dark:text-slate-200">وضع التقرير (Report Mode):</span>

            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsBulkMode(true);
                  setIsManualEdited(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                  isBulkMode
                    ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👥 تقرير جماعي للمجموعة ({groupStudents.length} طلاب)
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsManualEdited(false);
                  setIsBulkMode(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                  !isBulkMode
                    ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👤 تقرير فردي
              </button>
            </div>

            {!isBulkMode && groupStudents.length > 0 && (
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setIsManualEdited(false);
                }}
                className="bg-white dark:bg-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {groupStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.parentName || 'ولي الأمر'})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Tab Selection */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-1.5 flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 shadow-2xs font-black'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>خيارات التقييم والإملاء</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>قوالب الرسائل الجاهزة</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-teal-600 dark:text-teal-400 shadow-2xs font-black'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
            }`}
          >
            <Edit3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>معاينة وتعديل التقرير</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: QUICK SELECTIONS */}
          {activeTab === 'quick' && (
            <div className="space-y-4 text-xs">
              
              {/* Session Number & Package Counter Selector (Only shown if group/student uses package format e.g. 4, 8, 12) */}
              {hasPackage && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/75 dark:border-slate-800">
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      🔢 رقم الحصة الحالي:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalSessions}
                      value={sessionNum}
                      onChange={(e) => {
                        setSessionNum(Math.max(1, Number(e.target.value)));
                        setIsManualEdited(false);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      📦 إجمالي حصص الباقة:
                    </label>
                    <select
                      value={totalSessions}
                      onChange={(e) => {
                        setTotalSessions(Number(e.target.value));
                        setIsManualEdited(false);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value={4}>4 حصص</option>
                      <option value={8}>8 حصص</option>
                      <option value={12}>12 حصة</option>
                      <option value={16}>16 حصة</option>
                      {![4, 8, 12, 16].includes(totalSessions) && (
                        <option value={totalSessions}>{totalSessions} حصص</option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Attendance Selection */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/75 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    📌 حالة الحضور والغياب (Attendance):
                  </label>
                  {!isBulkMode && activeStudent && (
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      الطالب: {activeStudent.name}
                    </span>
                  )}
                </div>

                {!isBulkMode && activeStudent ? (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['present', 'late', 'absent'] as AttendanceStatus[]).map(attType => {
                      const currentStAtt = getStudentAttendanceStatus(activeStudent.id);
                      return (
                        <button
                          key={attType}
                          type="button"
                          onClick={() => {
                            setStudentAttendance(prev => ({
                              ...prev,
                              [activeStudent.id]: attType
                            }));
                            setOverallAttendance(attType);
                            setIsManualEdited(false);
                          }}
                          className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                            currentStAtt === attType
                              ? attType === 'present' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : attType === 'late' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-750'
                          }`}
                        >
                          {attType === 'present' ? '✓ حاضر (Present)' : attType === 'late' ? '⚠️ متأخر (Late)' : '✕ غائب (Absent)'}
                        </button>
                      );
                    })}
                  </div>
                ) : isBulkMode && groupStudents.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold">تحديد الحضور لكل طالب في المجموعة:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedAtt: Record<string, AttendanceStatus> = {};
                          groupStudents.forEach(st => { updatedAtt[st.id] = 'present'; });
                          setStudentAttendance(updatedAtt);
                          setOverallAttendance('present');
                          setIsManualEdited(false);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 rounded-md font-bold text-[10px] cursor-pointer shadow-2xs"
                      >
                        ✓ تحديد الجميع حاضر
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {groupStudents.map(st => {
                        const stAtt = getStudentAttendanceStatus(st.id);
                        return (
                          <div key={st.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-150 dark:border-slate-800 text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{st.name}</span>
                            <div className="flex items-center gap-1">
                              {(['present', 'late', 'absent'] as AttendanceStatus[]).map(attType => (
                                <button
                                  key={attType}
                                  type="button"
                                  onClick={() => {
                                    setStudentAttendance(prev => ({
                                      ...prev,
                                      [st.id]: attType
                                    }));
                                    setIsManualEdited(false);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border transition-all ${
                                    stAtt === attType
                                      ? attType === 'present' ? 'bg-emerald-600 text-white border-emerald-600'
                                        : attType === 'late' ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-rose-600 text-white border-rose-600'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {attType === 'present' ? 'Present' : attType === 'late' ? 'Late' : 'Absent'}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['present', 'late', 'absent'] as AttendanceStatus[]).map(attType => (
                      <button
                        key={attType}
                        type="button"
                        onClick={() => {
                          setOverallAttendance(attType);
                          setIsManualEdited(false);
                        }}
                        className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                          overallAttendance === attType
                            ? attType === 'present' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : attType === 'late' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-750'
                        }`}
                      >
                        {attType === 'present' ? '✓ حاضر (Present)' : attType === 'late' ? '⚠️ متأخر (Late)' : '✕ غائب (Absent)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Performance Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  🌟 أداء الطالب في الحصة:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ARABIC_PERFORMANCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPerformance(opt);
                        setIsManualEdited(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer text-[11px] ${
                        performance === opt
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-2xs font-black'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Homework Status Selection */}
              <div className="space-y-1.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  📖 وضع الواجب الحالي:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ARABIC_HOMEWORK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setHomeworkOption(opt);
                        setIsManualEdited(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer text-[11px] ${
                        homeworkOption === opt
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-2xs font-black'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dictation & Exam Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                {/* Dictation score */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    ✍️ درجة الإملاء (Dictation):
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {['10 / 10', '9 / 10', '8 / 10', '7 / 10', '5 / 10'].map(sc => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => {
                          setDictationScore(sc);
                          setIsManualEdited(false);
                        }}
                        className={`px-2 py-0.5 rounded border font-mono font-bold text-[10px] cursor-pointer transition-colors ${
                          dictationScore === sc
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={dictationScore}
                    onChange={(e) => {
                      setDictationScore(e.target.value);
                      setIsManualEdited(false);
                    }}
                    placeholder="مثال: 9 / 10"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                {/* Exam score */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    📝 درجة الاختبار / التقييم:
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {['10 / 10', '18 / 20', '20 / 20', '45 / 50', '50 / 50'].map(sc => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => {
                          setExamScore(sc);
                          setIsManualEdited(false);
                        }}
                        className={`px-2 py-0.5 rounded border font-mono font-bold text-[10px] cursor-pointer transition-colors ${
                          examScore === sc
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={examScore}
                    onChange={(e) => {
                      setExamScore(e.target.value);
                      setIsManualEdited(false);
                    }}
                    placeholder="مثال: 18 / 20"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Homework Required */}
              <div className="space-y-1.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  📚 الواجب المطلوب للحصة القادمة (Free Text):
                </label>
                <textarea
                  rows={2}
                  value={homeworkRequired}
                  onChange={(e) => {
                    setHomeworkRequired(e.target.value);
                    setIsManualEdited(false);
                  }}
                  placeholder="أدخل تفاصيل الواجب هنا..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
                />
              </div>

              {/* Quick Parent Notes */}
              <div className="space-y-1.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  💬 ملاحظات سريعة لولي الأمر (يمكنك اختيار أكثر من واحدة):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ARABIC_QUICK_NOTES.map(note => {
                    const isSelected = selectedNotes.includes(note);
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => {
                          toggleQuickNote(note);
                          setIsManualEdited(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all text-[11px] cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-750 dark:text-slate-300 hover:bg-slate-100/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-current" />}
                        <span>{note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: READY-MADE TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                اختر القالب المناسب لحالة الطالب:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ARABIC_MESSAGE_TEMPLATES.map(tmpl => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        handleSelectTemplate(tmpl);
                        setIsManualEdited(false);
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-750 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 dark:text-white">
                          {tmpl.title}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {tmpl.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Edit Selected Template text */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  نص الرسالة الجاهزة المحددة (يمكن تعديلها مباشرة):
                </label>
                <textarea
                  rows={4}
                  value={customTemplateText}
                  onChange={(e) => {
                    setSelectedTemplateId('custom');
                    setCustomTemplateText(e.target.value);
                    setIsManualEdited(false);
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FULL GENERATED REPORT PREVIEW & EDIT */}
          {activeTab === 'preview' && (
            <div className={`space-y-3.5 text-xs ${activeTab !== 'preview' ? 'mt-4 pt-4 border-t border-slate-200 dark:border-slate-800' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>التقرير النهائي الجاهز للإرسال لولي الأمر:</span>
                </label>

                <div className="flex items-center gap-2">
                  {isManualEdited && (
                    <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 font-black px-2 py-0.5 rounded-md">
                      تم التعديل يدوياً
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={finalGeneratedText}
                onChange={(e) => {
                  setFinalGeneratedText(e.target.value);
                  setIsManualEdited(true);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-lg p-3.5 text-xs font-mono text-slate-800 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              />

              {/* Bulk Quick Send List for Group Parents */}
              {isBulkMode && groupStudents.length > 0 && (
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 p-3.5 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-emerald-600" />
                      <span>قائمة إرسال الواتساب السريع لجميع أولياء أمور المجموعة ({groupStudents.length} طلاب):</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {groupStudents.map(st => {
                      const stPhone = st.parentPhone || st.studentPhone || '';
                      const stAtt = lesson.report?.studentAttendance?.[st.id] || lesson.report?.attendanceStatus || 'present';
                      const stAttBadge = stAtt === 'present' ? 'حاضر ✅' : stAtt === 'late' ? 'متأخر ⚠️' : 'غائب ❌';

                      return (
                        <div key={st.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{st.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">({st.parentName || 'ولي الأمر'}: {stPhone || 'لا يوجد رقم'})</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold px-1.5 py-0.5 rounded">{stAttBadge}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => sendWhatsAppToStudentParent(st)}
                            disabled={!stPhone}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer border transition-all flex items-center gap-1 ${
                              stPhone
                                ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-2xs'
                                : 'bg-slate-100 border-slate-100 dark:bg-slate-800 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>إرسال لـ {st.parentName || st.name.split(' ')[0]} 📱</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppSend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال عبر واتساب (WhatsApp)</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-200 border border-slate-250 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${parentPhone}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصال بولي الأمر</span>
            </a>

            <button
              onClick={() => {
                if (onSaveReport) {
                  onSaveReport(finalGeneratedText, {
                    arabicPerformance: performance,
                    arabicHomeworkOption: homeworkOption,
                    dictationScore,
                    arabicExamScore: examScore,
                    arabicHomeworkRequired: homeworkRequired,
                    arabicParentNotes: selectedNotes.join('\n'),
                    arabicTemplateMessage: customTemplateText,
                    arabicFullGeneratedReport: finalGeneratedText
                  });
                }
                onClose();
              }}
              className="bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-black text-xs py-2 px-4 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              حفظ وإغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
