package com.customermobapp.avanse

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import com.customermobapp.avanse.MainActivity
import com.customermobapp.avanse.R

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        //Log.d("FCM", "From: ${remoteMessage.from}")

        if (remoteMessage.data.isNotEmpty()) {
            //Log.d("FCM", "Message data payload: ${remoteMessage.data}")
            // Handle data message here
        }

        remoteMessage.notification?.let {
            //Log.d("FCM", "Message Notification Body: ${it.body}")
            // Handle notification message here
        }

        val title = remoteMessage.notification?.title
        val message = remoteMessage.notification?.body

        // For data-only messages, extract from remoteMessage.data
        if (remoteMessage.data.isNotEmpty()) {
            val dataTitle = remoteMessage.data["title"]
            val dataMessage = remoteMessage.data["message"]
            showNotification(this, dataTitle, dataMessage)
        } else {
            showNotification(this, title, message)
        }
    }

    override fun onNewToken(token: String) {
        //Log.d("FCM", "Refreshed token: $token")
        // Send token to your server if needed
    }

    private fun showNotification(context: Context, title: String?, message: String?) {
        val channelId = "default_channel_id"
        val channelName = "Default Channel"
        Log.d("FCM", "title: ${title}, message: ${message}")

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create channel only on API 26+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel description"
                enableLights(true)
                lightColor = Color.RED
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Intent to open app when notification is tapped
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notificationBuilder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher) 
            .setContentTitle(title ?: "Notification")
            .setContentText(message ?: "")
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Show notification
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
        //Log.d("FCM", "Notification shown with title: $title and message: $message")
    }
}