package com.ags19.teacherapp;

import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LiveTimer")
public class LiveTimerPlugin extends Plugin {

    @PluginMethod
    public void startTimer(PluginCall call) {
        String title = call.getString("title", "Live Unterricht");
        Double startTimeDouble = call.getDouble("startTime");
        long startTime = startTimeDouble != null ? startTimeDouble.longValue() : System.currentTimeMillis();

        Intent intent = new Intent(getContext(), LiveTimerService.class);
        intent.setAction(LiveTimerService.ACTION_START);
        intent.putExtra(LiveTimerService.EXTRA_TITLE, title);
        intent.putExtra(LiveTimerService.EXTRA_START_TIME, startTime);

        try {
            ContextCompat.startForegroundService(getContext(), intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start LiveTimer service: " + e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void stopTimer(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), LiveTimerService.class);
            intent.setAction(LiveTimerService.ACTION_STOP);
            getContext().stopService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to stop LiveTimer service: " + e.getLocalizedMessage());
        }
    }
}
