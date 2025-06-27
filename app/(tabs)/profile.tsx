// app/(tabs)/profile.tsx

import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { images } from '@/constants/images'; // Assuming you have this constant for images
import { icons } from '@/constants/icons';   // Assuming you have this constant for icons
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { user, signOut, authInitialized } = useAuth();
  const [loadingSignOut, setLoadingSignOut] = React.useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoadingSignOut(true);
    try {
      await signOut();
      Alert.alert("Signed Out", "You have been successfully signed out.");
      router.replace('/(auth)/sign-in'); // Redirect to sign-in after successful logout
    } catch (error: any) {
      Alert.alert("Sign Out Failed", error.message || "An error occurred during sign out.");
    } finally {
      setLoadingSignOut(false);
    }
  };

  // --- Initial Loading State ---
  if (!authInitialized) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-4 text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  // --- Not Authenticated State ---
  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-primary px-6 text-center">
        <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode='cover' />
        <Text className="text-xl font-bold mb-4 text-yellow-500">Access Denied</Text>
        <Text className="text-lg text-gray-300 mb-6">
          Please sign in to view your profile.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          className="bg-accent px-6 py-3 rounded-lg flex-row items-center justify-center"
        >
          <Image source={icons.login} className="w-5 h-5 mr-2" tintColor="#fff" />
          <Text className="text-white text-base font-semibold">Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Authenticated Profile View ---
  const joinDate = user.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : 'N/A';

  return (
    <View className='bg-primary relative flex-1'>
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode='cover' />
      <ScrollView
        className='flex-1 px-5'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 20,
          alignItems: 'center', // Center content horizontally
          justifyContent: 'center', // Center content vertically
        }}
      >
        <View className="w-full max-w-sm p-6 rounded-lg bg-black/50 items-center mt-10">
          {/* Avatar */}
          <Image
            source={images.default_avatar} // Assuming you have a person icon in your constants
            className="w-24 h-24 rounded-full border-2 border-yellow-500 mb-4"
          // Yellow tint for the icon
          />

          {/* User Name */}
          <Text className="text-white text-2xl font-bold mb-2">{user.name || 'User'}</Text>

          {/* User Email */}
          <Text className="text-gray-300 text-base mb-1">{user.email}</Text>

          {/* Joining Date */}
          <View className="flex-row items-center mb-6">
            <Image source={icons.calendar} className="w-4 h-4 mr-2" tintColor="#9ca3af" />
            <Text className="text-gray-400 text-sm">Joined: {joinDate}</Text>
          </View>

          {/* Sign Out Button - MODIFIED FOR OUTLINE STYLE */}
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={loadingSignOut}
            // Outline styles: border, border-color, no background color
            className="px-6 py-3 rounded-lg flex-row items-center justify-center border-2 border-accent"
          >
            {loadingSignOut ? (
              <ActivityIndicator size="small" color="#facc15" /> 
            ) : (
              <>
                <Image source={icons.logout} className="w-5 h-5 mr-2" tintColor="#facc15" />
                <Text className="text-accent text-base font-semibold">Sign Out</Text> 
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
