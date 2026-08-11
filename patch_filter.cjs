const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsView.tsx', 'utf-8');

const startStr = "      {/* DAILY FILTER FOR GROUPS */}";
const endStr = "      {/* STUDENTS LIST SEGMENT */}";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `      {/* DAILY FILTER FOR GROUPS */}
      {activeSegment === 'groups' && (
        <div className="relative">
          <select
            value={selectedGroupDay}
            onChange={(e) => setSelectedGroupDay(e.target.value)}
            className="w-full bg-surface border border-surface-border text-text-main text-xs font-bold rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="all">{t('students_all_days') || 'All Days'}</option>
            <option value="today">{t('students_today') || 'Today'} ({GERMAN_WEEKDAYS.find(w => w.dayNum === new Date().getDay())?.short})</option>
            {GERMAN_WEEKDAYS.map(w => (
              <option key={w.short} value={w.short}>
                {_t(w.full, w.full, w.full)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </div>
        </div>
      )}

`;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  if (!content.includes('ChevronDown')) {
    content = content.replace("import { Search, UserPlus, Filter, X, Trash2, Bot", "import { Search, UserPlus, Filter, X, Trash2, ChevronDown, Bot");
  }

  fs.writeFileSync('src/components/StudentsView.tsx', content, 'utf-8');
  console.log("Filter replaced");
} else {
  console.log("Could not find start or end strings.");
}
