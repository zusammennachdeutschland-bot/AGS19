import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLocalDate } from '../utils/timeUtils';
import { Bell, RefreshCw, CheckCircle2, Camera, Clock, Search, Trash2 } from 'lucide-react';
import { DEFAULT_OFFLINE_AVATAR } from '../data/avatarPresets';
import { AvatarImage } from './AvatarImage';
import { NotificationsModal } from './NotificationsModal';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { language } = useApp();
  const _t = (ar: string, en: string, de?: string) => language === 'ar' ? ar : language === 'de' ? (de || en) : en;

  const { 
    activeTab,
    profile, 
    updateProfile, 
    notifications, 
    lessons, 
    openLessonControl, 
     
    refreshCalendarAndDashboard, 
    setIsGlobalSearchOpen,
    setIsRecentlyDeletedModalOpen,
    recentlyDeleted,
    t 
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const deletedCount = recentlyDeleted.students.length + recentlyDeleted.groups.length + recentlyDeleted.lessons.length;

  const urgent30MinLesson = useMemo(() => {
    if (profile.enableLessonAlerts === false && profile.enableBrowserPush === false) return null;
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const upcoming = lessons.filter(l => {
      if (l.date !== todayStr || l.status !== 'scheduled') return false;
      const parts = l.time.split(':').map(n => parseInt(n, 10));
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return false;
      const lMins = parts[0] * 60 + parts[1];
      const diff = lMins - nowMins;
      return diff >= 0 && diff <= 30;
    });

    return upcoming[0] || null;
  }, [lessons, profile.enableLessonAlerts, profile.enableBrowserPush]);

  const handleRefresh = () => {
    refreshCalendarAndDashboard();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <>
      {/* Premium Safe Area Spacer for Android Status Bar */}
      <div 
        className="bg-surface dark:bg-black select-none max-w-lg mx-auto w-full shrink-0 transition-colors" 
        style={{ height: 'max(24px, env(safe-area-inset-top, 24px))' }}
      />

      {/* Compact Premium Dashboard Header */}
      <header className="bg-surface dark:bg-black border-b border-surface-border/80 px-3.5 py-2.5 sticky top-0 z-30 transition-colors shadow-2xs">
        <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
          {/* Profile & Greeting / Tab Indicator */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative group shrink-0">
              <AvatarImage
                name={profile.displayName}
                className="w-10 h-10 rounded-full font-black ring-2 ring-primary/25 dark:ring-primary/40 shadow-xs transition-transform group-hover:scale-105"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full shadow-2xs" />
            </div>

            <div className="leading-tight min-w-0 flex-1 pr-1">
              {activeTab === 'home' ? (
                <>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 dark:text-primary-soft flex items-center gap-1">
                    <span>{t('greeting') || 'WELCOME'}</span>
                    <span className="inline-block animate-wave text-[11px]">👋</span>
                  </p>
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug whitespace-normal break-words">
                    {profile.displayName}
                  </h1>
                </>
              ) : (
                <>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary dark:text-primary">
                    AGS19
                  </p>
                  <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 capitalize leading-snug whitespace-normal break-words">
                    {activeTab === 'schedule' ? (t('nav_schedule') || 'Termine')
                     : activeTab === 'students' ? (t('nav_students') || 'Schüler')
                     : activeTab === 'history' ? (t('nav_history') || 'Sitzungen')
                     : activeTab === 'payments' ? (t('nav_payments') || 'Zahlungen')
                     : activeTab === 'reports' ? (t('nav_reports') || 'Berichte')
                     : activeTab === 'settings' ? (t('nav_settings') || 'Einstellungen')
                     : activeTab}
                  </h1>
                </>
              )}
            </div>
          </div>

          {/* Right Action Controls: Unified Command Pill with Spring Animations */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Global Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-full bg-background dark:bg-background hover:bg-surface-hover text-text-main border border-surface-border/80 transition-colors cursor-pointer"
              aria-label="Global Search"
              title="Suchen..."
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Recently Deleted / Trash Bin */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setIsRecentlyDeletedModalOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-background dark:bg-background hover:bg-surface-hover text-text-main border border-surface-border/80 transition-colors cursor-pointer"
              aria-label="Recently Deleted"
              title="Zuletzt gelöscht"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {deletedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
                  {deletedCount}
                </span>
              )}
            </motion.button>

            {/* Refresh Data Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={handleRefresh}
              className="p-2 sm:p-2.5 rounded-full bg-background dark:bg-background hover:bg-surface-hover text-text-main border border-surface-border/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={_t("تحديث البيانات", "Refresh Data", "Daten aktualisieren")}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Notification Bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setShowNotifications(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-background dark:bg-background hover:bg-surface-hover text-text-main border border-surface-border/80 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black animate-bounce">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>
 
      {/* Urgent 30-Min Lesson Alert Banner */}
      {urgent30MinLesson && (
        <div className="bg-primary dark:bg-primary text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 bg-surface/20 rounded shrink-0">
              <Clock className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="truncate tracking-wide">
              {urgent30MinLesson.time}: {urgent30MinLesson.title || urgent30MinLesson.groupName || urgent30MinLesson.studentName}
            </span>
          </div>
 
          <button
            onClick={() => openLessonControl(urgent30MinLesson)}
            className="px-2.5 py-1 bg-surface/20 hover:bg-surface/30 text-white font-bold rounded-md text-[10px] uppercase tracking-wider shrink-0 cursor-pointer shadow-2xs transition-colors"
          >
            {t('open') || 'Öffnen'}
          </button>
        </div>
      )}
 
      {/* Refresh Toast Notification */}
      {showToast && (
        <div className="bg-primary text-white text-xs font-bold py-2 px-4 shadow-lg flex items-center justify-center gap-2 animate-scale-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>✓ {t('dataRefreshed')}</span>
        </div>
      )}
 
      {/* Modals */}
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  );
};

