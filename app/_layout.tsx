import { Stack } from "expo-router";
import "./global.css"
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    // Hide navigation bar
    NavigationBar.setVisibilityAsync('hidden');
    
    // Optional: Set behavior when user swipes up
    NavigationBar.setBehaviorAsync('overlay-swipe');
  }, []);
  return (<Stack>
    <Stack.Screen name="(tabs)" options={{headerShown:false}} />
    <Stack.Screen name="movies/[id]" options={{headerShown:false}} />
  </Stack>)
}
