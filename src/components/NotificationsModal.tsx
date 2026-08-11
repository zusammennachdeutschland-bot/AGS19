import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck, Clock, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { notifications, lessons, openLessonControl, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center pt-[max(24px,env(safe-area-inset-top,24px))] p-0 sm:p-4 pb-0">
      <div className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-surface/10 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Benachrichtigungen</h2>
              <p className="text-xs text-text-muted/70">Automatic 30-min reminders & Alerts</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-surface/10 rounded-full cursor-pointer text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="bg-surface-hover/80 px-4 py-2 border-b border-surface-border dark:border-surface-border-soft flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsRead}
              className="text-primary dark:text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Alle als gelesen markieren</span>
            </button>

            <button
              onClick={clearAllNotifications}
              className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              title="Alle Benachrichtigungen löschen (Erase All)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Alle löschen (Erase All)</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-text-muted/70 text-center py-4">Keine Benachrichtigungen.</p>
          ) : (
            notifications.map((n) => {
              const linkedLesson = n.lessonId ? lessons.find(l => l.id === n.lessonId) : null;

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (linkedLesson) {
                      openLessonControl(linkedLesson);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    !n.read 
                      ? 'bg-primary-soft dark:bg-primary-soft/40 border-primary-border dark:border-primary-border' 
                      : 'bg-surface-hover/50 border-surface-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-text-muted/70 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>

                  {linkedLesson && (
                    <div className="mt-2 pt-1.5 border-t border-surface-border-soft flex items-center justify-between text-[10px] font-bold text-primary dark:text-primary">
                      <span>Lektion verwalten & steuern (Lesson Control)</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
