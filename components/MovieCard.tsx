import { Link } from 'expo-router';
import { Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';



const { width } = Dimensions.get('window');
const cardWidth = (width - 80) / 3; // More padding to prevent overflow

const MovieCard = ({ id, poster_path, release_date, title, vote_average ,isadult,original_language}: Movie) => {
  const releaseYear = release_date ? new Date(release_date).getFullYear() : '';
  const rating = vote_average ? vote_average.toFixed(1) : '0.0';
  
  const posterUrl = poster_path 
    ? `https://image.tmdb.org/t/p/original${poster_path}`
    : 'https://placehold.co/800?text=Not+Available&font=roboto';
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity 
        className="mb-4 px-1" // Added horizontal padding
        activeOpacity={0.8}
        style={{ width: cardWidth }}
      >
        <View className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
          {/* Movie Poster Container */}
          <View 
            className="relative overflow-hidden" // Key: overflow-hidden on container
            style={{ height: cardWidth * 1.5 }}
          >
            <Image 
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
            
            {/* Rating Badge - Positioned safely inside */}
            <View className="absolute top-2 right-2 bg-black/90 px-2 py-1 rounded-lg max-w-[40px]">
              <Text className="text-yellow-400 text-[8px] font-semibold text-center">
                ⭐ {rating}
              </Text>
            </View>
            
           <View className='absolute top-2 left-2 px-2 py-1 rounded-lg max-w-[40px]'>
              <Text className='bg-yellow-300 text-xs font-bold p-1 rounded-lg'>{original_language}</Text>
            </View>
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute bottom-0 left-0 right-0 h-16"
            />
          </View>
          
          {/* Movie Info */}
          <View className="p-2 min-h-[50px]">
            <Text 
              className="text-white text-xs font-semibold leading-4 mb-1" 
              numberOfLines={1}
            >
              {title}
            </Text>
            <View className='flex-row justify-between'>
              <Text className="text-gray-400 text-[10px]">{releaseYear}</Text>
              <Text className="text-gray-400 text-[10px]">Movie</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
