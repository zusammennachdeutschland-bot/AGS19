import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PREDEFINED_GRADES } from '../data/initialData';
import { GradeLevel, LessonType, PaymentCycle } from '../types';
import { X, Users, Video, MapPin, DollarSign, Calendar, Bot, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AiImportModal } from './AiImportModal';

interface AddGroupModalProps {
  onClose: () => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ onClose }) => {
  const { addGroup, generateGroupScheduleLessons, profile, language, t } = useApp();

  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };

  const [isAiImportOpen, setIsAiImportOpen] = useState(false);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 9');
  const [type, setType] = useState<LessonType>('online');
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>('monthly');
  const [monthlyPackagePrice, setMonthlyPackagePrice] = useState(1200);
  const [pricePerSession, setPricePerSession] = useState(150);
  const [sessionCount, setSessionCount] = useState(8); // 1, 4, 8, 12
  const [startingSessionNumber, setStartingSessionNumber] = useState(1); // 1, 3, 5, 8...
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'cash' | 'bank_transfer' | 'paypal' | 'instapay'>('vodafone_cash');
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState('17:00');
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({});
  const [autoAddCalendar, setAutoAddCalendar] = useState(true);
  const [zoomLink, setZoomLink] = useState(profile.defaultZoomLink);
  const [meetLink, setMeetLink] = useState(profile.defaultMeetLink);
  const [address, setAddress] = useState('Hauptstraße 45, Modern Education Center, Cairo');
  const [color, setColor] = useState('#3B82F6');
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(60);

  const toggleScheduleDay = (day: string) => {
    setScheduleDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        if (!dayTimes[day]) {
          setDayTimes(dt => ({ ...dt, [day]: scheduleTime || '17:00' }));
        }
        return [...prev, day];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const calcMonthlyPrice = paymentCycle === 'per_lesson' 
      ? Number(pricePerSession) * (sessionCount || 8)
      : Number(monthlyPackagePrice);

    const schedules = scheduleDays.map(day => ({
      day,
      time: dayTimes[day] || scheduleTime || '17:00'
    }));

    const createdGroup = addGroup({
      name,
      grade,
      type,
      paymentCycle,
      monthlyPackagePrice: calcMonthlyPrice,
      pricePerSession: paymentCycle === 'per_lesson' ? Number(pricePerSession) : undefined,
      sessionCount: Number(sessionCount),
      startingSessionNumber: Number(startingSessionNumber),
      paymentMethod,
      scheduleDays,
      scheduleTime,
      scheduleDayTimes: dayTimes,
      schedules,
      zoomLink: type === 'online' ? zoomLink : undefined,
      meetLink: type === 'online' ? meetLink : undefined,
      address: type === 'offline' ? address : undefined,
      coordinates: type === 'offline' ? { lat: 30.0444, lng: 31.2357 } : undefined,
      color,
      lessonDurationMinutes: Number(lessonDurationMinutes)
    });

    if (autoAddCalendar && scheduleDays.length > 0) {
      generateGroupScheduleLessons(createdGroup.id, scheduleDays, scheduleTime, 4, dayTimes, createdGroup);
    }

    confetti({ particleCount: 60, spread: 50 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center pt-[max(24px,env(safe-area-inset-top,24px))] p-0 sm:p-4 pb-0">
      <div className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-surface/20 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('add_group_title')}</h2>
              <p className="text-xs text-primary-soft">{t('add_group_subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* AI Import Shortcut Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 border border-primary-border dark:border-primary-border rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{_t('استيراد مجموعة + طلاب بالذكاء الاصطناعي', 'Import Group + Students with AI')}</span>
                  <Sparkles className="w-3 h-3 text-primary fill-primary" />
                </h4>
                <p className="text-[10px] text-text-muted">
                  {_t('أنشئ المجموعة والطلاب دفعة واحدة بنص جاهز', 'Create group and all students at once with AI text')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiImportOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              {_t('تجربة الاستيراد', 'AI Import')}
            </button>
          </div>

          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Gruppen Name (Group Name) *
            </label>
            <input
              type="text"
              required
              placeholder="z. B. Deutsch Gruppe A2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Group Type Selector (Online / Offline) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Unterrichtsform (Lesson Type) *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('online')}
                className={`py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'online'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Online (Zoom / Meet)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('offline')}
                className={`py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'offline'
                    ? 'bg-primary text-white border-primary-border shadow-xs'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Offline (Vor Ort)</span>
              </button>
            </div>
          </div>

          {/* Predefined Grade */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Klassenstufe (Predefined Grade Level)
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none"
            >
              {PREDEFINED_GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Payment Model Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Abrechnungsmodell (Payment Option) *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentCycle('monthly')}
                className={`py-2.5 px-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentCycle === 'monthly'
                    ? 'bg-primary text-white border-primary-border shadow-xs'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Monatspaket (Monthly)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentCycle('per_lesson')}
                className={`py-2.5 px-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentCycle === 'per_lesson'
                    ? 'bg-primary text-white border-primary-border shadow-xs'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Pro Sitzung (Per Session)</span>
              </button>
            </div>
          </div>

          {/* Group Pricing & Cycle Settings */}
          <div className="space-y-3 bg-surface-hover/80 p-3 rounded-lg border border-surface-border dark:border-surface-border-soft">
            {paymentCycle === 'monthly' ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Paket Preis ({profile.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyPackagePrice}
                    onChange={(e) => setMonthlyPackagePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Zahlungs-Zyklus (Package)
                  </label>
                  <select
                    value={sessionCount}
                    onChange={(e) => setSessionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold"
                  >
                    <option value={4}>Alle 4 Lektionen (Every 4)</option>
                    <option value={8}>Alle 8 Lektionen (Every 8)</option>
                    <option value={12}>Alle 12 Lektionen (Every 12)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Preis pro Sitzung ({profile.currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="z. B. 150"
                  value={pricePerSession}
                  onChange={(e) => setPricePerSession(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold font-mono"
                />
              </div>
            )}

            {/* Payment method & Optional Starting Session Number */}
            <div className={`grid ${paymentCycle === 'monthly' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1 border-t border-surface-border dark:border-surface-border-soft`}>
              {paymentCycle === 'monthly' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary dark:text-primary flex items-center gap-1">
                    <span>Start-Sitzungsnummer:</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={startingSessionNumber}
                    onChange={(e) => setStartingSessionNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-surface border border-primary-border dark:border-primary-border rounded-xl text-xs font-black font-mono focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    z.B. Sitzung 3 oder 5 für bestehende Gruppen
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Standard Zahlungsart:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-surface border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold"
                >
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="instapay">InstaPay</option>
                  <option value="cash">Bargeld (Cash)</option>
                  <option value="bank_transfer">Banküberweisung</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule & Calendar Sync Settings */}
          <div className="p-3 bg-primary-soft dark:bg-primary-soft/40 border border-primary-border/60 dark:border-primary-border/60 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-hover dark:text-primary/70 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Unterrichtstage & Uhrzeit (Calendar)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-primary dark:text-primary/70">
                <input 
                  type="checkbox" 
                  checked={autoAddCalendar} 
                  onChange={(e) => setAutoAddCalendar(e.target.checked)}
                  className="rounded text-primary focus:ring-primary" 
                />
                <span>In Kalender eintragen</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted">
                Wochentage wählen (Repeat Days):
              </label>
              <div className="flex flex-wrap gap-1">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleScheduleDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scheduleDays.includes(day)
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface dark:bg-slate-800 text-text-muted border border-surface-border dark:border-surface-border-soft'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {scheduleDays.length === 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-muted">
                  Standard-Uhrzeit (Standard Start Time):
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface dark:bg-slate-800 border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                />
              </div>
            )}

            {/* Per-Day Custom Times Option */}
            {scheduleDays.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-primary-border/60 dark:border-primary-border/60">
                <label className="text-[11px] font-bold text-primary-hover dark:text-primary/70 block">
                  Uhrzeit pro Wochentag (Unterschiedliche Zeiten pro Tag):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleDays.map(day => (
                    <div key={day} className="flex items-center gap-1.5 bg-surface dark:bg-slate-800 p-1.5 rounded-xl border border-surface-border dark:border-surface-border-soft">
                      <span className="text-xs font-black text-primary dark:text-primary w-6 shrink-0">{day}:</span>
                      <input
                        type="time"
                        value={dayTimes[day] || scheduleTime || '17:00'}
                        onChange={(e) => setDayTimes(prev => ({ ...prev, [day]: e.target.value }))}
                        className="w-full bg-transparent text-xs font-mono font-bold focus:outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson Duration per Group */}
            <div className="pt-2 border-t border-primary-border/60 dark:border-primary-border/60 space-y-1">
              <label className="text-xs font-bold text-primary-hover dark:text-primary/70 flex items-center gap-1.5">
                <span>{t('lesson_duration_label')}:</span>
              </label>
              <select
                value={lessonDurationMinutes}
                onChange={(e) => setLessonDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-primary-border dark:border-primary-border rounded-xl text-xs font-bold text-primary dark:text-primary/70"
              >
                <option value={60}>60 Min (1 Std / 1 Hour - Default)</option>
                <option value={75}>75 Min (1h 15m)</option>
                <option value={90}>90 Min (1.5 Std / 1.5 Hours)</option>
                <option value={105}>105 Min (1h 45m)</option>
                <option value={120}>120 Min (2 Std / 2 Hours)</option>
                <option value={150}>150 Min (2.5 Std / 2.5 Hours)</option>
                <option value={180}>180 Min (3 Std / 3 Hours)</option>
              </select>
            </div>
          </div>

          {/* Type specific links */}
          {type === 'online' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Dauerhafter Zoom Link (Permanent)
                </label>
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Dauerhafter Google Meet Link
                </label>
                <input
                  type="url"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main">
                Adresse & Google Maps Ort
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all cursor-pointer"
          >
            Gruppe Speichern (Save Group)
          </button>
        </form>
      </div>

      <AiImportModal
        isOpen={isAiImportOpen}
        onClose={() => {
          setIsAiImportOpen(false);
          onClose();
        }}
      />
    </div>
  );
};
