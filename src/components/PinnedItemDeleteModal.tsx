import React from 'react';
import { AlertTriangle, X, Pin } from 'lucide-react';

interface PinnedItemDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  onClose: () => void;
  onConfirmDeletePermanently: () => void;
}

export const PinnedItemDeleteModal: React.FC<PinnedItemDeleteModalProps> = ({
  isOpen,
  itemName,
  itemType,
  onClose,
  onConfirmDeletePermanently,
}) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-md p-5 shadow-2xl relative animate-scale-up space-y-4">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-2 mb-1 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl shrink-0">
              <Pin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-text-main">
                ⚠️ Permanent Deletion
              </h3>
              <p className="text-xs font-semibold text-text-muted mt-0.5">
                {itemType}: "{itemName}"
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

        {/* Message */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-xs space-y-2 text-red-800 dark:text-red-300">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This item is pinned.</span>
          </div>
          <p className="leading-relaxed">
            Deleting it from here will permanently remove it and bypass the Recycle Bin.
          </p>
          <p className="font-bold pt-1">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onConfirmDeletePermanently}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main font-bold text-xs py-2.5 rounded-xl transition-all text-center cursor-pointer mt-1"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
