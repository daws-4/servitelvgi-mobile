import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Pressable, Text, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '@/app/contexts/ThemeColors';
interface SlideUpProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function SlideUp({ visible = true, onClose }: SlideUpProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [showComponent, setShowComponent] = useState(visible);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowComponent(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(0.5)),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1000,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        setShowComponent(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!showComponent) return null;

  return (
    <>
      <Animated.View
        className="absolute bottom-0 right-0 z-50 w-full p-4"
        style={{
          paddingBottom: insets.bottom,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }}>
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          className="w-full rounded-3xl border border-border bg-text p-6">
          <View className="flex-col items-center justify-start p-6">
            <Image
              source={require('@/assets/img/thomino.jpg')}
              className="mb-2 h-16 w-16 rounded-full"
            />
            <View className="flex-1 items-center">
              <Text className="text-sm text-invert opacity-50">Built by</Text>
              <Text className="text-xl font-bold text-invert">Thomino</Text>
            </View>
          </View>
          <Pressable
            className="mt-4 w-full items-center rounded-xl bg-invert py-4"
            onPress={handleClose}>
            <Text className="font-bold text-text">Close me</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}
