import { Feather as FeatherIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';

import useThemeColors from '@/app/contexts/ThemeColors';

type FeatherIconName = keyof typeof FeatherIcons.glyphMap;

interface BottomBarProps {
  showBackButton?: boolean;
  title?: string;
  hasAvatar?: boolean;
}

export default function BottomBar({
  showBackButton = false,
  title = '',
  hasAvatar = false,
}: BottomBarProps) {
  const [activeItem, setActiveItem] = useState<FeatherIconName>('camera');

  const handleItemPress = (iconName: FeatherIconName) => {
    setActiveItem(iconName);
  };

  return (
    <View className="flex-row items-center justify-center p-4">
      <View
        style={{
          elevation: 10,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
        className="rounded-full border border-white/20 ">
        <BlurView
          tint="dark"
          intensity={10}
          className="w-[300px] flex-row items-center justify-between overflow-hidden rounded-full bg-black/50 px-1 py-1.5">
          <BottomBarItem
            icon="camera"
            title="Photo"
            isActive={activeItem === 'camera'}
            onPress={() => handleItemPress('camera')}
          />
          <BottomBarItem
            icon="video"
            title="Video"
            isActive={activeItem === 'video'}
            onPress={() => handleItemPress('video')}
          />
          <BottomBarItem
            icon="user"
            title="Portrait"
            isActive={activeItem === 'user'}
            onPress={() => handleItemPress('user')}
          />
          <BottomBarItem
            icon="moon"
            title="Night"
            isActive={activeItem === 'moon'}
            onPress={() => handleItemPress('moon')}
          />
          <BottomBarItem
            icon="clock"
            title="Timer"
            isActive={activeItem === 'clock'}
            onPress={() => handleItemPress('clock')}
          />
        </BlurView>
      </View>
    </View>
  );
}

interface BottomBarItemProps {
  icon: FeatherIconName;
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const BottomBarItem = ({ icon, title, isActive, onPress }: BottomBarItemProps) => {
  const colors = useThemeColors();
  const widthAnim = useRef(new Animated.Value(isActive ? 100 : 40)).current;
  const textOpacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: isActive ? 100 : 40,
        duration: 400,
        easing: isActive
          ? Easing.bezier(0.1, 1, 0.94, 1) // expand
          : Easing.bezier(0.1, 1, 0.94, 1),
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        // easing: isActive
        //     ? Easing.bezier(0.0, 0.0, 0.2, 1)
        //     : Easing.bezier(0.4, 0.0, 1, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, widthAnim, textOpacityAnim]);

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-full transition-all duration-300 ${isActive ? 'bg-black/40' : 'bg-black/0'} mx-[2px] overflow-hidden`}>
      <Animated.View className="flex-row items-center" style={{ width: widthAnim }}>
        <View className="h-[40px] w-[40px] items-center justify-center">
          <Feather name={icon} size={15} color="white" />
        </View>
        <Animated.View
          style={{
            opacity: textOpacityAnim,
            transform: [
              {
                translateX: textOpacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          }}>
          <Text
            className="flex-shrink-0 items-center justify-center whitespace-nowrap text-center text-xs text-white"
            numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
