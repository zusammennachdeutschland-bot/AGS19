import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storageService';
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
    t,
    _t
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

      // Check for report draft if no finalized report yet
      async function checkDraft() {
        if (selectedLesson) {
          const draft = await storage.getItem<any>(`dl_draft_report_${selectedLesson.id}`);
          if (draft) {
            if (draft.attendance) setAttendance(draft.attendance);
            if (draft.studentAttendance) setStudentAttendance(draft.studentAttendance);
            if (draft.homeworkStatus) setHomeworkStatus(draft.homeworkStatus);
            if (draft.homeworkTitle) setHomeworkTitle(draft.homeworkTitle);
            if (draft.homeworkDescription) setHomeworkDescription(draft.homeworkDescription);
            if (draft.quizScore !== undefined) setQuizScore(draft.quizScore);
            if (draft.examScore !== undefined) setExamScore(draft.examScore);
            if (draft.participationScore !== undefined) setParticipationScore(draft.participationScore);
            if (draft.teacherNotes) setTeacherNotes(draft.teacherNotes);
            setShowReportForm(true);
            setIsEditingReport(true);
          }
        }
      }
      checkDraft();
    }
  }, [selectedLesson, students]);

  // Auto-save report draft as teacher types
  useEffect(() => {
    if (selectedLesson && (teacherNotes || homeworkTitle || homeworkDescription)) {
      storage.setItem(`dl_draft_report_${selectedLesson.id}`, {
        attendance, studentAttendance, homeworkStatus, homeworkTitle, homeworkDescription,
        quizScore, examScore, participationScore, teacherNotes
      });
    }
  }, [selectedLesson?.id, attendance, studentAttendance, homeworkStatus, homeworkTitle, homeworkDescription, quizScore, examScore, participationScore, teacherNotes]);

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
    } else if (selectedLesson.status === 'in_progress' && !activeLessonSession) {
      // Auto-start active global timer if lesson is in_progress
      startActiveLessonTimer(selectedLesson);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [selectedLesson?.id, selectedLesson?.status, activeLessonSession?.startedAt, activeLessonSession?.isRunning, activeLessonSession?.accumulatedSeconds, activeLessonSession?.lessonId]);

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
    setIsTimerRunning(false);
    endActiveLessonTimer();
    if (selectedLesson) {
      updateLesson(selectedLesson.id, { status: 'completed' });
    }
    setShowReportForm(true);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
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
    endActiveLessonTimer();
    storage.removeItem(`dl_draft_report_${selectedLesson.id}`);
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm: pt-[max(24px,env(safe-area-inset-top,24px))] overflow-y-auto p-0 sm:p-4 pb-0">
      <div className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              selectedLesson.type === 'online' ? 'bg-primary' : 'bg-primary'
            }`}>
              {selectedLesson.type === 'online' ? <Video className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/20 text-primary/70 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-primary/30">
                  {selectedLesson.type.toUpperCase()}
                </span>
                <span className="text-xs text-text-muted/70 font-medium">{selectedLesson.grade}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight">{selectedLesson.title}</h2>
            </div>
          </div>

          <button
            onClick={closeLessonControl}
            className="p-2 hover:bg-surface/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3 max-h-[78vh] overflow-y-auto font-sans">
          {/* Quick Lesson Banner & Convert Action */}
          {selectedLesson.isQuickLesson && (
            <div className="p-3 bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-primary dark:text-primary flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                  <span>⚡ Quick Lesson (Einmal-Lektion ohne Profil)</span>
                </span>
                <p className="text-[11px] text-primary dark:text-primary">
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
                className="bg-primary hover:bg-primary-hover text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-primary/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Convert to Student</span>
              </button>
            </div>
          )}

          {/* SAVED REPORT QUICK REVIEW OR ACTIVE FORM */}
          {selectedLesson.report && !isEditingReport ? (
            /* QUICK REVIEW SUMMARY CARD */
            <div className="bg-surface-hover/80 border border-surface-border dark:border-surface-border-soft/80 rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border/80 dark:border-surface-border-soft/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Kurze Zusammenfassung (Quick Review)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2.5 py-1 rounded-full border border-primary-border dark:border-primary-border">
                  ✓ Bericht gespeichert
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Attendance Summary */}
                <div className="p-3 bg-surface rounded-xl border border-surface-border/80 dark:border-surface-border space-y-1">
                  <span className="block text-[10px] font-black uppercase text-text-muted/70">1. Anwesenheit (Attendance)</span>
                  <span className={`font-black flex items-center gap-1 ${
                    selectedLesson.report.attendanceStatus === 'present' ? 'text-primary dark:text-primary' :
                    selectedLesson.report.attendanceStatus === 'late' ? 'text-primary dark:text-primary' :
                    'text-primary dark:text-primary'
                  }`}>
                    {selectedLesson.report.attendanceStatus === 'present' && '✓ Anwesend (Present)'}
                    {selectedLesson.report.attendanceStatus === 'late' && '⚠️ Verspätet (Late)'}
                    {selectedLesson.report.attendanceStatus === 'absent' && '✕ Abwesend (Absent)'}
                  </span>
                </div>

                {/* Homework Summary */}
                <div className="p-3 bg-surface rounded-xl border border-surface-border/80 dark:border-surface-border space-y-1">
                  <span className="block text-[10px] font-black uppercase text-text-muted/70">2. Hausaufgaben (Homework)</span>
                  <div className="space-y-0.5">
                    <span className={`font-black text-xs ${
                      selectedLesson.report.homeworkStatus === 'completed' ? 'text-primary dark:text-primary' :
                      selectedLesson.report.homeworkStatus === 'assigned' ? 'text-primary dark:text-primary' :
                      'text-primary dark:text-primary'
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
                <div className="p-3 bg-surface rounded-xl border border-surface-border/80 dark:border-surface-border space-y-1 text-xs">
                  <span className="block text-[10px] font-black uppercase text-text-muted/70">3. Notizen der Lehrkraft (Teacher Notes)</span>
                  <p className="text-xs font-medium text-text-main italic">
                    "{selectedLesson.report.teacherNotes}"
                  </p>
                </div>
              )}

              {/* Edit Report Toggle */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingReport(true)}
                  className="text-xs font-bold text-primary dark:text-primary hover:text-primary dark:hover:text-primary underline cursor-pointer"
                >
                  Bericht bearbeiten / Edit Report
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* BEFORE STARTING SECTION */}
              <div className="space-y-2 border-b border-slate-100 dark:border-surface-border pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Vor Unterrichtsbeginn (Before Starting)</span>
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedLesson.type === 'online' ? (
                    <>
                      <button
                        onClick={handleSendConfirmationMessage}
                        className="bg-primary-soft dark:bg-primary-soft/60 hover:bg-primary-soft dark:hover:bg-primary-soft border border-primary-border dark:border-primary-border text-primary dark:text-primary/70 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Confirmation Message</span>
                      </button>

                      <a
                        href={selectedLesson.meetingLink || profile.defaultZoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs active:scale-95 hover:shadow-lg hover:shadow-primary/30"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open Zoom Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={profile.defaultMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
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
                        className="bg-primary hover:bg-primary-hover text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Send Offline Lesson Started message"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{_t('إرسال إشعار بدء الحصة', 'Send Lesson Started Notice', 'Unterrichtsbeginn senden')}</span>
                      </button>

                      <button
                        onClick={handleStartTrip}
                        className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{_t('بدء الرحلة وإشعار ولي الأمر', 'Start Trip & Notify Parent', 'Fahrt starten & Eltern benachrichtigen')}</span>
                      </button>

                      <button
                        onClick={handleSendPaymentRequestMessage}
                        className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{_t('إرسال مطالبة بالدفع', 'Send Payment Request', 'Zahlungsaufforderung senden')}</span>
                      </button>

                      <button
                        onClick={handleOpenMaps}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{_t('فتح خرائط جوجل', 'Open Google Maps Navigation', 'Google Maps Navigation öffnen')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* DURING LESSON SECTION: LIVE TIMER & LESSON ACTIONS - ALWAYS VISIBLE */}
              <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-6 text-center relative overflow-hidden">
                {/* Background ambient glow when timer is running */}
                {isTimerRunning && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[60px] pointer-events-none animate-pulse" />
                )}
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                    <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-primary animate-pulse' : 'text-text-muted/70'}`} />
                    <span>{_t('مؤقت الحصة المباشر', 'Live Lesson Timer', 'Live-Unterrichts-Timer')}</span>
                  </span>

                  <span className="text-[10px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2 py-1 rounded-md border border-primary-border/30">
                    {_t(`المدة: ${selectedLesson.durationMinutes} دقيقة`, `Duration: ${selectedLesson.durationMinutes} min`, `Dauer: ${selectedLesson.durationMinutes} Min`)}
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
                        <span>{timerSeconds === 0 ? _t('بدء الحصة', 'Start', 'Starten') : _t('استئناف', 'Resume', 'Fortsetzen')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseLesson}
                        className="col-span-2 sm:col-span-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-white" />
                        <span>{_t('إيقاف مؤقت', 'Pause', 'Pausieren')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleEndLesson}
                      className={`${isTimerRunning ? 'col-span-2 sm:col-span-1' : 'col-span-2 sm:col-span-1'} bg-surface-hover hover:bg-slate-100 dark:hover:bg-slate-800 text-text-main font-bold text-sm px-5 py-3.5 rounded-xl border border-surface-border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
                    >
                      <Square className="w-4 h-4 text-text-main" />
                      <span>{_t('إنهاء', 'End Lesson', 'Beenden')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(!showReportForm)}
                      className="bg-surface-hover hover:bg-slate-100 dark:hover:bg-slate-800 text-text-main font-bold text-xs px-4 py-3 rounded-xl border border-surface-border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-text-main" />
                      <span>{showReportForm ? _t('إخفاء التقرير', 'Hide Report', 'Bericht ausblenden') : _t('التقرير', 'Report', 'Bericht')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(!showCancelPrompt)}
                      className="bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Ban className="w-4 h-4 text-red-500 dark:text-red-400" />
                      <span>{_t('إلغاء', 'Cancel', 'Stornieren')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CANCELLATION PROMPT BOX */}
                {showCancelPrompt && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>{_t('تأكيد إلغاء الحصة', 'Confirm Lesson Cancellation', 'Stornierung der Lektion bestätigen')}</span>
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
                      {_t('هل أنت متأكد من إلغاء هذه الحصة؟ سيتم توثيق السبب وحفظ الحصة كـ ملغاة.', 'Are you sure you want to cancel this lesson? The reason will be documented and saved.', 'Sind Sie sicher, dass Sie diese Lektion stornieren möchten? Der Grund wird dokumentiert.')}
                    </p>

                    <textarea
                      rows={2}
                      value={cancelReasonNote}
                      onChange={(e) => setCancelReasonNote(e.target.value)}
                      placeholder={_t('أدخل سبب إلغاء الحصة (اختياري)...', 'Enter cancellation reason (optional)...', 'Stornierungsgrund eingeben (optional)...')}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {_t('تراجع', 'Back', 'Zurück')}
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
                        <span>{_t('نعم، إلغاء الحصة', 'Yes, Cancel Lesson', 'Ja, Lektion stornieren')}</span>
                      </button>
                    </div>
                  </div>
                )}

              {/* AFTER ENDING LESSON: REPORT FORM */}
              {showReportForm && (
                <form onSubmit={handleSaveReport} className="space-y-4 pt-2 border-t border-surface-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>نموذج تقرير الحصة (Lesson Report Form)</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReportForm(false)}
                        className="text-xs text-primary dark:text-primary font-bold hover:underline cursor-pointer"
                      >
                        إخفاء التقرير
                      </button>
                      {selectedLesson.report && (
                        <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                          ✓ تم حفظ التقرير
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text-main">
                        1. Anwesenheit (Attendance):
                      </label>
                      {selectedLesson.groupId && groupStudents.length > 0 && (
                        <span className="text-[11px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2 py-0.5 rounded-md border border-primary-border">
                          {groupStudents.filter(s => (studentAttendance[s.id] || attendance) === 'present').length} / {groupStudents.length} Anwesend
                        </span>
                      )}
                    </div>

                    {/* Bulk "Mark All as Present" checkbox banner for group lessons */}
                    {selectedLesson.groupId && groupStudents.length > 0 && (
                      <div className="flex items-center justify-between bg-primary-soft dark:bg-primary-soft border-2 border-primary-border dark:border-primary-border/80 p-2.5 rounded-lg shadow-xs">
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
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                          />
                          <span className="text-xs font-black text-primary dark:text-primary flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
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
                          className="px-3 py-1 text-[11px] font-black bg-primary hover:bg-primary-hover active:scale-95 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
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
                            ? 'bg-primary text-white border-primary-border shadow-xs'
                            : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                        }`}
                      >
                        ✓ Anwesend (Present)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance('late')}
                        className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                          attendance === 'late'
                            ? 'bg-primary text-white border-primary-border shadow-xs'
                            : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
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
                            : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                        }`}
                      >
                        ✕ Abwesend (Absent)
                      </button>
                    </div>

                    {/* Individual Student Attendance List for Group Lessons */}
                    {selectedLesson.groupId && groupStudents.length > 0 && (
                      <div className="pt-2 border-t border-surface-border dark:border-surface-border-soft/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="block text-[11px] font-bold text-text-main">
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
                            className="text-[10px] text-primary dark:text-primary hover:text-primary font-extrabold cursor-pointer flex items-center gap-1 bg-primary-soft dark:bg-primary-soft px-2 py-0.5 rounded-lg border border-primary-border transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark All Present</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {groupStudents.map(st => {
                            const stAtt = studentAttendance[st.id] || attendance;
                            return (
                              <div key={st.id} className="flex items-center justify-between bg-surface p-2 rounded-xl border border-surface-border text-xs">
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
                                          ? attType === 'present' ? 'bg-primary text-white border-primary-border'
                                            : attType === 'late' ? 'bg-primary text-white border-primary-border'
                                            : 'bg-red-600 text-white border-red-700'
                                          : 'bg-surface-hover text-text-muted border-surface-border dark:border-surface-border-soft'
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
                    <label className="text-xs font-bold text-text-main">
                      2. Hausaufgaben (Homework):
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <button
                        type="button"
                        onClick={() => setHomeworkStatus('completed')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          homeworkStatus === 'completed'
                            ? 'bg-primary text-white border-primary-border shadow-xs'
                            : 'bg-surface-hover text-text-main border-surface-border'
                        }`}
                      >
                        Erledigt (Completed)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeworkStatus('assigned')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          homeworkStatus === 'assigned'
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface-hover text-text-main border-surface-border'
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
                            : 'bg-surface-hover text-text-main border-surface-border'
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
                      className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs"
                    />
                  </div>

                  {/* Teacher Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-main">
                      5. Notizen der Lehrkraft (Teacher Notes):
                    </label>
                    <textarea
                      rows={3}
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs focus:outline-none"
                      placeholder="Notizen zur Stunde hinterlassen..."
                    />
                  </div>

                  {/* Save Report Button */}
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-sm py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-primary/30"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Bericht speichern & Eltern benachrichtigen</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* PARENT COMMUNICATION QUICK BUTTONS */}
          <div className="pt-3 border-t border-slate-100 dark:border-surface-border space-y-2">
            <p className="text-xs font-bold text-text-main">
              Eltern-Kommunikation / Parent Communication:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowArabicParentReportModal(true)}
                className="bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
                className="bg-surface-hover hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Anruf Eltern / Call Parent</span>
              </a>

              {targetStudent?.phone && (
                <a
                  href={`tel:${targetStudent.phone}`}
                  className="bg-surface-hover hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />
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
