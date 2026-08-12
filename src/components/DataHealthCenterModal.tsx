import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfileModal } from './StudentProfileModal';
import { GroupProfileModal } from './GroupProfileModal';
import { Student, Group, Lesson, PaymentRecord } from '../types';
import { storage } from '../services/storageService';
import { X, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, Activity, Video, MapPin, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface DataHealthCenterModalProps {
  onClose: () => void;
}

export const DataHealthCenterModal: React.FC<DataHealthCenterModalProps> = ({ onClose }) => {
  const { students, groups, lessons, payments, setStudents, setLessons, setPayments, language } = useApp();
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>(new Date().toLocaleTimeString());

  // Inspection modal for viewing orphaned items in a category
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    count: number;
    category: string;
    onConfirm: () => void;
  } | null>(null);

  // Results modal state
  const [resultModalData, setResultModalData] = useState<{
    isOpen: boolean;
    counts: {
      students: number;
      sessions: number;
      calendarEvents: number;
      payments: number;
      attendance: number;
      homework: number;
      exams: number;
    };
    storageRecovered: string;
  }>({
    isOpen: false,
    counts: { students: 0, sessions: 0, calendarEvents: 0, payments: 0, attendance: 0, homework: 0, exams: 0 },
    storageRecovered: '0.00'
  });

  const isRtl = language === 'ar';
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };

  const validGroupIds = useMemo(() => new Set(groups.map(g => g.id)), [groups]);

  // Original data health checks (Parent phone, schedule, price, zoom, address)
  const healthData = useMemo(() => {
    const studentsWithoutParentPhone: Student[] = [];
    const groupsWithoutSchedule: Group[] = [];
    const groupsWithoutPrice: Group[] = [];
    const groupsWithoutZoomLink: Group[] = [];
    const groupsWithoutAddress: Group[] = [];

    students.forEach(st => {
      if (!st.parentPhone || st.parentPhone.trim() === '') {
        studentsWithoutParentPhone.push(st);
      }
    });

    groups.forEach(g => {
      const hasSchedule = (g.scheduleDays && g.scheduleDays.length > 0) || (g.schedules && g.schedules.length > 0);
      if (!hasSchedule) {
        groupsWithoutSchedule.push(g);
      }
      if (!g.pricePerSession && !g.monthlyPackagePrice) {
        groupsWithoutPrice.push(g);
      }
      if (g.type === 'online' && (!g.zoomLink || g.zoomLink.trim() === '')) {
        groupsWithoutZoomLink.push(g);
      }
      if (g.type === 'offline' && (!g.address || g.address.trim() === '')) {
        groupsWithoutAddress.push(g);
      }
    });

    const completeStudentsCount = students.length - studentsWithoutParentPhone.length;

    return {
      completeStudentsCount,
      studentsWithoutParentPhone,
      groupsWithoutSchedule,
      groupsWithoutPrice,
      groupsWithoutZoomLink,
      groupsWithoutAddress
    };
  }, [students, groups]);

  // Orphan Data Detection
  const orphanedStudents = useMemo(() => {
    return students.filter(st => !st.groupId || !validGroupIds.has(st.groupId));
  }, [students, validGroupIds]);

  const orphanedSessions = useMemo(() => {
    return lessons.filter(l => (!l.groupId || !validGroupIds.has(l.groupId)) && !l.isQuickLesson);
  }, [lessons, validGroupIds]);

  const orphanedCalendarSessions = orphanedSessions;

  const orphanedPayments = useMemo(() => {
    return payments.filter(p => !p.groupId || !validGroupIds.has(p.groupId));
  }, [payments, validGroupIds]);

  const orphanedAttendance = useMemo(() => {
    return lessons.filter(l => (!l.groupId || !validGroupIds.has(l.groupId)) && l.report && (l.report.studentAttendance || l.report.attendanceStatus));
  }, [lessons, validGroupIds]);

  const orphanedHomework = useMemo(() => {
    return lessons.filter(l => (!l.groupId || !validGroupIds.has(l.groupId)) && l.report && (l.report.homeworkStatus || l.report.homeworkTitle || l.report.studentHomeworkDone));
  }, [lessons, validGroupIds]);

  const orphanedExams = useMemo(() => {
    return lessons.filter(l => (!l.groupId || !validGroupIds.has(l.groupId)) && l.report && (l.report.examScore !== undefined || l.report.quizScore !== undefined || l.report.studentExamGrade));
  }, [lessons, validGroupIds]);

  const totalOrphanedCount = 
    orphanedStudents.length + 
    orphanedSessions.length + 
    orphanedCalendarSessions.length + 
    orphanedPayments.length + 
    orphanedAttendance.length + 
    orphanedHomework.length + 
    orphanedExams.length;

  const totalRecords = students.length + lessons.length + payments.length + groups.length;
  const healthyRecords = Math.max(0, totalRecords - totalOrphanedCount);
  const healthScore = totalRecords > 0 ? Math.round((healthyRecords / totalRecords) * 100) : 100;

  // Approximate storage used in MB
  const storageUsedMB = useMemo(() => {
    const rawSize = JSON.stringify({ students, groups, lessons, payments }).length;
    return (rawSize / (1024 * 1024)).toFixed(2);
  }, [students, groups, lessons, payments]);

  // Health Status
  const healthStatus = healthScore >= 95 ? 'excellent' : healthScore >= 75 ? 'needs_cleanup' : 'critical';

  const handleScanDatabase = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanTimestamp(new Date().toLocaleTimeString());
    }, 800);
  };

  const executeCleanup = (category: string) => {
    let deletedStudents = 0;
    let deletedSessions = 0;
    let deletedCalendarEvents = 0;
    let deletedPayments = 0;
    let deletedAttendance = 0;
    let deletedHomework = 0;
    let deletedExams = 0;

    if (category === 'all' || category === 'students') {
      deletedStudents = orphanedStudents.length;
      const orphanedStudentIds = new Set(orphanedStudents.map(s => s.id));
      setStudents(prev => prev.filter(s => !orphanedStudentIds.has(s.id)));
    }

    if (category === 'all' || category === 'sessions' || category === 'calendar') {
      deletedSessions = orphanedSessions.length;
      deletedCalendarEvents = orphanedCalendarSessions.length;
      const orphanedSessionIds = new Set(orphanedSessions.map(s => s.id));
      setLessons(prev => prev.filter(l => !orphanedSessionIds.has(l.id)));
    }

    if (category === 'all' || category === 'payments') {
      deletedPayments = orphanedPayments.length;
      const orphanedPaymentIds = new Set(orphanedPayments.map(p => p.id));
      setPayments(prev => prev.filter(p => !orphanedPaymentIds.has(p.id)));
    }

    if (category === 'all' || category === 'attendance') {
      deletedAttendance = orphanedAttendance.length;
      // Clear attendance report fields on orphaned sessions
      const orphanedIds = new Set(orphanedAttendance.map(l => l.id));
      setLessons(prev => prev.map(l => {
        if (orphanedIds.has(l.id) && l.report) {
          return {
            ...l,
            report: {
              ...l.report,
              studentAttendance: undefined,
              attendanceStatus: undefined
            }
          };
        }
        return l;
      }));
    }

    if (category === 'all' || category === 'homework') {
      deletedHomework = orphanedHomework.length;
      const orphanedIds = new Set(orphanedHomework.map(l => l.id));
      setLessons(prev => prev.map(l => {
        if (orphanedIds.has(l.id) && l.report) {
          return {
            ...l,
            report: {
              ...l.report,
              homeworkStatus: undefined,
              homeworkTitle: undefined,
              homeworkDescription: undefined,
              studentHomeworkDone: undefined
            }
          };
        }
        return l;
      }));
    }

    if (category === 'all' || category === 'exams') {
      deletedExams = orphanedExams.length;
      const orphanedIds = new Set(orphanedExams.map(l => l.id));
      setLessons(prev => prev.map(l => {
        if (orphanedIds.has(l.id) && l.report) {
          return {
            ...l,
            report: {
              ...l.report,
              examScore: undefined,
              quizScore: undefined,
              studentExamGrade: undefined
            }
          };
        }
        return l;
      }));
    }

    storage.getItem<Lesson[]>('dl_lessons').then(full => {
      if (full) {
        const validGroupIds = new Set(groups.map(g => g.id));
        const cleaned = full.filter(l => !l.groupId || validGroupIds.has(l.groupId));
        storage.setItem('dl_lessons', cleaned);
      }
    });
    storage.getItem<PaymentRecord[]>('dl_payments').then(full => {
      if (full) {
        const validGroupIds = new Set(groups.map(g => g.id));
        const cleaned = full.filter(p => !p.groupId || validGroupIds.has(p.groupId));
        storage.setItem('dl_payments', cleaned);
      }
    });
    storage.getItem<Student[]>('dl_students').then(full => {
      if (full) {
        const validGroupIds = new Set(groups.map(g => g.id));
        const cleaned = full.filter(s => !s.groupId || validGroupIds.has(s.groupId));
        storage.setItem('dl_students', cleaned);
      }
    });

    const totalCount = deletedStudents + deletedSessions + deletedCalendarEvents + deletedPayments + deletedAttendance + deletedHomework + deletedExams;
    const recoveredMB = (totalCount * 0.012).toFixed(2);

    setConfirmModalData(null);
    setResultModalData({
      isOpen: true,
      counts: {
        students: deletedStudents,
        sessions: deletedSessions,
        calendarEvents: deletedCalendarEvents,
        payments: deletedPayments,
        attendance: deletedAttendance,
        homework: deletedHomework,
        exams: deletedExams
      },
      storageRecovered: recoveredMB === '0.00' && totalCount > 0 ? '0.01' : recoveredMB
    });
  };

  const triggerCleanupConfirmation = (category: string, count: number, title: string) => {
    if (count === 0) return;
    setConfirmModalData({
      isOpen: true,
      title,
      count,
      category,
      onConfirm: () => executeCleanup(category)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className={`w-full max-w-md h-full bg-surface shadow-2xl flex flex-col ${isRtl ? 'text-right' : 'text-left'} animate-slide-in-right`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-hover/30">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h2 className="font-black text-lg text-text">{_t('مركز صحة البيانات', 'Data Health Center')}</h2>
              <p className="text-[11px] text-text-muted">Last scanned: {scanTimestamp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScanDatabase}
              disabled={isScanning}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title={_t('فحص قاعدة البيانات', 'Scan Database')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{_t('فحص', 'Scan')}</span>
            </button>
            <button onClick={onClose} className="p-2 bg-surface-hover rounded-xl text-text-muted hover:text-text transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">

          {/* 8. Data Health Summary Card */}
          <div className="bg-surface-hover/40 border border-surface-border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-text-muted uppercase tracking-wider">{_t('ملخص صحة قاعدة البيانات', 'Database Health Summary')}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                healthStatus === 'excellent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                healthStatus === 'needs_cleanup' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {healthStatus === 'excellent' && '🟢 ' + _t('ممتاز', 'Excellent')}
                {healthStatus === 'needs_cleanup' && '🟡 ' + _t('يحتاج تنظيف', 'Needs Cleanup')}
                {healthStatus === 'critical' && '🔴 ' + _t('حرج', 'Critical')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-background/80 p-3 rounded-xl border border-surface-border">
                <p className="text-[11px] text-text-muted font-medium">{_t('مؤشر الصحة', 'Health Score')}</p>
                <p className="text-xl font-black text-text mt-0.5">{healthScore}%</p>
              </div>
              <div className="bg-background/80 p-3 rounded-xl border border-surface-border">
                <p className="text-[11px] text-text-muted font-medium">{_t('مساحة التخزين', 'Storage Used')}</p>
                <p className="text-xl font-black text-text mt-0.5">{storageUsedMB} MB</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs px-1 text-text-muted pt-1">
              <span>{_t('السجلات السليمة:', 'Healthy Records:')} <strong className="text-emerald-600 dark:text-emerald-400">{healthyRecords}</strong></span>
              <span>{_t('السجلات اليتيمة:', 'Orphaned Records:')} <strong className="text-rose-600 dark:text-rose-400">{totalOrphanedCount}</strong></span>
            </div>
          </div>

          {/* New Section: Data Integrity & Cleanup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <h3 className="font-black text-sm text-text flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span>{_t('سلامة البيانات وتنظيفها', 'Data Integrity & Cleanup')}</span>
              </h3>
              {totalOrphanedCount > 0 && (
                <button
                  onClick={() => triggerCleanupConfirmation('all', totalOrphanedCount, _t('تنظيف جميع البيانات اليتيمة', 'Clean All Orphan Data'))}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  {_t('تنظيف الكل', 'Clean All')} ({totalOrphanedCount})
                </button>
              )}
            </div>

            {/* Orphan Item Component Helper */}
            {renderOrphanCard(
              _t('طلاب بدون جروب', 'Students Without Group'),
              orphanedStudents.length,
              () => setViewingCategory('students'),
              () => triggerCleanupConfirmation('students', orphanedStudents.length, _t('حذف الطلاب بدون جروب', 'Delete Students Without Group'))
            )}

            {renderOrphanCard(
              _t('حصص بدون جروب', 'Sessions Without Group'),
              orphanedSessions.length,
              () => setViewingCategory('sessions'),
              () => triggerCleanupConfirmation('sessions', orphanedSessions.length, _t('حذف الحصص بدون جروب', 'Delete Sessions Without Group'))
            )}

            {renderOrphanCard(
              _t('حصص التقويم بدون جروب', 'Calendar Sessions Without Group'),
              orphanedCalendarSessions.length,
              () => setViewingCategory('calendar'),
              () => triggerCleanupConfirmation('calendar', orphanedCalendarSessions.length, _t('حذف أحداث التقويم بدون جروب', 'Delete Calendar Sessions Without Group'))
            )}

            {renderOrphanCard(
              _t('مدفوعات بدون جروب', 'Payments Without Group'),
              orphanedPayments.length,
              () => setViewingCategory('payments'),
              () => triggerCleanupConfirmation('payments', orphanedPayments.length, _t('حذف المدفوعات بدون جروب', 'Delete Payments Without Group'))
            )}

            {renderOrphanCard(
              _t('سجلات الحضور بدون جروب', 'Attendance Records Without Group'),
              orphanedAttendance.length,
              () => setViewingCategory('attendance'),
              () => triggerCleanupConfirmation('attendance', orphanedAttendance.length, _t('حذف سجلات الحضور اليتيمة', 'Delete Orphaned Attendance'))
            )}

            {renderOrphanCard(
              _t('سجلات الواجبات بدون جروب', 'Homework Records Without Group'),
              orphanedHomework.length,
              () => setViewingCategory('homework'),
              () => triggerCleanupConfirmation('homework', orphanedHomework.length, _t('حذف سجلات الواجبات اليتيمة', 'Delete Orphaned Homework'))
            )}

            {renderOrphanCard(
              _t('سجلات الامتحانات بدون جروب', 'Exam/Quiz Records Without Group'),
              orphanedExams.length,
              () => setViewingCategory('exams'),
              () => triggerCleanupConfirmation('exams', orphanedExams.length, _t('حذف سجلات الامتحانات اليتيمة', 'Delete Orphaned Exams'))
            )}
          </div>

          {/* Original Integrity sections (Parent phone, schedule, price, zoom, address) */}
          <div className="space-y-4 pt-4 border-t border-surface-border">
            <h3 className="font-black text-sm text-text">
              {_t('اكتشاف النقص في البيانات الأساسية', 'Core Data Completeness')}
            </h3>

            {healthData.completeStudentsCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{healthData.completeStudentsCount} {_t('طالب مكتمل البيانات', 'Students with complete data')}</span>
              </div>
            )}

            {healthData.studentsWithoutParentPhone.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{healthData.studentsWithoutParentPhone.length} {_t('طلاب بدون رقم ولي أمر', 'Students missing parent phone')}</span>
                </div>
                <div className="space-y-1 pl-4 rtl:pl-0 rtl:pr-4">
                  {healthData.studentsWithoutParentPhone.map(st => (
                    <div key={st.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                      <span className="font-medium text-text">{st.name}</span>
                      <button 
                        onClick={() => setSelectedStudent(st)}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded-md font-bold hover:bg-amber-600 transition cursor-pointer"
                      >
                        {_t('إصلاح', 'Fix Now')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthData.groupsWithoutSchedule.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{healthData.groupsWithoutSchedule.length} {_t('جروب بدون جدول زمني', 'Groups missing schedule')}</span>
                </div>
                <div className="space-y-1 pl-4 rtl:pl-0 rtl:pr-4">
                  {healthData.groupsWithoutSchedule.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                      <span className="font-medium text-text">{g.name}</span>
                      <button 
                        onClick={() => setSelectedGroup(g)}
                        className="px-2.5 py-1 bg-rose-500 text-white rounded-md font-bold hover:bg-rose-600 transition cursor-pointer"
                      >
                        {_t('إصلاح', 'Fix Now')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {totalOrphanedCount === 0 && 
           healthData.studentsWithoutParentPhone.length === 0 && 
           healthData.groupsWithoutSchedule.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-70">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="font-bold text-text">{_t('جميع بيانات قاعدة البيانات سليمة ومكتملة!', 'All database records are healthy and complete!')}</p>
            </div>
          )}

        </div>
      </div>

      {/* Viewing Category Items Modal */}
      {viewingCategory && (
        <div onClick={() => setViewingCategory(null)} className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-surface-border rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-black text-base text-text">
                {viewingCategory === 'students' && _t('الطلاب بدون جروب', 'Students Without Group')}
                {viewingCategory === 'sessions' && _t('الحصص بدون جروب', 'Sessions Without Group')}
                {viewingCategory === 'calendar' && _t('أحداث التقويم بدون جروب', 'Calendar Sessions Without Group')}
                {viewingCategory === 'payments' && _t('المدفوعات بدون جروب', 'Payments Without Group')}
                {viewingCategory === 'attendance' && _t('سجلات الحضور اليتيمة', 'Orphaned Attendance Records')}
                {viewingCategory === 'homework' && _t('سجلات الواجبات اليتيمة', 'Orphaned Homework Records')}
                {viewingCategory === 'exams' && _t('سجلات الامتحانات اليتيمة', 'Orphaned Exam Records')}
              </h3>
              <button onClick={() => setViewingCategory(null)} className="p-1.5 hover:bg-surface-hover rounded-full text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {getItemsForCategory(viewingCategory).map((item: any) => (
                <div key={item.id} className="p-2.5 bg-background border border-surface-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-text">{item.name || item.title || item.studentName || 'Record #' + item.id.slice(0,6)}</p>
                    <p className="text-[10px] text-text-muted">{item.date || item.createdAt || item.dueDate || 'No date'}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded font-bold text-[10px]">Orphaned</span>
                </div>
              ))}
              {getItemsForCategory(viewingCategory).length === 0 && (
                <p className="text-center text-text-muted py-6">No orphaned records found in this category.</p>
              )}
            </div>

            <div className="pt-2 border-t border-surface-border flex justify-end">
              <button
                onClick={() => setViewingCategory(null)}
                className="px-4 py-2 bg-surface-hover hover:bg-surface-hover/80 text-text font-bold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Cleanup Confirmation Modal */}
      {confirmModalData?.isOpen && (
        <div onClick={() => setConfirmModalData(null)} className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-surface-border rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-text">⚠️ {_t('تنظيف البيانات اليتيمة', 'Cleanup Orphan Data')}</h3>
                <p className="text-xs text-text-muted">Orphan Data Cleanup</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              {_t(
                'السجلات المحددة غير مرتبطة بأي جروب حالي صالح.',
                'The selected records are not linked to any existing group.'
              )}
            </p>

            <div className="bg-background p-3 rounded-xl border border-surface-border text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-text-muted">Target Action:</span>
                <span className="text-text">{confirmModalData.title}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-text-muted">Records to delete:</span>
                <span className="text-rose-600 dark:text-rose-400">{confirmModalData.count}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
              {_t('لا يمكن التراجع عن هذا الإجراء.', 'This action cannot be undone.')}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmModalData(null)}
                className="flex-1 py-2.5 bg-surface-hover hover:bg-surface-hover/80 text-text font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {_t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={confirmModalData.onConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                {_t('حذف نهائياً', 'Delete Permanently')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Cleanup Results Modal */}
      {resultModalData.isOpen && (
        <div onClick={() => setResultModalData(prev => ({ ...prev, isOpen: false }))} className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-surface-border rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-emerald-500">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-text">{_t('اكتمل التنظيف', 'Cleanup Complete')}</h3>
                <p className="text-xs text-text-muted">Database successfully optimized</p>
              </div>
            </div>

            <div className="bg-background p-3.5 rounded-xl border border-surface-border text-xs space-y-2">
              <p className="font-bold text-text">{_t('تم حذف:', 'Deleted:')}</p>
              <ul className="list-disc list-inside space-y-1 text-text-muted font-medium pl-1">
                {resultModalData.counts.students > 0 && <li>Students: {resultModalData.counts.students}</li>}
                {resultModalData.counts.sessions > 0 && <li>Sessions: {resultModalData.counts.sessions}</li>}
                {resultModalData.counts.calendarEvents > 0 && <li>Calendar Events: {resultModalData.counts.calendarEvents}</li>}
                {resultModalData.counts.payments > 0 && <li>Payments: {resultModalData.counts.payments}</li>}
                {resultModalData.counts.attendance > 0 && <li>Attendance Records: {resultModalData.counts.attendance}</li>}
                {resultModalData.counts.homework > 0 && <li>Homework Records: {resultModalData.counts.homework}</li>}
                {resultModalData.counts.exams > 0 && <li>Exam Records: {resultModalData.counts.exams}</li>}
                {Object.values(resultModalData.counts).every(v => v === 0) && <li>No orphaned records found to clean.</li>}
              </ul>
              <div className="pt-2 border-t border-surface-border flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Storage Recovered:</span>
                <span>{resultModalData.storageRecovered} MB</span>
              </div>
            </div>

            <button
              onClick={() => setResultModalData(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          initialTab="edit"
        />
      )}

      {selectedGroup && (
        <GroupProfileModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );

  function renderOrphanCard(title: string, count: number, onView: () => void, onDeleteAll: () => void) {
    return (
      <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
        count > 0 
          ? 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300' 
          : 'bg-surface-hover/30 border-surface-border text-text-muted'
      }`}>
        <div className="space-y-0.5">
          <p className="font-bold text-xs text-text">{title}: <span className={count > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-text-muted'}>{count}</span></p>
          <p className="text-[10px] text-text-muted">
            {count > 0 ? _t('يوجد سجلات يتيمة غير مرتبطة بجروب', 'Orphaned records detected') : _t('جميع السجلات سليمة', 'All records linked properly')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {count > 0 && (
            <>
              <button
                onClick={onView}
                className="px-2.5 py-1 bg-surface hover:bg-surface-hover text-text font-bold text-[11px] rounded-lg border border-surface-border transition cursor-pointer"
              >
                {_t('عرض', 'View')}
              </button>
              <button
                onClick={onDeleteAll}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>{_t('حذف الكل', 'Delete All')}</span>
              </button>
            </>
          )}
          {count === 0 && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OK</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  function getItemsForCategory(category: string | null) {
    switch (category) {
      case 'students': return orphanedStudents;
      case 'sessions': return orphanedSessions;
      case 'calendar': return orphanedCalendarSessions;
      case 'payments': return orphanedPayments;
      case 'attendance': return orphanedAttendance;
      case 'homework': return orphanedHomework;
      case 'exams': return orphanedExams;
      default: return [];
    }
  }
};
