import { AntDesign } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import LottieView from 'lottie-react-native';
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '../contexts/ThemeColors';

import Header from '@/components/Header';
const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;

const slides = [
  {
    id: '1',
    title: 'Simple onboarding',
    image: require('@/assets/lottie/welcome-3.json'),
    description: 'Complete shopping experience',
  },
  {
    id: '2',
    title: 'Copy and paste',
    image: require('@/assets/lottie/welcome-2.json'),
    description: 'Elegant design for your shopping app',
  },
  {
    id: '3',
    title: 'Free to use',
    image: require('@/assets/lottie/welcome-1.json'),
    description: 'Easily modify themes, layouts, and state management for your app.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <>
      <Header showBackButton />
      <View className="relative flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={windowWidth} // 👈 Ensures snapping works perfectly
          renderItem={({ item }) => (
            <View style={{ width: windowWidth }} className="items-center justify-center p-6">
              <LottieView
                autoPlay
                source={item.image}
                style={{ width: windowWidth / 1.1, height: windowWidth / 1.1 }}
              />
              <Text className="mt-4 text-3xl font-bold text-text">{item.title}</Text>
              <Text className="mt-2 w-2/3 text-center text-text opacity-50">
                {item.description}
              </Text>
            </View>
          )}
          ListFooterComponent={() => <View className="h-28 w-full" />}
          keyExtractor={(item) => item.id}
        />

        <View className="mb-20 w-full flex-row  justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-px h-[2px] ${index === currentIndex ? 'w-4 bg-highlight' : 'w-4 bg-neutral-300'}`}
            />
          ))}
        </View>

        <View className="mb-global flex w-full flex-col space-y-2 px-6">
          <Pressable
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            className="flex w-full flex-row items-center justify-center rounded-full bg-white py-4">
            <Feather name="mail" size={20} color="black" />
            <Text className="ml-3 text-black">Use email</Text>
          </Pressable>
          <View className="mt-3 flex flex-row items-center justify-center gap-2">
            <Pressable className="flex flex-1 flex-row items-center justify-center rounded-full border border-border bg-black py-4">
              <AntDesign name="google" size={22} color="white" />
              <Text className="ml-3 text-white">Google login</Text>
            </Pressable>
            <Pressable className="relative flex flex-1 flex-row items-center justify-center rounded-full border border-border bg-black py-4">
              <AntDesign name="apple" size={22} color="white" />
              <Text className="ml-3 text-white">Apple ID</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
