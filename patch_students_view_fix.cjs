const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsView.tsx', 'utf-8');

const targetButtonsBlock = `      {/* DAILY FILTER FOR GROUPS */}
      {activeSegment === 'groups' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedGroupDay('all')}
            className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 \${
              selectedGroupDay === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-hover text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700'
            }\`}
          >
            {t('students_all_days')}
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroupDay('today')}
            className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 \${
              selectedGroupDay === 'today'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-primary-soft dark:bg-primary-soft text-primary dark:text-primary border border-primary-border dark:border-primary-border hover:bg-primary-soft'
            }\`}
          >
            <span>{t('students_today')}</span>
            <span className="text-[10px] font-mono opacity-80">({GERMAN_WEEKDAYS.find(w => w.dayNum === new Date().getDay())?.short})</span>
          </button>
          {GERMAN_WEEKDAYS.map(w => (
            <button
              key={w.short}
              type="button"
              onClick={() => setSelectedGroupDay(w.short)}
              className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 \${
                selectedGroupDay === w.short || selectedGroupDay === w.full
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-hover text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700'
              }\`}
            >
              {w.short}
            </button>
          ))}
        </div>
      )}`;

const replacementSelect = `      {/* DAILY FILTER FOR GROUPS */}
      {activeSegment === 'groups' && (
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <select
            value={selectedGroupDay}
            onChange={(e) => setSelectedGroupDay(e.target.value)}
            className="w-full bg-surface border border-surface-border text-text-main text-xs font-bold rounded-xl pl-9 pr-4 py-2.5 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="all">{t('students_all_days') || 'All Days'}</option>
            <option value="today">{t('students_today') || 'Today'}</option>
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
      )}`;

content = content.replace(targetButtonsBlock, replacementSelect);

// We need to make sure ChevronDown is imported.
if (!content.includes('ChevronDown')) {
  content = content.replace("import { Search, UserPlus, Filter, X, Trash2", "import { Search, UserPlus, Filter, X, Trash2, ChevronDown");
}

fs.writeFileSync('src/components/StudentsView.tsx', content, 'utf-8');
console.log("Updated StudentsView");
