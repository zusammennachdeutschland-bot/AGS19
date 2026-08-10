import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck, Clock, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { notifications, lessons, openLessonControl, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 pt-[max(24px,env(safe-area-inset-top,24px))]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Benachrichtigungen</h2>
              <p className="text-xs text-slate-400">Automatic 30-min reminders & Alerts</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
            <p className="text-xs text-slate-400 text-center py-6">Keine Benachrichtigungen.</p>
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
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>

                  {linkedLesson && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
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
