import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, RefreshCw, X, AlertTriangle, Users, BookOpen, Calendar, User } from 'lucide-react';

export const RecentlyDeletedModal: React.FC = () => {
  const { 
    isRecentlyDeletedModalOpen, 
    setIsRecentlyDeletedModalOpen, 
    recentlyDeleted, 
    restoreItem, 
    permanentlyDeleteItem, 
    clearRecentlyDeleted 
  } = useApp();

  const [activeType, setActiveType] = useState<'all' | 'students' | 'groups' | 'lessons'>('all');

  if (!isRecentlyDeletedModalOpen) return null;

  const totalCount = recentlyDeleted.students.length + recentlyDeleted.groups.length + recentlyDeleted.lessons.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[max(24px,env(safe-area-inset-top,24px))] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zuletzt gelöscht</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gelöschte Elemente wiederherstellen oder dauerhaft entfernen ({totalCount})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Möchten Sie den Papierkorb wirklich leeren? Dies kann nicht rückgängig gemacht werden.')) {
                    clearRecentlyDeleted();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
              >
                Papierkorb leeren
              </button>
            )}
            <button
              onClick={() => setIsRecentlyDeletedModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-medium">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeType === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Alle ({totalCount})
          </button>
          <button
            onClick={() => setActiveType('students')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeType === 'students'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Schüler ({recentlyDeleted.students.length})
          </button>
          <button
            onClick={() => setActiveType('groups')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeType === 'groups'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Gruppen ({recentlyDeleted.groups.length})
          </button>
          <button
            onClick={() => setActiveType('lessons')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeType === 'lessons'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Lektionen ({recentlyDeleted.lessons.length})
          </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {totalCount === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Trash2 className="w-10 h-10 mx-auto stroke-1 opacity-50" />
              <p className="text-sm font-medium">Der Papierkorb ist leer.</p>
              <p className="text-xs text-slate-400">Gelöschte Elemente erscheinen hier und können wiederhergestellt werden.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Students */}
              {(activeType === 'all' || activeType === 'students') && recentlyDeleted.students.map(({ item, deletedAt }) => (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.name} <span className="text-xs font-normal text-slate-500">(Schüler)</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Gelöscht am {new Date(deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreItem('student', item.id)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => permanentlyDeleteItem('student', item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                      title="Endgültig löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Groups */}
              {(activeType === 'all' || activeType === 'groups') && recentlyDeleted.groups.map(({ item, deletedAt }) => (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.name} <span className="text-xs font-normal text-slate-500">(Gruppe)</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Gelöscht am {new Date(deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreItem('group', item.id)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => permanentlyDeleteItem('group', item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                      title="Endgültig löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Lessons */}
              {(activeType === 'all' || activeType === 'lessons') && recentlyDeleted.lessons.map(({ item, deletedAt }) => (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.title} <span className="text-xs font-normal text-slate-500">({item.date})</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Gelöscht am {new Date(deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreItem('lesson', item.id)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => permanentlyDeleteItem('lesson', item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                      title="Endgültig löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
