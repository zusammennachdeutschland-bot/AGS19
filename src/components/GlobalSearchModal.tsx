import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Users, BookOpen, Calendar, DollarSign, ArrowRight, User } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isGlobalSearchOpen, 
    setIsGlobalSearchOpen, 
    students, 
    groups, 
    lessons, 
    payments, 
    setActiveTab, 
    openLessonControl 
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedStudents = q ? students.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.parentName?.toLowerCase().includes(q) || 
    s.studentPhone?.includes(q) || 
    s.parentPhone?.includes(q)
  ).slice(0, 5) : [];

  const matchedGroups = q ? groups.filter(g => 
    g.name.toLowerCase().includes(q) || 
    g.grade?.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchedLessons = q ? lessons.filter(l => 
    l.title.toLowerCase().includes(q) || 
    l.groupName.toLowerCase().includes(q) || 
    l.date.includes(q)
  ).slice(0, 5) : [];

  const matchedPayments = q ? payments.filter(p => 
    p.studentName?.toLowerCase().includes(q) || 
    p.groupName?.toLowerCase().includes(q) || 
    p.notes?.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const totalResults = matchedStudents.length + matchedGroups.length + matchedLessons.length + matchedPayments.length;

  const handleClose = () => {
    setIsGlobalSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[max(4rem,calc(env(safe-area-inset-top,24px)+2rem))] px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-2 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen nach Schüler, Gruppe, Lektion oder Zahlung..."
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')} 
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleClose} 
            className="ml-3 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {!q ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto stroke-1 opacity-50" />
              <p className="text-sm">Geben Sie einen Namen, eine Gruppe, ein Datum oder ein Schlüsselwort ein.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-base font-medium">Keine Ergebnisse gefunden für "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Überprüfen Sie die Rechtschreibung oder versuchen Sie einen anderen Begriff.</p>
            </div>
          ) : (
            <>
              {/* Students Section */}
              {matchedStudents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    <User className="w-3.5 h-3.5" />
                    Schüler ({matchedStudents.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setActiveTab('students');
                          handleClose();
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {student.grade} • Eltern: {student.parentName || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups Section */}
              {matchedGroups.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    <Users className="w-3.5 h-3.5" />
                    Gruppen ({matchedGroups.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setActiveTab('students');
                          handleClose();
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-9 rounded-full" 
                            style={{ backgroundColor: group.color || '#3b82f6' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {group.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {group.grade} • {group.type === 'online' ? '🌐 Online' : '📍 Präsenz'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons Section */}
              {matchedLessons.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Lektionen ({matchedLessons.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedLessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          openLessonControl(lesson);
                          handleClose();
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {lesson.time}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {lesson.date} • {lesson.groupName} ({lesson.durationMinutes} Min.)
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {matchedPayments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Zahlungen ({matchedPayments.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedPayments.map(payment => (
                      <button
                        key={payment.id}
                        onClick={() => {
                          setActiveTab('payments');
                          handleClose();
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                            {payment.amountDue} €
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              {payment.studentName} ({payment.groupName})
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Bezahlt: {payment.amountPaid} € • Status: {payment.status === 'paid' ? 'Bezahlt' : 'Offen'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
