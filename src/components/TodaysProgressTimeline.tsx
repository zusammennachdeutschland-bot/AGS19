import { isPendingStatus } from "../utils/lessonUtils";
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson } from '../types';
import { 
  CheckCircle2, Clock, PlayCircle, ChevronRight, AlertCircle, XCircle, X
} from 'lucide-react';

export const TodaysProgressTimeline: React.FC = () => {
  const { lessons, openLessonControl, dismissedDashboardLessonIds, dismissLessonFromDashboard, t } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. PAST PENDING LESSONS: Lessons from previous days with NO final status (neither completed nor cancelled)
  const pendingPastLessons = lessons
    .filter(l => l.date < todayStr && isPendingStatus(l.status) && !dismissedDashboardLessonIds.includes(l.id))
    .sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));

  // 2. TODAY'S LESSONS: Lessons scheduled for today, excluding dismissed items
  const todaysLessons = lessons
    .filter(l => l.date === todayStr && !dismissedDashboardLessonIds.includes(l.id))
    .sort((a, b) => a.time.localeCompare(b.time));

  const getLessonState = (lesson: Lesson): 'completed' | 'cancelled' | 'active' | 'upcoming' => {
    if (lesson.status === 'completed') return 'completed';
    if (lesson.status === 'cancelled') return 'cancelled';
    if (lesson.status === 'in_progress') return 'active';
    
    const [h, m] = lesson.time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) {
      return 'upcoming';
    }

    const startMin = h * 60 + m;
    const duration = lesson.durationMinutes || 60;
    const endMin = startMin + duration;

    if (currentMinutes >= startMin && currentMinutes < endMin) return 'active';
    return 'upcoming';
  };

  const processedLessons = todaysLessons.map(lesson => ({
    lesson,
    state: getLessonState(lesson),
  }));

  const completedCount = processedLessons.filter(p => p.lesson.status === 'completed').length;
  const cancelledCount = processedLessons.filter(p => p.lesson.status === 'cancelled').length;
  const activeCount = processedLessons.filter(p => p.state === 'active').length;
  const upcomingCount = processedLessons.filter(p => isPendingStatus(p.lesson.status) && p.state !== 'active').length;
  const totalCount = processedLessons.length;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* SECTION 2: PAST PENDING LESSONS */}
      {pendingPastLessons.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
              <span>{t('past_pending_lessons_title')} ({pendingPastLessons.length})</span>
            </span>
            <span className="text-[9px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
              {t('timeline_requires_action')}
            </span>
          </div>
          <p className="text-[10px] text-amber-800/85 dark:text-amber-300/80 font-medium leading-relaxed">
            {t('past_pending_lessons_desc')}
          </p>

          <div className="divide-y divide-amber-200/30 dark:divide-amber-900/20 pt-1">
            {pendingPastLessons.map((pLesson) => (
              <div
                key={pLesson.id}
                onClick={() => openLessonControl(pLesson)}
                className="py-2.5 flex items-center justify-between gap-2.5 cursor-pointer group transition-colors first:pt-0 last:pb-0"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/45 px-1.5 py-0.5 rounded">
                      {pLesson.date}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {pLesson.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {pLesson.studentName || pLesson.groupName || pLesson.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded transition-colors group-hover:bg-amber-500/20">
                    {t('timeline_requires_action')}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: TODAY'S LESSONS */}
      {totalCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('todays_lessons_title')}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2 italic">
            {t('timeline_no_lessons')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3.5">
          {/* Timeline Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t('todays_lessons_title')}</span>
                <span className="text-[10px] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 ml-1">
                  {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                {completedCount} / {totalCount} {t('timeline_completed_of')} ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
              {activeCount > 0 && (
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.max(10, Math.round((activeCount / totalCount) * 100))}%` }}
                />
              )}
            </div>

            {/* Status Count Summary Badges */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-bold">
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap overflow-hidden">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{completedCount} {t('status_completed')}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 whitespace-nowrap overflow-hidden">
                <PlayCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{activeCount} {t('status_in_progress')}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{upcomingCount} {t('timeline_upcoming')}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 whitespace-nowrap overflow-hidden">
                <XCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{cancelledCount} {t('status_cancelled')}</span>
              </div>
            </div>
          </div>

          {/* Chronological Timeline Nodes */}
          <div className="relative pl-3.5 space-y-3.5 pt-1 border-l border-slate-100 dark:border-slate-800/80">
            {processedLessons.map(({ lesson, state }) => {
              const isGroup = !!lesson.groupId || lesson.groupName.includes('Gruppe') || (lesson.title && lesson.title.includes('Gruppe'));
              const isCompletedState = lesson.status === 'completed';
              const isCancelledState = lesson.status === 'cancelled';

              return (
                <div 
                  key={lesson.id}
                  onClick={() => openLessonControl(lesson)}
                  className={`relative pl-3.5 transition-all cursor-pointer group rounded-lg p-3 border ${
                    isCompletedState
                      ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-200/60 dark:border-slate-800/40 opacity-70'
                      : isCancelledState
                      ? 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-200/40 dark:border-rose-900/20 opacity-60'
                      : state === 'active'
                      ? 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200/80 dark:border-blue-900/60'
                      : 'bg-slate-50/30 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/40'
                  }`}
                >
                  <div 
                    className={`absolute -left-[18.5px] top-4.5 w-2 h-2 rounded-full border bg-white dark:bg-slate-900 flex items-center justify-center ${
                      isCompletedState
                        ? 'border-slate-400 bg-slate-400'
                        : isCancelledState
                        ? 'border-rose-400 bg-rose-400'
                        : state === 'active'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 dark:border-slate-600 bg-white'
                    }`}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-mono font-bold ${isCompletedState ? 'text-slate-400 dark:text-slate-500 line-through' : isCancelledState ? 'text-rose-400 dark:text-rose-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                          {lesson.time}
                        </span>

                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isGroup 
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {isGroup ? t('timeline_group') : t('timeline_individual')}
                        </span>

                        {state === 'active' && !isCompletedState && !isCancelledState && (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                            {t('timeline_live_now')}
                          </span>
                        )}

                        {isCompletedState && (
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-slate-400" />
                            {t('status_completed')}
                          </span>
                        )}

                        {isCancelledState && (
                          <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                            {t('status_cancelled')}
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold line-clamp-1 transition-colors ${
                        isCompletedState 
                          ? 'line-through text-slate-400 dark:text-slate-500' 
                          : isCancelledState
                          ? 'line-through text-rose-400 dark:text-rose-500'
                          : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {lesson.studentName || lesson.groupName || lesson.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* X Button STRICTLY ONLY for Completed or Cancelled lessons */}
                      {(isCompletedState || isCancelledState) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissLessonFromDashboard(lesson.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={t('dismiss_from_dashboard')}
                          aria-label="Hide from dashboard"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
