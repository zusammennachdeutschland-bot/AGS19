const fs = require('fs');
let content = fs.readFileSync('src/components/StudentProfileModal.tsx', 'utf8');

const target = `      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-scale-up">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('edit')}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 hover:text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 border border-amber-500/30"
              title="Schülerdaten bearbeiten (Edit Student Data)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Bearbeiten</span>
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 border border-red-500/30"
              title="Schüler löschen / archivieren"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Löschen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">`;

const replacement = `      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-scale-up flex flex-col max-h-[90vh]">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-4 min-w-0">`;

content = content.replace(target, replacement);

const target2 = `              <h2 className="text-xl font-black tracking-tight">{student.name}</h2>
              <p className="text-xs text-slate-400">Eltern: {student.parentName} ({student.parentPhone})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 hide-scrollbar">`;

const replacement2 = `              <h2 className="text-xl font-black tracking-tight truncate">{student.name}</h2>
              <p className="text-xs text-slate-400 truncate">Eltern: {student.parentName} ({student.parentPhone})</p>
            </div>
            
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[50%]">
              <button
                onClick={() => setActiveTab('edit')}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 hover:text-white rounded-xl transition-colors cursor-pointer text-[10px] sm:text-xs font-bold flex items-center gap-1 border border-amber-500/30"
                title="Schülerdaten bearbeiten (Edit Student Data)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bearbeiten</span>
              </button>
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-xl transition-colors cursor-pointer text-[10px] sm:text-xs font-bold flex items-center gap-1 border border-red-500/30"
                title="Schüler löschen / archivieren"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Löschen</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/components/StudentProfileModal.tsx', content);
