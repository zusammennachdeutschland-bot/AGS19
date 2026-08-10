import React, { useState } from 'react';
import { Lesson, Student, TeacherProfile } from '../types';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, MessageSquare, Phone, Send, Share2, Sparkles } from 'lucide-react';
import { ArabicParentReportModal } from './ArabicParentReportModal';
import confetti from 'canvas-confetti';

interface ParentSummaryModalProps {
  lesson: Lesson;
  student?: Student;
  profile: TeacherProfile;
  onClose: () => void;
}

export const ParentSummaryModal: React.FC<ParentSummaryModalProps> = ({
  lesson,
  student,
  profile,
  onClose
}) => {
  const { students } = useApp();
  const [copied, setCopied] = useState(false);
  const [showArabicModal, setShowArabicModal] = useState(false);

  const activeStudent = student || 
    students.find(s => (lesson.studentId && s.id === lesson.studentId) || (lesson.studentName && s.name.trim().toLowerCase() === lesson.studentName.trim().toLowerCase())) || 
    (lesson.groupId ? students.find(s => s.groupId === lesson.groupId) : undefined);

  const report = lesson.report;
  const parentName = activeStudent?.parentName || lesson.quickParentName || (lesson.studentName ? `${lesson.studentName}'s Eltern` : 'Sehr geehrte Eltern');
  const parentPhone = activeStudent?.parentPhone || lesson.quickParentPhone || activeStudent?.studentPhone || lesson.quickStudentPhone || '';
  const studentPhone = activeStudent?.studentPhone || lesson.quickStudentPhone || parentPhone;

  // Generate German educational lesson summary message
  const generateSummaryText = () => {
    const attendance = report?.attendanceStatus === 'present' ? 'Anwesend (Present) ✅' : report?.attendanceStatus === 'late' ? 'Verspätet (Late) ⚠️' : 'Abwesend (Absent) ❌';
    const homework = report?.homeworkStatus === 'completed' ? 'Vollständig erledigt (Completed) ✅' : report?.homeworkStatus === 'assigned' ? 'Neu aufgegeben (Assigned) 📝' : 'Nicht erledigt ❌';
    
    return `Guten Tag ${parentName}! 🇩🇪

Hier ist der Unterrichtsbericht für ${lesson.studentName || lesson.title} vom ${lesson.date}:

📚 Kurs: ${lesson.title} (${lesson.grade})
⏱️ Sitzung: Session ${lesson.sessionNumber} von ${lesson.totalSessionsInPackage}
✅ Anwesenheit: ${attendance}
📖 Hausaufgabe: ${homework} ${report?.homeworkTitle ? `("${report.homeworkTitle}")` : ''}
📊 Bewertung:
  • Quiz: ${report?.quizScore ?? 'N/A'}/100
  • Mitarbeit: ${report?.participationScore ?? 'N/A'}/100
💳 Zahlungsstatus: ${report?.paymentStatus === 'paid' ? 'Bezahlt (Paid) ✅' : 'Ausstehend (Pending) ⚠️'}

📝 Anmerkung der Lehrkraft:
"${report?.teacherNotes || 'Sehr gute Leistung und aktive Teilnahme im Unterricht.'}"

Mit freundlichen Grüßen,
${profile.displayName}
AGS19 🇩🇪`;
  };

  const summaryText = generateSummaryText();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    const encodedText = encodeURIComponent(summaryText);
    const cleanPhone = parentPhone.replace(/[^0-9+]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
    confetti({ particleCount: 50, spread: 40 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Parent Summary & Communication</h2>
              <p className="text-xs text-blue-100">{lesson.title} • {lesson.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Formatted Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Automatisch generierter Bericht (German Summary)
              </label>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopiert!' : 'Text kopieren'}
              </button>
            </div>

            <textarea
              readOnly
              rows={11}
              value={summaryText}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Direct Communication Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Direkte Eltern-Kommunikation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleWhatsAppSend}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <a
                href={`tel:${parentPhone}`}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call Parent</span>
              </a>

              <a
                href={`tel:${studentPhone}`}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call Student</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            Schließen (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
