import { App as CapacitorApp } from '@capacitor/app';
import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TodaysProgressTimeline } from './components/TodaysProgressTimeline';
import { DailyStats } from './components/DailyStats';
import { PaymentAlertsCard } from './components/PaymentAlertsCard';
import { TomorrowsLessonsWidget } from './components/TomorrowsLessonsWidget';
import { AvailableTodayWidget } from './components/AvailableTodayWidget';

import { SmartDailySummaryWidget } from './components/SmartDailySummaryWidget';
import { QuickTodoWidget } from './components/QuickTodoWidget';
import { InspirationCardWidget } from './components/InspirationCardWidget';
import { ScheduleView } from './components/ScheduleView';
import { StudentsView } from './components/StudentsView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { SessionHistoryView } from './components/SessionHistoryView';
import { SettingsView } from './components/SettingsView';
import { FreeTimeSlotsView } from './components/FreeTimeSlotsView';
import { AndroidWidgetsHub } from './components/AndroidWidgetsHub';

import { AnimatePresence, motion } from 'motion/react';
import { BottomNav } from './components/BottomNav';
import { LessonControlModal } from './components/LessonControlModal';
import { AddLessonModal } from './components/AddLessonModal';
import { AddQuickLessonModal } from './components/AddQuickLessonModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddGroupModal } from './components/AddGroupModal';
import { StartLessonNowModal } from './components/StartLessonNowModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { RecentlyDeletedModal } from './components/RecentlyDeletedModal';
import { SetupWizard } from './components/SetupWizard';
import { BackupModal } from './components/BackupModal';

import { useLessonReminders } from './hooks/useLessonReminders';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

