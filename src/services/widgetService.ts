import { Preferences } from '@capacitor/preferences';
import { registerPlugin } from '@capacitor/core';
import { Lesson } from '../types';

export interface WidgetManagerPlugin {
  updateWidget(): Promise<void>;
}

const WidgetManager = registerPlugin<WidgetManagerPlugin>('WidgetManager');

export const syncTodayLessonsToWidget = async (lessons: Lesson[]) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Format to 12h for widget
    const formatTime12h = (timeStr: string) => {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      let h = parseInt(parts[0], 10);
      const m = parts[1] || '00';
      if (isNaN(h)) return timeStr;
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${period}`;
    };

    const todaysLessons = lessons
      .filter(l => l.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(l => ({
        id: l.id,
        time: formatTime12h(l.time),
        title: l.title || l.studentName || l.groupName || 'Lesson',
        status: l.status // 'scheduled', 'completed', 'cancelled', 'in_progress'
      }));

    // Save to CapacitorStorage so the native widget can read it
    await Preferences.set({
      key: 'widget_today_lessons',
      value: JSON.stringify(todaysLessons)
    });

    // Notify native widget to update
    if (WidgetManager && WidgetManager.updateWidget) {
      await WidgetManager.updateWidget().catch(() => {}); // Catch on web
    }
  } catch (error) {
    console.warn('Failed to sync widget lessons:', error);
  }
};
