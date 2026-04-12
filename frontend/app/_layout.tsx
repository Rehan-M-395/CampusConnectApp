import { Stack } from 'expo-router';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

import {
  requestNotificationPermission,
  getFCMToken,
  setupForegroundListener
} from '../services/notificationService';


// 🔥🔥 VERY IMPORTANT (OUTSIDE COMPONENT)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Message:', remoteMessage);
});


export default function RootLayout() {

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initNotifications() {
      console.log("App started");

      const granted = await requestNotificationPermission();

      if (granted) {
        const token = await getFCMToken();
        console.log("Device Token:", token);
      }

      unsubscribe = setupForegroundListener();
    }

    initNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}