function MainApp() {
  useLessonReminders();

  const { 
    activeTab, setActiveTab, 
    isControlModalOpen, closeLessonControl,
    isAddLessonModalOpen, setIsAddLessonModalOpen,
    isAddQuickLessonModalOpen, setIsAddQuickLessonModalOpen,
    isStartLessonNowModalOpen, setIsStartLessonNowModalOpen,
    isAddStudentModalOpen, setIsAddStudentModalOpen,
    isAddGroupModalOpen, setIsAddGroupModalOpen,
    isBackupModalOpen, setIsBackupModalOpen,
    isGlobalSearchOpen, setIsGlobalSearchOpen,
    isRecentlyDeletedModalOpen, setIsRecentlyDeletedModalOpen
  } = useApp();

  const stateRef = useRef({
    activeTab,
    isGlobalSearchOpen,
    isRecentlyDeletedModalOpen,
    isControlModalOpen,
    isAddLessonModalOpen,
    isAddQuickLessonModalOpen,
    isStartLessonNowModalOpen,
    isAddStudentModalOpen,
    isAddGroupModalOpen,
    isBackupModalOpen
  });

  // Keep state reference up to date for back button handler to avoid stale closures
  useEffect(() => {
    stateRef.current = {
      activeTab,
      isGlobalSearchOpen,
      isRecentlyDeletedModalOpen,
      isControlModalOpen,
      isAddLessonModalOpen,
      isAddQuickLessonModalOpen,
      isStartLessonNowModalOpen,
      isAddStudentModalOpen,
      isAddGroupModalOpen,
      isBackupModalOpen
    };
  }, [
    activeTab,
    isGlobalSearchOpen,
    isRecentlyDeletedModalOpen,
    isControlModalOpen,
    isAddLessonModalOpen,
    isAddQuickLessonModalOpen,
    isStartLessonNowModalOpen,
    isAddStudentModalOpen,
    isAddGroupModalOpen,
    isBackupModalOpen
  ]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

      const backButtonListener = CapacitorApp.addListener('backButton', () => {
        const {
          activeTab: currentActiveTab,
          isGlobalSearchOpen: searchOpen,
          isRecentlyDeletedModalOpen: deletedOpen,
          isControlModalOpen: controlOpen,
          isAddLessonModalOpen: addLessonOpen,
          isAddQuickLessonModalOpen: addQuickOpen,
          isStartLessonNowModalOpen: startNowOpen,
          isAddStudentModalOpen: addStudentOpen,
          isAddGroupModalOpen: addGroupOpen,
          isBackupModalOpen: backupOpen
        } = stateRef.current;

        if (searchOpen) {
          setIsGlobalSearchOpen(false);
        } else if (deletedOpen) {
          setIsRecentlyDeletedModalOpen(false);
        } else if (controlOpen) {
          closeLessonControl();
        } else if (addLessonOpen) {
          setIsAddLessonModalOpen(false);
        } else if (addQuickOpen) {
          setIsAddQuickLessonModalOpen(false);
        } else if (startNowOpen) {
          setIsStartLessonNowModalOpen(false);
        } else if (addStudentOpen) {
          setIsAddStudentModalOpen(false);
        } else if (addGroupOpen) {
          setIsAddGroupModalOpen(false);
        } else if (backupOpen) {
          setIsBackupModalOpen(false);
        } else if (currentActiveTab !== 'home') {
          setActiveTab('home');
        } else {
          CapacitorApp.exitApp();
        }
      });

      return () => {
        backButtonListener.then((listener) => listener.remove());
      };
    }
  }, []);


  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const TABS_ORDER = ['home', 'schedule', 'students', 'history', 'payments', 'reports', 'settings'];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    // Only detect swipe if horizontal movement is greater than vertical movement
    if (Math.abs(currentX - touchStartX) > Math.abs(currentY - touchStartY)) {
      setTouchEndX(currentX);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = TABS_ORDER.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < TABS_ORDER.length - 1) {
      setActiveTab(TABS_ORDER[currentIndex + 1] as any);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(TABS_ORDER[currentIndex - 1] as any);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-text-main font-sans antialiased overflow-hidden">
      <div className="max-w-lg mx-auto bg-background h-[100dvh] shadow-2xl relative flex flex-col border-x border-surface-border/80 dark:border-surface-border">
        <Header />

        {/* Tab View Content Area */}
        <main 
          className="flex-1 p-4 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] overflow-x-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="space-y-3"
            >
              {activeTab === 'home' && (

            <>
              {/* Daily Inspiration & Gratitude Card */}
              <InspirationCardWidget />

              {/* Today's Progress Timeline */}
              <TodaysProgressTimeline />

              {/* Compact Collapsible To-Do Widget */}
              <QuickTodoWidget />

              {/* Tomorrow's Lessons Compact Widget */}
              <TomorrowsLessonsWidget />
              <AvailableTodayWidget />


              {/* Weekly & Monthly Statistics */}
              <DailyStats />

              {/* Payment Alerts */}
              <PaymentAlertsCard />

              {/* Smart Daily Summary Widget at bottom of Dashboard */}
              <SmartDailySummaryWidget />
            </>
          )}

          {activeTab === 'schedule' && <ScheduleView />}

          {activeTab === 'students' && <StudentsView />}

          {activeTab === 'history' && <SessionHistoryView />}

          {activeTab === 'payments' && <PaymentsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'freeTime' && <FreeTimeSlotsView />}
          {activeTab === 'widgets' && <AndroidWidgetsHub />}

            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Global Modals */}
        {isControlModalOpen && <LessonControlModal />}
        {isAddLessonModalOpen && <AddLessonModal onClose={() => setIsAddLessonModalOpen(false)} />}
        {isAddQuickLessonModalOpen && <AddQuickLessonModal onClose={() => setIsAddQuickLessonModalOpen(false)} />}
        {isStartLessonNowModalOpen && <StartLessonNowModal onClose={() => setIsStartLessonNowModalOpen(false)} />}
        {isAddStudentModalOpen && <AddStudentModal onClose={() => setIsAddStudentModalOpen(false)} />}
        {isAddGroupModalOpen && <AddGroupModal onClose={() => setIsAddGroupModalOpen(false)} />}
        {isBackupModalOpen && <BackupModal onClose={() => setIsBackupModalOpen(false)} />}
        <GlobalSearchModal />
        <RecentlyDeletedModal />
        <SetupWizard />
      </div>
    </div>
  );
}


import { migrateFromLocalStorageToIndexedDB } from './services/migrationService';
import { storage } from './services/storageService';

export default function App() {
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        await migrateFromLocalStorageToIndexedDB();
        const keys = [
          'dl_theme', 'dl_accent_color', 'dl_quick_todos', 'dl_language', 'dl_profile',
          'dl_groups', 'dl_students', 'dl_lessons', 'dl_payments',
          'dl_notifications', 'dl_notification_settings', 'dl_inspiration_settings', 'dl_inspiration_messages',
          'dl_last_backup_time', 'dl_dismissed_dashboard_lessons', 'dl_recently_deleted',
          'dl_active_lesson_session', 'dl_notified_lesson_alerts', 'dl_local_backup_data'
        ];
        
        const data: any = {};
        for (const key of keys) {
          data[key] = await storage.getItem(key);
        }
        setInitialData(data);
      } catch (err) {
        console.error('Error during loadData initialisation:', err);
        setInitialData({});
      }
    }
    loadData();
  }, []);

  if (!initialData) {
    return <div className="h-[100dvh] w-screen flex items-center justify-center bg-background"><div className="animate-pulse text-slate-500">Lade Daten...</div></div>;
  }

  return (
    <AppProvider initialData={initialData}>
      <MainApp />
    </AppProvider>
  );
}
