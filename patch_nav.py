import re

with open('src/components/BottomNav.tsx', 'r') as f:
    content = f.read()

new_btn = """                    <button
                      onClick={() => handleTabClick('freeTime')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'freeTime'
                          ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary'
                          : 'hover:bg-background dark:hover:bg-slate-900 text-text-main'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{t('nav_free_time') || 'Free Time'}</span>
                    </button>
                    <button"""

content = content.replace("                    <button\n                      onClick={() => handleTabClick('history')}", new_btn + "\n                      onClick={() => handleTabClick('history')}")

with open('src/components/BottomNav.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

import_statement = "import { FreeTimeSlotsView } from './components/FreeTimeSlotsView';\n"
app_content = app_content.replace("import { SettingsView } from './components/SettingsView';", "import { SettingsView } from './components/SettingsView';\n" + import_statement)

view_statement = "          {activeTab === 'freeTime' && <FreeTimeSlotsView />}\n"
app_content = app_content.replace("          {activeTab === 'settings' && <SettingsView />}", "          {activeTab === 'settings' && <SettingsView />}\n" + view_statement)

# Also add Available Today widget to Dashboard
widget_import = "import { AvailableTodayWidget } from './components/AvailableTodayWidget';\n"
app_content = app_content.replace("import { TomorrowsLessonsWidget } from './components/TomorrowsLessonsWidget';", "import { TomorrowsLessonsWidget } from './components/TomorrowsLessonsWidget';\n" + widget_import)

widget_usage = "              <AvailableTodayWidget />\n"
app_content = app_content.replace("              <TomorrowsLessonsWidget />", "              <TomorrowsLessonsWidget />\n" + widget_usage)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Patched App.tsx and BottomNav")
