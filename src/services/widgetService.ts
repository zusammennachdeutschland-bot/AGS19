import { Preferences } from '@capacitor/preferences';
import { registerPlugin } from '@capacitor/core';
import { Lesson, Student, PaymentRecord, TodoItem } from '../types';

export interface WidgetManagerPlugin {
  updateWidget(): Promise<void>;
}

const WidgetManager = registerPlugin<WidgetManagerPlugin>('WidgetManager');

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

/**
 * 1. Sync Today's Lessons to SharedPreferences ('widget_today_lessons')
 */
export const syncTodayLessonsToWidget = async (lessons: Lesson[]) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLessons = lessons
      .filter(l => l.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(l => ({
        id: l.id,
        time: formatTime12h(l.time),
        title: l.title || l.studentName || l.groupName || 'Lesson',
        status: l.status
      }));

    await Preferences.set({
      key: 'widget_today_lessons',
      value: JSON.stringify(todaysLessons)
    });
  } catch (e) {
    console.warn('Sync Today Lessons failed', e);
  }
};

/**
 * 3. Sync Active Live Lesson state ('widget_active_session')
 */
export const syncActiveSessionToWidget = async (activeSession: {
  id: string;
  groupName: string;
  startTime: number;
  attendanceCount: number;
} | null) => {
  try {
    await Preferences.set({
      key: 'widget_active_session',
      value: JSON.stringify(activeSession ? {
        isActive: true,
        ...activeSession
      } : { isActive: false })
    });
  } catch (e) {
    console.warn('Sync Active Session failed', e);
  }
};

/**
 * 4. Sync Overdue Payments ('widget_payments_due')
 */
export const syncPaymentsDueToWidget = async (students: Student[]) => {
  try {
    const overdueStudents = students.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial');
    const totalOutstanding = overdueStudents.reduce((acc, s) => acc + (s.pricePerLesson || 50), 0);

    await Preferences.set({
      key: 'widget_payments_due',
      value: JSON.stringify({
        overdueCount: overdueStudents.length,
        totalOutstanding
      })
    });
  } catch (e) {
    console.warn('Sync Payments Due failed', e);
  }
};

/**
 * 5. Sync To-Do Tasks ('widget_todos')
 */
export const syncTodosToWidget = async (todos: TodoItem[]) => {
  try {
    const items = todos.map(t => ({ id: t.id, text: t.text }));
    await Preferences.set({
      key: 'widget_todos',
      value: JSON.stringify(items)
    });
  } catch (e) {
    console.warn('Sync Todos failed', e);
  }
};

/**
 * 6. Sync Revenue & Monthly Goal ('widget_revenue')
 */
export const syncRevenueToWidget = async (payments: PaymentRecord[]) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenue = payments
      .filter(p => p.dueDate === todayStr || p.paidDate === todayStr)
      .reduce((acc, p) => acc + (p.amountPaid || 0), 0);

    const weeklyRevenue = payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0) || 1850;
    const monthlyRevenue = Math.round(weeklyRevenue * 4.2);

    await Preferences.set({
      key: 'widget_revenue',
      value: JSON.stringify({
        today: todayRevenue,
        week: weeklyRevenue,
        month: monthlyRevenue,
        goal: 8000
      })
    });
  } catch (e) {
    console.warn('Sync Revenue failed', e);
  }
};

/**
 * 7. Sync Mini Dashboard stats ('widget_mini_dashboard')
 */
export const syncMiniDashboardToWidget = async (
  lessonsCountToday: number,
  totalStudents: number,
  attendanceRate: number,
  monthlyRev: number,
  overdueCount: number
) => {
  try {
    await Preferences.set({
      key: 'widget_mini_dashboard',
      value: JSON.stringify({
        lessonsToday: lessonsCountToday,
        totalStudents,
        attendanceRate,
        monthlyRev,
        overdueCount
      })
    });
  } catch (e) {
    console.warn('Sync Mini Dashboard failed', e);
  }
};

/**
 * 8. Sync Upcoming Lessons ('widget_upcoming_lessons')
 */
export const syncUpcomingLessonsToWidget = async (lessons: Lesson[], students: Student[]) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = lessons
      .filter(l => l.date >= todayStr && l.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5)
      .map(l => ({
        id: l.id,
        time: l.time,
        date: l.date,
        title: l.title || l.groupName || l.studentName || 'Lektion',
        studentCount: l.groupId ? students.filter(s => s.groupId === l.groupId).length : 1
      }));

    await Preferences.set({
      key: 'widget_upcoming_lessons',
      value: JSON.stringify(upcoming)
    });
  } catch (e) {
    console.warn('Sync Upcoming Lessons failed', e);
  }
};

/**
 * Master Sync All Widgets & Trigger Native Android Refresh Broadcast
 */
export const syncAllWidgetsToNative = async (data: {
  lessons: Lesson[];
  students: Student[];
  payments: PaymentRecord[];
  todos: TodoItem[];
  activeSession?: { id: string; groupName: string; startTime: number; attendanceCount: number } | null;
}) => {
  try {
    const { lessons, students, payments, todos, activeSession } = data;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLessons = lessons.filter(l => l.date === todayStr);

    const weeklyRevenue = payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0) || 1850;
    const monthlyRev = Math.round(weeklyRevenue * 4.2);
    const overdueStudents = students.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial');

    await Promise.all([
      syncTodayLessonsToWidget(lessons),
      syncActiveSessionToWidget(activeSession || null),
      syncPaymentsDueToWidget(students),
      syncTodosToWidget(todos),
      syncRevenueToWidget(payments),
      syncMiniDashboardToWidget(todayLessons.length, students.length, 94, monthlyRev, overdueStudents.length),
      syncUpcomingLessonsToWidget(lessons, students)
    ]);

    // Trigger native Android widget broadcast update
    if (WidgetManager && WidgetManager.updateWidget) {
      await WidgetManager.updateWidget().catch(() => {});
    }
  } catch (error) {
    console.warn('Failed master widget sync:', error);
  }
};
