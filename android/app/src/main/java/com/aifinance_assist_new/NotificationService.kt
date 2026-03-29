package com.aifinance_assist_new

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
        // Basic keywords for transaction detection (e.g., bank names, UPI, Debit, Credit)
        val transactionKeywords = listOf("spent", "debited", "credited", "transaction", "UPI", "bank", "payment")
        val lowerText = text.lowercase()
        return transactionKeywords.any { lowerText.contains(it) }
    }

    private fun sendNotificationToBackend(pkg: String, title: String, text: String) {
        val url = "http://100.54.5.93/transaction/parse"
        val json = JSONObject()
        json.put("packageName", pkg)
        json.put("title", title)
        json.put("text", text)
        json.put("timestamp", System.currentTimeMillis())

        val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val request = Request.Builder()
            .url(url)
            .post(body)
            .build()

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
