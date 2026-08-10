import fs from 'fs';
let code = fs.readFileSync('src/components/AddQuickLessonModal.tsx', 'utf8');

code = code.replace(
  '<button\\n              type="submit"\\n              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"',
  '<button\\n              type="submit"\\n              disabled={hasConflict}\\n              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 ${hasConflict ? \\\'bg-slate-400 cursor-not-allowed\\\' : \\\'bg-blue-600 hover:bg-blue-700\\\'}`}'
);

fs.writeFileSync('src/components/AddQuickLessonModal.tsx', code);
