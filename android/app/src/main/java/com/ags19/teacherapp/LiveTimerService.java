package com.ags19.teacherapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class LiveTimerService extends Service {
    public static final String CHANNEL_ID = "live_timer_channel";
    public static final int NOTIFICATION_ID = 9001;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String ACTION_PAUSE = "ACTION_PAUSE";
    
    public static final String EXTRA_TITLE = "EXTRA_TITLE";
    public static final String EXTRA_START_TIME = "EXTRA_START_TIME";
    public static final String EXTRA_DURATION_MINS = "EXTRA_DURATION_MINS";
    public static final String EXTRA_ELAPSED_MINS = "EXTRA_ELAPSED_MINS";
    public static final String EXTRA_REMAINING_MINS = "EXTRA_REMAINING_MINS";
    public static final String EXTRA_PERCENT = "EXTRA_PERCENT";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopForegroundAndSelf();
                return START_NOT_STICKY;
            }

            String title = intent.getStringExtra(EXTRA_TITLE);
            if (title == null || title.trim().isEmpty()) {
                title = "Live Unterricht";
            }
            long startTime = intent.getLongExtra(EXTRA_START_TIME, System.currentTimeMillis());
            int durationMins = intent.getIntExtra(EXTRA_DURATION_MINS, 60);
            int elapsedMins = intent.getIntExtra(EXTRA_ELAPSED_MINS, 0);
            int remainingMins = intent.getIntExtra(EXTRA_REMAINING_MINS, durationMins);
            int percent = intent.getIntExtra(EXTRA_PERCENT, 0);

            Notification notification = buildNotification(title, startTime, durationMins, elapsedMins, remainingMins, percent);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (Build.VERSION.SDK_INT >= 34) {
                    try {
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
                    } catch (Exception e) {
                        startForeground(NOTIFICATION_ID, notification);
                    }
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        }
        return START_STICKY;
    }

    private Notification buildNotification(String title, long startTime, int durationMins, int elapsedMins, int remainingMins, int percent) {
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
                this,
                0,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Pause Action
        Intent pauseIntent = new Intent(this, LiveTimerService.class);
        pauseIntent.setAction(ACTION_PAUSE);
        PendingIntent pausePendingIntent = PendingIntent.getService(
                this,
                1,
                pauseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // End Action
        Intent endIntent = new Intent(this, LiveTimerService.class);
        endIntent.setAction(ACTION_STOP);
        PendingIntent endPendingIntent = PendingIntent.getService(
                this,
                2,
                endIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String progressText = elapsedMins + " min of " + durationMins + " min completed (" + percent + "%)";
        String statusText;

        if (percent >= 100) {
            statusText = "Scheduled lesson time completed";
            progressText = "100% completed • Lesson running";
        } else if (percent >= 90) {
            statusText = "⚠️ Lesson ending soon (" + remainingMins + " min left)";
        } else if (percent >= 70) {
            statusText = "Ending Soon (" + remainingMins + " min remaining)";
        } else {
            statusText = "On Track • Verbleibend: " + remainingMins + " min";
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(statusText)
                .setSubText(progressText)
                .setWhen(startTime)
                .setUsesChronometer(true)
                .setProgress(durationMins, elapsedMins > durationMins ? durationMins : elapsedMins, false)
                .setCategory(NotificationCompat.CATEGORY_NAVIGATION)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(contentIntent)
                .addAction(android.R.drawable.ic_media_pause, "Pause", pausePendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Beenden", endPendingIntent);

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Live Lesson Navigation Activity",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Google Maps style live navigation notification for active lessons and Magic Capsule");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void stopForegroundAndSelf() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                Notification celebrationNotification = new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle("Lesson Completed Successfully ✓")
                        .setContentText("Great job! Session saved successfully.")
                        .setAutoCancel(true)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .build();
                manager.notify(NOTIFICATION_ID + 1, celebrationNotification);
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        stopSelf();
    }

    @Override
    public void onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
