import React from 'react';
import { CheckCircle2, X, Trash2 } from 'lucide-react';

interface DeletionCompleteModalProps {
  isOpen: boolean;
  title?: string;
  deletedCounts: {
    group?: string;
    students?: number;
    sessions?: number;
    calendarEvents?: number;
    payments?: number;
    items?: number;
  };
  onClose: () => void;
}

export const DeletionCompleteModal: React.FC<DeletionCompleteModalProps> = ({
  isOpen,
  title = 'Deletion Complete',
  deletedCounts,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md p-5 shadow-2xl relative animate-scale-up space-y-4">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-2 mb-1 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-text-main">
                {title}
              </h3>
              <p className="text-xs font-semibold text-text-muted mt-0.5">
                Successfully processed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-hover rounded-full transition-colors cursor-pointer text-text-muted/70 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deleted List */}
        <div className="bg-background/50 dark:bg-slate-900/40 border border-surface-border rounded-xl p-4 text-xs space-y-2.5">
          <p className="font-bold text-text-main">
            Deleted:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-text-muted font-medium">
            {deletedCounts.group && <li>Group: {deletedCounts.group}</li>}
            {deletedCounts.students !== undefined && deletedCounts.students > 0 && (
              <li>{deletedCounts.students} Students</li>
            )}
            {deletedCounts.sessions !== undefined && deletedCounts.sessions > 0 && (
              <li>{deletedCounts.sessions} Sessions</li>
            )}
            {deletedCounts.calendarEvents !== undefined && deletedCounts.calendarEvents > 0 && (
              <li>{deletedCounts.calendarEvents} Calendar Events</li>
            )}
            {deletedCounts.payments !== undefined && deletedCounts.payments > 0 && (
              <li>{deletedCounts.payments} Payment Records</li>
            )}
            {deletedCounts.items !== undefined && deletedCounts.items > 0 && (
              <li>{deletedCounts.items} Items</li>
            )}
          </ul>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold pt-2 border-t border-surface-border">
            All linked data has been removed successfully.
          </p>
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>OK</span>
          </button>
        </div>

      </div>
    </div>
  );
};
