import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Group, PaymentCycle } from '../types';
import { X, Users, Video, MapPin, ExternalLink, Save, DollarSign, Calendar, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface GroupProfileModalProps {
  group: Group;
  onClose: () => void;
}

export const GroupProfileModal: React.FC<GroupProfileModalProps> = ({ group, onClose }) => {
  const { updateGroup, deleteGroup, archiveGroup, generateGroupScheduleLessons, profile, students, lessons, payments, t } = useApp();

  const [name, setName] = useState(group.name);
  const [type, setType] = useState(group.type);
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>(group.paymentCycle || 'monthly');
  const [monthlyPackagePrice, setMonthlyPackagePrice] = useState(group.monthlyPackagePrice);
  const [pricePerSession, setPricePerSession] = useState(group.pricePerSession || Math.round(group.monthlyPackagePrice / (group.sessionCount || 8)));
  const [sessionCount, setSessionCount] = useState(group.sessionCount || 8);
  const [scheduleDays, setScheduleDays] = useState<string[]>(group.scheduleDays || ['Mo', 'Mi']);
  const [scheduleTime, setScheduleTime] = useState(group.scheduleTime || '17:00');
  const [dayTimes, setDayTimes] = useState<Record<string, string>>(group.scheduleDayTimes || { 'Mo': '17:00', 'Mi': '18:30' });
  const [zoomLink, setZoomLink] = useState(group.zoomLink || profile.defaultZoomLink);
  const [meetLink, setMeetLink] = useState(group.meetLink || profile.defaultMeetLink);
  const [address, setAddress] = useState(group.address || 'Hauptstraße 45, Cairo');
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(group.lessonDurationMinutes || 60);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const groupStudents = students.filter(s => s.groupId === group.id);

  const toggleScheduleDay = (day: string) => {
    setScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGenerateCalendar = () => {
    if (scheduleDays.length === 0) return;
    generateGroupScheduleLessons(group.id, scheduleDays, scheduleTime, 4, dayTimes);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const calcMonthlyPrice = paymentCycle === 'per_lesson'
      ? Number(pricePerSession) * (sessionCount || 8)
      : Number(monthlyPackagePrice);

    const schedules = scheduleDays.map(day => ({
      day,
      time: dayTimes[day] || scheduleTime || '17:00'
    }));

    const updatedGroupData = {
      ...group,
      name,
      type,
      paymentCycle,
      monthlyPackagePrice: calcMonthlyPrice,
      pricePerSession: paymentCycle === 'per_lesson' ? Number(pricePerSession) : undefined,
      sessionCount: paymentCycle === 'monthly' ? Number(sessionCount) : 8,
      scheduleDays,
      scheduleTime,
      scheduleDayTimes: dayTimes,
      schedules,
      zoomLink: type === 'online' ? zoomLink : undefined,
      meetLink: type === 'online' ? meetLink : undefined,
      address: type === 'offline' ? address : undefined,
      lessonDurationMinutes: Number(lessonDurationMinutes)
    };

    updateGroup(group.id, updatedGroupData);

    if (scheduleDays.length > 0) {
      generateGroupScheduleLessons(group.id, scheduleDays, scheduleTime, 4, dayTimes, updatedGroupData);
    }

    confetti({ particleCount: 50, spread: 40 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 pt-[max(24px,env(safe-area-inset-top,24px))]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{group.name}</h2>
              <p className="text-xs text-indigo-100">{group.grade} • {groupStudents.length} Schüler</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gruppen Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            />
          </div>

          {/* Payment Cycle Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Abrechnungsmodell (Payment Option)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentCycle('monthly')}
                className={`py-2 px-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentCycle === 'monthly'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Monatspaket (Monthly)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentCycle('per_lesson')}
                className={`py-2 px-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentCycle === 'per_lesson'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pro Sitzung (Per Session)</span>
              </button>
            </div>
          </div>

          {/* Pricing & Sessions */}
          {paymentCycle === 'monthly' ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Monatspaket Preis ({profile.currency})
                </label>
                <input
                  type="number"
                  value={monthlyPackagePrice}
                  onChange={(e) => setMonthlyPackagePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sitzungen pro Paket
                </label>
                <input
                  type="number"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Preis pro Sitzung ({profile.currency})
              </label>
              <input
                type="number"
                value={pricePerSession}
                onChange={(e) => setPricePerSession(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          )}

          {/* Schedule & Calendar Sync */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Unterrichtstage & Kalender (Group Schedule)</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateCalendar}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
              >
                + In Kalender eintragen
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Wochentage wählen:
              </label>
              <div className="flex flex-wrap gap-1">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleScheduleDay(day)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  Standard-Uhrzeit (Standard Time):
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            )}

            {/* Per-Day Custom Times */}
            {scheduleDays.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                <label className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block">
                  Uhrzeit pro Wochentag (Individual Times per Day):
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

          {/* Type details */}
          {type === 'online' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Permanent Zoom Link</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
                <a
                  href={zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          )}

          {/* Students in group */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Schüler in dieser Gruppe ({groupStudents.length}):
            </p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {groupStudents.map(s => (
                <div key={s.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex justify-between font-semibold">
                  <span>{s.name}</span>
                  <span className="text-slate-400 font-mono">{s.parentPhone}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs px-4 py-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-red-200 dark:border-red-800"
              title="Gruppe löschen / archivieren"
            >
              <Trash2 className="w-4 h-4" />
              <span>Gruppe Löschen</span>
            </button>

            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Änderungen Speichern</span>
            </button>
          </div>
        </form>
      </div>

      <DeleteConfirmModal
        isOpen={isConfirmingDelete}
        itemType="group"
        itemName={group.name}
        recordsSummary={{
          studentsCount: groupStudents.length,
          lessonsCount: lessons.filter(l => l.groupId === group.id).length,
          paymentsCount: payments.filter(p => p.groupId === group.id).length,
          attendanceCount: lessons.filter(l => l.groupId === group.id && l.report?.attendanceStatus).length,
        }}
        onConfirmDelete={() => {
          deleteGroup(group.id);
          setIsConfirmingDelete(false);
          onClose();
        }}
        onConfirmArchive={() => {
          archiveGroup(group.id);
          setIsConfirmingDelete(false);
          onClose();
        }}
        onClose={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};
