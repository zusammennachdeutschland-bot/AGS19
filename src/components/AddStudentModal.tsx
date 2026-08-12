import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storageService';
import { PREDEFINED_GRADES } from '../data/initialData';
import { GradeLevel } from '../types';
import { X, UserPlus, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddStudentModalProps {
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose }) => {
  const { groups, students, addStudent, t, language } = useApp();

  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [grade, setGrade] = useState<GradeLevel>('Grade 7');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

  const selectedGroup = groups.find(g => g.id === groupId);

  // Load draft on mount
  useEffect(() => {
    async function loadDraft() {
      const draft = await storage.getItem<any>('dl_draft_add_student');
      if (draft) {
        if (draft.name) setName(draft.name);
        if (draft.groupId) setGroupId(draft.groupId);
        if (draft.grade) setGrade(draft.grade);
        if (draft.parentName) setParentName(draft.parentName);
        if (draft.parentPhone) setParentPhone(draft.parentPhone);
        if (draft.studentPhone) setStudentPhone(draft.studentPhone);
        if (draft.notes) setNotes(draft.notes);
      }
    }
    loadDraft();
  }, []);

  // Save draft on state changes
  useEffect(() => {
    if (name || parentName || parentPhone || studentPhone || notes) {
      storage.setItem('dl_draft_add_student', {
        name, groupId, grade, parentName, parentPhone, studentPhone, notes
      });
    }
  }, [name, groupId, grade, parentName, parentPhone, studentPhone, notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !groupId) return;
    if (!parentPhone.trim()) {
      alert(_t('رقم هاتف ولي الأمر مطلوب إجبارياً', 'Parent phone number is required', 'Telefonnummer der Eltern ist erforderlich'));
      return;
    }
    const isDuplicate = students.some(s => s.name.toLowerCase() === name.toLowerCase() && s.groupId === groupId);
    if (isDuplicate) {
      if (!window.confirm(t('duplicate_student_warning') || 'طالب بنفس الاسم موجود بالفعل. هل تريد المتابعة؟ / A student with the same name already exists in this group. Do you want to continue?')) return;
    }

    addStudent({
      name,
      groupId,
      grade: selectedGroup?.grade || grade,
      parentName,
      parentPhone,
      studentPhone,
      notes,
      avatarUrl: ''
    });

    storage.removeItem('dl_draft_add_student');
    confetti({ particleCount: 60, spread: 50 });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center pt-[max(24px,env(safe-area-inset-top,24px))] p-0 sm:p-4 pb-0"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md shadow-2xl overflow-hidden animate-scale-up"
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-surface/20 rounded-xl">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{_t('إضافة طالب جديد', 'Add New Student', 'Neuen Schüler anlegen')}</h2>
              <p className="text-xs text-primary-soft">{_t('توريث تسعير المجموعة تلقائياً', 'Automatic Group Pricing Inheritance', 'Automatische Gruppenpreisvererbung')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Student Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              {_t('اسم الطالب *', 'Student Name *', 'Schüler Name *')}
            </label>
            <input
              type="text"
              required
              placeholder={_t('مثال: أحمد علي', 'e.g. Ahmed Ali', 'z. B. Ahmed Ali')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              {_t('تعيين المجموعة / الدورة *', 'Assigned Group *', 'Gruppe / Kurs zuweisen *')}
            </label>
            <select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                const g = groups.find(item => item.id === e.target.value);
                if (g) setGrade(g.grade);
              }}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.grade} • {(g.type || '').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Info Inherited Notice */}
          {selectedGroup && (
            <div className="bg-primary-soft dark:bg-primary-soft/40 border border-primary-border/80 dark:border-primary-border/60 rounded-xl p-3 flex items-start gap-2 text-xs text-primary-hover dark:text-primary/70 transition-all">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{_t('الأسعار الموروثة تلقائياً:', 'Inherited Pricing:', 'Automatischer Preisschlüssel:')}</p>
                <p className="text-[11px] text-primary dark:text-primary mt-0.5">
                  {_t('الباقة: ', 'Package: ', 'Package: ')}
                  <span className="font-mono font-bold">{selectedGroup.monthlyPackagePrice} EGP</span> / {selectedGroup.sessionCount} {_t('حصص', 'sessions', 'Sitzungen')}.
                  {_t(` يتم التوريث تلقائياً من ${selectedGroup.name}.`, ` Inherited automatically from ${selectedGroup.name}.`, ` Preis wird automatisch von ${selectedGroup.name} übernommen.`)}
                </p>
              </div>
            </div>
          )}

          {/* Predefined Grade Level */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              {_t('المرحلة الدراسية', 'Grade Level', 'Klassenstufe')}
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PREDEFINED_GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Parent Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              {_t('اسم ولي الأمر', 'Parent Name', 'Name des Erziehungsberechtigten')}
            </label>
            <input
              type="text"
              placeholder={_t('مثال: علي محمود', 'e.g. Ali Mahmoud', 'z. B. Ali Mahmoud')}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main">
                {_t('هاتف ولي الأمر *', 'Parent Phone *', 'Telefon Eltern *')}
              </label>
              <input
                type="tel"
                required
                placeholder="+20 100 123 4567"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main">
                {_t('هاتف الطالب (اختياري)', 'Student Phone (Optional)', 'Telefon Schüler (Optional)')}
              </label>
              <input
                type="tel"
                placeholder="+20 101 123 4567"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              {_t('ملاحظات الطالب', 'Student Notes', 'Lernnotizen')}
            </label>
            <textarea
              rows={2}
              placeholder={_t('ملاحظات إضافية حول الطالب...', 'Special focus, notes, or weaknesses...', 'Besondere Schwerpunkte, Schwächen oder Vorkenntnisse...')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-primary/30"
          >
            {_t('حفظ الطالب', 'Save Student', 'Schüler Speichern')}
          </button>
        </form>
      </div>
    </div>
  );
};
