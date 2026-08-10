import { Group, GroupScheduleSlot } from '../types';

export const DAY_NAME_TO_NUM: Record<string, number> = {
  'so': 0, 'sonntag': 0, 'sun': 0, 'sunday': 0, 'الأحد': 0, 'الاحد': 0,
  'mo': 1, 'montag': 1, 'mon': 1, 'monday': 1, 'الإثنين': 1, 'الاثنين': 1,
  'di': 2, 'dienstag': 2, 'tue': 2, 'tuesday': 2, 'الثلاثاء': 2,
  'mi': 3, 'mittwoch': 3, 'wed': 3, 'wednesday': 3, 'الأربعاء': 3, 'الاربعاء': 3,
  'do': 4, 'donnerstag': 4, 'thu': 4, 'thursday': 4, 'الخميس': 4,
  'fr': 5, 'freitag': 5, 'fri': 5, 'friday': 5, 'الجمعة': 5,
  'sa': 6, 'samstag': 6, 'sat': 6, 'saturday': 6, 'السبت': 6,
};

export const NUM_TO_SHORT_DAY: Record<number, string> = {
  0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa'
};

export const NUM_TO_ENGLISH_DAY: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export const NUM_TO_ARABIC_DAY: Record<number, string> = {
  0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت'
};

export function getDayNumber(dayName: string): number {
  if (!dayName) return -1;
  const normalized = dayName.trim().toLowerCase();
  return DAY_NAME_TO_NUM[normalized] !== undefined ? DAY_NAME_TO_NUM[normalized] : -1;
}

/**
 * Returns normalized GroupScheduleSlot[] for any group.
 * Backward compatible with scheduleDays, scheduleTime, and scheduleDayTimes.
 */
export function getGroupScheduleSlots(group: Partial<Group>): GroupScheduleSlot[] {
  if (group.schedules && group.schedules.length > 0) {
    return group.schedules;
  }

  const slots: GroupScheduleSlot[] = [];
  const days = group.scheduleDays || [];
  const dayTimes = group.scheduleDayTimes || {};
  const defaultTime = group.scheduleTime || '17:00';

  days.forEach((day) => {
    const dayNum = getDayNumber(day);
    const shortKey = dayNum !== -1 ? NUM_TO_SHORT_DAY[dayNum] : day;
    const time = dayTimes[day] || dayTimes[shortKey] || defaultTime;
    slots.push({ day, time });
  });

  return slots;
}

/**
 * Formats group schedule slots for display in UI.
 * e.g., "Saturday @ 15:00, Wednesday @ 19:00"
 */
export function formatGroupScheduleDisplay(group: Partial<Group>, lang: 'ar' | 'en' | 'de' = 'ar'): string {
  const slots = getGroupScheduleSlots(group);
  if (slots.length === 0) {
    return lang === 'ar' ? 'بدون مواعيد محددة' : 'No schedule set';
  }

  // If all slots have the same time, render "Sat, Wed @ 18:00"
  const firstTime = slots[0].time;
  const allSameTime = slots.every(s => s.time === firstTime);

  if (allSameTime) {
    const daysStr = slots.map(s => s.day).join(', ');
    return `${daysStr} @ ${firstTime}`;
  }

  // Independent times per day: "Saturday @ 15:00 | Wednesday @ 19:00"
  return slots.map(s => `${s.day} @ ${s.time}`).join(' | ');
}
