import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student, Group, Lesson, PaymentRecord } from '../types';
import { storage } from '../services/storageService';
import { 
  ALL_BACKUP_CATEGORIES, BackupCategory, calculateBackupStats, 
  generateBackupFilename, encryptBackupData, decryptBackupData, 
  analyzeBackupPayload, RestoreAnalysisResult, RestoreHistoryEntry 
} from '../utils/backupEngine';
import { 
  Download, Upload, ShieldCheck, Database, Lock, Unlock, 
  RefreshCw, RotateCcw, CheckSquare, Square, Users, User, 
  BookOpen, Award, DollarSign, Calendar, Clock, Settings, 
  MessageSquare, Video, FileText, Layout, Bell, AlertTriangle, 
  CheckCircle2, Share2, Save, HardDrive, Sparkles, History, 
  Eye, Sliders, ArrowRight, ShieldAlert, FileCode, Check
} from 'lucide-react';

interface SmartBackupCenterProps {
  onBack?: () => void;
}

export const SmartBackupCenter: React.FC<SmartBackupCenterProps> = ({ onBack }) => {
  const { 
    students, groups, lessons, payments, notifications, 
    profile, notificationSettings, inspirationSettings, 
    inspirationMessages, todos, setStudents, setGroups, 
    setLessons, setPayments, setNotifications, setProfile, 
    setNotificationSettings, setInspirationSettings, setInspirationMessages,
    lastBackupTime, performBackup, exportBackupFile, importBackupFile,
    t, _t
  } = useApp();

  // Active Tab: 'backup' | 'restore' | 'auto_settings' | 'history'
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'auto_settings' | 'history'>('backup');

  // Backup Category Selection
  const [selectedCategories, setSelectedCategories] = useState<BackupCategory[]>(
    ALL_BACKUP_CATEGORIES.map(c => c.id)
  );

  // Encryption Password
  const [enablePassword, setEnablePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Export State & Progress
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusMsg, setExportStatusMsg] = useState<string | null>(null);

  // Restore State
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');
  const [decryptPasswordInput, setDecryptPasswordInput] = useState<string>('');
  const [analysis, setAnalysis] = useState<RestoreAnalysisResult | null>(null);
  const [selectedRestoreCategories, setSelectedRestoreCategories] = useState<BackupCategory[]>([]);
  const [restoreMode, setRestoreMode] = useState<'smart' | 'merge' | 'replace'>('smart');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const [showReplaceWarning, setShowReplaceWarning] = useState<boolean>(false);

  // Restore Point / Rollback State
  const [hasRestorePoint, setHasRestorePoint] = useState<boolean>(false);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);

  // Auto Backups State
  const [autoDaily, setAutoDaily] = useState<boolean>(() => localStorage.getItem('dl_auto_backup_daily') === 'true');
  const [autoWeekly, setAutoWeekly] = useState<boolean>(() => localStorage.getItem('dl_auto_backup_weekly') !== 'false');
  const [autoMonthly, setAutoMonthly] = useState<boolean>(() => localStorage.getItem('dl_auto_backup_monthly') === 'true');
  const [retentionCount, setRetentionCount] = useState<number>(() => Number(localStorage.getItem('dl_backup_retention')) || 10);

  // History Log
  const [historyLogs, setHistoryLogs] = useState<RestoreHistoryEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing restore point & load history on mount
  useEffect(() => {
    const rp = localStorage.getItem('dl_restore_point_snapshot');
    setHasRestorePoint(!!rp);

    try {
      const histStr = localStorage.getItem('dl_restore_history');
      if (histStr) {
        setHistoryLogs(JSON.parse(histStr));
      }
    } catch (e) {
      console.error('Failed to parse restore history', e);
    }
  }, []);

  // Save Auto Backup Settings
  const saveAutoBackupConfig = (daily: boolean, weekly: boolean, monthly: boolean, retention: number) => {
    setAutoDaily(daily);
    setAutoWeekly(weekly);
    setAutoMonthly(monthly);
    setRetentionCount(retention);

    localStorage.setItem('dl_auto_backup_daily', String(daily));
    localStorage.setItem('dl_auto_backup_weekly', String(weekly));
    localStorage.setItem('dl_auto_backup_monthly', String(monthly));
    localStorage.setItem('dl_backup_retention', String(retention));
  };

  // Helper for Category Icons
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-4 h-4 text-primary" />;
      case 'Users': return <Users className="w-4 h-4 text-primary" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-primary" />;
      case 'Award': return <Award className="w-4 h-4 text-primary" />;
      case 'DollarSign': return <DollarSign className="w-4 h-4 text-primary" />;
      case 'Calendar': return <Calendar className="w-4 h-4 text-primary" />;
      case 'Clock': return <Clock className="w-4 h-4 text-primary" />;
      case 'Settings': return <Settings className="w-4 h-4 text-primary" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'Video': return <Video className="w-4 h-4 text-primary" />;
      case 'FileText': return <FileText className="w-4 h-4 text-primary" />;
      case 'Layout': return <Layout className="w-4 h-4 text-primary" />;
      case 'Bell': return <Bell className="w-4 h-4 text-primary" />;
      default: return <CheckSquare className="w-4 h-4 text-primary" />;
    }
  };

  // Selection Toggles
  const handleSelectAll = () => {
    setSelectedCategories(ALL_BACKUP_CATEGORIES.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
  };

  const toggleCategory = (id: BackupCategory) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter(c => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const stats = calculateBackupStats(selectedCategories, {
    students, groups, lessons, payments, notifications, profile,
    notificationSettings, inspirationSettings, inspirationMessages, todos
  });

  const isFullBackup = selectedCategories.length === ALL_BACKUP_CATEGORIES.length;

  // Execute Backup Export
  const handleCreateAndDownloadBackup = async () => {
    if (selectedCategories.length === 0) {
      setExportStatusMsg(_t('⚠️ يرجى اختيار فئة واحدة على الأقل للتصدير.', 'Please select at least one category to export.'));
      return;
    }

    setIsExporting(true);
    setExportProgress(10);
    setExportStatusMsg(_t('جاري تجميع وإعداد البيانات...', 'Gathering and preparing backup payload...'));

    setTimeout(async () => {
      try {
        setExportProgress(40);
        
        // Assemble payload
        const payloadData: any = {};
        if (selectedCategories.includes('students')) payloadData.students = students;
        if (selectedCategories.includes('groups')) payloadData.groups = groups;
        if (selectedCategories.includes('schedule')) payloadData.lessons = lessons;
        if (selectedCategories.includes('financial')) payloadData.payments = payments;
        if (selectedCategories.includes('notifications')) payloadData.notifications = notifications;
        if (selectedCategories.includes('settings')) payloadData.profile = profile;
        if (selectedCategories.includes('availability')) payloadData.workingHours = profile.workingHours;
        if (selectedCategories.includes('templates')) payloadData.parentMessageTemplates = profile.parentMessageTemplates;
        if (selectedCategories.includes('meeting_links')) payloadData.meetingLinks = { defaultZoomLink: profile.defaultZoomLink, defaultMeetLink: profile.defaultMeetLink };

        setExportProgress(70);

        let encryptedDataStr: string | undefined = undefined;
        let isEncrypted = false;

        if (enablePassword && password.trim().length > 0) {
          isEncrypted = true;
          setExportStatusMsg(_t('جاري تشفير البيانات بكلمة المرور...', 'Encrypting payload with password...'));
          encryptedDataStr = await encryptBackupData(payloadData, password);
        }

        const backupPayload = {
          app: 'TeacherAssistant' as const,
          version: '2.5.0',
          timestamp: new Date().toISOString(),
          backupType: isFullBackup ? ('Full' as const) : ('Partial' as const),
          encrypted: isEncrypted,
          categories: selectedCategories,
          counts: {
            students: payloadData.students?.length || 0,
            groups: payloadData.groups?.length || 0,
            lessons: payloadData.lessons?.length || 0,
            attendance: stats.attendanceCount,
            homework: stats.homeworkCount,
            exams: stats.examCount,
            payments: payloadData.payments?.length || 0,
            notifications: payloadData.notifications?.length || 0,
            todos: todos?.length || 0
          },
          metadata: {
            teacherName: profile.displayName || 'Teacher',
            totalRecords: stats.totalRecords,
            estimatedSizeKb: stats.estimatedSizeKb
          },
          encryptedData: encryptedDataStr,
          data: isEncrypted ? undefined : payloadData
        };

        const jsonString = JSON.stringify(backupPayload, null, 2);
        const fileName = generateBackupFilename(isFullBackup);

        setExportProgress(90);

        // Download JSON
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update last backup time
        performBackup();

        setExportProgress(100);
        setExportStatusMsg(_t('✓ تم إنشاء وتنزيل ملف النسخة الاحتياطية بنجاح!', '✓ Backup file created and downloaded successfully!'));
      } catch (e: any) {
        console.error('Backup creation error', e);
        setExportStatusMsg(`❌ Error: ${e.message || 'Failed to create backup'}`);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // Analyze File for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setRestoreFileContent(content);
        tryParseAndAnalyze(content, '');
      }
    };
    reader.readAsText(file);
  };

  const tryParseAndAnalyze = async (contentStr: string, passStr: string) => {
    try {
      let parsed = JSON.parse(contentStr);
      if (parsed.encrypted && parsed.encryptedData) {
        if (!passStr) {
          // Encrypted file requires password
          const result = analyzeBackupPayload(parsed, { students, groups, lessons, payments, notifications, profile });
          setAnalysis(result);
          return;
        }
        // Attempt decryption
        const decryptedData = await decryptBackupData(parsed.encryptedData, passStr);
        parsed.data = decryptedData;
      }

      const result = analyzeBackupPayload(parsed, { students, groups, lessons, payments, notifications, profile });
      setAnalysis(result);
      if (result.isValid && result.categories.length > 0) {
        setSelectedRestoreCategories(result.categories);
      }
    } catch (err: any) {
      setAnalysis({
        isValid: false,
        isEncrypted: false,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        backupType: 'Partial',
        categories: [],
        counts: { students: 0, groups: 0, lessons: 0, attendance: 0, homework: 0, exams: 0, payments: 0, notifications: 0, settingsIncluded: false },
        impact: { addStudents: 0, updateStudents: 0, addGroups: 0, updateGroups: 0, addLessons: 0, updateLessons: 0, addPayments: 0, updatePayments: 0, duplicateEntries: 0, conflicts: 0 },
        errorMessage: _t('كلمة المرور غير صحيحة أو الملف تالف.', 'Incorrect password or corrupted file.')
      });
    }
  };

  // Execute Selective Restore
  const triggerExecuteRestore = async () => {
    if (!analysis || !analysis.isValid || !restoreFileContent) return;

    if (restoreMode === 'replace' && !showReplaceWarning) {
      setShowReplaceWarning(true);
      return;
    }

    setShowReplaceWarning(false);
    setIsRestoring(true);
    setRestoreProgress(10);

    // Step 1: Create Automatic Restore Point
    console.log('students before', students.length);
    console.log('groups before', groups.length);
    console.log('lessons before', lessons.length);
    console.log('payments before', payments.length);

    const currentSnapshot = {
      timestamp: new Date().toISOString(),
      students,
      groups,
      lessons,
      payments,
      notifications,
      profile,
      notificationSettings,
      inspirationSettings,
      inspirationMessages,
      todos
    };

    localStorage.setItem('dl_restore_point_snapshot', JSON.stringify(currentSnapshot));
    setHasRestorePoint(true);
    setRestoreProgress(30);

    setTimeout(async () => {
      try {
        let parsed = JSON.parse(restoreFileContent);
        if (parsed.encrypted && parsed.encryptedData) {
          parsed.data = await decryptBackupData(parsed.encryptedData, decryptPasswordInput);
        }

        const data = parsed.data || parsed;
        setRestoreProgress(60);

        console.log('parsed students', data.students?.length);
        console.log('parsed groups', data.groups?.length);
        console.log('parsed lessons', data.lessons?.length);
        console.log('parsed payments', data.payments?.length);
        console.log('selectedRestoreCategories', selectedRestoreCategories);

        // Smart Restore logic
        if (restoreMode === 'smart') {
          if (selectedRestoreCategories.includes('students') && data.students) {
            try {
              const existingMap = new Map(students.map(s => [s.id, s]));
              const newStudentsList = [...students];

              data.students.forEach((impS: Student) => {
                if (existingMap.has(impS.id)) {
                  const idx = newStudentsList.findIndex(s => s.id === impS.id);
                  if (idx !== -1) newStudentsList[idx] = { ...newStudentsList[idx], ...impS };
                } else {
                  newStudentsList.push(impS);
                }
              });
              console.log('calling setStudents');
              setStudents(newStudentsList);
              await storage.setItem('dl_students', newStudentsList);
            } catch (categoryError: any) {
              console.error('Error during smart restore students', categoryError);
            }
          }

          if (selectedRestoreCategories.includes('groups') && data.groups) {
            try {
              const existingMap = new Map(groups.map(g => [g.id, g]));
              const newGroupsList = [...groups];

              data.groups.forEach((impG: Group) => {
                if (existingMap.has(impG.id)) {
                  const idx = newGroupsList.findIndex(g => g.id === impG.id);
                  if (idx !== -1) newGroupsList[idx] = { ...newGroupsList[idx], ...impG };
                } else {
                  newGroupsList.push(impG);
                }
              });
              console.log('calling setGroups');
              setGroups(newGroupsList);
              await storage.setItem('dl_groups', newGroupsList);
            } catch (categoryError: any) {
              console.error('Error during smart restore groups', categoryError);
            }
          }

          if (selectedRestoreCategories.includes('schedule') && data.lessons) {
            try {
              const existingMap = new Map(lessons.map(l => [l.id, l]));
              const newLessonsList = [...lessons];

              data.lessons.forEach((impL: Lesson) => {
                if (existingMap.has(impL.id)) {
                  const idx = newLessonsList.findIndex(l => l.id === impL.id);
                  if (idx !== -1) newLessonsList[idx] = { ...newLessonsList[idx], ...impL };
                } else {
                  newLessonsList.push(impL);
                }
              });
              console.log('calling setLessons');
              setLessons(newLessonsList);
              await storage.setItem('dl_lessons', newLessonsList);
            } catch (categoryError: any) {
              console.error('Error during smart restore lessons', categoryError);
            }
          }

          if (selectedRestoreCategories.includes('financial') && data.payments) {
            try {
              const existingMap = new Map(payments.map(p => [p.id, p]));
              const newPaymentsList = [...payments];

              data.payments.forEach((impP: PaymentRecord) => {
                if (existingMap.has(impP.id)) {
                  const idx = newPaymentsList.findIndex(p => p.id === impP.id);
                  if (idx !== -1) newPaymentsList[idx] = { ...newPaymentsList[idx], ...impP };
                } else {
                  newPaymentsList.push(impP);
                }
              });
              console.log('calling setPayments');
              setPayments(newPaymentsList);
              await storage.setItem('dl_payments', newPaymentsList);
            } catch (categoryError: any) {
              console.error('Error during smart restore payments', categoryError);
            }
          }
        } else if (restoreMode === 'merge') {
          // Merge Mode: append records
          if (selectedRestoreCategories.includes('students') && data.students) {
            try {
              const newList = [...students, ...data.students];
              console.log('calling setStudents');
              setStudents(newList);
              await storage.setItem('dl_students', newList);
            } catch (categoryError: any) {
              console.error('Error during merge restore students', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('groups') && data.groups) {
            try {
              const newList = [...groups, ...data.groups];
              console.log('calling setGroups');
              setGroups(newList);
              await storage.setItem('dl_groups', newList);
            } catch (categoryError: any) {
              console.error('Error during merge restore groups', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('schedule') && data.lessons) {
            try {
              const newList = [...lessons, ...data.lessons];
              console.log('calling setLessons');
              setLessons(newList);
              await storage.setItem('dl_lessons', newList);
            } catch (categoryError: any) {
              console.error('Error during merge restore lessons', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('financial') && data.payments) {
            try {
              const newList = [...payments, ...data.payments];
              console.log('calling setPayments');
              setPayments(newList);
              await storage.setItem('dl_payments', newList);
            } catch (categoryError: any) {
              console.error('Error during merge restore payments', categoryError);
            }
          }
        } else if (restoreMode === 'replace') {
          // Replace Mode: overwrite selected categories
          if (selectedRestoreCategories.includes('students') && data.students) {
            try {
              console.log('calling setStudents');
              setStudents(data.students);
              await storage.setItem('dl_students', data.students);
            } catch (categoryError: any) {
              console.error('Error during replace restore students', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('groups') && data.groups) {
            try {
              console.log('calling setGroups');
              setGroups(data.groups);
              await storage.setItem('dl_groups', data.groups);
            } catch (categoryError: any) {
              console.error('Error during replace restore groups', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('schedule') && data.lessons) {
            try {
              console.log('calling setLessons');
              setLessons(data.lessons);
              await storage.setItem('dl_lessons', data.lessons);
            } catch (categoryError: any) {
              console.error('Error during replace restore lessons', categoryError);
            }
          }
          if (selectedRestoreCategories.includes('financial') && data.payments) {
            try {
              console.log('calling setPayments');
              setPayments(data.payments);
              await storage.setItem('dl_payments', data.payments);
            } catch (categoryError: any) {
              console.error('Error during replace restore payments', categoryError);
            }
          }
        }

        // Restore Settings if selected
        if (selectedRestoreCategories.includes('settings') && data.profile) {
          try {
            const newProfile = { ...profile, ...data.profile };
            setProfile(newProfile);
            await storage.setItem('dl_profile', newProfile);
          } catch (categoryError: any) {
            console.error('Error during restore settings', categoryError);
          }
        }

        console.log('restore finished');

        setRestoreProgress(100);
        setRestoreSuccessMsg(_t('✓ تم استعادة البيانات المحددة بنجاح مع إنشاء نقطة استعادة تلقائية!', '✓ Selected categories restored successfully with auto restore point!'));

        // Log into history
        const newLog: RestoreHistoryEntry = {
          id: 'hist_' + Date.now(),
          timestamp: new Date().toISOString(),
          backupName: restoreFileName || 'Imported_Backup.json',
          mode: restoreMode,
          categories: selectedRestoreCategories,
          status: 'success',
          totalRecordsAdded: analysis.impact.addStudents + analysis.impact.addGroups + analysis.impact.addLessons + analysis.impact.addPayments,
          totalRecordsUpdated: analysis.impact.updateStudents + analysis.impact.updateGroups + analysis.impact.updateLessons + analysis.impact.updatePayments
        };

        const updatedLogs = [newLog, ...historyLogs];
        setHistoryLogs(updatedLogs);
        localStorage.setItem('dl_restore_history', JSON.stringify(updatedLogs));

      } catch (err: any) {
        console.error('Restore error', err);
        setRestoreSuccessMsg(`❌ Restore failed: ${err.message}`);
      } finally {
        setIsRestoring(false);
      }
    }, 400);
  };

  // Rollback Action
  const handleUndoLastRestore = () => {
    const rpStr = localStorage.getItem('dl_restore_point_snapshot');
    if (!rpStr) return;

    setIsRollingBack(true);
    setTimeout(() => {
      try {
        const rp = JSON.parse(rpStr);
        if (rp.students) setStudents(rp.students);
        if (rp.groups) setGroups(rp.groups);
        if (rp.lessons) setLessons(rp.lessons);
        if (rp.payments) setPayments(rp.payments);
        if (rp.notifications) setNotifications(rp.notifications);
        if (rp.profile) setProfile(rp.profile);

        setRestoreSuccessMsg(_t('✓ تم التراجع واستعادة النسخة السابقة بنجاح!', '✓ Rollback successful! Restored database to previous state.'));

        // Log rollback
        const newLog: RestoreHistoryEntry = {
          id: 'roll_' + Date.now(),
          timestamp: new Date().toISOString(),
          backupName: 'Undo Last Restore (Rollback)',
          mode: 'smart',
          categories: ALL_BACKUP_CATEGORIES.map(c => c.id),
          status: 'rolled_back',
          totalRecordsAdded: 0,
          totalRecordsUpdated: 0,
          notes: 'User performed 1-click rollback to restore point'
        };

        const updatedLogs = [newLog, ...historyLogs];
        setHistoryLogs(updatedLogs);
        localStorage.setItem('dl_restore_history', JSON.stringify(updatedLogs));

      } catch (e) {
        console.error('Rollback error', e);
      } finally {
        setIsRollingBack(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-5 animate-scale-up">
      {/* Top Header Card */}
      <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary dark:text-primary border border-primary/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-text-main">
                {_t('مركز النسخ الاحتياطي والاستعادة الذكي', 'Smart Backup & Restore Center', 'Sicherungs- & Wiederherstellungszentrum')}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {_t('إدارة شاملة لآمان البيانات، التشفير بكلمة المرور، الاستعادة الانتقائية والتراجع التلقائي', 'Professional data management, password encryption, selective restore & 1-click rollback')}
              </p>
            </div>
          </div>

          {/* Rollback button if restore point exists */}
          {hasRestorePoint && (
            <button
              type="button"
              onClick={handleUndoLastRestore}
              disabled={isRollingBack}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs shrink-0 active:scale-95"
              title={_t('التراجع عن آخر عملية استعادة', 'Undo last restore')}
            >
              <RotateCcw className={`w-4 h-4 ${isRollingBack ? 'animate-spin' : ''}`} />
              <span>{_t('التراجع عن آخر استعادة', 'Undo Last Restore')}</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-muted hover:text-text-main'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{_t('إنشاء نسخة احتياطية', 'Create Backup')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'restore'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-muted hover:text-text-main'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{_t('استعادة البيانات', 'Restore Center')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auto_settings')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'auto_settings'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-muted hover:text-text-main'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{_t('النسخ التلقائي', 'Auto Backups')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-muted hover:text-text-main'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{_t('سجل الاستعادة', 'Restore History')}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {exportStatusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between gap-3 animate-scale-up ${
          exportStatusMsg.includes('✓') 
            ? 'bg-primary-soft text-primary border-primary-border dark:bg-primary-soft dark:text-primary'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        }`}>
          <span>{exportStatusMsg}</span>
          <button type="button" onClick={() => setExportStatusMsg(null)} className="text-text-muted hover:text-text-main cursor-pointer">✕</button>
        </div>
      )}

      {restoreSuccessMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between gap-3 animate-scale-up ${
          restoreSuccessMsg.includes('✓') 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
        }`}>
          <span>{restoreSuccessMsg}</span>
          <button type="button" onClick={() => setRestoreSuccessMsg(null)} className="text-text-muted hover:text-text-main cursor-pointer">✕</button>
        </div>
      )}

      {/* ==========================================
          TAB 1: CREATE BACKUP
      ========================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-5 animate-fade-in">
          {/* Quick Actions & State Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border border-surface-border p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-2 rounded-xl bg-primary-soft hover:bg-primary/20 text-primary dark:text-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-primary-border/60"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{_t('تحديد الكل', 'Select All')}</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-3 py-2 rounded-xl bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-muted text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-surface-border/60"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{_t('إلغاء التحديد', 'Deselect All')}</span>
              </button>
            </div>

            {/* Selection Status Badge */}
            <div className="flex items-center gap-2">
              {isFullBackup ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{_t('تحديد كامل (100%)', 'Full Backup Selected (100%)')}</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-black flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {_t(`تحديد جزئي (${selectedCategories.length}/${ALL_BACKUP_CATEGORIES.length})`, `Partial Selection (${selectedCategories.length}/${ALL_BACKUP_CATEGORIES.length})`)}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Backup Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_BACKUP_CATEGORIES.map(category => {
              const isChecked = selectedCategories.includes(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    isChecked
                      ? 'bg-primary-soft/40 dark:bg-primary-soft/20 border-primary dark:border-primary shadow-2xs'
                      : 'bg-surface hover:bg-surface-hover border-surface-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-xl border shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-hover text-text-muted border-surface-border'
                  }`}>
                    {renderCategoryIcon(category.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-text-main truncate">
                        {_t(category.labelAr, category.labelEn)}
                      </h4>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                      />
                    </div>
                    <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                      {_t(category.descriptionAr, category.descriptionEn)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backup Information Preview & Summary Card */}
          <div className={`p-5 rounded-2xl border shadow-sm transition-all space-y-4 ${
            isFullBackup 
              ? 'bg-gradient-to-br from-emerald-500/10 via-surface to-surface border-emerald-500/40 dark:border-emerald-500/30'
              : 'bg-gradient-to-br from-indigo-500/10 via-surface to-surface border-indigo-500/40 dark:border-indigo-500/30'
          }`}>
            <div className="flex items-center justify-between border-b border-surface-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isFullBackup ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-main">
                    {isFullBackup ? _t('معاينة النسخة الاحتياطية الكاملة', 'Full Backup Preview') : _t('معاينة النسخة الاحتياطية الجزئية', 'Partial Backup Preview')}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {_t('تفاصيل البيانات المشمولة والحجم التقديري قبل التصدير', 'Payload details and estimated size before export')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-primary dark:text-primary font-mono bg-primary-soft dark:bg-primary-soft px-3 py-1 rounded-xl border border-primary-border/60">
                  {stats.totalRecords} {_t('سجل إجمالي', 'Total Records')}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-bold">
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('الطلاب', 'Students')}</span>
                <span className="font-mono text-sm text-text-main font-black">{stats.studentCount}</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('المجموعات', 'Groups')}</span>
                <span className="font-mono text-sm text-text-main font-black">{stats.groupCount}</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('سجلات الحضور', 'Attendance')}</span>
                <span className="font-mono text-sm text-text-main font-black">{stats.attendanceCount}</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('المدفوعات', 'Payments')}</span>
                <span className="font-mono text-sm text-text-main font-black">{stats.paymentCount}</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('سجلات الواجبات', 'Homework')}</span>
                <span className="font-mono text-sm text-text-main font-black">{stats.homeworkCount}</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] text-text-muted block uppercase">{_t('الحجم التقديري', 'Estimated Size')}</span>
                <span className="font-mono text-sm text-primary font-black">{stats.estimatedSizeKb} KB</span>
              </div>
              <div className="p-2.5 bg-surface rounded-xl border border-surface-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-text-muted block uppercase">{_t('وقت التخمين', 'Estimated Time')}</span>
                <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400 font-black">&lt; 1 sec</span>
              </div>
            </div>

            {/* Security Options Card */}
            <div className="bg-surface/90 border border-surface-border p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-text-main">
                    {_t('حماية الملف بكلمة مرور (تشفير AES)', 'Password Protect & Encrypt Backup File')}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none dark:peer-focus:ring-primary rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {enablePassword && (
                <div className="pt-2 border-t border-surface-border/80 flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={_t('أدخل كلمة مرور حماية الملف...', 'Enter encryption password...')}
                      className="w-full bg-surface-hover border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-text-muted hover:text-text-main text-xs cursor-pointer"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0 leading-tight">
                    {_t('سيتطلب فتح الملف أو استعادته إدخال هذه كلمة المرور.', 'This password will be required when restoring this backup file.')}
                  </span>
                </div>
              )}
            </div>

            {/* Export Progress Bar if exporting */}
            {isExporting && (
              <div className="space-y-1.5 pt-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-text-main">
                  <span>{_t('جاري إنشاء الملف...', 'Creating backup file...')}</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${exportProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Final Download Trigger Button */}
            <button
              type="button"
              onClick={handleCreateAndDownloadBackup}
              disabled={isExporting || selectedCategories.length === 0}
              className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 text-white font-black py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4.5 h-4.5" />
              <span>
                {isFullBackup 
                  ? _t('تنزيل النسخة الاحتياطية الكاملة (JSON)', 'Download Full Backup (JSON)')
                  : _t(`تنزيل النسخة الاحتياطية الجزئية (${selectedCategories.length} فئات)`, `Download Partial Backup (${selectedCategories.length} categories)`)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: RESTORE CENTER
      ========================================== */}
      {activeTab === 'restore' && (
        <div className="space-y-5 animate-fade-in">
          {/* Upload Drop Zone */}
          <div className="bg-surface border-2 border-dashed border-primary/40 hover:border-primary p-6 rounded-2xl text-center space-y-3 transition-all">
            <div className="p-3 bg-primary-soft rounded-2xl w-12 h-12 mx-auto flex items-center justify-center text-primary">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-main">
                {_t('اختر أو أسقط ملف النسخة الاحتياطية (JSON)', 'Select or drop backup file (JSON)')}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {_t('يدعم ملفات النسخ الاحتياطي العادية والمشفرة بكلمة مرور', 'Supports standard and password encrypted JSON backups')}
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary-hover text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>{_t('تصفح الجهاز لملف JSON', 'Browse JSON File')}</span>
            </button>

            {restoreFileName && (
              <div className="pt-2 text-xs font-mono font-bold text-primary flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{restoreFileName}</span>
              </div>
            )}
          </div>

          {/* Analysis & Selective Restore Area */}
          {analysis && (
            <div className="bg-surface border border-surface-border p-5 rounded-2xl shadow-sm space-y-5 animate-scale-up">
              {/* Encrypted Password Prompt if needed */}
              {analysis.isEncrypted && !analysis.payload?.data && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
                    <Lock className="w-4 h-4" />
                    <span>{_t('هذا الملف مشفر بكلمة مرور', 'This backup file is password protected')}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={decryptPasswordInput}
                      onChange={(e) => setDecryptPasswordInput(e.target.value)}
                      placeholder={_t('أدخل كلمة المرور لفك التشفير...', 'Enter password to unlock...')}
                      className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-text-main"
                    />
                    <button
                      type="button"
                      onClick={() => tryParseAndAnalyze(restoreFileContent!, decryptPasswordInput)}
                      className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                    >
                      {_t('فك التشفير', 'Unlock')}
                    </button>
                  </div>
                </div>
              )}

              {/* Backup Info Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-primary-soft text-primary font-mono text-[11px] font-bold">
                      v{analysis.version}
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {_t(`نوع النسخة: ${analysis.backupType}`, `Backup Type: ${analysis.backupType}`)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                    {_t('تحليل آمن للبيانات', 'Verified Structure')}
                  </span>
                </div>
              </div>

              {/* Restore Modes Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-text-muted tracking-wider">
                  {_t('طريقة الاستعادة (Restore Mode)', 'Restore Mode')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Smart Restore Mode */}
                  <div
                    onClick={() => setRestoreMode('smart')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                      restoreMode === 'smart'
                        ? 'bg-primary-soft/60 border-primary text-text-main shadow-xs'
                        : 'bg-surface hover:bg-surface-hover border-surface-border opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {_t('استعادة ذكية (مستحسن)', 'Smart Restore (Default)')}
                      </span>
                      {restoreMode === 'smart' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {_t('اكتشاف التكرارات، تحديث السجلات الحالية، وإضافة الجديدة بدون فقدان البيانات.', 'Detect duplicates, update existing, add missing, maintain links.')}
                    </p>
                  </div>

                  {/* Merge Mode */}
                  <div
                    onClick={() => setRestoreMode('merge')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                      restoreMode === 'merge'
                        ? 'bg-primary-soft/60 border-primary text-text-main shadow-xs'
                        : 'bg-surface hover:bg-surface-hover border-surface-border opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-text-main flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {_t('دمج البيانات (Merge)', 'Merge Mode')}
                      </span>
                      {restoreMode === 'merge' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {_t('الاحتفاظ بالبيانات الحالية مع إضافة جميع سجلات الاستيراد بدون حذف.', 'Keep current data, add imported records without deletion.')}
                    </p>
                  </div>

                  {/* Replace Mode */}
                  <div
                    onClick={() => setRestoreMode('replace')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                      restoreMode === 'replace'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'bg-surface hover:bg-surface-hover border-surface-border opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {_t('استبدال كلي (Replace)', 'Replace Mode')}
                      </span>
                      {restoreMode === 'replace' && <Check className="w-4 h-4 text-rose-500" />}
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {_t('استبدال البيانات الحالية تماماً بالبيانات المستوردة.', 'Replace current data with imported data for selected categories.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selective Categories to Restore */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-text-muted tracking-wider">
                    {_t('اختر الفئات المراد استعادتها', 'Categories to Restore')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedRestoreCategories(analysis.categories)}
                    className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    {_t('تحديد كل فئات الملف', 'Select All Available')}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {analysis.categories.map(catId => {
                    const isSel = selectedRestoreCategories.includes(catId);
                    const catObj = ALL_BACKUP_CATEGORIES.find(c => c.id === catId);
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => {
                          if (isSel) setSelectedRestoreCategories(selectedRestoreCategories.filter(c => c !== catId));
                          else setSelectedRestoreCategories([...selectedRestoreCategories, catId]);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSel 
                            ? 'bg-primary-soft text-primary border-primary-border' 
                            : 'bg-surface text-text-muted border-surface-border'
                        }`}
                      >
                        <span className="truncate">{catObj ? _t(catObj.labelAr, catObj.labelEn) : catId}</span>
                        {isSel ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Restore Impact Report Preview */}
              <div className="bg-surface-hover/80 border border-surface-border p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-text-main flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>{_t('تقرير التأثير قبل الاستعادة (Restore Impact Report)', 'Restore Impact Report')}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-surface rounded-lg border border-surface-border">
                    <span className="text-[10px] text-text-muted block">{_t('سجلات جديدة ستضاف', 'Records to Add')}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{analysis.impact.addStudents + analysis.impact.addGroups + analysis.impact.addLessons + analysis.impact.addPayments}
                    </span>
                  </div>

                  <div className="p-2 bg-surface rounded-lg border border-surface-border">
                    <span className="text-[10px] text-text-muted block">{_t('سجلات سيتم تحديثها', 'Records to Update')}</span>
                    <span className="font-mono text-primary font-bold">
                      {analysis.impact.updateStudents + analysis.impact.updateGroups + analysis.impact.updateLessons + analysis.impact.updatePayments}
                    </span>
                  </div>

                  <div className="p-2 bg-surface rounded-lg border border-surface-border">
                    <span className="text-[10px] text-text-muted block">{_t('سجلات مكررة', 'Duplicates Detected')}</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {analysis.impact.duplicateEntries}
                    </span>
                  </div>

                  <div className="p-2 bg-surface rounded-lg border border-surface-border">
                    <span className="text-[10px] text-text-muted block">{_t('تعارضات محتملة', 'Potential Conflicts')}</span>
                    <span className="font-mono text-slate-500 font-bold">0</span>
                  </div>
                </div>
              </div>

              {/* Progress bar if restoring */}
              {isRestoring && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-text-main">
                    <span>{_t('جاري إنشاء نقطة استعادة وتطبيق التغييرات...', 'Creating Restore Point & Applying...')}</span>
                    <span>{restoreProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${restoreProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Replace Warning Modal Alert */}
              {showReplaceWarning && (
                <div className="bg-rose-500/10 border-2 border-rose-500/40 p-4 rounded-xl space-y-3 animate-scale-up">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{_t('تنبيه هام: وضع الاستبدال سيقوم باستبدال البيانات الحالية!', 'Warning: Replace Mode will overwrite current data!')}</span>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">
                    {_t('سيتم أخذ نقطة استعادة تلقائية قبل التطبيق حتى تتمكن من التراجع في أي وقت.', 'An automatic Restore Point snapshot will be captured first so you can Undo anytime.')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={triggerExecuteRestore}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl cursor-pointer"
                    >
                      {_t('تأكيد الاستبدال والاستعادة', 'Confirm Replace & Restore')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplaceWarning(false)}
                      className="px-4 py-2 bg-surface border border-surface-border text-text-main font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {_t('إلغاء', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Restore Button */}
              {!showReplaceWarning && (
                <button
                  type="button"
                  onClick={triggerExecuteRestore}
                  disabled={isRestoring || selectedRestoreCategories.length === 0}
                  className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 text-white font-black py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {selectedRestoreCategories.length === ALL_BACKUP_CATEGORIES.length
                      ? _t('استعادة كل شيء (Restore Everything)', 'Restore Everything')
                      : _t(`استعادة الفئات المحددة (${selectedRestoreCategories.length})`, `Restore Selected Categories (${selectedRestoreCategories.length})`)}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: AUTO BACKUPS SETTINGS
      ========================================== */}
      {activeTab === 'auto_settings' && (
        <div className="bg-surface border border-surface-border p-5 rounded-2xl shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 border-b border-surface-border pb-3">
            <div className="p-2.5 rounded-xl bg-primary-soft text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-main">
                {_t('إعدادات النسخ الاحتياطي التلقائي وسجل الاحتفاظ', 'Automatic Backup & Retention Schedule')}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {_t('حفظ نسخ احتياطية دورية تلقائياً وتحديد عدد النسخ المحتفظ بها', 'Schedule periodic background snapshots & set retention limits')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Daily */}
            <div className="flex items-center justify-between p-3.5 bg-surface-hover/80 rounded-xl border border-surface-border">
              <div>
                <h4 className="text-xs font-black text-text-main">{_t('نسخة احتياطية يومية', 'Daily Automatic Backup')}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">{_t('حفظ لقطة يومية من البيانات عند فتح التطبيق', 'Capture a daily data snapshot upon app launch')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoDaily}
                onChange={(e) => saveAutoBackupConfig(e.target.checked, autoWeekly, autoMonthly, retentionCount)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Weekly */}
            <div className="flex items-center justify-between p-3.5 bg-surface-hover/80 rounded-xl border border-surface-border">
              <div>
                <h4 className="text-xs font-black text-text-main">{_t('نسخة احتياطية أسبوعية', 'Weekly Automatic Backup')}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">{_t('حفظ لقطة أسبوعية منتظمة من البيانات', 'Capture a weekly snapshot automatically')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoWeekly}
                onChange={(e) => saveAutoBackupConfig(autoDaily, e.target.checked, autoMonthly, retentionCount)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Monthly */}
            <div className="flex items-center justify-between p-3.5 bg-surface-hover/80 rounded-xl border border-surface-border">
              <div>
                <h4 className="text-xs font-black text-text-main">{_t('نسخة احتياطية شهرية', 'Monthly Automatic Backup')}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">{_t('حفظ لقطة شهرية لمراجعة نهاية الشهر', 'Capture a monthly snapshot for record archives')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoMonthly}
                onChange={(e) => saveAutoBackupConfig(autoDaily, autoWeekly, e.target.checked, retentionCount)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Retention Policy Selection */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-black text-text-main">
              {_t('سياسة الاحتفاظ بالنسخ الاحتياطية (Retention Policy)', 'Backup Retention Policy')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => saveAutoBackupConfig(autoDaily, autoWeekly, autoMonthly, cnt)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    retentionCount === cnt
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface hover:bg-surface-hover border-surface-border text-text-muted'
                  }`}
                >
                  {_t(`آخر ${cnt} نسخ`, `Keep Last ${cnt}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: RESTORE HISTORY
      ========================================== */}
      {activeTab === 'history' && (
        <div className="bg-surface border border-surface-border p-5 rounded-2xl shadow-2xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary-soft text-primary">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-text-main">
                  {_t('سجل عمليات الاستعادة والصيانة', 'Restore Operation History')}
                </h3>
                <p className="text-xs text-text-muted">
                  {_t('عرض السجل التاريخي لجميع عمليات استعادة البيانات السابقة', 'Chronological audit log of all previous restore operations')}
                </p>
              </div>
            </div>
          </div>

          {historyLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted space-y-1">
              <p>{_t('لا توجد عمليات استعادة مسجلة حالياً.', 'No restore history logged yet.')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-surface-hover/80 rounded-xl border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-bold text-text-main">{log.backupName}</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      {new Date(log.timestamp).toLocaleString()} • Mode: <span className="font-mono font-bold">{log.mode}</span>
                    </p>
                  </div>

                  <div className="text-right sm:text-end text-[11px] font-mono text-text-muted">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{log.totalRecordsAdded} Added</span>
                    <span className="mx-1">•</span>
                    <span className="text-primary font-bold">{log.totalRecordsUpdated} Updated</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
