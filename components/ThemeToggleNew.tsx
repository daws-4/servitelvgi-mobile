import Feather from '@expo/vector-icons/Feather';
import { useTheme } from 'app/contexts/ThemeContext';
import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, TouchableOpacity, InteractionManager } from 'react-native';

import useThemeColors from '@/app/contexts/ThemeColors';

interface ThemeToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
}

const ThemeToggleNew: React.FC<ThemeToggleProps> = ({ value, onChange, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const slideAnim = useRef(
    new Animated.Value(value !== undefined ? (value ? 0 : 0.5) : isDark ? 0 : 0.5)
  ).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePress = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newValue = value !== undefined ? !value : !isDark;
    if (onChange) {
      onChange(newValue);
    } else {
      toggleTheme();
    }
    // Animate the switch
    Animated.spring(slideAnim, {
      toValue: newValue ? 6 : 0.5,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start(() => setIsAnimating(false));
  };

  const isActive = value !== undefined ? value : isDark;

  return (
    <TouchableOpacity onPress={handlePress} className={`flex-row items-center py-1 ${className}`}>
      <View className="h-10 w-20 flex-row items-center justify-between rounded-full">
        <View className="dark:bg-dark-secondary absolute h-full w-full rounded-full bg-neutral-200" />

        {/* Sun icon on left */}
        <View className="z-10 ml-1 h-8 w-8 items-center justify-center">
          <Feather name="sun" size={16} color={isActive ? colors.icon : colors.icon} />
        </View>

        {/* Moon icon on right */}
        <View className="z-10 mr-1 h-8 w-8 items-center justify-center">
          <Feather name="moon" size={16} color={!isActive ? colors.icon : colors.icon} />
        </View>

        {/* Animated thumb */}
        <Animated.View
          style={{
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 7],
                }),
              },
            ],
            position: 'absolute',
            left: 1,
          }}
          className="dark:bg-dark-primary my-0.5 h-8 w-8 rounded-full bg-white shadow-sm"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeToggleNew;
