import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, GradeLevel } from '../types';
import { getStudentCyclePricing } from '../utils/paymentUtils';
import { CARTOON_AVATARS } from '../data/avatarPresets';
import { 
  X, Phone, Send, FileText, Upload, Trash2, Calendar, Award, DollarSign, 
  BookOpen, CheckCircle2, AlertCircle, Download, FileCheck, User, Camera, Edit3, Save, Check, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
  initialTab?: 'overview' | 'attendance' | 'scores' | 'payments' | 'files' | 'edit';
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose, initialTab = 'overview' }) => {
  const { groups, lessons, payments, profile, uploadStudentDocument, deleteStudentDocument, updateStudent, deleteStudent } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'scores' | 'payments' | 'files' | 'edit'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'homework' | 'exam' | 'doc'>('homework');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Editable Student Fields
  const [editName, setEditName] = useState(student.name);
  const [editGroupId, setEditGroupId] = useState(student.groupId);
  const [editGrade, setEditGrade] = useState<GradeLevel>(student.grade);
  const [editParentName, setEditParentName] = useState(student.parentName);
  const [editParentPhone, setEditParentPhone] = useState(student.parentPhone);
  const [editStudentPhone, setEditStudentPhone] = useState(student.studentPhone);
  const [editNotes, setEditNotes] = useState(student.notes || '');
  const [editStatus, setEditStatus] = useState<'active' | 'archived'>(student.status || 'active');
  const [editAvatarUrl, setEditAvatarUrl] = useState(student.avatarUrl || CARTOON_AVATARS[0].url);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const assignedGroup = groups.find(g => g.id === (activeTab === 'edit' ? editGroupId : student.groupId));
  const studentLessons = lessons.filter(l => l.studentId === student.id || l.studentName === student.name);
  const studentPayments = payments.filter(p => p.studentId === student.id || p.studentName === student.name);

  // Dynamic cycle pricing & package progress calculation
  const { cycleLength, amountDue, pricePerSession } = getStudentCyclePricing(student, assignedGroup);

  const paidLessonIds = new Set<string>();
  payments.forEach(p => {
    if (p.status === 'paid' && p.lessonIds) {
      p.lessonIds.forEach(id => paidLessonIds.add(id));
    }
  });

  const unbilledCompletedCount = lessons.filter(l => {
    if (l.status !== 'completed') return false;
    const matchesGroup = assignedGroup ? l.groupId === assignedGroup.id : false;
    const matchesStudent = l.studentId === student.id || l.studentName === student.name;
    if (!matchesGroup && !matchesStudent) return false;
    const att = l.report?.studentAttendance?.[student.id] || l.report?.attendanceStatus || 'present';
    if (att === 'absent') return false;
    return !paidLessonIds.has(l.id);
  }).length;

  const currentCycleProgress = unbilledCompletedCount === 0 ? 0 : (unbilledCompletedCount % cycleLength || cycleLength);

  // Attendance stats
  const presentCount = studentLessons.filter(l => l.report?.attendanceStatus === 'present' || l.report?.studentAttendance?.[student.id] === 'present').length;
  const lateCount = studentLessons.filter(l => l.report?.attendanceStatus === 'late' || l.report?.studentAttendance?.[student.id] === 'late').length;
  const absentCount = studentLessons.filter(l => l.report?.attendanceStatus === 'absent' || l.report?.studentAttendance?.[student.id] === 'absent').length;

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(student.id, {
      name: editName,
      groupId: editGroupId,
      grade: editGrade,
      parentName: editParentName,
      parentPhone: editParentPhone,
      studentPhone: editStudentPhone,
      notes: editNotes,
      status: editStatus,
      avatarUrl: editAvatarUrl
    });

    setSaveSuccessToast(true);
    confetti({ particleCount: 50, spread: 40 });
    setTimeout(() => {
      setSaveSuccessToast(false);
      setActiveTab('overview');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadStudentDocument(student.id, e.target.files[0], selectedCategory);
      confetti({ particleCount: 40, spread: 40 });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            updateStudent(student.id, { avatarUrl: dataUrl });
            setEditAvatarUrl(dataUrl);
            confetti({ particleCount: 30, spread: 30 });
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const cleanParentPhone = student.parentPhone.replace(/[^0-9+]/g, '');

  const parentDisplay = [student.parentName, student.parentPhone].filter(Boolean).join(' • ');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm: pt-[max(24px,env(safe-area-inset-top,24px))] overflow-y-auto p-0 sm:p-4 pb-0">
      <div className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 p-5 text-white relative">
          {/* Symmetrical Header Row */}
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-text-muted/70 uppercase">
              Schüler-Profil / Student Profile
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Info Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0 group">
                <img
                  src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={student.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary/30 shadow-md"
                />
                <label 
                  className="absolute -bottom-1 -right-1 p-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                  title="Foto ändern / hochladen"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-primary/25 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border/20">
                    {student.grade}
                  </span>
                  {assignedGroup?.name && (
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700/60">
                      {assignedGroup.name}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black tracking-tight leading-tight">{student.name}</h2>
                <p className="text-[11px] text-slate-300 font-medium">
                  {parentDisplay ? `Eltern: ${parentDisplay}` : 'Keine Elterndaten hinterlegt'}
                </p>
              </div>
            </div>

            {/* Top Quick Actions (Bearbeiten & Löschen) with no overlap risk */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="px-3 py-1.5 bg-surface/10 hover:bg-surface/15 text-slate-200 hover:text-white rounded-lg transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-white/5"
                title="Daten bearbeiten"
              >
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>Bearbeiten</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary rounded-lg transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-primary-border/10"
                title="Löschen / Archivieren"
              >
                <Trash2 className="w-3.5 h-3.5 text-primary" />
                <span>Löschen</span>
              </button>
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/5">
            <a
              href={`https://wa.me/${cleanParentPhone}`}
              target="_blank"
              rel="noreferrer"
              className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={student.parentPhone ? `tel:${student.parentPhone}` : '#'}
              className={`font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                student.parentPhone 
                  ? 'bg-primary hover:bg-primary-hover text-white cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Parent</span>
            </a>

            <a
              href={student.studentPhone ? `tel:${student.studentPhone}` : '#'}
              className={`font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                student.studentPhone 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Student</span>
            </a>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 border-b border-surface-border bg-surface-hover/50 p-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-primary text-white shadow-xs' : 'text-text-muted'
            }`}
          >
            Übersicht
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'attendance' ? 'bg-primary text-white shadow-xs' : 'text-text-muted'
            }`}
          >
            Anwesenheit ({presentCount + lateCount + absentCount})
          </button>

          <button
            onClick={() => setActiveTab('scores')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'scores' ? 'bg-primary text-white shadow-xs' : 'text-text-muted'
            }`}
          >
            Noten & Aufgaben
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-primary text-white shadow-xs' : 'text-text-muted'
            }`}
          >
            Zahlungen
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'files' ? 'bg-primary text-white shadow-xs' : 'text-text-muted'
            }`}
          >
            Dateien ({student.documents.length})
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'edit' ? 'bg-primary text-white shadow-xs font-bold' : 'text-primary dark:text-primary font-bold bg-primary-soft dark:bg-primary-soft'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bearbeiten</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-3 bg-primary-soft dark:bg-primary-soft/40 rounded-lg border border-primary-border dark:border-primary-border/40">
                  <span className="block text-[10px] text-slate-500 uppercase">Sitzungen</span>
                  <span className="text-xl text-primary font-mono">{studentLessons.length}</span>
                </div>
                <div className="p-3 bg-primary-soft dark:bg-primary-soft rounded-lg border border-primary-border dark:border-primary-border">
                  <span className="block text-[10px] text-slate-500 uppercase">Anwesend</span>
                  <span className="text-xl text-primary font-mono">{presentCount}</span>
                </div>
                <div className="p-3 bg-primary-soft dark:bg-primary-soft rounded-lg border border-primary-border dark:border-primary-border">
                  <span className="block text-[10px] text-slate-500 uppercase">Paketzyklus</span>
                  <span className="text-xl text-primary font-mono">{currentCycleProgress} / {cycleLength}</span>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-4 bg-surface-hover/60 rounded-lg border border-surface-border dark:border-surface-border-soft space-y-2 text-xs">
                <h4 className="font-bold text-text-main uppercase tracking-wider text-[11px]">Allgemeine Informationen</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div><span className="font-semibold text-text-muted/70">Gruppe:</span> {assignedGroup?.name || 'Keine'}</div>
                  <div><span className="font-semibold text-text-muted/70">Klasse:</span> {student.grade}</div>
                  <div><span className="font-semibold text-text-muted/70">Elternteil:</span> {student.parentName}</div>
                  <div><span className="font-semibold text-text-muted/70">Telefon Eltern:</span> {student.parentPhone}</div>
                  <div><span className="font-semibold text-text-muted/70">Telefon Schüler:</span> {student.studentPhone || 'N/A'}</div>
                  <div><span className="font-semibold text-text-muted/70">Beigetreten:</span> {student.joinedDate || 'Standard'}</div>
                </div>
                {student.notes && (
                  <div className="pt-2 border-t border-surface-border dark:border-surface-border-soft">
                    <span className="font-semibold text-text-muted/70">Notizen:</span>
                    <p className="mt-1 text-text-main italic">{student.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 bg-primary-soft dark:bg-primary-soft rounded-xl border border-primary-border">
                  <span className="block text-[10px] text-slate-500">✓ Anwesend</span>
                  <span className="text-lg text-primary font-mono">{presentCount}</span>
                </div>
                <div className="p-2.5 bg-primary-soft dark:bg-primary-soft rounded-xl border border-primary-border">
                  <span className="block text-[10px] text-slate-500">⚠️ Verspätet</span>
                  <span className="text-lg text-primary font-mono">{lateCount}</span>
                </div>
                <div className="p-2.5 bg-primary-soft dark:bg-primary-soft rounded-xl border border-primary-border">
                  <span className="block text-[10px] text-slate-500">✕ Abwesend</span>
                  <span className="text-lg text-primary font-mono">{absentCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Anwesenheitsprotokoll</h4>
                {studentLessons.length === 0 ? (
                  <p className="text-xs text-text-muted/70 italic">Noch keine Sitzungen vorhanden.</p>
                ) : (
                  studentLessons.map((l) => {
                    const status = l.report?.studentAttendance?.[student.id] || l.report?.attendanceStatus || 'present';
                    return (
                      <div key={l.id} className="p-3 bg-surface-hover/80 rounded-lg border border-surface-border/80 dark:border-surface-border-soft flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-text-main">{l.title}</p>
                          <p className="text-[11px] text-slate-500">{l.date} • {l.time} Uhr</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          status === 'present' ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary' :
                          status === 'late' ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary' :
                          'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary'
                        }`}>
                          {status === 'present' ? 'Anwesend' : status === 'late' ? 'Verspätet' : 'Abwesend'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SCORES & HOMEWORK TAB */}
          {activeTab === 'scores' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Hausaufgaben & Prüfungsergebnisse</h3>
              {studentLessons.filter(l => l.report?.homeworkTitle || l.report?.scores).length === 0 ? (
                <p className="text-xs text-text-muted/70 italic">Keine Prüfungsergebnisse oder Hausaufgaben verzeichnet.</p>
              ) : (
                studentLessons.filter(l => l.report?.homeworkTitle || l.report?.scores).map((l) => (
                  <div key={l.id} className="p-3 bg-surface-hover/80 rounded-lg border border-surface-border/80 dark:border-surface-border-soft text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-text-main">{l.title} ({l.date})</span>
                      {l.report?.homeworkStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          l.report?.homeworkStatus === 'completed' ? 'bg-primary-soft text-primary' : 'bg-primary-soft text-primary-hover'
                        }`}>
                          {l.report?.homeworkStatus === 'completed' ? 'Hausaufgabe erledigt' : 'Aufgegeben'}
                        </span>
                      )}
                    </div>
                    {l.report?.homeworkTitle && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Aufgabe:</span> {l.report.homeworkTitle}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Zahlungshistorie (Payment History)</h3>
              {studentPayments.length === 0 ? (
                <p className="text-xs text-text-muted/70 italic">Keine Zahlungsunterlagen vorhanden.</p>
              ) : (
                studentPayments.map((p) => (
                  <div key={p.id} className="p-3 bg-surface-hover/80 rounded-lg border border-surface-border/80 dark:border-surface-border-soft flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-main">{p.groupName}</p>
                      <p className="text-[10px] text-slate-500">Fällig am: {p.dueDate}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs ${p.status === 'paid' ? 'text-primary' : 'text-red-600'}`}>
                      {p.amountDue} {profile.currency} ({p.status.toUpperCase()})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FILES & DOCUMENTS TAB */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Dokumente & Hausaufgaben-Upload</h3>
                
                {/* Category selector */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'homework' | 'exam' | 'doc')}
                  className="px-2 py-1 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-lg text-[11px] font-bold"
                >
                  <option value="homework">Homework File</option>
                  <option value="exam">Exam File</option>
                  <option value="doc">Student Doc</option>
                </select>
              </div>

              {/* Upload Input */}
              <label className="border-2 border-dashed border-primary-border dark:border-primary-border hover:border-primary-border bg-primary-soft dark:bg-primary-soft rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-primary dark:text-primary mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klicken zum Hochladen (Upload PDF / Document)
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">PDF, Word, PNG oder Exam Dokumente</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Uploaded Files List */}
              <div className="space-y-2">
                {student.documents.length === 0 ? (
                  <p className="text-xs text-text-muted/70 text-center py-3 italic">
                    Keine Dokumente hochgeladen.
                  </p>
                ) : (
                  student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-surface-hover/80 rounded-lg border border-surface-border/80 dark:border-surface-border-soft flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary-soft dark:bg-primary-soft text-primary dark:text-primary rounded-xl">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-text-main line-clamp-1">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-500">
                            {doc.fileSize} • Hochgeladen am {doc.uploadedAt} • <span className="uppercase font-bold text-primary">{doc.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-primary"
                          title="Herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteStudentDocument(student.id, doc.id)}
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EDIT STUDENT DATA TAB */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <h3 className="text-xs font-bold uppercase text-primary dark:text-primary flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Schülerdaten Bearbeiten (Edit Student Data)</span>
                </h3>
                <span className="text-[10px] text-text-muted/70 font-mono">ID: {student.id}</span>
              </div>

              {/* Avatar Selection Section */}
              <div className="space-y-2 bg-surface-hover/60 border border-surface-border/80 dark:border-surface-border-soft/80 p-3 rounded-lg">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Cartoon Avatar wählen (Choose Avatar)</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto pr-1">
                  {CARTOON_AVATARS.map((av) => {
                    const isSelected = editAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatarUrl(av.url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 ${
                          isSelected
                            ? 'border-primary-border ring-2 ring-primary/30 scale-105'
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
              </div>

              {/* Student Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Schüler Name (Student Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Group & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Zugewiesene Gruppe (Group)
                  </label>
                  <select
                    value={editGroupId}
                    onChange={(e) => setEditGroupId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Klassenstufe / Niveau (Grade)
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parent Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Eltern Name (Parent Name)
                  </label>
                  <input
                    type="text"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    placeholder="Herr / Frau Ali"
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Eltern Telefon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Student Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Schüler Telefon (Student Direct Phone)
                  </label>
                  <input
                    type="tel"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    placeholder="+20 11..."
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">
                    Status (Student Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'archived')}
                    className="w-full px-3 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">🟢 Aktiv (Active Student)</option>
                    <option value="archived">⚪ Pausiert / Archiviert (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">
                  Notizen (Teacher Notes)
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notizen zum Schüler, Lernstand..."
                  className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {saveSuccessToast && (
                <div className="bg-primary text-white text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <Check className="w-4 h-4" />
                  <span>✓ Schülerdaten erfolgreich aktualisiert!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-black text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Änderungen Speichern (Save Changes)</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isConfirmingDelete}
        itemType="student"
        itemName={student.name}
        recordsSummary={{
          lessonsCount: studentLessons.length,
          paymentsCount: studentPayments.length,
          attendanceCount: studentLessons.filter(l => l.report?.attendanceStatus).length,
        }}
        onConfirmDelete={() => {
          deleteStudent(student.id);
          setIsConfirmingDelete(false);
          onClose();
        }}
        onConfirmArchive={() => {
          deleteStudent(student.id);
          setIsConfirmingDelete(false);
          onClose();
        }}
        onClose={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};
