import { checkOverlap } from "../utils/lessonUtils";
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson } from '../types';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  Video, MapPin, CheckCircle2, AlertTriangle, Trash2, ArrowLeftRight, 
  Download, X, Check, Zap, RefreshCw, Play
} from 'lucide-react';
import { StartLessonNowModal } from './StartLessonNowModal';

export const ScheduleView: React.FC = () => {
  const { lessons, profile, openLessonControl, setIsAddLessonModalOpen, setIsAddQuickLessonModalOpen, updateLesson, deleteLesson, refreshCalendarAndDashboard,  t } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const [showStartLessonNowModal, setShowStartLessonNowModal] = useState(false);

  const handleRefreshCalendar = () => {
    refreshCalendarAndDashboard();
    setShowRefreshToast(true);
    setTimeout(() => {
      setShowRefreshToast(false);
    }, 2500);
  };

  // Reschedule Modal State
  const [rescheduleLesson, setRescheduleLesson] = useState<Lesson | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string>('');

  // Working hours from profile
  const workingStart = profile.workingHours?.startTime || '09:00';
  const workingEnd = profile.workingHours?.endTime || '21:30';

  // CONFLICT DETECTION
  const conflictsMap = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    lessons.forEach((l) => {
      const key = `${l.date}_${l.time}`;
      if (!map[key]) map[key] = [];
      map[key].push(l);
    });
    return map;
  }, [lessons]);

  const hasConflict = (lessonId: string) => {
    return dayConflicts.includes(lessonId);
  };

  const checkTimeConflict = (date: string, time: string, excludeLessonId?: string) => {
    const dummy = { id: 'dummy', date, time, durationMinutes: 60 };
    return lessons.some(l => l.id !== excludeLessonId && checkOverlap(dummy, l));
  };

  const dayConflicts = useMemo(() => {
    const conflicts: string[] = [];
    for (let i = 0; i < lessons.length; i++) {
      for (let j = i + 1; j < lessons.length; j++) {
        if (checkOverlap(lessons[i], lessons[j])) {
          if (!conflicts.includes(lessons[i].id)) conflicts.push(lessons[i].id);
          if (!conflicts.includes(lessons[j].id)) conflicts.push(lessons[j].id);
        }
      }
    }
    return conflicts;
  }, [lessons]);

  // DAY VIEW CALCULATIONS
  const dayLessons = useMemo(() => {
    return lessons
      .filter((l) => l.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [lessons, selectedDate]);

  // WEEK VIEW CALCULATIONS
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const lessonsOnDay = lessons.filter((l) => l.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString(undefined, { month: 'short' }),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        lessons: lessonsOnDay,
      });
    }
    return days;
  }, [selectedDate, lessons, todayStr]);

  // MONTH VIEW CALCULATIONS
  const monthData = useMemo(() => {
    const current = new Date(selectedDate);
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const monthName = firstDayOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const gridDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      gridDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const lessonsOnDay = lessons.filter((l) => l.date === dateStr);

      gridDays.push({
        dayNumber: day,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        lessons: lessonsOnDay,
        hasConflict: lessonsOnDay.some((l) => hasConflict(l.id)),
      });
    }

    return { monthName, gridDays };
  }, [selectedDate, lessons, todayStr]);

  // RESCHEDULE ACTION
  const openReschedule = (lesson: Lesson) => {
    setRescheduleLesson(lesson);
    setNewDate(lesson.date);
    setNewTime(lesson.time);
    setRescheduleSuccess('');
  };

  const handleSaveReschedule = () => {
    if (!rescheduleLesson || !newDate || !newTime) return;

    updateLesson(rescheduleLesson.id, {
      date: newDate,
      time: newTime,
    });

    setRescheduleSuccess(t('schedule_reschedule_success'));
    setTimeout(() => {
      setRescheduleLesson(null);
      setRescheduleSuccess('');
    }, 1200);
  };

  // GOOGLE CALENDAR ICS EXPORT
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AGS19//Calendar App',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    lessons.forEach((l) => {
      const cleanDate = l.date.replace(/-/g, '');
      const cleanTime = l.time.replace(':', '') + '00';
      const startDT = `${cleanDate}T${cleanTime}`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`SUMMARY:${l.title} (${l.grade})`);
      icsContent.push(`DESCRIPTION:Lesson ${l.sessionNumber}/${l.totalSessionsInPackage} - Type: ${l.type.toUpperCase()}`);
      icsContent.push(`DTSTART:${startDT}`);
      icsContent.push(`DURATION:PT${l.durationMinutes || 60}M`);
      if (l.meetingLink) icsContent.push(`LOCATION:${l.meetingLink}`);
      else if (l.locationAddress) icsContent.push(`LOCATION:${l.locationAddress}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Schedule_${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>{t('schedule_title')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('schedule_working_hours')}: {workingStart} - {workingEnd}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
          {/* Refresh Calendar Data */}
          <button
            onClick={handleRefreshCalendar}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs px-2.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('schedule_refresh')}</span>
          </button>

          {/* Export iCal */}
          <button
            onClick={handleExportICS}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs px-2.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('schedule_ical')}</span>
          </button>

          {/* START LESSON NOW */}
          <button
            onClick={() => setShowStartLessonNowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>{t('schedule_start_now')}</span>
          </button>

          {/* Quick Lesson */}
          <button
            onClick={() => setIsAddQuickLessonModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs px-2.5 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{t('nav_quickLesson')}</span>
          </button>
        </div>
      </div>

      {/* REFRESH TOAST BANNER */}
      {showRefreshToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-lg flex items-center justify-center gap-2 shadow-md animate-scale-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>✓ {t('dataRefreshed')}</span>
        </div>
      )}

      {/* CONFLICT ALERT BANNER */}
      {dayConflicts.length > 0 && calendarView === 'day' && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-lg p-3 flex items-center justify-between gap-2 animate-pulse">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              {t('schedule_conflict_alert')}: {selectedDate}
            </span>
          </div>
        </div>
      )}

      {/* VIEW SWITCHER TABS & DATE NAVIGATION BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-3">
        
        {/* Row 1: View Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calendarView === 'day' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('schedule_day_view')}
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calendarView === 'week' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('schedule_week_view')}
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calendarView === 'month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('schedule_month_view')}
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            {t('schedule_today')}
          </button>
        </div>

        {/* Row 2: Date Selector Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const current = new Date(selectedDate);
              if (calendarView === 'day') current.setDate(current.getDate() - 1);
              else if (calendarView === 'week') current.setDate(current.getDate() - 7);
              else current.setMonth(current.getMonth() - 1);
              setSelectedDate(current.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="text-center">
            {calendarView === 'day' && (
              <>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm font-extrabold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer font-mono text-center"
                />
                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase">
                  {selectedDate === todayStr ? t('schedule_today') : new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </>
            )}

            {calendarView === 'week' && (
              <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                {weekDays[0].dateStr.substring(5)} — {weekDays[6].dateStr.substring(5)}
              </span>
            )}

            {calendarView === 'month' && (
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {monthData.monthName}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              const current = new Date(selectedDate);
              if (calendarView === 'day') current.setDate(current.getDate() + 1);
              else if (calendarView === 'week') current.setDate(current.getDate() + 7);
              else current.setMonth(current.getMonth() + 1);
              setSelectedDate(current.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* 1. DAY VIEW */}
      {calendarView === 'day' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500 uppercase">({dayLessons.length}) {t('schedule_title')}</span>
            {dayConflicts.length === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('schedule_no_conflicts')}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('schedule_conflict')}
              </span>
            )}
          </div>

          {dayLessons.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('schedule_no_lessons_day')}</p>
              <button
                onClick={() => setIsAddLessonModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + {t('schedule_add_lesson_for')}
              </button>
            </div>
          ) : (
            <div className="space-y-3 relative">
              <div className="absolute left-[54px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>

              {dayLessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isCancelled = lesson.status === 'cancelled';
                const conflict = hasConflict(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-3 relative z-10 group"
                  >
                    <div className={`w-12 text-right text-xs font-extrabold font-mono shrink-0 pt-3 ${
                      isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {lesson.time}
                    </div>

                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shrink-0 mt-3.5 ${
                      conflict
                        ? 'bg-rose-600 ring-4 ring-rose-200 dark:ring-rose-950 animate-bounce'
                        : isCompleted
                        ? 'bg-slate-400 dark:bg-slate-500 ring-2 ring-slate-200 dark:ring-slate-800'
                        : isCancelled
                        ? 'bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                        : 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-950'
                    }`} />

                    <div className={`flex-1 border rounded-lg p-3 transition-all ${
                      conflict
                        ? 'border-rose-400 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/30'
                        : isCompleted
                        ? 'bg-slate-100/90 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 opacity-80'
                        : isCancelled
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-75'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 border-slate-200/80 dark:border-slate-700/80 group-hover:border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div onClick={() => openLessonControl(lesson)} className="cursor-pointer flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-xs sm:text-sm font-bold transition-colors ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : isCancelled
                                ? 'line-through text-rose-400 dark:text-rose-500'
                                : 'text-slate-900 dark:text-white group-hover:text-blue-600'
                            }`}>
                              {lesson.title}
                            </h4>

                            {isCompleted && (
                              <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-slate-500" />
                                {t('status_completed')}
                              </span>
                            )}

                            {isCancelled && (
                              <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded-md">
                                {t('status_cancelled')}
                              </span>
                            )}

                            {conflict && (
                              <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded-md">
                                {t('schedule_conflict')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="font-semibold">{lesson.grade}</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              Session {lesson.sessionNumber}/{lesson.totalSessionsInPackage}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              {t('schedule_weekly')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {lesson.type === 'online' ? (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Video className="w-3 h-3" /> {t('next_action_online')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {t('next_action_offline')}
                            </span>
                          )}

                          <button
                            onClick={() => openReschedule(lesson)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {calendarView === 'week' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
            {weekDays.map((day) => (
              <div
                key={day.dateStr}
                className={`bg-white dark:bg-slate-900 border rounded-lg p-3 shadow-2xs space-y-2 transition-all ${
                  day.isToday
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <div>
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase block">
                      {day.dayName}
                    </span>
                    <span className={`text-sm font-black font-mono ${day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {day.dayNumber}. {day.monthName}
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {day.lessons.length}
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[90px]">
                  {day.lessons.length === 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-4 font-semibold">
                      {t('schedule_no_lessons')}
                    </p>
                  ) : (
                    day.lessons.map((l) => {
                      const conflict = hasConflict(l.id);
                      return (
                        <div
                          key={l.id}
                          onClick={() => openLessonControl(l)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                            conflict
                              ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200'
                              : l.type === 'online'
                              ? 'bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200'
                              : 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono font-bold text-[10px]">
                            <span>{l.time}</span>
                            <span className="uppercase text-[9px] font-black">{l.type}</span>
                          </div>
                          <p className="font-bold text-[11px] truncate mt-0.5">{l.title}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    setIsAddLessonModalOpen(true);
                  }}
                  className="w-full text-[10px] font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 p-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-center"
                >
                  + {t('add')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {calendarView === 'month' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthData.gridDays.map((cell, index) => {
              if (!cell) {
                return <div key={`empty_${index}`} className="min-h-[64px] bg-slate-50/40 dark:bg-slate-900/40 rounded-xl" />;
              }

              const isSelected = cell.dateStr === selectedDate;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                    setCalendarView('day');
                  }}
                  className={`min-h-[64px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isToday
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 font-bold'
                      : isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${cell.isToday ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                      {cell.dayNumber}
                    </span>

                    {cell.lessons.length > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        cell.hasConflict ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {cell.lessons.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {cell.lessons.slice(0, 3).map((l) => (
                      <span
                        key={l.id}
                        className={`w-2 h-2 rounded-full ${
                          l.type === 'online' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        title={`${l.time} - ${l.title}`}
                      />
                    ))}
                    {cell.lessons.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-400">+{cell.lessons.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleLesson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <span>{t('schedule_reschedule')}</span>
              </h3>
              <button
                onClick={() => setRescheduleLesson(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{rescheduleLesson.title}</span>
              <p className="text-[11px] text-slate-500">{rescheduleLesson.date} • {rescheduleLesson.time}</p>
            </div>

            {rescheduleSuccess && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{rescheduleSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('schedule_new_date')}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('schedule_new_time')}
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {checkTimeConflict(newDate, newTime, rescheduleLesson?.id) && (
                <div className="bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 text-[11px] font-bold p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{t('schedule_conflict_alert')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleLesson(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={checkTimeConflict(newDate, newTime, rescheduleLesson?.id)}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-xs ${checkTimeConflict(newDate, newTime, rescheduleLesson?.id) ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START LESSON NOW MODAL */}
      {showStartLessonNowModal && (
        <StartLessonNowModal onClose={() => setShowStartLessonNowModal(false)} />
      )}
    </div>
  );
};
