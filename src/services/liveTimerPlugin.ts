import { registerPlugin } from '@capacitor/core';

export interface LiveTimerPluginInterface {
  /**
   * Starts the native android Foreground Service with chronometer notification for Magic Capsule / Dynamic Island
   * @param options Object containing title and initial start timestamp in milliseconds
   */
  startTimer(options: { title?: string; startTime: number }): Promise<void>;

  /**
   * Stops the native android Foreground Service and removes the notification
   */
  stopTimer(): Promise<void>;
}

const LiveTimer = registerPlugin<LiveTimerPluginInterface>('LiveTimer', {
  web: {
    startTimer: async (options) => {
      console.log('[LiveTimer Web Fallback] startTimer called:', options);
    },
    stopTimer: async () => {
      console.log('[LiveTimer Web Fallback] stopTimer called');
    },
  },
});

export default LiveTimer;
