import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Calendar, Users, MoreHorizontal, Wallet, BarChart2, Settings, Zap, History, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsAddQuickLessonModalOpen, 
    setIsStartLessonNowModalOpen, 
    t 
  } = useApp();
  
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Helper to determine if "More" sub-tabs are active
  const isHistoryActive = activeTab === 'history';
  const isReportsActive = activeTab === 'reports';
  const isSettingsActive = activeTab === 'settings';
  const isMoreTabActive = isHistoryActive || isReportsActive || isSettingsActive;

  // Define primary tabs
  const leftTabs = [
    { id: 'home', label: t('nav_home') || 'Start', icon: Home },
    { id: 'schedule', label: t('nav_schedule') || 'Termine', icon: Calendar },
    { id: 'students', label: t('nav_students') || 'Schüler', icon: Users },
  ];

  const rightTabs = [
    { id: 'payments', label: t('nav_payments') || 'Zahlungen', icon: Wallet },
  ];

  // Dynamic more tab metadata
  const getMoreTabMetadata = () => {
    if (isHistoryActive) return { label: t('nav_history') || 'Sitzungen', icon: History, colorClass: 'text-amber-500' };
    if (isReportsActive) return { label: t('nav_reports') || 'Berichte', icon: BarChart2, colorClass: 'text-indigo-500' };
    if (isSettingsActive) return { label: t('nav_settings') || 'Einstellungen', icon: Settings, colorClass: 'text-blue-500' };
    return { label: t('nav_more') || 'Mehr', icon: MoreHorizontal, colorClass: 'text-slate-400' };
  };

  const moreTab = getMoreTabMetadata();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    setShowMoreMenu(false);
    setShowQuickMenu(false);
  };

  return (
    <div className="absolute bottom-5 left-4 right-4 z-40 max-w-lg mx-auto select-none pointer-events-none">
      <div className="relative w-full flex justify-center">
        {/* Floating Dock glassmorphism container */}
        <div className="w-full bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/60 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-3 py-2 flex items-center justify-between pointer-events-auto relative">
          
          {/* LEFT TABS */}
          <div className="flex items-center gap-1">
            {leftTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="relative flex items-center justify-center py-2 px-3 rounded-full cursor-pointer transition-all focus:outline-none shrink-0"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Gliding Active background Pill using framer-motion */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-blue-600/10 dark:bg-blue-400/15 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  <motion.div 
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <IconComponent
                      className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    />
                    
                    {/* Expandable Label only for active state */}
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ width: 0, opacity: 0, scale: 0.8 }}
                          animate={{ width: 'auto', opacity: 1, scale: 1 }}
                          exit={{ width: 0, opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                          className="text-[10px] sm:text-xs font-black tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap overflow-hidden pr-0.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              );
            })}
          </div>

          {/* CENTER Tactile Quick Action FAB */}
          <div className="relative flex items-center justify-center shrink-0 -mt-7 select-none">
            {/* Soft breathing background rings */}
            <div className="absolute inset-[-4px] bg-blue-500/10 dark:bg-blue-400/10 rounded-full animate-ping opacity-60 pointer-events-none scale-90" />
            
            <motion.button
              whileHover={{ scale: 1.12, rotate: showQuickMenu ? 90 : 0 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                setShowQuickMenu(prev => !prev);
                setShowMoreMenu(false);
              }}
              className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/30 ring-[5px] ring-white dark:ring-black relative z-10 cursor-pointer focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Schnell-Eintrag"
              title="Aktionen anzeigen"
            >
              <Zap className="w-5.5 h-5.5 fill-white" />
            </motion.button>

            {/* Quick Action Popover Menu */}
            <AnimatePresence>
              {showQuickMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="absolute bottom-16 w-56 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/60 rounded-[20px] shadow-xl p-1.5 space-y-1 z-50 pointer-events-auto"
                >
                  <button
                    onClick={() => {
                      setIsAddQuickLessonModalOpen(true);
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
                        {t('quick_lesson_modal_title') || 'Schnell-Eintrag'}
                      </span>
                      <span className="block text-[9px] text-slate-400 font-medium">
                        Schnell eine Lektion planen
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsStartLessonNowModalOpen(true);
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-violet-500 mt-0.5 shrink-0 fill-violet-500/15" />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
                        {t('sofort_title') || 'Start Lesson Now (Anytime)'}
                      </span>
                      <span className="block text-[9px] text-slate-400 font-medium">
                        Sofort eine Live-Stoppuhr starten
                      </span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT TABS */}
          <div className="flex items-center gap-1">
            {rightTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="relative flex items-center justify-center py-2 px-3 rounded-full cursor-pointer transition-all focus:outline-none shrink-0"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-blue-600/10 dark:bg-blue-400/15 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  <motion.div 
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <IconComponent
                      className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    />
                    
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ width: 0, opacity: 0, scale: 0.8 }}
                          animate={{ width: 'auto', opacity: 1, scale: 1 }}
                          exit={{ width: 0, opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                          className="text-[10px] sm:text-xs font-black tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap overflow-hidden pr-0.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              );
            })}

            {/* MORE BUTTON */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowMoreMenu(prev => !prev);
                  setShowQuickMenu(false);
                }}
                className="relative flex items-center justify-center py-2 px-3 rounded-full cursor-pointer transition-all focus:outline-none shrink-0"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isMoreTabActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-blue-600/10 dark:bg-blue-400/15 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}

                <motion.div 
                  animate={{ scale: isMoreTabActive ? 1.08 : 1 }}
                  className="flex items-center gap-1.5"
                >
                  <moreTab.icon
                    className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors duration-200 ${
                      isMoreTabActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  />
                  
                  <AnimatePresence initial={false}>
                    {isMoreTabActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, scale: 0.8 }}
                        animate={{ width: 'auto', opacity: 1, scale: 1 }}
                        exit={{ width: 0, opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                        className="text-[10px] sm:text-xs font-black tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap overflow-hidden pr-0.5"
                      >
                        {moreTab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </button>

              {/* Modern Frosted-glass context menu popover */}
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="absolute bottom-14 right-0 w-44 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/60 rounded-[20px] shadow-xl p-1.5 space-y-1.5 z-50 origin-bottom-right"
                  >
                    <button
                      onClick={() => handleTabClick('history')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'history'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <History className="w-4 h-4 text-amber-500" />
                      <span>{t('nav_history') || 'Sitzungen'}</span>
                    </button>

                    <button
                      onClick={() => handleTabClick('reports')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'reports'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                      <span>{t('nav_reports') || 'Berichte'}</span>
                    </button>

                    <button
                      onClick={() => handleTabClick('settings')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>{t('nav_settings') || 'Einstellungen'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
