import { AntDesign, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, Image, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '../contexts/ThemeColors';

import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface SlideData {
  id: string;
  title: string;
  image: any;
  banner: any;
  description: string;
  iconName: FeatherIconName;
  boxColor: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    title: 'Subtle parallax',
    image: require('@/assets/img/user-3.jpg'),
    banner: require('@/assets/img/thomino.jpg'),
    description: 'Welcome to the app',
    iconName: 'smartphone',
    boxColor: 'bg-pink-600',
  },
  {
    id: '2',
    title: 'Elegant design',
    image: require('@/assets/img/user-2.jpg'),
    banner: require('@/assets/img/thomino.jpg'),
    description: 'Elegant design for your marketplace app',
    iconName: 'pen-tool',
    boxColor: 'bg-violet-500',
  },
  {
    id: '3',
    title: 'Customizable & Fast',
    image: require('@/assets/img/user-1.jpg'),
    banner: require('@/assets/img/thomino.jpg'),
    description: 'Easily modify themes and layouts.',
    iconName: 'headphones',
    boxColor: 'bg-teal-500',
  },
];

export default function ParallaxScreen() {
  const colors = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;

  const translateXAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    translateXAnim.setValue(30);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <>
      <Header showBackButton />
      <View className="relative flex-1 bg-background">
        <View className="w-full flex-row justify-end px-4 pt-2">
          <ThemeToggle />
        </View>
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
            listener: handleScroll,
          })}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={windowWidth}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * windowWidth,
              index * windowWidth,
              (index + 1) * windowWidth,
            ];

            const bannerTranslateX = scrollX.interpolate({
              inputRange,
              outputRange: [-windowWidth * 0.2, 0, windowWidth * 0.2],
              extrapolate: 'clamp',
            });

            const imageTranslateX = scrollX.interpolate({
              inputRange,
              outputRange: [-windowWidth * 0.1, 0, windowWidth * 0.1],
              extrapolate: 'clamp',
            });

            const boxTranslateX = scrollX.interpolate({
              inputRange,
              outputRange: [windowWidth * 0.15, 0, -windowWidth * 0.15],
              extrapolate: 'clamp',
            });

            const isCurrentSlide = index === currentIndex;

            return (
              <View style={{ width: windowWidth }} className="items-center justify-center p-6">
                <View className="relative w-full items-center justify-center p-6">
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: -20,
                      left: 70,
                      transform: [
                        { translateX: bannerTranslateX },
                        {
                          translateX: isCurrentSlide
                            ? translateXAnim.interpolate({
                                inputRange: [0, 20],
                                outputRange: [-20, 0],
                              })
                            : 0,
                        },
                      ],
                    }}>
                    <Image
                      source={item.banner}
                      className="h-24 w-24"
                      style={{ borderRadius: 20 }}
                    />
                  </Animated.View>

                  <Animated.View
                    style={{
                      zIndex: 20,
                      transform: [
                        { translateX: imageTranslateX },
                        //{ scale: isCurrentSlide ? scaleAnim : 1 }
                      ],
                    }}>
                    <Image
                      source={item.image}
                      className="h-44 w-44 border-8 border-border"
                      style={{ borderRadius: 40 }}
                    />
                  </Animated.View>

                  <Animated.View
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: 56,
                      zIndex: 30,
                      transform: [
                        { translateX: boxTranslateX },
                        {
                          translateX: isCurrentSlide
                            ? translateXAnim.interpolate({
                                inputRange: [0, 50],
                                outputRange: [0, 0],
                              })
                            : 0,
                        },
                      ],
                    }}
                    className={`h-20 w-20 ${item.boxColor} items-center justify-center rounded-3xl border-8 border-border`}>
                    <Feather name={item.iconName} size={24} color="white" />
                  </Animated.View>
                </View>

                <Animated.View className="items-center justify-center">
                  <Text className="mt-4 text-2xl font-bold text-text">{item.title}</Text>
                  <Text className="mt-2 text-center text-text opacity-50">{item.description}</Text>
                </Animated.View>
              </View>
            );
          }}
          ListFooterComponent={() => <View className="h-28 w-full" />}
          keyExtractor={(item) => item.id}
        />

        <View className="mb-20 w-full flex-row justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${index === currentIndex ? 'w-2 bg-highlight' : 'w-2 bg-neutral-400'}`}
            />
          ))}
        </View>

        {/* Login/Signup Buttons */}
        <View className="mb-global flex w-full flex-col space-y-2 px-6">
          <View className="flex flex-row items-center justify-center gap-2">
            <Pressable
              onPress={() => router.push('/(tabs)' as any)}
              className="flex flex-1 flex-row items-center justify-center rounded-full border border-border py-4">
              <AntDesign name="google" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/login' as any)}
              className="flex w-1/4 flex-1 flex-row items-center justify-center rounded-full bg-text py-4">
              <Feather name="mail" size={20} color={colors.invert} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)' as any)}
              className="flex flex-1 flex-row items-center justify-center rounded-full border border-black border-border py-4">
              <AntDesign name="apple" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
