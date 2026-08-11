import re

with open('src/components/AddLessonModal.tsx', 'r') as f:
    content = f.read()

import_statement = "import { getFreePeriodsForDate, getBookableSlots, formatTimeDisplay } from '../utils/timeUtils';\n"
content = content.replace("import { checkOverlap } from '../utils/lessonUtils';", import_statement + "import { checkOverlap } from '../utils/lessonUtils';")


old_gen = """  // SUGGEST AVAILABLE SLOTS based on Working Hours & existing schedule
  const generateAvailableSlots = () => {
    const slots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return slots.filter(slot => !checkConflict(slot));
  };

  const availableSlots = generateAvailableSlots();"""

new_gen = """  // SUGGEST AVAILABLE SLOTS based on Working Hours & existing schedule
  const availableSlots = React.useMemo(() => {
    if (!profile.weeklyWorkingHours) return [];
    const freePeriods = getFreePeriodsForDate(date, lessons, groups, profile.weeklyWorkingHours);
    const bookable = getBookableSlots(freePeriods, durationMinutes);
    return bookable.map(b => b.start);
  }, [date, lessons, groups, profile.weeklyWorkingHours, durationMinutes]);"""

content = content.replace(old_gen, new_gen)

old_btn = """                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    time === slot
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-hover text-text-main border-surface-border'
                  }`}
                >
                  {slot} Uhr
                </button>"""

new_btn = """                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    time === slot
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-hover text-text-main hover:bg-surface border-surface-border'
                  }`}
                >
                  {formatTimeDisplay(slot, profile.language || 'de')}
                </button>"""

content = content.replace(old_btn, new_btn)

with open('src/components/AddLessonModal.tsx', 'w') as f:
    f.write(content)

print("Patched AddLessonModal")
