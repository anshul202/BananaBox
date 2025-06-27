// app/(auth)/sign-in.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { images } from '@/constants/images';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { icons } from '@/constants/icons';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='bg-primary h-full relative'>
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode='cover' />
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image source={icons.logo} resizeMode="contain" className="w-[115px] h-[35px]" />
          <Text className="text-2xl font-semibold text-white mt-10">
            Sign In to BananaFlix
          </Text>

          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={setPassword}
            otherStyles="mt-7"
            secureTextEntry
            placeholder="Enter your password"
          />

          <CustomButton
            title="Sign In"
            handlePress={handleSignIn}
            containerStyles="mt-7"
            isLoading={loading}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-regular">
              Don&apos;t have an account?
            </Text>
            <Link href="/(auth)/sign-up" className="text-lg font-semibold text-accent">
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
