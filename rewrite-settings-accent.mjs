import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

const oldAccentSection = `
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-1">
              {[
                { id: 'blue' as const, bg: 'bg-primary', ring: 'ring-primary/50', border: 'border-blue-700' },
                { id: 'green' as const, bg: 'bg-green-600', ring: 'ring-green-500/50', border: 'border-green-700' },
                { id: 'purple' as const, bg: 'bg-purple-600', ring: 'ring-purple-500/50', border: 'border-purple-700' },
                { id: 'orange' as const, bg: 'bg-orange-600', ring: 'ring-orange-500/50', border: 'border-orange-700' },
                { id: 'red' as const, bg: 'bg-red-600', ring: 'ring-red-500/50', border: 'border-red-700' },
                { id: 'teal' as const, bg: 'bg-teal-600', ring: 'ring-teal-500/50', border: 'border-teal-700' },
                { id: 'indigo' as const, bg: 'bg-indigo-600', ring: 'ring-indigo-500/50', border: 'border-indigo-700' },
              ].map((item) => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (accentColor !== item.id) {
                        setAccentColor(item.id);
                        confetti({ particleCount: 30, spread: 40 });
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div 
                      className={\`w-10 h-10 rounded-full \${item.bg} flex items-center justify-center border \${item.border} shadow-xs relative transition-all duration-300 transform group-hover:scale-110 active:scale-95 \${
                        isSelected 
                          ? 'ring-4 ' + item.ring + ' scale-105' 
                          : 'opacity-80 hover:opacity-100'
                      }\`}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm animate-scale-up" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
`;

const newAccentSection = `
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-2 pb-2">
              {[
                { id: 'blue' as const, hex: '#3b82f6', color: 'blue' },
                { id: 'green' as const, hex: '#16a34a', color: 'green' },
                { id: 'purple' as const, hex: '#9333ea', color: 'purple' },
                { id: 'orange' as const, hex: '#ea580c', color: 'orange' },
                { id: 'red' as const, hex: '#dc2626', color: 'red' },
                { id: 'teal' as const, hex: '#0d9488', color: 'teal' },
                { id: 'indigo' as const, hex: '#4f46e5', color: 'indigo' },
              ].map((item) => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (accentColor !== item.id) {
                        setAccentColor(item.id);
                        confetti({ particleCount: 30, spread: 40 });
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div 
                      style={{ backgroundColor: item.hex }}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative transition-all duration-300 transform group-hover:scale-110 active:scale-95 \${
                        isSelected 
                          ? 'ring-4 ring-offset-2 ring-offset-surface scale-110' 
                          : 'opacity-80 hover:opacity-100 border border-white/20'
                      }\`}
                      style={{ backgroundColor: item.hex, ...(isSelected ? { ringColor: item.hex } : {}) }}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm animate-scale-up" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Accent Preview */}
            <div className="mt-6 p-4 rounded-2xl border border-primary-border/60 bg-primary-soft/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-[10px] uppercase font-bold text-text-muted relative z-10">Live Preview</h4>
              <div className="flex gap-3 relative z-10">
                <button className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-95">
                  Primary Button
                </button>
                <button className="flex-1 bg-primary-soft text-primary py-2 rounded-xl text-xs font-bold transition-all hover:bg-primary/20 active:scale-95">
                  Secondary
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border relative z-10 shadow-sm">
                <div className="p-2 bg-primary-soft rounded-lg text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-main truncate">Premium Widget</p>
                  <p className="text-[10px] text-text-muted truncate">Adapts to your accent color</p>
                </div>
                <div className="ml-auto shrink-0">
                   <div className="w-8 h-4 rounded-full bg-primary relative cursor-pointer">
                     <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>
              </div>
            </div>
`;

// wait, the ringColor style object might be invalid React, let's fix that.
const fixedNewAccentSection = newAccentSection.replace(
  'style={{ backgroundColor: item.hex, ...(isSelected ? { ringColor: item.hex } : {}) }}',
  'style={{ backgroundColor: item.hex, ...(isSelected ? { "--tw-ring-color": item.hex } : {}) } as React.CSSProperties}'
);

if (content.includes('const isSelected = accentColor === item.id;')) {
    const startIdx = content.indexOf('<div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-1">');
    const endIdx = content.indexOf('</div>\n          </div>\n\n          {/* Dark Mode Section */}');
    // let's just use string replacement
    // actually, let's use a simpler substring replacement
}

let newCont = content.replace(oldAccentSection, fixedNewAccentSection);
fs.writeFileSync('src/components/SettingsView.tsx', newCont);
console.log('Settings View updated');

