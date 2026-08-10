const fs = require('fs');
let content = fs.readFileSync('src/components/BackupModal.tsx', 'utf8');
content = content.replace(
  "          {/* Mandatory Action Buttons */}\n          <div className=\"grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800\">\n          </div>",
  `          {/* Mandatory Action Buttons */}
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
          </div>`
);
fs.writeFileSync('src/components/BackupModal.tsx', content);
