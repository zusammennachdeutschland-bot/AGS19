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
    public static final String EXTRA_TITLE = "EXTRA_TITLE";
    public static final String EXTRA_START_TIME = "EXTRA_START_TIME";

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

            Notification notification = buildNotification(title, startTime);

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

    private Notification buildNotification(String title, long startTime) {
        Intent targetIntent = new Intent(this, MainActivity.class);
        targetIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                targetIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText("Unterricht läuft...")
                .setWhen(startTime)
                .setUsesChronometer(true)
                .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pendingIntent);

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Live Lesson Timer",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Live timer display for notification tray and Magic Capsule");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void stopForegroundAndSelf() {
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
