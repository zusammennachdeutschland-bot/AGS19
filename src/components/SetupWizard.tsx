import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Globe, Clock, Check, Briefcase } from 'lucide-react';
import { AppLanguage } from '../types';

export const SetupWizard: React.FC = () => {
  const { profile, updateProfile, setLanguage } = useApp();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLocalLanguage] = useState<AppLanguage>('de');
  const [currency, setCurrency] = useState('EGP');

  if (profile.displayName !== 'Teacher') {
    return null;
  }

  const handleComplete = () => {
    updateProfile({
      displayName: displayName.trim() || 'Teacher',
      email: email.trim(),
      language,
      currency
    });
    setLanguage(language);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center pt-[max(24px,env(safe-area-inset-top,24px))] font-sans animate-in fade-in p-0 sm:p-4 pb-0">
      <div className="bg-surface rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        <div className="bg-gradient-to-br from-primary to-primary-hover p-5 text-white text-center">
          <div className="w-16 h-16 bg-surface/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-1">Welcome to Glück fröhlich und froh</h2>
          <p className="text-sm text-primary-soft font-medium">Let's set up your teacher profile</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted/70">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Herr Schmidt"
                  className="w-full pl-10 p-3 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-text-muted/70 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted/70">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full pl-10 p-3 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLocalLanguage(e.target.value as AppLanguage)}
                  className="w-full p-3 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                >
                  <option value="EGP">EGP</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!displayName.trim()}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Check className="w-5 h-5" />
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};