import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/appwrite";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: movies,
    loading: moviesLoading,
    refetch: loadMovies,
    reset,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: searchQuery }), true);
  // console.log(movies[0])

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
        if(movies?.length > 0 && movies?.[0]){
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
      }
    }, 500);
    return () => {
      clearTimeout(timeOutId);
    };
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="Search Movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

            {moviesLoading && (
              <ActivityIndicator
                size={"large"}
                color="#0000ff"
                className="my-3"
              />
            )}
            {moviesError && (
              <Text className="text-red-500 px-5 my-3">
                Error : {moviesError.message}
              </Text>
            )}
            {!moviesLoading &&
              !moviesError &&
              searchQuery.trim() &&
              movies?.length > 0 && (
                <Text className="text-accent">
                  Search Results for:
                  <Text className="text-white text-sm font-semibold mt-5 mb-3">
                    {" "}
                    {searchQuery}
                  </Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={() =>
          !moviesLoading && !moviesError && searchQuery.trim() ? (
            <View className="flex-1 justify-center items-center py-20 px-8">
              {/* Icon or illustration */}
              <View className="w-20 h-20 bg-gray-800 rounded-full justify-center items-center mb-6">
                <Text className="text-4xl">🔍</Text>
              </View>

              {/* Main message */}
              <Text className="text-gray-400 text-lg font-medium text-center mb-2">
                No results found
              </Text>

              {/* Search query */}
              <Text className="text-gray-500 text-base text-center mb-4">
                for "{searchQuery}"
              </Text>

              {/* Suggestion text */}
              <Text className="text-gray-600 text-sm text-center leading-5 max-w-xs">
                Try adjusting your search terms or check the spelling
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
