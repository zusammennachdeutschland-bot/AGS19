import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, Star, RefreshCw, Quote } from 'lucide-react';

export const InspirationCardWidget: React.FC = () => {
  const { 
    activeInspirationCard, 
    dismissInspirationCard, 
    toggleFavoriteInspirationMessage,
    checkAndTriggerInspirationReminder,
    inspirationSettings,
    language
  } = useApp();


  React.useEffect(() => {
    if (activeInspirationCard) {
      const timer = setTimeout(() => {
        dismissInspirationCard();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeInspirationCard, dismissInspirationCard]);

  if (!activeInspirationCard || inspirationSettings.frequency === 'disabled') {
    return null;
  }

  if (inspirationSettings.displayMethod !== 'in_app' && inspirationSettings.displayMethod !== 'both') {
    return null;
  }

  const isFavorite = activeInspirationCard.isFavorite;

  return (
    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/50 rounded-lg p-4 shadow-2xs relative overflow-hidden transition-all animate-fade-in font-sans">
      {/* Decorative subtle background icon */}
      <div className="absolute -bottom-3 -left-3 text-amber-500/5 pointer-events-none">
        <Quote className="w-20 h-20 rotate-180" />
      </div>

      <div className="relative z-10 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-white rounded-xl shrink-0 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                {language === 'ar' ? 'إلهام اليوم' : language === 'de' ? 'Tägliche Inspiration' : 'Daily Inspiration'}
              </h3>
              <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                {language === 'ar' ? 'تذكير للمعلم وخطوة للبركة' : 'Teacher Reminder & Motivation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleFavoriteInspirationMessage(activeInspirationCard.id)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'
              }`}
              title={isFavorite ? 'مفضلة' : 'إضافة للمفضلة'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => checkAndTriggerInspirationReminder('manual')}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
              title={language === 'ar' ? 'رسالة أخرى' : 'Another Message'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={dismissInspirationCard}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message body - flat layout */}
        <div className="pt-1.5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed text-right dir-rtl font-sans">
            "{activeInspirationCard.text}"
          </p>
        </div>
      </div>
    </div>
  );
};
