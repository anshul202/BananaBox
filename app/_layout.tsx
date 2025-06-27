import { Redirect, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "./global.css"
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ActivityIndicator, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync();


const InitialLayout = () => {
  const { user, authInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is fully initialized
    if (!authInitialized) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the splash screen is still visible, hide it
    SplashScreen.hideAsync();

    // Perform the redirection based on auth status
    if (user && !inAuthGroup) {
      // User is signed in and NOT in the auth group.
      // Ensure they are in the main part of the app.
      // The default route is (tabs), so we don't need to push,
      // it will render automatically.
    } else if (!user && !inAuthGroup) {
      // User is NOT signed in and NOT in the auth group.
      // Redirect them to the sign-in page.
      router.replace('/(auth)/sign-in');
    }
  }, [authInitialized, user, segments]); // Dependencies for the effect

  // This layout defines all possible screens.
  // The useEffect above will handle redirecting the user to the correct one.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  useEffect(() => {
    // Hide navigation bar
    NavigationBar.setVisibilityAsync('hidden');
      }, []);
  
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
