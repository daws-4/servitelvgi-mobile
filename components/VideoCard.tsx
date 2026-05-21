import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, Text, Animated, Easing } from 'react-native';

interface VideoCardProps {
  videoUrl: string;
  title: string;
  description: string;
  duration: string;
  onPress?: () => void;
}

export default function VideoCard({
  videoUrl,
  title,
  description,
  duration,
  onPress,
}: VideoCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(220)).current;
  const translateYAnim = useRef(new Animated.Value(-20)).current;

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.play();
  });

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    if (newExpanded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(heightAnim, {
          toValue: 400,
          duration: 400,
          useNativeDriver: false,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateYAnim, {
          toValue: 60,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1)),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(heightAnim, {
          toValue: 220,
          duration: 350,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.cubic),
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ]).start();
    }

    if (onPress) onPress();
  };

  return (
    <Pressable
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      className="mb-4 rounded-2xl"
      onPress={handleToggle}>
      <Animated.View
        style={{
          height: heightAnim,
        }}
        className="relative w-full overflow-hidden rounded-2xl bg-secondary">
        <Animated.View style={{ opacity: fadeAnim, zIndex: 30 }}>
          <LinearGradient
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              height: '100%',
              zIndex: 30,
              padding: 16,
            }}
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}>
            <View className="flex-row justify-end">
              <Text className="rounded-full bg-black/70 px-2 py-1 text-sm text-white opacity-70">
                {duration}
              </Text>
            </View>
            <View className="flex flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-white">{title}</Text>
                <Text className="text-sm text-white opacity-90">{description}</Text>
              </View>
              <BlurView
                intensity={20}
                tint="dark"
                className="overflow-hidden rounded-full bg-black/50 p-3">
                <Feather name="play" size={20} color="white" />
              </BlurView>
            </View>
          </LinearGradient>
        </Animated.View>

        {error ? (
          <View className="absolute left-0 top-0 z-20 h-full w-full items-center justify-center">
            <View className="rounded-lg bg-red-500/10 p-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          </View>
        ) : (
          <Animated.View
            className="absolute left-0 top-0 z-10 scale-[200%]"
            style={{
              width: '100%',
              height: 500,
              top: -200,
              transform: [{ translateY: translateYAnim }],
            }}>
            <VideoView
              player={player}
              style={{ width: '100%', height: 500, transform: [{ scale: 1.5 }] }}
              allowsFullscreen
              nativeControls={false}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}
