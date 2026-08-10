import React, { useState } from 'react';
import { checkOverlap } from '../utils/lessonUtils';
import { useApp } from '../context/AppContext';
import { PREDEFINED_GRADES } from '../data/initialData';
import { GradeLevel, LessonType, PaymentStatus } from '../types';
import { X, Calendar, Clock, Zap, Video, MapPin, DollarSign, User, Phone, FileText } from 'lucide-react';

interface AddQuickLessonModalProps {
  onClose: () => void;
}

export const AddQuickLessonModal: React.FC<AddQuickLessonModalProps> = ({ onClose }) => {
  const { addQuickLesson, profile, lessons, t } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [studentName, setStudentName] = useState('');
  const [quickStudentPhone, setQuickStudentPhone] = useState('');
  const [quickParentPhone, setQuickParentPhone] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('16:00');
  const [type, setType] = useState<LessonType>('online');
  const [amountDue, setAmountDue] = useState(250);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [quickNotes, setQuickNotes] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 9');
  const [locationAddress, setLocationAddress] = useState('Kairo Schulungsraum');
  const [meetingLink, setMeetingLink] = useState(profile.defaultZoomLink || 'https://zoom.us/j/123456789');

  
  const checkConflict = (checkTime: string) => {
    const dummyLesson = { id: 'dummy', date, time: checkTime, durationMinutes: 60 };
    return lessons.some(l => checkOverlap(dummyLesson, l));
  };
  const hasConflict = checkConflict(time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    addQuickLesson({
      studentName: studentName.trim(),
      quickStudentPhone: quickStudentPhone.trim(),
      quickParentPhone: quickParentPhone.trim(),
      date,
      time,
      type,
      grade,
      amountDue: Number(amountDue),
      amountPaid: Number(amountPaid),
      paymentStatus,
      durationMinutes: 60,
      status: 'scheduled',
      title: `⚡ Quick Lesson: ${studentName.trim()}`,
      quickNotes: quickNotes.trim(),
      locationAddress: type === 'offline' ? locationAddress : undefined,
      meetingLink: type === 'online' ? meetingLink : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 pt-[max(24px,env(safe-area-inset-top,24px))] overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-scale-up">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between text-slate-800 dark:text-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{t('quick_lesson_modal_title')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('quick_lesson_modal_desc')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Required: Student Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('students_student_name')} *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Karim Ahmed"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Optional Phones */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {t('students_student_phone')}
              </label>
              <input
                type="tel"
                placeholder="+20 100 123 4567"
                value={quickStudentPhone}
                onChange={(e) => setQuickStudentPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {t('students_parent_phone')}
              </label>
              <input
                type="tel"
                placeholder="+20 101 987 6543"
                value={quickParentPhone}
                onChange={(e) => setQuickParentPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('date')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {t('time')} *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Type Switcher */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('next_action_online')} / {t('next_action_offline')} *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('online')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  type === 'online'
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> {t('next_action_online')}
              </button>

              <button
                type="button"
                onClick={() => setType('offline')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  type === 'offline'
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> {t('next_action_offline')}
              </button>
            </div>
          </div>

          {/* Fee & Payment Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> ({profile.currency}) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={amountDue}
                onChange={(e) => setAmountDue(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('status')}</label>
              <select
                value={paymentStatus}
                onChange={(e) => {
                  const val = e.target.value as PaymentStatus;
                  setPaymentStatus(val);
                  if (val === 'paid') setAmountPaid(amountDue);
                  else if (val === 'pending') setAmountPaid(0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="pending">{t('status_pending')}</option>
                <option value="paid">{t('payments_paid')}</option>
                <option value="partial">{t('payments_partial')}</option>
              </select>
            </div>
          </div>

          {/* Grade Level (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('students_grade')}</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors cursor-pointer"
            >
              {PREDEFINED_GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> {t('notes')}
            </label>
            <textarea
              rows={2}
              placeholder=""
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={hasConflict}
            className={`w-full text-white font-black text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 border ${
              hasConflict 
                ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed opacity-70' 
                : 'bg-amber-500 border-amber-500 hover:bg-amber-600 text-white shadow-sm'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{t('save')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
