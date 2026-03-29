package com.aifinance_assist_new

import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class NotificationService : NotificationListenerService() {
    private val client = OkHttpClient()
    private val TAG = "NotificationService"

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        Log.d(TAG, "Notification received from: $packageName")
        Log.d(TAG, "Title: $title")
        Log.d(TAG, "Text: $text")

        // Basic parsing for transaction alerts
        if (isTransactionNotification(packageName, title, text)) {
            sendNotificationToBackend(packageName, title, text)
        }
    }

    private fun isTransactionNotification(pkg: String, title: String, text: String): Boolean {
        val transactionKeywords = listOf("spent", "debited", "credited", "transaction", "UPI", "bank", "payment")
        val lowerText = text.lowercase()
        return transactionKeywords.any { lowerText.contains(it) }
    }

    private fun getUserId(): Int {
        val prefs = applicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getInt("user_id", 1) // fallback to 1
    }

    private fun getAuthToken(): String? {
        val prefs = applicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getString("auth_token", null)
    }

    private fun getApiUrl(): String {
        val prefs = applicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getString("api_url", "http://172.20.10.14:3000") ?: "http://172.20.10.14:3000"
    }

    private fun sendNotificationToBackend(pkg: String, title: String, text: String) {
        val baseUrl = getApiUrl()
        val url = "$baseUrl/transactions/parse"
        val userId = getUserId()
        val token = getAuthToken()

        val json = JSONObject()
        json.put("user_id", userId)
        json.put("sms", text)

        val body = json.toString()
            .toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

        val requestBuilder = Request.Builder()
            .url(url)
            .post(body)

        // Attach JWT token if available
        if (token != null) {
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }

        val request = requestBuilder.build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Failed to send notification to backend: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                Log.d(TAG, "Backend response: ${response.body?.string()}")
            }
        })
    }
}
