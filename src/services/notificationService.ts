// Mobile Notification & MediaSession Service for Active Lesson Timers & Reminders

export interface NotificationActionHandler {
  onEndLesson?: () => void;
  onOpenLesson?: () => void;
  onCancelLesson?: () => void;
}

let activeNotification: any = null;

export const isNotificationSupported = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'Notification' in window && !!window.Notification;
  } catch {
    return false;
  }
};

export const getNotificationPermission = (): NotificationPermission => {
  try {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
  } catch {
    return 'denied';
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
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
 * Updates the native persistent notification for a running lesson session.
 */
export const updateActiveLessonNotification = (data: {
  groupName: string;
  grade?: string;
  elapsedMinutes: number;
  remainingMinutes?: number;
  startTimeStr: string;
  lessonTitle: string;
  handlers?: NotificationActionHandler;
}) => {
  try {
    if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
      return;
    }

    const { groupName, grade, elapsedMinutes, remainingMinutes, startTimeStr, lessonTitle, handlers } = data;

    const title = `📚 ${groupName}${grade ? ` (${grade})` : ''}`;
    const remText = remainingMinutes !== undefined && remainingMinutes >= 0 ? ` • ${remainingMinutes} min left` : '';
    const body = `⏱ ${elapsedMinutes} min elapsed${remText}\n🕒 Started ${startTimeStr}`;

    // If ServiceWorker registration is available and active, showNotification via SW
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

  // Also sync with MediaSession API for lock screen timer display
  updateMediaSessionLockscreen(data.groupName, `⏱ ${data.elapsedMinutes} min elapsed`, data.handlers);
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

export const clearActiveLessonNotification = () => {
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

  clearMediaSession();
};

/**
 * Integrates MediaSession API so Android lockscreen / iOS media widget displays running timer
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
      album: 'Lerne Deutsch Session',
      artwork: [
        { src: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=192&q=80', sizes: '192x192', type: 'image/jpeg' }
      ]
    });

    // Provide handlers for Media controls on lock screen
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

/**
 * System notification helpers for reminders
 */
export const sendSystemNotification = (title: string, body: string, tag: string = 'general') => {
  try {
    if (!isNotificationSupported() || getNotificationPermission() !== 'granted') return;

    new Notification(title, {
      body,
      tag,
      icon: '/pwa-192x192.png'
    });
  } catch (err) {
    console.warn('Notification error:', err);
  }
};

