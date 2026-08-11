package com.ags19.teacherapp;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetManager")
public class WidgetManagerPlugin extends Plugin {
    @PluginMethod
    public void updateWidget(PluginCall call) {
        Intent intent = new Intent(getContext(), TodayLessonsWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(getContext())
                .getAppWidgetIds(new ComponentName(getContext(), TodayLessonsWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getContext().sendBroadcast(intent);
        call.resolve();
    }
}
