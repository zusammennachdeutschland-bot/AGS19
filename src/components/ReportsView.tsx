import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart2, Printer, TrendingUp, AlertCircle, CheckCircle2, 
  Clock, Calendar, DollarSign, ArrowUpRight, AlertTriangle, Filter, Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Lesson } from '../types';
import confetti from 'canvas-confetti';

export const ReportsView: React.FC = () => {
  const { lessons, updateLesson, profile, openLessonControl, t } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'this_week' | 'paid' | 'unpaid'>('all');

  // Helper to format date display (DD.MM.YYYY)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  // Helper to compute start of week date (Monday)
  const getWeekStart = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const getWeekKey = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Sonstige';
    const monday = getWeekStart(d);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatShort = (date: Date) => 
      `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    return `Woche ${formatShort(monday)} – ${formatShort(sunday)} (${monday.getFullYear()})`;
  };

  // Group lessons by week
  const sortedLessons = [...lessons].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter lessons
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];

  const filteredLessons = sortedLessons.filter(l => {
    if (activeFilter === 'paid') return l.paymentStatus === 'paid';
    if (activeFilter === 'unpaid') return l.paymentStatus !== 'paid';
    if (activeFilter === 'this_week') {
      const lDate = new Date(l.date);
      const lWeekStart = getWeekStart(lDate).toISOString().split('T')[0];
      return lWeekStart === currentWeekStartStr;
    }
    return true;
  });

  // Grouping by week key
  const weeksGrouped: Record<string, Lesson[]> = {};
  filteredLessons.forEach(l => {
    const key = getWeekKey(l.date);
    if (!weeksGrouped[key]) weeksGrouped[key] = [];
    weeksGrouped[key].push(l);
  });

  // Overall Financial & Session Metrics
  const totalCollectedRevenue = lessons
    .filter(l => l.status === 'completed' || l.amountPaid > 0)
    .reduce((sum, l) => sum + (l.amountPaid || 0), 0);

  const totalUnpaidAmount = lessons
    .filter(l => l.paymentStatus !== 'paid')
    .reduce((sum, l) => sum + Math.max(0, (l.amountDue || 0) - (l.amountPaid || 0)), 0);

  const completedSessionsCount = lessons.filter(l => l.status === 'completed').length;
  const cancelledSessionsCount = lessons.filter(l => l.status === 'cancelled').length;

  const unpaidLastSessionsCount = lessons.filter(
    l => l.paymentStatus !== 'paid' && l.sessionNumber === l.totalSessionsInPackage
  ).length;

  // Mark as paid quick handler
  const handleMarkAsPaid = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    updateLesson(lesson.id, {
      paymentStatus: 'paid',
      amountPaid: lesson.amountDue
    });
    confetti({ particleCount: 50, spread: 40 });
  };

  // Revenue chart data by week or month
  const chartData = Object.entries(weeksGrouped).map(([weekLabel, weekLessons]) => {
    const collected = weekLessons.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
    const unpaid = weekLessons.reduce((sum, l) => sum + (l.paymentStatus !== 'paid' ? (l.amountDue - l.amountPaid) : 0), 0);
    return {
      name: weekLabel.split(' ')[1] || weekLabel,
      Einnahmen: collected,
      Offen: unpaid
    };
  }).reverse();

  // Attendance breakdown
  const attendanceData = [
    { name: 'Anwesend', value: lessons.filter(l => l.report?.attendanceStatus === 'present').length || 12, color: '#10B981' },
    { name: 'Verspätet', value: lessons.filter(l => l.report?.attendanceStatus === 'late').length || 2, color: '#F59E0B' },
    { name: 'Abwesend', value: lessons.filter(l => l.report?.attendanceStatus === 'absent').length || 1, color: '#EF4444' }
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t ? t('reports_and_analyses') || 'Berichte & Analysen' : 'Berichte & Analysen'}</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-bold mt-0.5">
            Sitzungen, wöchentliche Einnahmen & Bezahlungs-Kontrolle
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Drucken / PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Erhaltene Einnahmen</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{totalCollectedRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-500">{profile.currency}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> Aus Sitzungen bezahlt
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offener Betrag</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {totalUnpaidAmount.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-500">{profile.currency}</span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-2">
            <Clock className="w-3.5 h-3.5" /> Ausstehende Zahlungen
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sitzungen Absolviert</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              {completedSessionsCount}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Sitzungen</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold mt-2 block">Insgesamt durchgeführt</span>
        </div>

        <div className={`border rounded-xl p-4 shadow-2xs transition-all ${
          unpaidLastSessionsCount > 0 
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/60' 
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
        }`}>
          <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            Letzte Sitzung Unbezahlt
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black font-mono text-red-600 dark:text-red-400">
              {unpaidLastSessionsCount}
            </span>
            <span className="text-[11px] font-bold text-red-600/80">Pakete</span>
          </div>
          <span className="text-[10px] text-red-700 dark:text-red-300 font-bold flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            {unpaidLastSessionsCount > 0 ? 'Dringend kassieren!' : 'Alles im grünen Bereich'}
          </span>
        </div>
      </div>

      {/* WEEKLY SESSIONS & MONEY LOG LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Wöchentliches Sitzungs- & Einnahmen-Protokoll</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              Jede Sitzung mit erhaltenem Honorar und Bezahlungs-Warnungen
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 border border-transparent'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setActiveFilter('this_week')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeFilter === 'this_week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 border border-transparent'
              }`}
            >
              Diese Woche
            </button>
            <button
              onClick={() => setActiveFilter('paid')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Bezahlt
            </button>
            <button
              onClick={() => setActiveFilter('unpaid')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeFilter === 'unpaid'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Unbezahlt
            </button>
          </div>
        </div>

        {/* List grouped by week */}
        {Object.keys(weeksGrouped).length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold italic">
            Keine Sitzungen für die ausgewählte Filteroption gefunden.
          </div>
        ) : (
          Object.entries(weeksGrouped).map(([weekTitle, weekLessons]) => {
            const weekRevenue = weekLessons.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
            const weekUnpaid = weekLessons.reduce((sum, l) => sum + (l.paymentStatus !== 'paid' ? (l.amountDue - l.amountPaid) : 0), 0);

            return (
              <div key={weekTitle} className="space-y-2 border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden bg-slate-50/25 dark:bg-slate-900/40">
                {/* Week Header */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 font-mono">
                      📅 {weekTitle}
                    </span>
                    <span className="text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300">
                      {weekLessons.length} Sitzungen
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      +{weekRevenue} {profile.currency} erhalten
                    </span>
                    {weekUnpaid > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60">
                        ⚠️ {weekUnpaid} {profile.currency} offen
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-850 p-1">
                  {weekLessons.map(l => {
                    const isLastSession = l.sessionNumber === l.totalSessionsInPackage;
                    const isUnpaidLastSession = isLastSession && l.paymentStatus !== 'paid';

                    return (
                      <div 
                        key={l.id}
                        onClick={() => openLessonControl(l)}
                        className={`p-3 rounded-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                          isUnpaidLastSession
                            ? 'bg-red-50/40 dark:bg-red-950/20 border border-red-300 dark:border-red-900/40 hover:bg-red-50/80'
                            : 'hover:bg-slate-100/40 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Left: Group name, date, session info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs">
                              {l.groupName || l.title}
                            </span>

                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40 font-mono">
                              Sitzung {l.sessionNumber}/{l.totalSessionsInPackage}
                            </span>

                            {l.status === 'completed' ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Absolviert
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> Geplant
                              </span>
                            )}

                            {/* UNPAID LAST SESSION WARNING BADGE */}
                            {isUnpaidLastSession && (
                              <span className="text-[9px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3 h-3" />
                                Letztes Honorar offen!
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <span className="font-mono">{formatDateDisplay(l.date)} um {l.time} Uhr</span>
                            <span>•</span>
                            <span>{l.grade}</span>
                            <span>•</span>
                            <span>{l.type === 'online' ? 'Online' : 'Vor Ort'}</span>
                          </div>
                        </div>

                        {/* Right: Payment collected status & action */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            {l.paymentStatus === 'paid' ? (
                              <div>
                                <span className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                  +{l.amountPaid || l.amountDue} {profile.currency}
                                </span>
                                <span className="block text-[9px] font-bold text-emerald-600 uppercase">
                                  ✓ Bezahlt
                                </span>
                              </div>
                            ) : l.paymentStatus === 'partial' ? (
                              <div>
                                <span className="font-bold font-mono text-xs text-indigo-600 dark:text-indigo-400">
                                  +{l.amountPaid} {profile.currency}
                                </span>
                                <span className="block text-[9px] font-bold text-amber-600 uppercase">
                                  Teilweise ({l.amountDue - l.amountPaid} offen)
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold font-mono text-xs text-red-600 dark:text-red-400">
                                  0 {profile.currency}
                                </span>
                                <span className="block text-[9px] font-bold text-red-600 uppercase">
                                  ⚠️ Offen ({l.amountDue} {profile.currency})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Button to mark paid quickly */}
                          {l.paymentStatus !== 'paid' && (
                            <button
                              onClick={(e) => handleMarkAsPaid(e, l)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Als bezahlt markieren"
                            >
                              <Check className="w-3 h-3" />
                              <span>Als Bezahlt</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Revenue & Attendance Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Revenue Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Wöchentlicher Umsatz ({profile.currency})</span>
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="Einnahmen" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offen" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Anwesenheitsübersicht der Schüler</span>
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={attendanceData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
