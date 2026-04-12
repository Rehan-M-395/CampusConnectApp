import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  return enabled;
}

export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

export function setupForegroundListener() {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground Message:', remoteMessage);

    // Show alert
    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || ''
    );
  });
}

export function setupBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Message:', remoteMessage);
    // Handle background message (e.g., update local state, show notification)
    // Firebase handles showing notification automatically
  });
}

export function setupTokenRefresh(onTokenRefresh: (token: string) => void) {
  return messaging().onTokenRefresh(token => {
    console.log('Token refreshed:', token);
    onTokenRefresh(token);
  });
}