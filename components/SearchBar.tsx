import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface props{
  onPress?: () => void;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({onPress,value,onChangeText,placeholder}:props) => {
  return (
    <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
      <Image source={icons.search} className='size-5' resizeMode='contain' tintColor="#ab8bff" />
      <TextInput
      onPress={onPress}
      placeholder={placeholder}
      placeholderTextColor="#ab8bff"
      className='flex-1 text-white ml-3'
      value={value}
      onChangeText={onChangeText}
      />
    </View>
  )
}

export default SearchBar

