import { Image, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'

interface TrendingCardProps {
  movie: {
    movie_id: Number;
    title: string;
    poster_url: string;
  };
  index: number;
}

const TrendingCard = ({ movie: { movie_id, title, poster_url}, index }: TrendingCardProps) => {
  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity 
        className="w-32 relative mr-4"
        activeOpacity={0.8}
      >
        {/* Poster Image */}
        <Image
          source={{ uri: poster_url }}
          className="w-32 h-48 rounded-xl"
          resizeMode="cover"
        />
        
        {/* Magnificent Rank Number - Bottom Left */}
        <View className="absolute bottom-2 left-2">
          <MaskedView
            style={{ width: 40, height: 40 }}
            maskElement={
              <View className="flex-1 justify-center items-center">
                <Text className="text-white text-2xl font-black">
                  {index + 1}
                </Text>
              </View>
            }
          >
            {/* Gradient Background */}
            <LinearGradient
              colors={['#FF6B6B', '#FF4757']}
              style={{ width: 40, height: 40 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </MaskedView>
          
          {/* Glow Effect */}
          <View 
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              shadowColor: '#FF6B6B',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
              elevation: 10,
            }}
          />
        </View>

        {/* Title Overlay - Top */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-16 justify-start p-2 rounded-t-xl"
        >
          <Text 
            className="text-white text-xs font-semibold text-center" 
            numberOfLines={2}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  )
}

export default TrendingCard
