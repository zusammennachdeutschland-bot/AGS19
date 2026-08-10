import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, GradeLevel } from '../types';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-scale-up">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white relative">
          {/* Symmetrical Header Row */}
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Schüler-Profil / Student Profile
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
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
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                />
                <label 
                  className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                  title="Foto ändern / hochladen"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-indigo-500/25 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/20">
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
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-lg transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-white/5"
                title="Daten bearbeiten"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Bearbeiten</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 rounded-lg transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-rose-500/10"
                title="Löschen / Archivieren"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={student.parentPhone ? `tel:${student.parentPhone}` : '#'}
              className={`font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                student.parentPhone 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
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
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Übersicht
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Anwesenheit ({presentCount + lateCount + absentCount})
          </button>

          <button
            onClick={() => setActiveTab('scores')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'scores' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Noten & Aufgaben
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Zahlungen
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'files' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Dateien ({student.documents.length})
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'edit' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60'
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
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/40">
                  <span className="block text-[10px] text-slate-500 uppercase">Sitzungen</span>
                  <span className="text-xl text-blue-600 font-mono">{studentLessons.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                  <span className="block text-[10px] text-slate-500 uppercase">Anwesend</span>
                  <span className="text-xl text-emerald-600 font-mono">{presentCount}</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/40">
                  <span className="block text-[10px] text-slate-500 uppercase">Paketzyklus</span>
                  <span className="text-xl text-amber-600 font-mono">{student.currentPackageLessonIndex || 1} / {student.packageLessonsCount || 8}</span>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Allgemeine Informationen</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div><span className="font-semibold text-slate-400">Gruppe:</span> {assignedGroup?.name || 'Keine'}</div>
                  <div><span className="font-semibold text-slate-400">Klasse:</span> {student.grade}</div>
                  <div><span className="font-semibold text-slate-400">Elternteil:</span> {student.parentName}</div>
                  <div><span className="font-semibold text-slate-400">Telefon Eltern:</span> {student.parentPhone}</div>
                  <div><span className="font-semibold text-slate-400">Telefon Schüler:</span> {student.studentPhone || 'N/A'}</div>
                  <div><span className="font-semibold text-slate-400">Beigetreten:</span> {student.joinedDate || 'Standard'}</div>
                </div>
                {student.notes && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-400">Notizen:</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-200 italic">{student.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                  <span className="block text-[10px] text-slate-500">✓ Anwesend</span>
                  <span className="text-lg text-emerald-600 font-mono">{presentCount}</span>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
                  <span className="block text-[10px] text-slate-500">⚠️ Verspätet</span>
                  <span className="text-lg text-amber-600 font-mono">{lateCount}</span>
                </div>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200">
                  <span className="block text-[10px] text-slate-500">✕ Abwesend</span>
                  <span className="text-lg text-rose-600 font-mono">{absentCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Anwesenheitsprotokoll</h4>
                {studentLessons.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Noch keine Sitzungen vorhanden.</p>
                ) : (
                  studentLessons.map((l) => {
                    const status = l.report?.studentAttendance?.[student.id] || l.report?.attendanceStatus || 'present';
                    return (
                      <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{l.title}</p>
                          <p className="text-[11px] text-slate-500">{l.date} • {l.time} Uhr</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          status === 'present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          status === 'late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
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
                <p className="text-xs text-slate-400 italic">Keine Prüfungsergebnisse oder Hausaufgaben verzeichnet.</p>
              ) : (
                studentLessons.filter(l => l.report?.homeworkTitle || l.report?.scores).map((l) => (
                  <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{l.title} ({l.date})</span>
                      {l.report?.homeworkStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          l.report?.homeworkStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
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
                <p className="text-xs text-slate-400 italic">Keine Zahlungsunterlagen vorhanden.</p>
              ) : (
                studentPayments.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{p.groupName}</p>
                      <p className="text-[10px] text-slate-500">Fällig am: {p.dueDate}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs ${p.status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
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
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold"
                >
                  <option value="homework">Homework File</option>
                  <option value="exam">Exam File</option>
                  <option value="doc">Student Doc</option>
                </select>
              </div>

              {/* Upload Input */}
              <label className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klicken zum Hochladen (Upload PDF / Document)
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">PDF, Word, PNG oder Exam Dokumente</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Uploaded Files List */}
              <div className="space-y-2">
                {student.documents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3 italic">
                    Keine Dokumente hochgeladen.
                  </p>
                ) : (
                  student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-500">
                            {doc.fileSize} • Hochgeladen am {doc.uploadedAt} • <span className="uppercase font-bold text-indigo-600">{doc.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-blue-600"
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
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Schülerdaten Bearbeiten (Edit Student Data)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">ID: {student.id}</span>
              </div>

              {/* Avatar Selection Section */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3 rounded-lg">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
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
                            ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Schüler Name (Student Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Group & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Zugewiesene Gruppe (Group)
                  </label>
                  <select
                    value={editGroupId}
                    onChange={(e) => setEditGroupId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Klassenstufe / Niveau (Grade)
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Eltern Name (Parent Name)
                  </label>
                  <input
                    type="text"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    placeholder="Herr / Frau Ali"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Eltern Telefon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Student Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Schüler Telefon (Student Direct Phone)
                  </label>
                  <input
                    type="tel"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    placeholder="+20 11..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status (Student Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'archived')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">🟢 Aktiv (Active Student)</option>
                    <option value="archived">⚪ Pausiert / Archiviert (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notizen (Teacher Notes)
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notizen zum Schüler, Lernstand..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {saveSuccessToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <Check className="w-4 h-4" />
                  <span>✓ Schülerdaten erfolgreich aktualisiert!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-black text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
