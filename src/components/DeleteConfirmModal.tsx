import React from 'react';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemType: 'student' | 'group';
  itemName: string;
  recordsSummary?: {
    lessonsCount: number;
    paymentsCount: number;
    attendanceCount: number;
    studentsCount?: number;
  };
  onConfirmDelete: () => void;
  onConfirmArchive: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  itemType,
  itemName,
  recordsSummary,
  onConfirmDelete,
  onConfirmArchive,
  onClose,
}) => {
  if (!isOpen) return null;

  const hasAssociatedRecords =
    (recordsSummary?.lessonsCount || 0) > 0 ||
    (recordsSummary?.paymentsCount || 0) > 0 ||
    (recordsSummary?.attendanceCount || 0) > 0 ||
    (recordsSummary?.studentsCount || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {itemType === 'student' ? 'Schüler löschen / archivieren' : 'Gruppe löschen / archivieren'}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                "{itemName}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if existing records */}
        {hasAssociatedRecords ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-4 text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Achtung: Zugehörige Daten vorhanden!</span>
            </div>
            <p className="leading-relaxed">
              Für <strong>{itemName}</strong> existieren folgende Datensätze im System:
            </p>
            <ul className="list-disc list-inside space-y-1 font-semibold text-[11px] text-amber-800/90 dark:text-amber-300/90 pl-1">
              {recordsSummary?.studentsCount ? (
                <li>{recordsSummary.studentsCount} zugewiesene Schüler</li>
              ) : null}
              {recordsSummary?.lessonsCount ? (
                <li>{recordsSummary.lessonsCount} Lektionen / Termine</li>
              ) : null}
              {recordsSummary?.paymentsCount ? (
                <li>{recordsSummary.paymentsCount} Zahlungsaufzeichnungen</li>
              ) : null}
              {recordsSummary?.attendanceCount ? (
                <li>{recordsSummary.attendanceCount} Anwesenheitsdaten</li>
              ) : null}
            </ul>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1">
              Tipp: Sie können diesen Eintrag <strong>archivieren</strong>, um Historien und Berichte zu behalten.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sind Sie sicher, dass Sie <strong>{itemName}</strong> löschen oder archivieren möchten?
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onConfirmArchive}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Archive className="w-4 h-4 text-amber-500" />
            <span>In Archiv verschieben (Empfohlen)</span>
          </button>

          <button
            type="button"
            onClick={onConfirmDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Endgültig löschen</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold text-xs py-2 rounded-lg transition-all text-center cursor-pointer mt-1"
          >
            Abbrechen
          </button>
        </div>

      </div>
    </div>
  );
};
