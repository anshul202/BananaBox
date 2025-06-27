import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';

function formatCount(rawNum?: number): string {
  const num = rawNum ?? 0; // defaults to 0 if undefined or null

  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num >= 1_000)
    return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
  return num.toString();
}
interface MovieInfoProps{
  label: string;
  value: string | number | null;
}

const MovieInfo=({label,value}:MovieInfoProps)=>(
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
  const {id}=useLocalSearchParams();
  const {data:movie,loading}=useFetch(()=>fetchMovieDetails(id as string));

  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{
        paddingBottom:80
      }}>
        <View>
          <Image source={{uri:`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className='w-full h-[500px]' resizeMode='stretch' />          
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
          <MovieInfo label='Overview' value={movie?.overview}/>
          <MovieInfo label='Genres' value={movie?.genres?.map((x)=>x.name).join(' , ')}/>
            <View className='flex flex-row justify-between w-1/2'>
          <MovieInfo label='Budget' value={'$ '+formatCount(movie?.budget)}/>
          <MovieInfo label='Revenue' value={'$ '+formatCount(movie?.revenue)}/>
            </View>
            <MovieInfo label='Production Companies' value={movie?.production_companies?.map((x)=>x.name).join('-') || 'N/A'}/>
        </View>
      </ScrollView>
      <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
        <Image source={icons.arrow} className='size-5 mr-5 mt-0.5 rotate-180' tintColor={'#fff'} />
        <Text className='text-white text-sm font-semibold '>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Page

