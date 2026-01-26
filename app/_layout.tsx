import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import {
  Raleway_600SemiBold,
} from '@expo-google-fonts/raleway';

import {
  Poppins_400Regular,
  Poppins_500Medium,
} from '@expo-google-fonts/poppins';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Raleway: Raleway_600SemiBold,
    'Raleway-SemiBold': Raleway_600SemiBold,

    Poppins: Poppins_400Regular,
    'Poppins-Regular': Poppins_400Regular,

    'Poppins-Medium': Poppins_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
    </Stack>
    </SafeAreaProvider>
  );
}