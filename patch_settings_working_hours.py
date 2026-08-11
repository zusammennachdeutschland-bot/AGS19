import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Replace state variables
content = content.replace("  const [startTime, setStartTime] = useState(profile.workingHours?.startTime || '08:00');\n  const [endTime, setEndTime] = useState(profile.workingHours?.endTime || '20:00');\n  const [workingDays, setWorkingDays] = useState<number[]>(profile.workingHours?.workingDays || [1, 2, 3, 4, 5, 6, 7]);",
"""  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState(profile.weeklyWorkingHours || {
    0: { isOff: true, startTime: '09:00', endTime: '21:00' },
    1: { isOff: false, startTime: '09:00', endTime: '21:00' },
    2: { isOff: false, startTime: '09:00', endTime: '21:00' },
    3: { isOff: false, startTime: '09:00', endTime: '21:00' },
    4: { isOff: false, startTime: '09:00', endTime: '21:00' },
    5: { isOff: false, startTime: '09:00', endTime: '21:00' },
    6: { isOff: false, startTime: '09:00', endTime: '21:00' },
  });""")

# Replace handleSaveCalendarSettings
old_save = """  const handleSaveCalendarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      workingHours: {
        workingDays,
        startTime,
        endTime
      },
      enableLessonAlerts,
      enableBrowserPush
    });
    setSaveStatusMsg(t('settings_save_success') as string);
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };"""

new_save = """  const handleSaveCalendarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      weeklyWorkingHours,
      enableLessonAlerts,
      enableBrowserPush
    });
    setSaveStatusMsg(t('settings_save_success') as string);
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };"""

content = content.replace(old_save, new_save)

# Now the form UI
old_form = """              {/* Working Days Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  {_t('أيام العمل الأسبوعية:', 'Working Days:')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { num: 6, label: _t('السبت', 'Sa') },
                    { num: 7, label: _t('الأحد', 'So') },
                    { num: 1, label: _t('الإثنين', 'Mo') },
                    { num: 2, label: _t('الثلاثاء', 'Di') },
                    { num: 3, label: _t('الأربعاء', 'Mi') },
                    { num: 4, label: _t('الخميس', 'Do') },
                    { num: 5, label: _t('الجمعة', 'Fr') },
                  ].map(day => {
                    const isSelected = workingDays.includes(day.num);
                    return (
                      <button
                        key={day.num}
                        type="button"
                        onClick={() => toggleWorkingDay(day.num)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-hover text-text-muted border border-surface-border dark:border-surface-border-soft'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_start_time')}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_end_time')}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>"""

new_form = """              {/* Weekly Working Hours Configuration */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-main">
                  {_t('ساعات العمل الأسبوعية', 'Weekly Working Hours')}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { num: 6, label: _t('السبت', 'Sat') },
                    { num: 0, label: _t('الأحد', 'Sun') },
                    { num: 1, label: _t('الإثنين', 'Mon') },
                    { num: 2, label: _t('الثلاثاء', 'Tue') },
                    { num: 3, label: _t('الأربعاء', 'Wed') },
                    { num: 4, label: _t('الخميس', 'Thu') },
                    { num: 5, label: _t('الجمعة', 'Fri') },
                  ].map(day => {
                    const dNum = day.num as keyof typeof weeklyWorkingHours;
                    const hours = weeklyWorkingHours[dNum];
                    return (
                      <div key={day.num} className={`flex items-center justify-between p-3 rounded-xl border ${hours.isOff ? 'bg-surface-hover border-surface-border opacity-60' : 'bg-surface border-primary-border/40'}`}>
                        <div className="flex items-center gap-3 min-w-[80px]">
                          <input 
                            type="checkbox" 
                            checked={!hours.isOff} 
                            onChange={(e) => setWeeklyWorkingHours(prev => ({ ...prev, [dNum]: { ...prev[dNum], isOff: !e.target.checked } }))} 
                            className="w-4 h-4 rounded text-primary"
                          />
                          <span className="text-sm font-bold text-text-main">{day.label}</span>
                        </div>
                        
                        {!hours.isOff ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={hours.startTime}
                              onChange={(e) => setWeeklyWorkingHours(prev => ({ ...prev, [dNum]: { ...prev[dNum], startTime: e.target.value } }))}
                              className="px-2 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-xs font-mono font-bold"
                            />
                            <span className="text-text-muted text-xs">→</span>
                            <input
                              type="time"
                              value={hours.endTime}
                              onChange={(e) => setWeeklyWorkingHours(prev => ({ ...prev, [dNum]: { ...prev[dNum], endTime: e.target.value } }))}
                              className="px-2 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-xs font-mono font-bold"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-hover px-3 py-1 rounded-lg">Off</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>"""

content = content.replace(old_form, new_form)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Updated SettingsView")
