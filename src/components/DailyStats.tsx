import { isPendingStatus } from "../utils/lessonUtils";
import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Users, Wallet, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const DailyStats: React.FC = () => {
  const { lessons, students, groups, profile, openLessonControl, t } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLessons = lessons.filter(l => l.date === todayStr);

  const completedCount = todaysLessons.filter(l => l.status === 'completed').length;
  const totalCount = todaysLessons.length;

  // Past pending sessions (past lessons not completed or cancelled)
  const pastPendingLessons = lessons.filter(l => l.date < todayStr && isPendingStatus(l.status));
  const pastPendingCount = pastPendingLessons.length;

  // Calculate actual unique students attending lessons today
  const getStudentsTodayCount = () => {
    if (todaysLessons.length === 0) return 0;
    const studentSet = new Set<string>();
    todaysLessons.forEach(l => {
      if (l.studentId) {
        studentSet.add(l.studentId);
      } else if (l.groupId && l.groupId !== 'quick_group') {
        const groupStudents = students.filter(s => s.groupId === l.groupId);
        if (groupStudents.length > 0) {
          groupStudents.forEach(s => studentSet.add(s.id));
        } else {
          const grp = groups.find(g => g.id === l.groupId);
          if (grp) {
            studentSet.add(`group_${grp.id}`);
          }
        }
      } else if (l.studentName) {
        studentSet.add(l.studentName);
      }
    });
    return studentSet.size;
  };

  const totalStudentsToday = getStudentsTodayCount();

  // Revenue today (sum of paid lessons today)
  const revenueToday = todaysLessons
    .filter(l => l.paymentStatus === 'paid')
    .reduce((sum, l) => sum + (l.amountPaid || l.amountDue || 0), 0);

  // Monthly Overview calculations
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthStudentsCount = students.length;
  const monthGroupsCount = groups.length;
  const monthCompletedLessonsCount = lessons.filter(l => 
    l.date.startsWith(currentMonthPrefix) && l.status === 'completed'
  ).length;

  const monthRevenue = lessons
    .filter(l => l.date.startsWith(currentMonthPrefix) && l.paymentStatus === 'paid')
    .reduce((sum, l) => sum + (l.amountPaid || l.amountDue || 0), 0);

  const formatMonthlyRevenue = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return val.toLocaleString();
  };

  return (
    <div className="space-y-3">
      {/* Pending Sessions Warning Card (if any exist) */}
      {pastPendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {pastPendingCount} ausstehende Vergangene Sitzung{pastPendingCount > 1 ? 'en' : ''}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Vergangene Lektionen ohne gespeicherten Bericht oder Abschluss
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (pastPendingLessons[0]) {
                openLessonControl(pastPendingLessons[0]);
              }
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Bearbeiten
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lessons Today */}
        <div className="bg-slate-50/55 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('daily_stats_lessons_today')}
            </span>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            {totalCount}
          </p>
        </div>

        {/* Students Today */}
        <div className="bg-slate-50/55 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('daily_stats_students_today')}
            </span>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            {totalStudentsToday}
          </p>
        </div>

        {/* Pending Sessions Metric */}
        <div className="bg-slate-50/55 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Offene Sitzungen
            </span>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            {pastPendingCount}
          </p>
        </div>

        {/* Completed Today */}
        <div className="bg-slate-50/55 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('daily_stats_completed')}
            </span>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            {completedCount} / {totalCount}
          </p>
        </div>
      </div>

      {/* Monthly Overview Section - Completely Flat layout to respect guidelines (No nested cards) */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-2xs">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{t('daily_stats_monthly_overview')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-3xs">
            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 truncate">{t('daily_stats_students')}</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{monthStudentsCount}</span>
          </div>

          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-3xs">
            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 truncate">{t('daily_stats_groups')}</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{monthGroupsCount}</span>
          </div>

          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-3xs">
            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 truncate">{t('daily_stats_completed_short')}</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{monthCompletedLessonsCount}</span>
          </div>

          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-3xs">
            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 truncate">{t('daily_stats_revenue')}</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatMonthlyRevenue(monthRevenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

