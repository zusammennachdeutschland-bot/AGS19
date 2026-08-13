import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PendingFollowUp } from '../utils/homeworkFollowUpUtils';
import { X, Check, Send, BookOpen, User } from 'lucide-react';
import { buildWhatsAppUrl, formatWhatsAppPhone } from '../utils/phoneUtils';
import confetti from 'canvas-confetti';

interface HomeworkFollowUpModalProps {
  pendingFollowUps: PendingFollowUp[];
  initialGroupId?: string;
  onClose: () => void;
}

export const HomeworkFollowUpModal: React.FC<HomeworkFollowUpModalProps> = ({ pendingFollowUps, initialGroupId, onClose }) => {
  const { students, updateLesson } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<PendingFollowUp | null>(
    initialGroupId ? pendingFollowUps.find(p => p.groupId === initialGroupId) || null : null
  );

  const handleMarkDone = (lessonId: string) => {
    updateLesson(lessonId, { homeworkFollowUpSentAt: new Date().toISOString() });
    setSelectedGroup(null);
    if (pendingFollowUps.length === 1) {
      onClose();
    }
  };

  const handleSendWhatsApp = (parentPhone: string, message: string, lessonId: string) => {
    const formattedPhone = formatWhatsAppPhone(parentPhone);
    const url = buildWhatsAppUrl(formattedPhone, message);
    window.open(url, '_blank');
    
    // Mark as done after opening WhatsApp
    handleMarkDone(lessonId);
    
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  if (selectedGroup) {
    const homeworkText = selectedGroup.latestCompletedLesson.report?.homework || 'لا يوجد تفاصيل للواجب في التقرير';
    const groupStudents = students.filter(s => s.groupId === selectedGroup.groupId);
    
    // Group students by parent phone
    const byPhone: Record<string, string[]> = {};
    groupStudents.forEach(s => {
      const phone = s.parentPhone?.trim();
      if (phone) {
        if (!byPhone[phone]) byPhone[phone] = [];
        byPhone[phone].push(s.name);
      }
    });

    const messages = Object.entries(byPhone).map(([phone, names]) => {
      const isMultiple = names.length > 1;
      let message = `السلام عليكم،\n\n`;
      if (isMultiple) {
        message += `برجاء التأكد من أن:\n`;
        names.forEach(name => {
          message += `• ${name}\n`;
        });
        message += `قاموا بحل الواجب التالي:\n\n${homeworkText}\n\nشكراً لحضراتكم.`;
      } else {
        message += `برجاء التأكد من أن ${names[0]} قام بحل الواجب التالي:\n\n${homeworkText}\n\nشكراً لحضراتكم.`;
      }
      return { phone, message, names };
    });

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 font-sans">
        <div className="bg-surface w-full max-w-lg rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
          
          <div className="p-5 flex items-center justify-between border-b border-surface-border sticky top-0 bg-surface z-10">
            <div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center hover:underline"
              >
                ← عودة للقائمة
              </button>
              <h2 className="text-xl font-black text-text-main flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                {selectedGroup.groupName}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
              <h3 className="text-xs font-black text-amber-800 dark:text-amber-400 mb-2 uppercase tracking-wide">
                الواجب المسجل (Homework)
              </h3>
              <p className="text-sm font-semibold text-text-main whitespace-pre-wrap">
                {homeworkText}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-main">رسائل أولياء الأمور</h3>
              
              {messages.length === 0 ? (
                <p className="text-sm text-text-muted">لا يوجد أرقام هواتف لأولياء أمور في هذا الجروب.</p>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className="border border-surface-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      <User className="w-4 h-4" />
                      {m.names.join(' و ')}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-text-main whitespace-pre-wrap border border-slate-200 dark:border-slate-800 font-medium">
                      {m.message}
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(m.phone, m.message, selectedGroup.latestCompletedLesson.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Follow-Up
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-surface-border">
            <button
              onClick={() => handleMarkDone(selectedGroup.latestCompletedLesson.id)}
              className="w-full bg-surface hover:bg-surface-hover border border-surface-border text-text-main font-bold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Mark Follow-Up Done (Manual)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 font-sans">
      <div className="bg-surface w-full max-w-lg rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[80vh]">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        
        <div className="p-5 flex items-center justify-between border-b border-surface-border sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-black text-text-main flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Homework Follow-Up
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 overflow-y-auto">
          {pendingFollowUps.map(p => (
            <div 
              key={p.groupId}
              onClick={() => setSelectedGroup(p)}
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-surface-border last:border-0 transition-colors"
            >
              <span className="font-bold text-base text-text-main">{p.groupName}</span>
              <span className="text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-md">
                {p.isToday ? 'Today' : p.isTomorrow ? 'Tomorrow' : p.nextLessonDateStr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
