import fs from 'fs';
let code = fs.readFileSync('src/components/AddQuickLessonModal.tsx', 'utf8');

const oldButton = `<button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >`;

const newButton = `<button
            type="submit"
            disabled={hasConflict}
            className={\`w-full text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 \${hasConflict ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'}\`}
          >`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/components/AddQuickLessonModal.tsx', code);
