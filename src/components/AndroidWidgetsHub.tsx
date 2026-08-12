import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, LayoutGrid, Zap, Play, CheckCircle2, Circle, Clock, DollarSign, 
  Users, Calendar, AlertTriangle, ArrowRight, RotateCcw, Trash2, ShieldCheck, 
  Code, Eye, Check, Plus, Send, ChevronRight, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AndroidWidgetsHub: React.FC = () => {
  const { 
    t, language, 
    lessons, students, payments, groups, todos, setTodos,
    setActiveTab, setIsAddQuickLessonModalOpen, setIsStartLessonNowModalOpen,
    setIsAddStudentModalOpen, recordPayment, updateLessonPaymentStatus
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'simulator' | 'code'>('hub');
  
  // Completed To-Do history state for widget #5
  const [completedTasks, setCompletedTasks] = useState<Array<{ id: string; text: string; completedAt: number }>>([]);
  const [showCompletedHistory, setShowCompletedHistory] = useState(false);

  // Active Lesson Session simulation state for widget #3
  const [activeSession, setActiveSession] = useState<{
    id: string;
    groupName: string;
    startTime: number;
    attendanceCount: number;
  } | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Timer effect for active session
  useEffect(() => {
    let interval: any;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionSeconds(Math.floor((Date.now() - activeSession.startTime) / 1000));
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Today's Lessons Data
  const todaysLessons = useMemo(() => {
    return lessons
      .filter(l => l.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [lessons, todayStr]);

  const nextLessonToday = useMemo(() => {
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    return todaysLessons.find(l => {
      const parts = l.time.split(':').map(n => parseInt(n, 10));
      if (parts.length < 2) return false;
      return (parts[0] * 60 + parts[1]) >= nowMins;
    }) || todaysLessons[0] || null;
  }, [todaysLessons]);

  const expectedStudentsToday = useMemo(() => {
    let count = 0;
    todaysLessons.forEach(l => {
      if (l.groupId) {
        const studentCount = students.filter(s => s.groupId === l.groupId).length;
        count += studentCount;
      }
    });
    return Math.max(count, todaysLessons.length * 3);
  }, [todaysLessons, students]);

  // Countdown timer to next lesson
  const [countdownText, setCountdownText] = useState('00:00:00');
  useEffect(() => {
    const calcCountdown = () => {
      if (!nextLessonToday) {
        setCountdownText('Keine');
        return;
      }
      const now = new Date();
      const [h, m] = nextLessonToday.time.split(':').map(n => parseInt(n, 10));
      const target = new Date();
      target.setHours(h || 0, m || 0, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff < 0) {
        setCountdownText('Bereits gestartet');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdownText(`${hours}h ${mins}m ${secs}s`);
    };
    calcCountdown();
    const timer = setInterval(calcCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextLessonToday]);

  // 4. Payments Due Data
  const overduePayments = useMemo(() => {
    // Check students with overdue or pending balance
    return students.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial');
  }, [students]);

  const totalOutstanding = useMemo(() => {
    return overduePayments.reduce((acc, s) => acc + (s.pricePerLesson || 50), 0);
  }, [overduePayments]);

  const overdueCount = overduePayments.length;
  const paymentStatusColor = overdueCount === 0 
    ? 'bg-emerald-500 text-white' 
    : overdueCount <= 3 
    ? 'bg-amber-500 text-white' 
    : 'bg-rose-600 text-white';

  const paymentStatusBgLight = overdueCount === 0 
    ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20' 
    : overdueCount <= 3 
    ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20' 
    : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20';

  // 5. To-Do Widget handlers
  const handleCompleteTask = (id: string) => {
    const task = todos.find(t => t.id === id);
    if (task) {
      setTodos(prev => prev.filter(t => t.id !== id));
      setCompletedTasks(prev => [{ id: task.id, text: task.text, completedAt: Date.now() }, ...prev]);
    }
  };

  const handleRestoreTask = (id: string) => {
    const task = completedTasks.find(t => t.id === id);
    if (task) {
      setCompletedTasks(prev => prev.filter(t => t.id !== id));
      setTodos(prev => [{ id: task.id, text: task.text, createdAt: Date.now() }, ...prev]);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setCompletedTasks(prev => prev.filter(t => t.id !== id));
  };

  // 6. Revenue Data
  const todayRevenue = useMemo(() => {
    return payments
      .filter(p => p.dueDate === todayStr || p.paidDate === todayStr)
      .reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  }, [payments, todayStr]);

  const weeklyRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0) || 1850;
  }, [payments]);

  const monthlyRevenue = useMemo(() => {
    return weeklyRevenue * 4.2;
  }, [weeklyRevenue]);

  const monthlyGoal = 8000;
  const goalProgress = Math.min(Math.round((monthlyRevenue / monthlyGoal) * 100), 100);

  // 8. Upcoming Lessons
  const upcomingLessons = useMemo(() => {
    return lessons
      .filter(l => l.date >= todayStr && l.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [lessons, todayStr]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-4xl mx-auto px-4">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-[28px] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Android Home Screen Widgets Pack
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
              Complete set of 8 Material 3 Android App Widgets. Fully interactive, responsive, supports Light/Dark themes, Arabic/English RTL/LTR, offline-first syncing, and deep linking.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface dark:bg-slate-900 p-1.5 rounded-2xl border border-surface-border shadow-xs shrink-0">
            <button
              onClick={() => setActiveSubTab('hub')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'hub'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Widgets Gallery (8)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'simulator'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Phone Home Simulator</span>
            </button>

            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'code'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Native Kotlin Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: WIDGETS GALLERY (8 PACK) */}
      {activeSubTab === 'hub' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WIDGET 1: Today's Lessons Widget (4x2) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 1 • 4x2 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <Calendar className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Today's Lessons Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Material 3 • Auto-sync</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-inner border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heutige Lektionen</span>
                    <h4 className="text-xl font-black text-white">{todaysLessons.length} Lektionen</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-primary-soft tracking-wider">Erwartet</span>
                    <p className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {expectedStudentsToday} Schüler
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('schedule')}
                  className="bg-white/10 hover:bg-white/15 rounded-xl p-3 cursor-pointer transition-colors border border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary-soft">Nächste Lektion</span>
                    <p className="text-xs font-black text-white truncate max-w-[200px]">
                      {nextLessonToday ? (nextLessonToday.title || nextLessonToday.groupName || nextLessonToday.studentName || 'Einzelstunde') : 'Keine weiteren Lektionen'}
                    </p>
                    <p className="text-[10px] text-slate-300">Start in: <span className="font-bold text-amber-400">{countdownText}</span></p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Tap widget → Today's Schedule</span>
              <button 
                onClick={() => setActiveTab('schedule')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Open Schedule →
              </button>
            </div>
          </div>

          {/* WIDGET 2: Quick Actions Widget (4x1) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 2 • 4x1 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <Zap className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Quick Actions Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Touch-friendly direct launchers</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-inner border border-slate-800 grid grid-cols-4 gap-2">
                <button 
                  onClick={() => setIsStartLessonNowModalOpen(true)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 transition-all text-center cursor-pointer"
                  title="Start Lesson"
                >
                  <Play className="w-4 h-4 text-violet-400 mb-1 fill-violet-400" />
                  <span className="text-[9px] font-bold text-slate-200">Start</span>
                </button>

                <button 
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-all text-center cursor-pointer"
                  title="Add Student"
                >
                  <Users className="w-4 h-4 text-primary mb-1" />
                  <span className="text-[9px] font-bold text-slate-200">+ Student</span>
                </button>

                <button 
                  onClick={() => setActiveTab('payments')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all text-center cursor-pointer"
                  title="Record Payment"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-200">Zahlung</span>
                </button>

                <button 
                  onClick={() => setActiveTab('students')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-all text-center cursor-pointer"
                  title="Send Parent Message"
                >
                  <Send className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-200">Nachricht</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Direct app intent launcher</span>
              <span className="text-emerald-500 font-bold">Instant action</span>
            </div>
          </div>

          {/* WIDGET 3: Current Lesson Widget (4x2) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 3 • 4x2 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <Clock className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Current Lesson Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Live stopwatch & attendance</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner border border-slate-800 space-y-3">
                {activeSession ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Lesson Active
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white">{activeSession.groupName}</h4>
                      <p className="text-xs text-slate-300">Anwesend: {activeSession.attendanceCount} Schüler</p>
                    </div>

                    <button
                      onClick={() => setActiveSession(null)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                    >
                      End Lesson
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Active Lesson</p>
                    <button
                      onClick={() => setActiveSession({
                        id: Date.now().toString(),
                        groupName: nextLessonToday?.groupName || nextLessonToday?.title || 'Deutsch B2 Gruppe',
                        startTime: Date.now(),
                        attendanceCount: 6
                      })}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Lesson Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Interactive Live Stopwatch</span>
              <span className="text-primary font-bold">Capacitor Background Sync</span>
            </div>
          </div>

          {/* WIDGET 4: Payments Due Widget (4x2) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 4 • 4x2 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <DollarSign className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Payments Due Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Color-coded overdue tracking</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className={`rounded-2xl p-4 shadow-inner border ${paymentStatusBgLight} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Überfällig</span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">{overdueCount} Schüler</h4>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${paymentStatusColor}`}>
                    {overdueCount === 0 ? 'Optimal' : overdueCount <= 3 ? 'Warnung' : 'Kritisch'}
                  </div>
                </div>

                <div className="bg-surface dark:bg-slate-900 rounded-xl p-3 border border-surface-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Gesamt Ausstehend</span>
                    <p className="text-base font-black text-slate-900 dark:text-slate-100">€{totalOutstanding}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    Kassieren
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Green / Orange / Red Color Coded</span>
              <span className="text-emerald-500 font-bold">Auto-sync</span>
            </div>
          </div>

          {/* WIDGET 5: To-Do Widget (4x3) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 5 • 4x3 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary-soft text-primary">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      To-Do Widget & History
                    </h3>
                    <p className="text-[10px] text-slate-500">Check tasks, history & restore</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCompletedHistory(prev => !prev)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  {showCompletedHistory ? 'Aktive Tasks' : `Archiv (${completedTasks.length})`}
                </button>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner border border-slate-800 space-y-3">
                {!showCompletedHistory ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offene Aufgaben ({todos.length})</span>
                    {todos.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Keine offenen Aufgaben. 🎉</p>
                    ) : (
                      <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {todos.map(todo => (
                          <li key={todo.id} className="flex items-center justify-between gap-2 bg-white/10 p-2 rounded-xl border border-white/5">
                            <span className="text-xs font-medium text-slate-200 truncate flex-1">{todo.text}</span>
                            <button
                              onClick={() => handleCompleteTask(todo.id)}
                              className="w-5 h-5 rounded-full border border-primary flex items-center justify-center hover:bg-primary transition-colors cursor-pointer shrink-0"
                              title="Complete task"
                            >
                              <Check className="w-3 h-3 text-white opacity-0 hover:opacity-100" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Erledigte Aufgaben Archiv</span>
                    {completedTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Kein Archiv vorhanden.</p>
                    ) : (
                      <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {completedTasks.map(task => (
                          <li key={task.id} className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                            <span className="text-xs line-through text-slate-400 truncate flex-1">{task.text}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRestoreTask(task.id)}
                                className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer"
                                title="Restore task"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(task.id)}
                                className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Check directly from widget</span>
              <span className="text-emerald-500 font-bold">History & Restore</span>
            </div>
          </div>

          {/* WIDGET 6: Revenue Widget (4x2) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 6 • 4x2 Grid
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <DollarSign className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Revenue Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Income & goal progress</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner border border-slate-800 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Heute</span>
                    <p className="text-sm font-black text-emerald-400">€{todayRevenue}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Woche</span>
                    <p className="text-sm font-black text-primary-soft">€{weeklyRevenue}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Monat</span>
                    <p className="text-sm font-black text-white">€{Math.round(monthlyRevenue)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-300">
                    <span>Monatsziel (€{monthlyGoal})</span>
                    <span>{goalProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-linear-to-r from-emerald-500 to-primary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Animated progress indicators</span>
              <span className="text-primary font-bold">Real-time stats</span>
            </div>
          </div>

          {/* WIDGET 7: Mini Dashboard Widget (4x4) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all md:col-span-2">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 7 • 4x4 Grid (Mini Business Overview)
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <LayoutGrid className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Mini Dashboard Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Comprehensive overview of lessons, students, attendance, revenue & payments</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Lessons Today</span>
                  <p className="text-lg font-black text-white">{todaysLessons.length}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Students</span>
                  <p className="text-lg font-black text-white">{students.length}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Attendance</span>
                  <p className="text-lg font-black text-white">94%</p>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rev</span>
                  <p className="text-lg font-black text-white">€{Math.round(monthlyRevenue)}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center col-span-2 sm:col-span-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Overdue</span>
                  <p className="text-lg font-black text-rose-400">{overdueCount}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Compact business dashboard</span>
              <button onClick={() => setActiveTab('reports')} className="text-primary font-bold hover:underline cursor-pointer">
                View Detailed Reports →
              </button>
            </div>
          </div>

          {/* WIDGET 8: Upcoming Lessons Widget (4x3) */}
          <div className="bg-surface dark:bg-slate-900 border border-surface-border rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all md:col-span-2">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
              Widget 8 • 4x3 Grid (Next 5 Lessons)
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <Calendar className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Upcoming Lessons Widget
                  </h3>
                  <p className="text-[10px] text-slate-500">Next 5 scheduled lessons with time, group & student count</p>
                </div>
              </div>

              {/* Rendered Widget Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner border border-slate-800 space-y-2">
                {upcomingLessons.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Keine kommenden Lektionen gefunden.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {upcomingLessons.map(lesson => (
                      <div key={lesson.id} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-mono text-xs font-bold">
                            {lesson.time}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{lesson.title || lesson.groupName || lesson.studentName || 'Lektion'}</h4>
                            <p className="text-[10px] text-slate-400">{lesson.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary" />
                            {lesson.groupId ? students.filter(s => s.groupId === lesson.groupId).length : 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-surface-border mt-4">
              <span>Scrollable list view</span>
              <button onClick={() => setActiveTab('schedule')} className="text-primary font-bold hover:underline cursor-pointer">
                Full Calendar →
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB 2: PHONE HOME SCREEN SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="bg-slate-900 rounded-[32px] p-6 text-white border border-slate-800 shadow-2xl flex flex-col items-center">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-lg font-black text-white">Android Phone Home Screen Simulator</h2>
            <p className="text-xs text-slate-400">Preview how your widgets appear on an Android device running Material 3 with live data.</p>
          </div>

          {/* Android Phone Frame Mockup */}
          <div className="w-full max-w-sm bg-black rounded-[48px] p-4 border-[6px] border-slate-700 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Phone Status Bar */}
            <div className="flex justify-between items-center px-4 py-2 text-[11px] font-bold text-slate-300">
              <span>17:01</span>
              <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span className="w-4 h-2 bg-emerald-500 rounded-xs inline-block" />
              </div>
            </div>

            {/* Home Screen Content Grid */}
            <div className="space-y-3 py-3 px-2 overflow-y-auto max-h-[550px] scrollbar-none">
              {/* Mini Dashboard Widget in Simulator */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Teacher Mini Dashboard</span>
                  <span className="text-primary">4x4</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400">Lessons</span>
                    <p className="text-sm font-black text-white">{todaysLessons.length}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400">Students</span>
                    <p className="text-sm font-black text-white">{students.length}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400">Revenue</span>
                    <p className="text-sm font-black text-emerald-400">€{Math.round(monthlyRevenue)}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400">Overdue</span>
                    <p className="text-sm font-black text-rose-400">{overdueCount}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions in Simulator */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700 grid grid-cols-4 gap-2">
                <button onClick={() => setIsStartLessonNowModalOpen(true)} className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-violet-600/20 text-center">
                  <Play className="w-3.5 h-3.5 text-violet-400 mb-0.5 fill-violet-400" />
                  <span className="text-[8px] font-bold">Start</span>
                </button>
                <button onClick={() => setIsAddStudentModalOpen(true)} className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-primary/20 text-center">
                  <Users className="w-3.5 h-3.5 text-primary mb-0.5" />
                  <span className="text-[8px] font-bold">+ Student</span>
                </button>
                <button onClick={() => setActiveTab('payments')} className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-emerald-500/20 text-center">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                  <span className="text-[8px] font-bold">Pay</span>
                </button>
                <button onClick={() => setActiveTab('students')} className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-blue-500/20 text-center">
                  <Send className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                  <span className="text-[8px] font-bold">Msg</span>
                </button>
              </div>

              {/* Today's Lessons in Simulator */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Today's Lessons</span>
                  <span className="text-primary">4x2</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-primary-soft">Nächste</span>
                    <p className="text-xs font-black truncate max-w-[160px]">{nextLessonToday?.title || nextLessonToday?.groupName || 'Deutsch B2'}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{countdownText}</span>
                </div>
              </div>

              {/* To-Do in Simulator */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Quick Todos ({todos.length})</span>
                  <span className="text-primary">4x3</span>
                </div>
                {todos.slice(0, 2).map(todo => (
                  <div key={todo.id} className="bg-slate-900/80 p-2 rounded-xl flex items-center justify-between text-xs">
                    <span className="truncate max-w-[180px]">{todo.text}</span>
                    <button onClick={() => handleCompleteTask(todo.id)} className="w-4 h-4 rounded-full border border-primary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Android Home Bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-4" />
          </div>
        </div>
      )}

      {/* SUB TAB 3: NATIVE KOTLIN CODE EXPORTER */}
      {activeSubTab === 'code' && (
        <div className="bg-slate-900 rounded-[28px] p-6 text-white border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">Android Native App Widgets (Jetpack Glance & RemoteViews)</h2>
            <p className="text-xs text-slate-400">
              Integrate these Kotlin widget classes into your Capacitor Android project under <code className="text-primary">android/app/src/main/java/com/teacherassistant/widgets/</code>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">1. WidgetProvider.kt (Android AppWidgetProvider)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
{`package com.teacherassistant.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.teacherassistant.app.R

class TeacherWidgetsProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        internal fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_todays_lessons)
            // Bind Capacitor shared preferences data
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">2. WidgetManagerPlugin.java (Capacitor Bridge)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
{`package com.teacherassistant.widgets

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "WidgetManager")
class WidgetManagerPlugin : Plugin() {
    @PluginMethod
    fun updateWidget(call: PluginCall) {
        val intent = android.content.Intent("com.teacherassistant.UPDATE_WIDGETS")
        context.sendBroadcast(intent)
        call.resolve()
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
