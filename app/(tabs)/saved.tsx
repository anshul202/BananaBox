// app/(tabs)/saved.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { listUserMovies, deleteUserMovie, updateMovieStatus, SavedMovieDocument } from '@/services/appwrite';
import { useFocusEffect, useRouter } from 'expo-router'; // Ensures data refreshes when screen is focused
import { images } from '@/constants/images'; // Assuming you have this constant for images
import { icons } from '@/constants/icons';   // Assuming you have this constant for icons
import { Link } from 'expo-router';


export default function SavedScreen() {
  const { user, authInitialized } = useAuth();
  const [savedMovies, setSavedMovies] = useState<SavedMovieDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'watching' | 'watched' | 'unwatched'>('all');
  const router = useRouter(); // Initialize router for navigation

  const fetchUserMovies = async () => {
    if (!user) {
      setSavedMovies([]); // Clear if no user
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Pass the filterStatus to the Appwrite function if not 'all'
      const movies = await listUserMovies(user.$id, filterStatus === 'all' ? undefined : filterStatus);
      setSavedMovies(movies);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load saved movies.");
      setSavedMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect will trigger fetchUserMovies every time the screen becomes active
  useFocusEffect(
    React.useCallback(() => {
      fetchUserMovies();
    }, [user, filterStatus]) // Re-fetch when user or filter changes
  );

  const handleRemove = async (documentId: string, movieTitle: string) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove "${movieTitle}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            setLoading(true); // Indicate loading for the specific action
            try {
              await deleteUserMovie(documentId);
              // Optimistically update UI
              setSavedMovies(prev => prev.filter(m => m.$id !== documentId));
              Alert.alert("Success", "Movie removed!");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove movie.");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleChangeStatus = async (documentId: string, newStatus: 'watching' | 'watched' | 'unwatched') => {
    setLoading(true);
    try {
      const updatedDoc = await updateMovieStatus(documentId, newStatus);
      // Update the specific movie in the state
      setSavedMovies(prev => prev.map(m => m.$id === documentId ? updatedDoc : m));
      // No need for Alert here, can be handled by a toast or subtle feedback
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const renderSavedMovieItem = ({ item }: { item: SavedMovieDocument }) => {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : 'https://placehold.co/800?text=Not+Available&font=roboto';

  let statusColor = 'text-gray-400';
  switch (item.status) {
    case 'watching':
      statusColor = 'text-blue-400';
      break;
    case 'watched':
      statusColor = 'text-green-400';
      break;
    case 'unwatched':
      statusColor = 'text-red-400';
      break;
  }

  return (
    <Link
      href={`/movies/${item.movie_id}`}
      asChild
      className="mb-4"
    >
      <View className="flex-row items-center bg-black/40 rounded-lg p-3 border border-accent">
        <Image
          source={{ uri: posterUrl }}
          className=" rounded-md mr-4 bg-gray-800" // Added bg-black to fix transparency
          resizeMode="cover"
          style={{
            width:80,
            height:120
          }}
        />
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
          <Text className={`text-sm font-semibold ${statusColor}`}>
            Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>

          <View className="flex-row flex-wrap mt-2 -m-1">
            {item.status !== 'watching' && (
              <TouchableOpacity
                className="bg-blue-600 px-2 py-1 rounded-full m-1"
                onPress={() => handleChangeStatus(item.$id, 'watching')}
              >
                <Text className="text-white text-xs">Watching</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'watched' && (
              <TouchableOpacity
                className="bg-green-600 px-2 py-1 rounded-full m-1"
                onPress={() => handleChangeStatus(item.$id, 'watched')}
              >
                <Text className="text-white text-xs">Watched</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'unwatched' && (
              <TouchableOpacity
                className="bg-red-600 px-2 py-1 rounded-full m-1"
                onPress={() => handleChangeStatus(item.$id, 'unwatched')}
              >
                <Text className="text-white text-xs">Unwatched</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="bg-gray-700 px-2 py-1 rounded-full m-1"
              onPress={() => handleRemove(item.$id, item.title)}
            >
              <Text className="text-white text-xs">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Link>
  );
};

  // --- Initial Loading State ---
  if (!authInitialized) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-4 text-gray-400">Loading saved movies...</Text>
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
          Please sign in to view your saved movies.
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

  return (
    <View className='bg-primary relative flex-1'>
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode='cover' />
      <ScrollView
        className='flex-1 px-5'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 20,         }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-10 mb-5 mx-auto" />
        <Text className="text-2xl font-bold mb-4 text-yellow-500 text-center">Your Saved Movies</Text>

        <View className="flex-row justify-around mb-6 bg-black/40 rounded-lg p-2">
          {['all', 'watching', 'watched', 'unwatched'].map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-full ${filterStatus === status ? 'bg-accent' : 'bg-gray-700'}`}
            >
              <Text className={`text-sm font-semibold ${filterStatus === status ? 'text-black' : 'text-gray-300'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#facc15" className="mt-10" />
        ) : savedMovies.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Image source={icons.icon} className="w-24 h-24 mb-4" tintColor="#9ca3af" /> 
            <Text className="text-center text-gray-400 text-lg">
              {filterStatus === 'all' ? "You haven't saved any movies yet." : `No movies marked as '${filterStatus}'.`}
            </Text>
            <Text className="text-center text-gray-500 text-sm mt-2">
              Go explore and add some!
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/')} // Go to home/search
              className="mt-6 bg-accent px-6 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-black text-base font-semibold">Find Movies</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedMovies}
            keyExtractor={item => item.$id}
            renderItem={renderSavedMovieItem}
            scrollEnabled={false} // Encapsulated in ScrollView, so FlatList doesn't need its own scroll
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        )}
      </ScrollView>
    </View>
  );
}
