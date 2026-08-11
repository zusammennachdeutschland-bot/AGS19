import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, CheckCircle2, Download, Upload, ShieldCheck, Database
} from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose }) => {
  const { 
    profile, lastBackupTime,
    performBackup, exportBackupFile, importBackupFile,
    students, lessons, groups, payments, notifications
  } = useApp();

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBackupNow = () => {
    performBackup();
    exportBackupFile();
    setFeedbackMsg({ type: 'success', text: '✓ Lokales Backup als JSON-Datei im Gerätespeicher gespeichert!' });
  };

  const handleFileUploadAndRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importBackupFile(content);
        if (success) {
          setFeedbackMsg({ type: 'success', text: '✓ Alle Daten erfolgreich aus der Backup-Datei wiederhergestellt!' });
        } else {
          setFeedbackMsg({ type: 'error', text: '❌ Ungültige Backup-Datei. Bitte überprüfen Sie das Format.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreClick = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      const success = await importBackupFile();
      if (success) {
        setFeedbackMsg({ type: 'success', text: '✓ Alle Daten erfolgreich aus dem lokalen Snapshot wiederhergestellt!' });
      } else {
        setFeedbackMsg({ type: 'error', text: '❌ Kein automatisches Backup gefunden. Bitte wählen Sie eine JSON-Datei aus.' });
      }
    }
  };

  const totalRecords = students.length + groups.length + lessons.length + payments.length + notifications.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center font-sans p-0 sm:p-4 pb-0">
      <div className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-surface/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black">Lokales Backup & Daten</h2>
              <p className="text-xs text-primary-soft font-semibold">Datensicherheit & Export</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status Alert Banner */}
          <div className="bg-surface-hover/80 p-3.5 rounded-lg border border-surface-border dark:border-surface-border-soft space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Benutzerkonto</span>
              <span className="text-xs font-bold text-text-main flex items-center gap-1.5 bg-primary-soft dark:bg-primary-soft text-primary dark:text-primary px-2.5 py-0.5 rounded-full border border-primary-border dark:border-primary-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                {profile.displayName || 'Lehrer'}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className={`p-3 rounded-lg text-xs font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-primary-soft text-primary border-primary-border dark:bg-primary-soft dark:text-primary dark:border-primary-border'
                : feedbackMsg.type === 'error'
                ? 'bg-primary-soft text-primary border-primary-border dark:bg-primary-soft dark:text-primary dark:border-primary-border'
                : 'bg-primary-soft text-primary-hover border-primary-border dark:bg-primary-soft/60 dark:text-primary/70 dark:border-primary-border'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {/* Timestamp Metrics */}
          <div className="grid grid-cols-1 gap-2 text-xs font-bold">
            <div className="p-3 bg-surface-hover/80 rounded-lg border border-surface-border/80 dark:border-surface-border-soft">
              <span className="block text-[10px] text-text-muted/70 uppercase font-black">Letztes Lokales Backup</span>
              <span className="text-xs font-mono font-extrabold text-text-main mt-1 block">
                {new Date(lastBackupTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} Uhr
              </span>
            </div>
          </div>

          {/* Records Summary */}
          <div className="p-3.5 bg-primary-soft dark:bg-primary-soft rounded-lg border border-primary-border dark:border-primary-border">
            <div className="flex items-center justify-between border-b border-primary-border dark:border-primary-border pb-2 mb-2">
              <span className="text-xs font-extrabold text-primary dark:text-primary flex items-center gap-1.5">
                <Database className="w-4 h-4 text-primary" />
                Gesamte Datensätze Im Backup
              </span>
              <span className="text-xs font-black font-mono text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2 py-0.5 rounded-lg">
                {totalRecords} Datensätze
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold">
              <div className="bg-surface dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-text-muted/70 block text-[9px]">Schüler</span>
                <span className="font-mono text-text-main">{students.length}</span>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-text-muted/70 block text-[9px]">Gruppen</span>
                <span className="font-mono text-text-main">{groups.length}</span>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-text-muted/70 block text-[9px]">Lektionen</span>
                <span className="font-mono text-text-main">{lessons.length}</span>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-text-muted/70 block text-[9px]">Zahlungen</span>
                <span className="font-mono text-text-main">{payments.length}</span>
              </div>
            </div>
          </div>

          {/* Mandatory Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-surface-border">
            <button
              onClick={handleBackupNow}
              className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Backup Now</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={handleFileUploadAndRestore}
            />
            <button
              onClick={handleRestoreClick}
              className="bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Data (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
