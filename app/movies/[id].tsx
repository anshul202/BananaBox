// app/movies/[id].tsx

import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';

// --- NEW IMPORTS FOR SAVED MOVIE FUNCTIONALITY ---
import { useAuth } from '@/context/AuthContext';
import { saveUserMovie, deleteUserMovie, getUserMovieStatus, SavedMovieDocument } from '@/services/appwrite';
// --- END NEW IMPORTS ---

function formatCount(rawNum?: number): string {
  const num = rawNum ?? 0; // defaults to 0 if undefined or null

  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num >= 1_000)
    return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
  return num.toString();
}

interface MovieInfoProps {
  label: string;
  value: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm mt-2'>
      {label}
    </Text>
    <Text className='text-light-200 font-bold text-sm mt-2 '>
      {value || 'N/A'}
    </Text>
  </View>
)

const Page = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));

  // --- NEW STATE AND HOOKS FOR SAVED MOVIE FUNCTIONALITY ---
  const { user } = useAuth();
  const [savedDoc, setSavedDoc] = useState<SavedMovieDocument | null>(null);
  const [isSaving, setIsSaving] = useState(true); 
  // Start true to show loading while we check

  useEffect(() => {
    // This function checks if the movie is already in the user's saved list
    const checkSavedStatus = async () => {
      if (user && movie) {
        try {
          const statusDoc = await getUserMovieStatus(user.$id, movie.id);
          setSavedDoc(statusDoc);
        } catch (error) {
          console.error("Failed to check saved status:", error);
          setSavedDoc(null);
        } finally {
          setIsSaving(false); // Stop loading after the check is complete
        }
      } else {
        setIsSaving(false); // Also stop loading if there's no user or movie
      }
    };
    checkSavedStatus();
  }, [user, movie]); // Re-run this check if the user logs in or the movie data loads

  const handleSaveToggle = async () => {
    if (!user) {
      Alert.alert("Please sign in", "You need to be logged in to save movies.");
      return;
    }
    if (!movie) return; // Can't save if movie data isn't loaded

    setIsSaving(true);
    try {
      if (savedDoc) {
        // If it's already saved, we unsave (delete) it
        await deleteUserMovie(savedDoc.$id);
        setSavedDoc(null);
        Alert.alert("Success", "Movie removed from your list!");
      } else {
        // If it's not saved, we save (create) it
        // We cast the `movie` (MovieDetails) to `Movie` as they share the necessary fields
        const newSavedDoc = await saveUserMovie(user.$id, movie as Movie, 'unwatched');
        setSavedDoc(newSavedDoc);
        Alert.alert("Success", "Movie saved to your list!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };
  // --- END NEW STATE AND HOOKS ---

  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{
        paddingBottom: 80
      }}>
        <View>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }} className='w-full h-[500px]' resizeMode='stretch' />
        </View>
        <View className='flex-col items-start justify-center mt-5 px-5'>
          <Text className='font-bold text-white text-xl'>{movie?.title}</Text>
          <View className='flex-row items-center gap-x-1 mt-2 '>
            <Text className='text-light-200 text-sm'>{movie?.release_date?.split("-")[0]}</Text>
            <Text className='text-light-200 text-sm'>|</Text>
            <Text className='text-light-200 text-sm'>{movie?.runtime} min</Text>
          </View>
          <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
            <Image source={require('@/assets/icons/star.png')} className='size-4' />
            <Text className='text-light-200 text-sm'>{movie?.vote_average.toFixed(1)}</Text>
            <Text className='text-light-100 text-xs'>({formatCount(movie?.vote_count)})</Text>
          </View>
          <MovieInfo label='Overview' value={movie?.overview} />
          <MovieInfo label='Genres' value={movie?.genres?.map((x) => x.name).join(' , ')} />
          <View className='flex flex-row justify-between w-1/2'>
            <MovieInfo label='Budget' value={'$ ' + formatCount(movie?.budget)} />
            <MovieInfo label='Revenue' value={'$ ' + formatCount(movie?.revenue)} />
          </View>
          <MovieInfo label='Production Companies' value={movie?.production_companies?.map((x) => x.name).join('-') || 'N/A'} />
        </View>
      </ScrollView>

      {/* --- NEW SAVE BUTTON --- */}
      {user && ( // Only show the button if the user is logged in
        <TouchableOpacity
          className='absolute top-5 right-5 z-50 bg-black/50 w-12 h-12 rounded-full flex items-center justify-center'
          onPress={handleSaveToggle}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Image
              source={savedDoc ? icons.save_filled : icons.save} // Assuming you have 'save' and 'save_filled' icons
              className='w-6 h-6'
              tintColor={savedDoc ? '#FFD700' : '#FFFFFF'} // Example: Gold when saved, White when not
              resizeMode='contain'
            />
          )}
        </TouchableOpacity>
      )}
      {/* --- END NEW SAVE BUTTON --- */}

      <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
        <Image source={icons.arrow} className='size-5 mr-5 mt-0.5 rotate-180' tintColor={'#fff'} />
        <Text className='text-white text-sm font-semibold '>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Page