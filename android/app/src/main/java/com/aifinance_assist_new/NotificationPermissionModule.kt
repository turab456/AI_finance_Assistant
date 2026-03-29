package com.aifinance_assist_new

import android.content.Context
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

    @ReactMethod
    fun openNotificationSettings() {
        val intent = android.content.Intent(
            Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS
        )
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun setUserId(userId: Int) {
        val prefs = reactApplicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("user_id", userId).apply()
    }

    @ReactMethod
    fun setAuthToken(token: String) {
        val prefs = reactApplicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("auth_token", token).apply()
    }

    @ReactMethod
    fun setApiUrl(url: String) {
        val prefs = reactApplicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("api_url", url).apply()
    }
}
