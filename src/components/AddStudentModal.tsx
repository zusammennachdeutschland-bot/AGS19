import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storageService';
import { PREDEFINED_GRADES } from '../data/initialData';
import { CARTOON_AVATARS } from '../data/avatarPresets';
import { GradeLevel } from '../types';
import { X, UserPlus, Users, Info, Camera, User, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddStudentModalProps {
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose }) => {
  const { groups, students, addStudent, t } = useApp();

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [grade, setGrade] = useState<GradeLevel>('Grade 7');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(CARTOON_AVATARS[0].url);
  const [genderFilter, setGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');

  const selectedGroup = groups.find(g => g.id === groupId);

  const filteredAvatars = CARTOON_AVATARS.filter(
    a => genderFilter === 'all' || a.gender === genderFilter
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max_size = 300;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            setAvatarUrl(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      avatarUrl: avatarUrl || CARTOON_AVATARS[0].url
    });

    storage.removeItem('dl_draft_add_student');
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
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Neuen Schüler anlegen (Add Student)</h2>
              <p className="text-xs text-primary-soft">Automatic Group Pricing Inheritance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar Selection Section */}
          <div className="space-y-2 bg-surface-hover/60 border border-surface-border/80 dark:border-surface-border-soft/80 p-3.5 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Cartoon Avatar wählen (Choose Avatar)</span>
              </label>

              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-700/70 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setGenderFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    genderFilter === 'all'
                      ? 'bg-surface dark:bg-slate-800 text-primary dark:text-primary shadow-xs'
                      : 'text-text-muted'
                  }`}
                >
                  Alle ({CARTOON_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('boy')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    genderFilter === 'boy'
                      ? 'bg-surface dark:bg-slate-800 text-primary dark:text-primary shadow-xs'
                      : 'text-text-muted'
                  }`}
                >
                  Jungs
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('girl')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    genderFilter === 'girl'
                      ? 'bg-surface dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-text-muted'
                  }`}
                >
                  Mädchen
                </button>
              </div>
            </div>

            {/* Avatar Grid Selection */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
              {filteredAvatars.map((av) => {
                const isSelected = avatarUrl === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 scale-105'
                        : 'border-surface-border dark:border-surface-border-soft hover:border-slate-400'
                    }`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Photo Upload Option */}
            <div className="pt-2 border-t border-surface-border/80 dark:border-surface-border-soft/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-muted font-medium">
                Oder eigenes Foto verwenden:
              </span>
              <label className="px-3 py-1.5 bg-surface dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-text-main border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                <Camera className="w-3.5 h-3.5 text-primary dark:text-primary" />
                <span>Foto hochladen</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Student Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Schüler Name (Student Name) *
            </label>
            <input
              type="text"
              required
              placeholder="z. B. Ahmed Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Gruppe / Kurs zuweisen (Assigned Group) *
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
                  {g.name} ({g.grade} • {g.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Info Inherited Notice */}
          {selectedGroup && (
            <div className="bg-primary-soft dark:bg-primary-soft/40 border border-primary-border/80 dark:border-primary-border/60 rounded-xl p-3 flex items-start gap-2 text-xs text-primary-hover dark:text-primary/70 active:scale-95 transition-all hover:bg-primary/20">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Automatischer Preisschlüssel (Inherited Pricing):</p>
                <p className="text-[11px] text-primary dark:text-primary mt-0.5">
                  Package: <span className="font-mono font-bold">{selectedGroup.monthlyPackagePrice} EGP</span> / {selectedGroup.sessionCount} Sitzungen.
                  Preis wird automatisch von {selectedGroup.name} übernommen.
                </p>
              </div>
            </div>
          )}

          {/* Predefined Grade Level */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main">
              Klassenstufe (Predefined Grade Level)
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
              Name des Erziehungsberechtigten (Parent Name)
            </label>
            <input
              type="text"
              placeholder="z. B. Ali Mahmoud"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main">
                Telefon Eltern (Parent Phone)
              </label>
              <input
                type="tel"
                placeholder="+20 100 123 4567"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main">
                Telefon Schüler (Student Phone)
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
              Lernnotizen (Student Notes)
            </label>
            <textarea
              rows={2}
              placeholder="Besondere Schwerpunkte, Schwächen oder Vorkenntnisse..."
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
            Schüler Speichern (Save Student)
          </button>
        </form>
      </div>
    </div>
  );
};
