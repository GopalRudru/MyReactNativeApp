
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { incrementUnreadCount } from '../redux/slices/notificationSlice';
import { createModuleLogger } from '../../utils/logger';

const logger = createModuleLogger('NotificationServices');

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Push Notification Permission',
        message: 'We need your permission to send you notifications',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    logger.log('POST_NOTIFICATIONS permission:', granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getFcmToken();
    }
  } else if (enabled) {
    // iOS: Only get token if permission granted
    logger.log('POST_NOTIFICATIONS permission:', enabled);
    getFcmToken();
  }
}

export async function getFcmToken() {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    //logger.log('FCM Token:', fcmToken);
    // Store or send token to your backend
  } else {
    logger.warn('Failed to get FCM token');
  }
}

export function notificationListener(dispatch: any) {
  // Foreground
    messaging().onMessage(async remoteMessage => {
  // Display local notification using Notifee
  await notifee.displayNotification({
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
    },
    ios: {
      foregroundPresentationOptions: {
        alert: true,
        sound: true,
        badge: true,
      },
    },
  });
  dispatch(incrementUnreadCount());
});

  // Background/quit
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    logger.log('Background Message:', remoteMessage);
  });

  // Opened from background state
  messaging().onNotificationOpenedApp(remoteMessage => {
    dispatch(incrementUnreadCount());
    logger.log('Notification caused app to open from background:', remoteMessage);
  });

  // Opened from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        logger.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });
}
