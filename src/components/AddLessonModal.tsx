import React, { useState } from 'react';
import { checkOverlap } from '../utils/lessonUtils';
import { useApp } from '../context/AppContext';
import { PREDEFINED_GRADES } from '../data/initialData';
import { GradeLevel, LessonType } from '../types';
import { X, Calendar, Clock, AlertTriangle, Sparkles, Check, Video, MapPin, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddLessonModalProps {
  onClose: () => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({ onClose }) => {
  const { groups, students, lessons, profile, addLesson, t } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [type, setType] = useState<LessonType>('online');
  const [grade, setGrade] = useState<GradeLevel>('Grade 9');
  
  // Weekly Recurring States (Default: True)
  const [isWeeklyRecurring, setIsWeeklyRecurring] = useState(true);
  const [repeatWeeks, setRepeatWeeks] = useState(4);

  const selectedGroup = groups.find(g => g.id === groupId);
  const groupStudents = students.filter(s => s.groupId === groupId);

  // CONFLICT DETECTION ALGORITHM:
  // Check if chosen date + time overlaps with any existing lesson
  const checkConflict = (checkTime: string) => {
    const dummyLesson = { id: 'dummy', date, time: checkTime, durationMinutes };
    return lessons.some(l => checkOverlap(dummyLesson, l));
  };

  const hasConflict = checkConflict(time);

  // SUGGEST AVAILABLE SLOTS based on Working Hours & existing schedule
  const generateAvailableSlots = () => {
    const slots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return slots.filter(slot => !checkConflict(slot));
  };

  const availableSlots = generateAvailableSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || hasConflict) return;

    const targetStudent = students.find(s => s.id === studentId);

    addLesson({
      groupId,
      groupName: selectedGroup?.name || 'Deutsch Gruppe',
      studentId: studentId || undefined,
      studentName: targetStudent?.name || undefined,
      title: targetStudent?.name || selectedGroup?.name || 'Deutsch Lektion',
      date,
      time,
      durationMinutes: Number(durationMinutes),
      type,
      grade: selectedGroup?.grade || grade,
      status: 'scheduled',
      paymentStatus: 'unpaid',
      amountDue: selectedGroup ? Math.round(selectedGroup.monthlyPackagePrice / selectedGroup.sessionCount) : 250,
      amountPaid: 0
    }, isWeeklyRecurring ? Number(repeatWeeks) : 1);

    confetti({ particleCount: 70, spread: 50 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-scale-up font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('schedule_lesson_title')}</h2>
              <p className="text-xs text-blue-100">Weekly Recurring & Google Calendar Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Select Group */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gruppe / Kurs *
            </label>
            <select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                const g = groups.find(item => item.id === e.target.value);
                if (g) {
                  setType(g.type);
                  setGrade(g.grade);
                  if (g.lessonDurationMinutes) setDurationMinutes(g.lessonDurationMinutes);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.grade} • {g.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Individual Student (Optional if group lesson) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Einzelner Schüler (Optional)
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">-- Gesamte Gruppe ({selectedGroup?.name}) --</option>
              {groupStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Startdatum (Start Date)</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Uhrzeit (Time)</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* WEEKLY RECURRING PANEL */}
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Wöchentlich Wiederholen (Weekly Recurring)</span>
              </span>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={isWeeklyRecurring}
                  onChange={(e) => setIsWeeklyRecurring(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Aktiv</span>
              </label>
            </div>

            {isWeeklyRecurring && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Anzahl der Wochen (Weeks Duration):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[4, 8, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRepeatWeeks(num)}
                      className={`py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        repeatWeeks === num
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num} Wochen ({num} Termine)
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold italic mt-1">
                  ✓ Lektionen werden jeden {new Date(date).toLocaleDateString('de-DE', { weekday: 'long' })} um {time} Uhr automatisch eingetragen.
                </p>
              </div>
            )}
          </div>

          {/* CONFLICT DETECTION WARNING */}
          {hasConflict && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3 flex items-start gap-2 text-xs text-red-800 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terminkonflikt erkannt! (Schedule Conflict)</p>
                <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                  Es gibt bereits eine andere Lektion um {time} Uhr an diesem Tag. Bitte wählen Sie eine freie Zeit aus.
                </p>
              </div>
            </div>
          )}

          {/* SUGGESTED TIME SLOTS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Freie Zeitfenster (Suggested Available Slots):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    time === slot
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  {slot} Uhr
                </button>
              ))}
            </div>
          </div>

          {/* Type selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lesson Type</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('online')}
                className={`py-2 rounded-xl font-bold border ${
                  type === 'online' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setType('offline')}
                className={`py-2 rounded-xl font-bold border ${
                  type === 'offline' ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Offline
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={hasConflict}
            className={`w-full font-bold text-xs py-3 rounded-lg shadow-md transition-all cursor-pointer ${
              hasConflict
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {hasConflict ? 'Konflikt beheben' : isWeeklyRecurring ? `${repeatWeeks} Wöchentliche Lektionen Speichern` : t('save_lesson_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};
