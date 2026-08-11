import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Add Search to imports if not there
if "Search" not in content:
    content = content.replace("Settings,", "Settings, Search,")

# Add searchQuery state
if "const [searchQuery, setSearchQuery] = useState('');" not in content:
    content = content.replace("const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);", "const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);\n  const [searchQuery, setSearchQuery] = useState('');")

# Modify renderSubPageHeader to hide back button on lg
header_search = """  const renderSubPageHeader = (title: string, subtitle?: string) => (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border/80 dark:border-surface-border">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="p-2.5 rounded-xl bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          title={_t('العودة للإعدادات', 'Back to Settings')}
        >
          <BackIcon className="w-5 h-5" />
        </button>"""

header_replace = """  const renderSubPageHeader = (title: string, subtitle?: string) => (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border/80 dark:border-surface-border">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="lg:hidden p-2.5 rounded-xl bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          title={_t('العودة للإعدادات', 'Back to Settings')}
        >
          <BackIcon className="w-5 h-5" />
        </button>"""

content = content.replace(header_search, header_replace)

# Replace return layout
old_return_start = """  return (
    <div className="space-y-4 pb-28">
      {/* ==========================================
          HOME SETTINGS VIEW (CATEGORY CARDS)
      ========================================== */}
      {activeCategory === null && (
        <div className="space-y-4 animate-scale-up">
          {/* Main Title Header */}
          <div>
            <h2 className="text-lg font-black text-text-main flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>{t('settings_title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {_t('اختر قسماً لإدارة إعدادات التطبيق', 'Select a section to manage application settings', 'Wählen Sie einen Bereich zur Verwaltung aus')}
            </p>
          </div>
          {/* Main Category Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryCards.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="bg-surface border border-surface-border/90 dark:border-surface-border hover:border-primary dark:hover:border-primary rounded-lg p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-start group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    <div className={`p-3 rounded-lg border shrink-0 ${cat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-text-main truncate group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      
                    </div>
                  </div>
                  <div className="p-2 text-text-muted/70 group-hover:text-primary dark:group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
                    <ForwardIcon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}"""

new_return_start = """  const filteredCategories = categoryCards.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-28 items-start">
      {/* Sidebar / List View */}
      <div className={`w-full lg:w-1/3 shrink-0 lg:sticky lg:top-20 space-y-4 ${activeCategory !== null ? 'hidden lg:block' : 'block'}`}>
        {/* Main Title Header */}
        <div>
          <h2 className="text-xl font-black text-text-main flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <span>{t('settings_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {_t('اختر قسماً لإدارة إعدادات التطبيق', 'Select a section to manage application settings', 'Wählen Sie einen Bereich zur Verwaltung aus')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={_t('ابحث في الإعدادات...', 'Search settings...', 'Einstellungen durchsuchen...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-2">
          {filteredCategories.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full bg-surface border rounded-xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-start group ${
                  isActive 
                    ? 'border-primary dark:border-primary bg-primary/5' 
                    : 'border-surface-border/90 dark:border-surface-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                  <div className={`p-2.5 rounded-lg border shrink-0 ${cat.color} ${isActive ? 'ring-2 ring-primary/20' : ''}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-extrabold truncate transition-colors ${isActive ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className={`p-2 transition-all shrink-0 ${isActive ? 'text-primary translate-x-1' : 'text-text-muted/50 group-hover:text-primary group-hover:translate-x-1'}`}>
                  <ForwardIcon className="w-4 h-4" />
                </div>
              </button>
            );
          })}
          {filteredCategories.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">
               {_t('لا توجد نتائج', 'No results found', 'Keine Ergebnisse')}
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className={`w-full lg:w-2/3 ${activeCategory === null ? 'hidden lg:block' : 'block'}`}>
        {activeCategory === null ? (
          <div className="hidden lg:flex flex-col items-center justify-center h-[60vh] bg-surface rounded-2xl border border-surface-border text-center p-8 animate-fade-in shadow-sm">
            <Settings className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">
               {_t('اختر قسماً', 'Select a Category', 'Wählen Sie eine Kategorie')}
            </h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
               {_t('اختر قسماً من القائمة الجانبية لعرض وإدارة الإعدادات الخاصة به.', 'Choose a category from the sidebar to view and manage its settings.', 'Wählen Sie eine Kategorie aus der Seitenleiste aus, um die Einstellungen anzuzeigen und zu verwalten.')}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in bg-surface lg:rounded-2xl lg:border border-surface-border lg:shadow-sm lg:p-6 min-h-[60vh]">"""

if old_return_start in content:
    content = content.replace(old_return_start, new_return_start)
    # Also we need to close the extra div we opened for Detail View
    # Currently the very end of the file is likely:
    #       )}
    #     </div>
    #   );
    # };
    # We will replace the last two closing tags.
    if content.endswith("    </div>\n  );\n};\n"):
        content = content[:-18] + "    </div>\n      </div>\n    </div>\n  );\n};\n"
    with open('src/components/SettingsView.tsx', 'w') as f:
        f.write(content)
    print("Success replacing layout")
else:
    print("Could not find the return block to replace")

