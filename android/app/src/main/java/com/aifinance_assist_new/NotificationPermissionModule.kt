package com.aifinance_assist_new

import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationPermissionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NotificationPermissionModule"
    }

    @ReactMethod
    fun isNotificationServiceEnabled(promise: Promise) {
        val packageName = reactApplicationContext.packageName
        val listeners = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners"
        )
        val isEnabled = listeners != null && listeners.contains(packageName)
        promise.resolve(isEnabled)
    }
}
