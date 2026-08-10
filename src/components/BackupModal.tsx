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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black">Lokales Backup & Daten</h2>
              <p className="text-xs text-emerald-100 font-semibold">Datensicherheit & Export</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status Alert Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Benutzerkonto</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {profile.displayName || 'Lehrer'}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className={`p-3 rounded-lg text-xs font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {/* Timestamp Metrics */}
          <div className="grid grid-cols-1 gap-2 text-xs font-bold">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="block text-[10px] text-slate-400 uppercase font-black">Letztes Lokales Backup</span>
              <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white mt-1 block">
                {new Date(lastBackupTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} Uhr
              </span>
            </div>
          </div>

          {/* Records Summary */}
          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-900/60 pb-2 mb-2">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Gesamte Datensätze Im Backup
              </span>
              <span className="text-xs font-black font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-lg">
                {totalRecords} Datensätze
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-slate-400 block text-[9px]">Schüler</span>
                <span className="font-mono text-slate-900 dark:text-white">{students.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-slate-400 block text-[9px]">Gruppen</span>
                <span className="font-mono text-slate-900 dark:text-white">{groups.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-slate-400 block text-[9px]">Lektionen</span>
                <span className="font-mono text-slate-900 dark:text-white">{lessons.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                <span className="text-slate-400 block text-[9px]">Zahlungen</span>
                <span className="font-mono text-slate-900 dark:text-white">{payments.length}</span>
              </div>
            </div>
          </div>

          {/* Mandatory Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleBackupNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
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
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
