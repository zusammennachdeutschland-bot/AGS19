import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PREDEFINED_GRADES } from '../data/initialData';
import { GradeLevel, LessonType, PaymentCycle } from '../types';
import { X, Users, Video, MapPin, DollarSign, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddGroupModalProps {
  onClose: () => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ onClose }) => {
  const { addGroup, generateGroupScheduleLessons, profile, t } = useApp();

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('add_group_title')}</h2>
              <p className="text-xs text-indigo-100">{t('add_group_subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gruppen Name (Group Name) *
            </label>
            <input
              type="text"
              required
              placeholder="z. B. Deutsch Gruppe A2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Group Type Selector (Online / Offline) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Unterrichtsform (Lesson Type) *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('online')}
                className={`py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'online'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Offline (Vor Ort)</span>
              </button>
            </div>
          </div>

          {/* Predefined Grade */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Klassenstufe (Predefined Grade Level)
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
            >
              {PREDEFINED_GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Payment Model Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Abrechnungsmodell (Payment Option) *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentCycle('monthly')}
                className={`py-2.5 px-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentCycle === 'monthly'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Pro Sitzung (Per Session)</span>
              </button>
            </div>
          </div>

          {/* Group Pricing & Cycle Settings */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            {paymentCycle === 'monthly' ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Paket Preis ({profile.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyPackagePrice}
                    onChange={(e) => setMonthlyPackagePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Zahlungs-Zyklus (Package)
                  </label>
                  <select
                    value={sessionCount}
                    onChange={(e) => setSessionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value={4}>Alle 4 Lektionen (Every 4)</option>
                    <option value={8}>Alle 8 Lektionen (Every 8)</option>
                    <option value={12}>Alle 12 Lektionen (Every 12)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preis pro Sitzung ({profile.currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="z. B. 150"
                  value={pricePerSession}
                  onChange={(e) => setPricePerSession(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                />
              </div>
            )}

            {/* Payment method & Optional Starting Session Number */}
            <div className={`grid ${paymentCycle === 'monthly' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1 border-t border-slate-200 dark:border-slate-700`}>
              {paymentCycle === 'monthly' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <span>Start-Sitzungsnummer:</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={startingSessionNumber}
                    onChange={(e) => setStartingSessionNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-black font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    z.B. Sitzung 3 oder 5 für bestehende Gruppen
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Standard Zahlungsart:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
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
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Unterrichtstage & Uhrzeit (Calendar)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-blue-700 dark:text-blue-300">
                <input 
                  type="checkbox" 
                  checked={autoAddCalendar} 
                  onChange={(e) => setAutoAddCalendar(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>In Kalender eintragen</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
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
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {scheduleDays.length === 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Standard-Uhrzeit (Standard Start Time):
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            )}

            {/* Per-Day Custom Times Option */}
            {scheduleDays.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                <label className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block">
                  Uhrzeit pro Wochentag (Unterschiedliche Zeiten pro Tag):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleDays.map(day => (
                    <div key={day} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 w-6 shrink-0">{day}:</span>
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
            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 space-y-1">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <span>{t('lesson_duration_label')}:</span>
              </label>
              <select
                value={lessonDurationMinutes}
                onChange={(e) => setLessonDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300"
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dauerhafter Zoom Link (Permanent)
                </label>
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dauerhafter Google Meet Link
                </label>
                <input
                  type="url"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Adresse & Google Maps Ort
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all cursor-pointer"
          >
            Gruppe Speichern (Save Group)
          </button>
        </form>
      </div>
    </div>
  );
};
