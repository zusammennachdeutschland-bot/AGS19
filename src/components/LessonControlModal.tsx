import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson, AttendanceStatus, HomeworkStatus, PaymentStatus, LessonReport } from '../types';
import { 
  X, Play, Pause, Square, Video, MapPin, Send, Phone, CheckCircle2, 
  Clock, AlertCircle, Sparkles, FileText, Award, DollarSign, ExternalLink, Navigation,
  Zap, UserPlus, XCircle, Ban
} from 'lucide-react';
import { ParentSummaryModal } from './ParentSummaryModal';
import { ArabicParentReportModal } from './ArabicParentReportModal';
import confetti from 'canvas-confetti';

export const LessonControlModal: React.FC = () => {
  const { 
    selectedLesson, 
    closeLessonControl, 
    saveLessonReport, 
    cancelLesson, 
    updateLesson, 
    students, 
    profile, 
    groups, 
    convertQuickLessonToStudent,
    activeLessonSession,
    startActiveLessonTimer,
    pauseActiveLessonTimer,
    resumeActiveLessonTimer,
    endActiveLessonTimer,
    t
  } = useApp();

  // Cancel Lesson state
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReasonNote, setCancelReasonNote] = useState('');

  // Background & Stopwatch persistent timer state

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [showParentSummaryModal, setShowParentSummaryModal] = useState(false);
  const [showArabicParentReportModal, setShowArabicParentReportModal] = useState(false);

  // Form state for lesson report
  const [attendance, setAttendance] = useState<AttendanceStatus>('present');
  const [studentAttendance, setStudentAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [homeworkStatus, setHomeworkStatus] = useState<HomeworkStatus>('assigned');
  const [homeworkTitle, setHomeworkTitle] = useState('Kapitel 3: Grammatik Übungen');
  const [homeworkDescription, setHomeworkDescription] = useState('Seiten 45-48 im Arbeitsbuch fertigstellen.');
  const [quizScore, setQuizScore] = useState<number>(85);
  const [examScore, setExamScore] = useState<number>(90);
  const [participationScore, setParticipationScore] = useState<number>(95);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [amountPaid, setAmountPaid] = useState<number>(200);
  const [packageChoice, setPackageChoice] = useState<number>(selectedLesson?.totalSessionsInPackage || 4);
  const [teacherNotes, setTeacherNotes] = useState('Gute Interaktion, Wortschatz wurde erfolgreich wiederholt.');
  const [studentPayments, setStudentPayments] = useState<Record<string, { status: PaymentStatus; amount: number }>>({});
  const [reminderCopied, setReminderCopied] = useState(false);

  // Group students for bulk/individual attendance
  const groupStudents = selectedLesson?.groupId 
    ? students.filter(s => s.groupId === selectedLesson.groupId)
    : [];

  // Initialize report form if selected lesson already has a report
  useEffect(() => {
    if (selectedLesson?.report) {
      setAttendance(selectedLesson.report.attendanceStatus);
      if (selectedLesson.report.studentAttendance) {
        setStudentAttendance(selectedLesson.report.studentAttendance);
      } else if (selectedLesson.groupId) {
        const initialAtt: Record<string, AttendanceStatus> = {};
        const groupSts = students.filter(s => s.groupId === selectedLesson.groupId);
        groupSts.forEach(st => {
          initialAtt[st.id] = selectedLesson.report?.attendanceStatus || 'present';
        });
        setStudentAttendance(initialAtt);
      }
      setHomeworkStatus(selectedLesson.report.homeworkStatus);
      setHomeworkTitle(selectedLesson.report.homeworkTitle || '');
      setHomeworkDescription(selectedLesson.report.homeworkDescription || '');
      setQuizScore(selectedLesson.report.quizScore || 85);
      setExamScore(selectedLesson.report.examScore || 90);
      setParticipationScore(selectedLesson.report.participationScore || 95);
      setPaymentStatus(selectedLesson.report.paymentStatus);
      setAmountPaid(selectedLesson.report.amountPaid || selectedLesson.amountDue);
      setTeacherNotes(selectedLesson.report.teacherNotes || '');
      setPackageChoice(selectedLesson.totalSessionsInPackage || 4);
      if (selectedLesson.studentPayments) {
        const initialMap: Record<string, { status: PaymentStatus; amount: number }> = {};
        Object.entries(selectedLesson.studentPayments).forEach(([stId, pDetail]: [string, any]) => {
          if (pDetail) {
            initialMap[stId] = { 
              status: pDetail.status || 'pending', 
              amount: typeof pDetail.amount === 'number' ? pDetail.amount : (typeof pDetail.amountPaid === 'number' ? pDetail.amountPaid : 0)
            };
          }
        });
        setStudentPayments(initialMap);
      }
      setShowReportForm(true);
      setIsEditingReport(false);
    } else if (selectedLesson) {
      setAmountPaid(selectedLesson.amountDue);
      setPaymentStatus(selectedLesson.paymentStatus);
      setPackageChoice(selectedLesson.totalSessionsInPackage || 4);
      if (selectedLesson.groupId) {
        const initialAtt: Record<string, AttendanceStatus> = {};
        const groupSts = students.filter(s => s.groupId === selectedLesson.groupId);
        groupSts.forEach(st => {
          initialAtt[st.id] = 'present';
        });
        setStudentAttendance(initialAtt);
      }
      if (selectedLesson.studentPayments) {
        const initialMap: Record<string, { status: PaymentStatus; amount: number }> = {};
        Object.entries(selectedLesson.studentPayments).forEach(([stId, pDetail]: [string, any]) => {
          if (pDetail) {
            initialMap[stId] = { 
              status: pDetail.status || 'pending', 
              amount: typeof pDetail.amount === 'number' ? pDetail.amount : (typeof pDetail.amountPaid === 'number' ? pDetail.amountPaid : 0)
            };
          }
        });
        setStudentPayments(initialMap);
      }
      setShowReportForm(false);
      setIsEditingReport(false);
    }
  }, [selectedLesson, students]);

  const handleSendPaymentReminder = () => {
    const text = `السلام عليكم ورحمة الله وبركاته.\nتم الانتهاء من عدد الحصص المتفق عليها. برجاء تحويل الرسوم المستحقة.\n\nبيانات التحويل:\n📱 رقم الهاتف: ${profile.phone || '01012345678'}\n💳 InstaPay: ${profile.instaPayId || 'abdulrahman@instapay'}\n\nمع الشكر والتقدير\n${profile.displayName}`;
    navigator.clipboard.writeText(text);
    setReminderCopied(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setReminderCopied(false), 3000);
  };

    // Use activeLessonSession from Context for global robust state
  useEffect(() => {
    if (!selectedLesson) return;
    
    // If the active global lesson is the current lesson, use its state
    if (activeLessonSession && activeLessonSession.lessonId === selectedLesson.id) {
      if (activeLessonSession.isRunning) {
        const elapsed = Math.max(0, Math.floor((Date.now() - activeLessonSession.startedAt) / 1000));
        setTimerSeconds(activeLessonSession.accumulatedSeconds + elapsed);
        setIsTimerRunning(true);
      } else {
        setTimerSeconds(activeLessonSession.accumulatedSeconds);
        setIsTimerRunning(false);
      }
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [selectedLesson?.id, activeLessonSession?.startedAt, activeLessonSession?.isRunning, activeLessonSession?.accumulatedSeconds, activeLessonSession?.lessonId]);

  // Stopwatch interval timer with Date.now() delta calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateElapsedTime = () => {
      if (activeLessonSession && activeLessonSession.lessonId === selectedLesson?.id && activeLessonSession.isRunning) {
        const elapsed = Math.max(0, Math.floor((Date.now() - activeLessonSession.startedAt) / 1000));
        setTimerSeconds(activeLessonSession.accumulatedSeconds + elapsed);
      }
    };

    if (isTimerRunning) {
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
      window.addEventListener('visibilitychange', updateElapsedTime);
      window.addEventListener('focus', updateElapsedTime);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('visibilitychange', updateElapsedTime);
      window.removeEventListener('focus', updateElapsedTime);
    };
  }, [isTimerRunning, activeLessonSession, selectedLesson?.id]);

  if (!selectedLesson) return null;

  const targetStudent = students.find(s => 
    (selectedLesson.studentId && s.id === selectedLesson.studentId) || 
    (selectedLesson.studentName && s.name.trim().toLowerCase() === selectedLesson.studentName.trim().toLowerCase())
  ) || (selectedLesson.groupId ? students.find(s => s.groupId === selectedLesson.groupId) : undefined);
  
  const targetGroup = groups.find(g => g.id === selectedLesson.groupId);

  // Recipient Phone Resolution (Parent Phone > Student Phone > Quick Lesson Phone)
  const recipientPhone = (
    targetStudent?.parentPhone || 
    selectedLesson?.quickParentPhone || 
    targetStudent?.studentPhone || 
    selectedLesson?.quickStudentPhone || 
    ''
  ).replace(/[^0-9+]/g, '');

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartLesson = () => {
    setIsTimerRunning(true);
    if (selectedLesson) {
      if (selectedLesson.status !== 'completed') {
        updateLesson(selectedLesson.id, { status: 'in_progress' });
      }
      if (activeLessonSession && activeLessonSession.lessonId === selectedLesson.id) {
         resumeActiveLessonTimer();
      } else {
         startActiveLessonTimer(selectedLesson);
      }
    }
  };

  const handlePauseLesson = () => {
    setIsTimerRunning(false);
    pauseActiveLessonTimer();
  };

  const handleEndLesson = () => {
    handlePauseLesson();
    setIsTimerRunning(false);
    setShowReportForm(true);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const reportData: LessonReport = {
      attendanceStatus: attendance,
      studentAttendance,
      homeworkStatus,
      homeworkTitle,
      homeworkDescription,
      quizScore: Number(quizScore),
      examScore: Number(examScore),
      participationScore: Number(participationScore),
      teacherNotes,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    saveLessonReport(selectedLesson.id, reportData, packageChoice);
    setIsEditingReport(false);
    setShowParentSummaryModal(true);
  };

  // Communication Handlers with Recipient Validation & Teacher Name
  const handleSendConfirmationMessage = () => {
    const text = encodeURIComponent(`Hallo! Erinnerung an die Deutschstunde (${selectedLesson.title}) heute um ${selectedLesson.time} Uhr.\nMit freundlichen Grüßen,\nHerr ${profile.displayName}`);
    if (recipientPhone) {
      window.open(`https://wa.me/${recipientPhone}?text=${text}`, '_blank');
    } else {
      alert('Keine gültige Telefonnummer gefunden.');
    }
  };

  const handleSendOfflineLessonStartMessage = () => {
    const text = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\n\nتم بدء الحصة الآن.\n\nنحيطكم علماً بأن الطالب بدأ الحصة في موعدها المحدد.\n\nمع تحيات\nأ. ${profile.displayName}`);
    if (recipientPhone) {
      window.open(`https://wa.me/${recipientPhone}?text=${text}`, '_blank');
    } else {
      alert('يرجى التأكد من إضافة رقم هاتف ولي الأمر أولاً.');
    }
  };

  const handleSendPaymentRequestMessage = () => {
    const text = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\n\nتم الانتهاء من عدد الحصص المتفق عليها.\nبرجاء تحويل الرسوم المستحقة.\n\nمع تحيات\nأ. ${profile.displayName}`);
    if (recipientPhone) {
      window.open(`https://wa.me/${recipientPhone}?text=${text}`, '_blank');
    } else {
      alert('يرجى التأكد من إضافة رقم هاتف ولي الأمر أولاً.');
    }
  };

  const handleStartTrip = () => {
    const text = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\n\nأ. ${profile.displayName} في الطريق الآن للحصة (${selectedLesson.title}). الوصول المتوقع خلال 20-30 دقيقة إن شاء الله. 🚗`);
    if (recipientPhone) {
      window.open(`https://wa.me/${recipientPhone}?text=${text}`, '_blank');
    } else {
      alert('Keine Telefonnummer angegeben.');
    }
  };

  const handleOpenMaps = () => {
    const address = selectedLesson.locationAddress || targetGroup?.address || 'Cairo, Egypt';
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-scale-up">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              selectedLesson.type === 'online' ? 'bg-blue-600' : 'bg-amber-600'
            }`}>
              {selectedLesson.type === 'online' ? <Video className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-blue-400/30">
                  {selectedLesson.type.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedLesson.grade}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight">{selectedLesson.title}</h2>
            </div>
          </div>

          <button
            onClick={closeLessonControl}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto font-sans">
          {/* Quick Lesson Banner & Convert Action */}
          {selectedLesson.isQuickLesson && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>⚡ Quick Lesson (Einmal-Lektion ohne Profil)</span>
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Schüler: {selectedLesson.studentName} {selectedLesson.quickStudentPhone && `• Tel: ${selectedLesson.quickStudentPhone}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newStudent = convertQuickLessonToStudent(selectedLesson.id);
                  if (newStudent) {
                    closeLessonControl();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Convert to Student</span>
              </button>
            </div>
          )}

          {/* SAVED REPORT QUICK REVIEW OR ACTIVE FORM */}
          {selectedLesson.report && !isEditingReport ? (
            /* QUICK REVIEW SUMMARY CARD */
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Kurze Zusammenfassung (Quick Review)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ✓ Bericht gespeichert
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Attendance Summary */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="block text-[10px] font-black uppercase text-slate-400">1. Anwesenheit (Attendance)</span>
                  <span className={`font-black flex items-center gap-1 ${
                    selectedLesson.report.attendanceStatus === 'present' ? 'text-emerald-600 dark:text-emerald-400' :
                    selectedLesson.report.attendanceStatus === 'late' ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  }`}>
                    {selectedLesson.report.attendanceStatus === 'present' && '✓ Anwesend (Present)'}
                    {selectedLesson.report.attendanceStatus === 'late' && '⚠️ Verspätet (Late)'}
                    {selectedLesson.report.attendanceStatus === 'absent' && '✕ Abwesend (Absent)'}
                  </span>
                </div>

                {/* Homework Summary */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="block text-[10px] font-black uppercase text-slate-400">2. Hausaufgaben (Homework)</span>
                  <div className="space-y-0.5">
                    <span className={`font-black text-xs ${
                      selectedLesson.report.homeworkStatus === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                      selectedLesson.report.homeworkStatus === 'assigned' ? 'text-blue-600 dark:text-blue-400' :
                      'text-rose-600 dark:text-rose-400'
                    }`}>
                      {selectedLesson.report.homeworkStatus === 'completed' && 'Erledigt (Completed)'}
                      {selectedLesson.report.homeworkStatus === 'assigned' && 'Aufgegeben (Assigned)'}
                      {selectedLesson.report.homeworkStatus === 'not_completed' && 'Nicht erledigt'}
                    </span>
                    {selectedLesson.report.homeworkTitle && (
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {selectedLesson.report.homeworkTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher Notes Summary */}
              {selectedLesson.report.teacherNotes && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                  <span className="block text-[10px] font-black uppercase text-slate-400">3. Notizen der Lehrkraft (Teacher Notes)</span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic">
                    "{selectedLesson.report.teacherNotes}"
                  </p>
                </div>
              )}

              {/* Edit Report Toggle */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingReport(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline cursor-pointer"
                >
                  Bericht bearbeiten / Edit Report
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* BEFORE STARTING SECTION */}
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Vor Unterrichtsbeginn (Before Starting)</span>
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedLesson.type === 'online' ? (
                    <>
                      <button
                        onClick={handleSendConfirmationMessage}
                        className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Confirmation Message</span>
                      </button>

                      <a
                        href={selectedLesson.meetingLink || profile.defaultZoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open Zoom Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={profile.defaultMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open Google Meet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSendOfflineLessonStartMessage}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Send Arabic Offline Lesson Started message"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال إشعار بدء الحصة (Offline Start)</span>
                      </button>

                      <button
                        onClick={handleStartTrip}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Start Trip & Notify Parent</span>
                      </button>

                      <button
                        onClick={handleSendPaymentRequestMessage}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Send Payment Request (إرسال مطالبة)</span>
                      </button>

                      <button
                        onClick={handleOpenMaps}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open Google Maps Navigation</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* DURING LESSON SECTION: LIVE TIMER */}
              {!showReportForm && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-lg space-y-4 text-center">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Live Unterrichts-Timer</span>
                    </span>

                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/30 font-medium">
                      Dauer: {selectedLesson.durationMinutes} Min.
                    </span>
                  </div>

                  {/* Stopwatch Display */}
                  <div className="py-2">
                    <span className="text-5xl font-black font-mono tracking-wider text-emerald-400 drop-shadow-md">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>

                  {/* Timer & Main Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {!isTimerRunning ? (
                      <button
                        type="button"
                        onClick={handleStartLesson}
                        className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>{timerSeconds === 0 ? 'Start Lesson' : 'Resume Lesson'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseLesson}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-slate-950" />
                        <span>Pause Lesson</span>
                      </button>
                    )}

                    {(isTimerRunning || timerSeconds > 0) && (
                      <button
                        type="button"
                        onClick={handleEndLesson}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>End Lesson</span>
                      </button>
                    )}

                    {!isTimerRunning && timerSeconds === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowReportForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Quick Complete / Submit Report</span>
                      </button>
                    )}
                    {/* CANCEL LESSON ACTION BUTTON (Req 1) */}
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(!showCancelPrompt)}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-rose-400/30"
                      title="Lektion Absagen (Cancel Lesson)"
                    >
                      <Ban className="w-4 h-4 text-rose-400" />
                      <span>Cancel Lesson</span>
                    </button>
                  </div>

                  {/* CANCELLATION PROMPT BOX */}
                  {showCancelPrompt && (
                    <div className="mt-4 p-4 bg-rose-950/80 border border-rose-800 rounded-lg text-left space-y-3 animate-fade-in text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-rose-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>Lektion absagen (Cancel Lesson)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCancelPrompt(false)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-rose-100">
                        Sind Sie sicher, dass Sie diese Lektion absagen möchten? Die Lektion wird im Verlauf als <strong className="text-white">Abgesagt</strong> gespeichert und aus den ausstehenden Aufgaben entfernt.
                      </p>

                      <textarea
                        rows={2}
                        value={cancelReasonNote}
                        onChange={(e) => setCancelReasonNote(e.target.value)}
                        placeholder="Absagegrund / Anmerkung eingeben (optional)..."
                        className="w-full p-2.5 bg-slate-900 border border-rose-700/60 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCancelPrompt(false)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            cancelLesson(selectedLesson.id, cancelReasonNote);
                            setShowCancelPrompt(false);
                          }}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Ja, Lektion absagen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AFTER ENDING LESSON: REPORT FORM */}
              {showReportForm && (
                <form onSubmit={handleSaveReport} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Unterrichtsbericht (Lesson Report Form)</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReportForm(false)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Timer wieder anzeigen
                      </button>
                      {selectedLesson.report && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Bericht Gespeichert
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        1. Anwesenheit (Attendance):
                      </label>
                      {selectedLesson.groupId && groupStudents.length > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/50">
                          {groupStudents.filter(s => (studentAttendance[s.id] || attendance) === 'present').length} / {groupStudents.length} Anwesend
                        </span>
                      )}
                    </div>

                    {/* Bulk "Mark All as Present" checkbox banner for group lessons */}
                    {selectedLesson.groupId && groupStudents.length > 0 && (
                      <div className="flex items-center justify-between bg-emerald-50/90 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700/80 p-2.5 rounded-lg shadow-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={groupStudents.every(st => (studentAttendance[st.id] || attendance) === 'present')}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const targetStatus: AttendanceStatus = isChecked ? 'present' : 'absent';
                              setAttendance(targetStatus);
                              const updatedAtt: Record<string, AttendanceStatus> = {};
                              groupStudents.forEach(st => {
                                updatedAtt[st.id] = targetStatus;
                              });
                              setStudentAttendance(updatedAtt);
                              if (isChecked) {
                                confetti({ particleCount: 35, spread: 45 });
                              }
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                          <span className="text-xs font-black text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Alle als anwesend markieren (Mark All Present)</span>
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setAttendance('present');
                            const updatedAtt: Record<string, AttendanceStatus> = {};
                            groupStudents.forEach(st => {
                              updatedAtt[st.id] = 'present';
                            });
                            setStudentAttendance(updatedAtt);
                            confetti({ particleCount: 40, spread: 50 });
                          }}
                          className="px-3 py-1 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Alle anwesend ✓</span>
                        </button>
                      </div>
                    )}

                    {/* Main Attendance Status Buttons */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAttendance('present');
                          if (selectedLesson.groupId && groupStudents.length > 0) {
                            const updatedAtt: Record<string, AttendanceStatus> = {};
                            groupStudents.forEach(st => {
                              updatedAtt[st.id] = 'present';
                            });
                            setStudentAttendance(updatedAtt);
                          }
                        }}
                        className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                          attendance === 'present'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ✓ Anwesend (Present)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('late')}
                        className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                          attendance === 'late'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ⚠️ Verspätet (Late)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('absent')}
                        className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                          attendance === 'absent'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ✕ Abwesend (Absent)
                      </button>
                    </div>

                    {/* Individual Student Attendance List for Group Lessons */}
                    {selectedLesson.groupId && groupStudents.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            👥 Einzelne Schüler-Anwesenheit (Individual Student Attendance):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedAtt: Record<string, AttendanceStatus> = {};
                              groupStudents.forEach(st => {
                                updatedAtt[st.id] = 'present';
                              });
                              setStudentAttendance(updatedAtt);
                              confetti({ particleCount: 30, spread: 40 });
                            }}
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-extrabold cursor-pointer flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/50 transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark All Present</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {groupStudents.map(st => {
                            const stAtt = studentAttendance[st.id] || attendance;
                            return (
                              <div key={st.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
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
                                      }}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border transition-all ${
                                        stAtt === attType
                                          ? attType === 'present' ? 'bg-emerald-600 text-white border-emerald-700'
                                            : attType === 'late' ? 'bg-amber-600 text-white border-amber-700'
                                            : 'bg-red-600 text-white border-red-700'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
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
                    )}
                  </div>

                  {/* Homework Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      2. Hausaufgaben (Homework):
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <button
                        type="button"
                        onClick={() => setHomeworkStatus('completed')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          homeworkStatus === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        Erledigt (Completed)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeworkStatus('assigned')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          homeworkStatus === 'assigned'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        Aufgegeben (Assigned)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeworkStatus('not_completed')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          homeworkStatus === 'not_completed'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        Nicht erledigt
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Hausaufgaben Titel (z. B. Kapitel 3 Grammatik)"
                      value={homeworkTitle}
                      onChange={(e) => setHomeworkTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  {/* Teacher Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      5. Notizen der Lehrkraft (Teacher Notes):
                    </label>
                    <textarea
                      rows={3}
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                      placeholder="Notizen zur Stunde hinterlassen..."
                    />
                  </div>

                  {/* Save Report Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Bericht speichern & Eltern benachrichtigen</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* PARENT COMMUNICATION QUICK BUTTONS */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Eltern-Kommunikation / Parent Communication:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowArabicParentReportModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>تقرير ولي الأمر / Elternbericht</span>
              </button>

              <a
                href={targetStudent?.parentPhone || selectedLesson?.quickParentPhone ? `tel:${(targetStudent?.parentPhone || selectedLesson?.quickParentPhone || '').replace(/[^0-9+]/g, '')}` : '#'}
                onClick={(e) => {
                  if (!targetStudent?.parentPhone && !selectedLesson?.quickParentPhone) {
                    e.preventDefault();
                    alert('لا يوجد رقم هاتف مسجل لولي الأمر. يرجى إضافة الرقم في بيانات الطالب.');
                  }
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Anruf Eltern / Call Parent</span>
              </a>

              {targetStudent?.phone && (
                <a
                  href={`tel:${targetStudent.phone}`}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Anruf Schüler / Call Student</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parent Summary Modal overlay */}
      {showParentSummaryModal && (
        <ParentSummaryModal
          lesson={{
            ...selectedLesson,
            sessionNumber: selectedLesson.sessionNumber || 1,
            totalSessionsInPackage: packageChoice || selectedLesson.totalSessionsInPackage || 4,
            report: {
              ...(selectedLesson.report || {}),
              attendanceStatus: attendance,
              studentAttendance: studentAttendance,
              homeworkStatus,
              homeworkTitle,
              homeworkDescription,
              quizScore: Number(quizScore),
              examScore: Number(examScore),
              participationScore: Number(participationScore),
              paymentStatus,
              amountPaid: Number(amountPaid),
              teacherNotes,
              savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          }}
          student={targetStudent}
          profile={profile}
          onClose={() => setShowParentSummaryModal(false)}
        />
      )}

      {/* Unified Parent Report Modal overlay */}
      {showArabicParentReportModal && (
        <ArabicParentReportModal
          lesson={{
            ...selectedLesson,
            sessionNumber: selectedLesson.sessionNumber || 1,
            totalSessionsInPackage: packageChoice || selectedLesson.totalSessionsInPackage || 8,
            report: {
              ...(selectedLesson.report || {}),
              attendanceStatus: attendance,
              studentAttendance: studentAttendance,
              homeworkStatus,
              homeworkTitle,
              homeworkDescription,
              paymentStatus,
              amountPaid: Number(amountPaid),
              teacherNotes,
            }
          }}
          student={targetStudent}
          profile={profile}
          onClose={() => setShowArabicParentReportModal(false)}
          onSaveReport={(arabicReportText, extraFields) => {
            saveLessonReport(selectedLesson.id, {
              attendanceStatus: attendance,
              studentAttendance: studentAttendance,
              homeworkStatus,
              homeworkTitle,
              homeworkDescription,
              paymentStatus,
              amountPaid: Number(amountPaid),
              teacherNotes,
              arabicFullGeneratedReport: arabicReportText,
              ...(extraFields || {}),
              savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, extraFields?.totalSessionsInPackage || packageChoice);
            confetti({ particleCount: 60, spread: 50 });
          }}
        />
      )}
    </div>
  );
};
