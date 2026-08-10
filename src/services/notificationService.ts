import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationActionHandler {
  onEndLesson?: () => void;
  onOpenLesson?: () => void;
  onCancelLesson?: () => void;
}

let activeNotification: any = null;
let isChannelCreated = false;

// Initialize Notification Channels for Android 8.0+
export const initNotificationChannels = async () => {
  if (Capacitor.isNativePlatform() && !isChannelCreated) {
    try {
      await LocalNotifications.createChannel({
        id: 'lessons_reminders',
        name: 'Lesson Reminders & Active Timers',
        description: 'Notifications for class reminders and running lesson timer',
        importance: 4, // High importance for heads up
        visibility: 1,
        sound: 'beep.wav',
        vibration: true,
      });
      isChannelCreated = true;
    } catch (err) {
      console.warn('Failed to create notification channel:', err);
    }
  }
};

export const isNotificationSupported = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;
  try {
    return typeof window !== 'undefined' && 'Notification' in window && !!window.Notification;
  } catch {
    return false;
  }
};

export const getNotificationPermission = async (): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display; // 'granted' | 'denied' | 'prompt'
    } catch {
      return 'denied';
    }
  }

  try {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
  } catch {
    return 'denied';
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (err) {
      console.warn('Failed to request native notification permissions:', err);
      return false;
    }
  }

  try {
    if (!isNotificationSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return false;
  }
};

/**
 * Updates the persistent notification for a running lesson session.
 */
export const updateActiveLessonNotification = async (data: {
  groupName: string;
  grade?: string;
  elapsedMinutes: number;
  remainingMinutes?: number;
  startTimeStr: string;
  lessonTitle: string;
  handlers?: NotificationActionHandler;
}) => {
  const { groupName, grade, elapsedMinutes, remainingMinutes, startTimeStr, lessonTitle, handlers } = data;
  const title = `📚 ${groupName}${grade ? ` (${grade})` : ''}`;
  const remText = remainingMinutes !== undefined && remainingMinutes >= 0 ? ` • ${remainingMinutes} min left` : '';
  const body = `⏱ ${elapsedMinutes} min elapsed${remText}\n🕒 Started ${startTimeStr}`;

  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999, // Constant ID for active lesson so it gets overwritten
            title,
            body,
            channelId: 'lessons_reminders',
            schedule: { at: new Date(Date.now() + 100) },
            extra: { lessonTitle, groupName },
            ongoing: true, // Keep notification persistent on Android
            autoCancel: false,
          }
        ]
      });
    } catch (err) {
      console.warn('Native notification update failed:', err);
    }
  } else {
    try {
      const perm = await getNotificationPermission();
      if (perm !== 'granted') return;

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'active-lesson-timer',
            renotify: false,
            requireInteraction: true,
            actions: [
              { action: 'end_lesson', title: '⏹ End' },
              { action: 'open_lesson', title: '📱 Open' },
              { action: 'cancel_lesson', title: '✕ Cancel' }
            ],
            data: { lessonTitle, groupName }
          } as any);
        }).catch(() => {
          fallbackStandardNotification(title, body, handlers);
        });
      } else {
        fallbackStandardNotification(title, body, handlers);
      }
    } catch (err) {
      console.warn('Could not update active notification:', err);
    }
  }

  // Also sync with MediaSession API for lock screen timer display
  updateMediaSessionLockscreen(groupName, `⏱ ${elapsedMinutes} min elapsed`, handlers);
};

const fallbackStandardNotification = (
  title: string, 
  body: string, 
  handlers?: NotificationActionHandler
) => {
  try {
    if (activeNotification) {
      try {
        activeNotification.close();
      } catch {}
    }

    activeNotification = new Notification(title, {
      body,
      tag: 'active-lesson-timer',
      icon: '/pwa-192x192.png',
      requireInteraction: true,
      silent: true
    });

    activeNotification.onclick = (e: any) => {
      try {
        if (e && e.preventDefault) e.preventDefault();
        window.focus();
        if (handlers?.onOpenLesson) handlers.onOpenLesson();
      } catch {}
    };
  } catch (err) {
    console.warn('Standard notification fallback error:', err);
  }
};

export const clearActiveLessonNotification = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
    } catch {}
  } else {
    try {
      if (activeNotification) {
        try {
          activeNotification.close();
        } catch {}
        activeNotification = null;
      }

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.getNotifications({ tag: 'active-lesson-timer' }).then(notifs => {
            notifs.forEach(n => n.close());
          }).catch(() => {});
        }).catch(() => {});
      }
    } catch {}
  }

  clearMediaSession();
};

/**
 * System notification helpers for alerts and reminders
 */
export const sendSystemNotification = async (title: string, body: string, tag: string = 'general') => {
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      const notifId = Math.floor(Math.random() * 100000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            channelId: 'lessons_reminders',
            schedule: { at: new Date(Date.now() + 100) },
          }
        ]
      });
    } catch (err) {
      console.warn('Native sendSystemNotification failed:', err);
    }
  } else {
    try {
      const perm = await getNotificationPermission();
      if (perm !== 'granted') return;

      new Notification(title, {
        body,
        tag,
        icon: '/pwa-192x192.png'
      });
    } catch (err) {
      console.warn('Browser notification error:', err);
    }
  }
};

/**
 * Schedule future local notification (e.g. for upcoming lesson reminders)
 */
export const scheduleLocalNotification = async (
  id: number,
  title: string,
  body: string,
  scheduleDate: Date
) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId: 'lessons_reminders',
            schedule: { at: scheduleDate },
          }
        ]
      });
    } catch (err) {
      console.warn('Failed to schedule native local notification:', err);
    }
  }
};

/**
 * Integrates MediaSession API so lockscreen / audio bar displays running lesson
 */
const updateMediaSessionLockscreen = (
  title: string, 
  body: string, 
  handlers?: NotificationActionHandler
) => {
  try {
    if (
      typeof window === 'undefined' || 
      !('mediaSession' in navigator) || 
      !('MediaMetadata' in window) ||
      !window.MediaMetadata
    ) {
      return;
    }

    // @ts-ignore
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title,
      artist: body,
      album: 'AGS19 Teacher App',
      artwork: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      try {
        if (handlers?.onEndLesson) handlers.onEndLesson();
      } catch {}
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      try {
        if (handlers?.onEndLesson) handlers.onEndLesson();
      } catch {}
    });
  } catch (e) {
    console.warn('MediaSession update failed:', e);
  }
};

const clearMediaSession = () => {
  try {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.setActionHandler('pause', null);
    navigator.mediaSession.setActionHandler('stop', null);
  } catch {}
};
