import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '../contexts/ThemeColors';

import Header from '@/components/Header';

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const [currentDayIndex, setCurrentDayIndex] = useState(4); // Friday is active by default

  // Weather data for each day
  const weeklyWeatherData = [
    {
      day: 'Monday',
      date: 'Jun 2',
      temp: 18,
      condition: 'Cloudy',
      icon: 'cloud' as const,
      lowHigh: '15°/25°',
    },
    {
      day: 'Tuesday',
      date: 'Jun 3',
      temp: 16,
      condition: 'Rainy',
      icon: 'cloud-rain' as const,
      lowHigh: '14°/22°',
    },
    {
      day: 'Wednesday',
      date: 'Jun 4',
      temp: 22,
      condition: 'Partly Cloudy',
      icon: 'cloud' as const,
      lowHigh: '18°/28°',
    },
    {
      day: 'Thursday',
      date: 'Jun 5',
      temp: 15,
      condition: 'Stormy',
      icon: 'cloud-lightning' as const,
      lowHigh: '12°/20°',
    },
    {
      day: 'Friday',
      date: 'Jun 6',
      temp: 24,
      condition: 'Sunny',
      icon: 'sun' as const,
      lowHigh: '20°/30°',
    },
    {
      day: 'Saturday',
      date: 'Jun 7',
      temp: 26,
      condition: 'Hot',
      icon: 'sun' as const,
      lowHigh: '22°/32°',
    },
    {
      day: 'Sunday',
      date: 'Jun 8',
      temp: 21,
      condition: 'Mild',
      icon: 'cloud' as const,
      lowHigh: '18°/26°',
    },
  ];

  const currentWeather = weeklyWeatherData[currentDayIndex];

  return (
    <>
      <Header showBackButton />
      <View className="flex-1 bg-background p-6">
        <View className="mt-[105px] flex-row items-start justify-between overflow-hidden border-t border-text pt-2">
          <Text className="text-sm font-normal uppercase text-text">New York</Text>
          <AnimatedDateDisplay currentWeather={currentWeather} />
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="w-full flex-row items-center justify-between overflow-hidden">
            <AnimatedWeatherDisplay currentWeather={currentWeather} />
            <AnimatedWeatherIcon currentWeather={currentWeather} />
          </View>
          <View className="my-14 mr-auto items-start">
            <DayData icon="thermometer" data={currentWeather.lowHigh} label="Low/High Temp" />
            <DayData icon="wind" data="10km/h" label="Wind" />
            <DayData icon="droplet" data="78%" label="Humidity" />
            <DayData icon="clock" data="1013hPa" label="Pressure" />
            <DayData icon="sunrise" data="06:00" label="Sunrise" />
            <DayData icon="sunset" data="18:00" label="Sunset" />
          </View>
        </View>
        <PrecipitationChart currentDayIndex={currentDayIndex} />
      </View>
      <View className="relative w-full flex-row">
        <View
          className="flex-1 flex-row items-center justify-between border-t border-text bg-background px-6"
          style={{ paddingBottom: insets.bottom }}>
          <DayMenu
            day="Mon"
            onPress={() => setCurrentDayIndex(0)}
            isActive={currentDayIndex === 0}
          />
          <DayMenu
            day="Tue"
            onPress={() => setCurrentDayIndex(1)}
            isActive={currentDayIndex === 1}
          />
          <DayMenu
            day="Wed"
            onPress={() => setCurrentDayIndex(2)}
            isActive={currentDayIndex === 2}
          />
          <DayMenu
            day="Thu"
            onPress={() => setCurrentDayIndex(3)}
            isActive={currentDayIndex === 3}
          />
          <DayMenu
            day="Fri"
            onPress={() => setCurrentDayIndex(4)}
            isActive={currentDayIndex === 4}
          />
          <DayMenu
            day="Sat"
            onPress={() => setCurrentDayIndex(5)}
            isActive={currentDayIndex === 5}
          />
          <DayMenu
            day="Sun"
            onPress={() => setCurrentDayIndex(6)}
            isActive={currentDayIndex === 6}
          />
        </View>
        <SlidingIndicator currentDayIndex={currentDayIndex} />
      </View>
    </>
  );
}

const AnimatedDateDisplay = ({ currentWeather }: { currentWeather: any }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [displayData, setDisplayData] = useState(currentWeather);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDisplayData(currentWeather);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentWeather]);

  return (
    <Animated.View
      className="items-end"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
      <Text className="text-sm font-normal uppercase text-text">{displayData.day}</Text>
      <Text className="text-3xl font-semibold text-text">{displayData.date}</Text>
    </Animated.View>
  );
};

const AnimatedWeatherDisplay = ({ currentWeather }: { currentWeather: any }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayData, setDisplayData] = useState(currentWeather);
  const [displayTemp, setDisplayTemp] = useState(currentWeather.temp);

  useEffect(() => {
    // Animate text sliding
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDisplayData(currentWeather);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Animate temperature counter
    const startTemp = displayTemp;
    const endTemp = currentWeather.temp;

    countAnim.setValue(0);
    const listener = countAnim.addListener(({ value }) => {
      const currentTemp = Math.round(startTemp + (endTemp - startTemp) * value);
      setDisplayTemp(currentTemp);
    });

    Animated.timing(countAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    return () => {
      countAnim.removeListener(listener);
    };
  }, [currentWeather]);

  return (
    <View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
        <Text className="mb-2 text-xl font-semibold text-text">{displayData.condition}</Text>
      </Animated.View>
      <Text className="text-6xl font-bold text-text">{displayTemp}°</Text>
    </View>
  );
};

const AnimatedWeatherIcon = ({ currentWeather }: { currentWeather: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [displayIcon, setDisplayIcon] = useState(currentWeather.icon);
  const colors = useThemeColors();

  useEffect(() => {
    // Animate out: scale down, fade out, and rotate
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change icon in the middle of animation
      setDisplayIcon(currentWeather.icon);
      rotateAnim.setValue(-1);

      // Animate in: scale up, fade in, and rotate back
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentWeather]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
        opacity: fadeAnim,
      }}>
      <Feather name={displayIcon} size={60} color={colors.icon} strokeWidth={0.2} />
    </Animated.View>
  );
};

const DayMenu = ({
  day,
  isActive,
  onPress,
}: {
  day: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable onPress={onPress} className="flex-1 flex-row items-center justify-center pb-4 pt-6">
      <Text
        className={`text-xs uppercase text-text ${isActive ? 'font-medium opacity-100' : 'opacity-50'}`}>
        {day}
      </Text>
    </Pressable>
  );
};

const DayData = (props: any) => {
  const colors = useThemeColors();
  return (
    <View className="w-2/3 flex-row items-center  justify-between py-2">
      <View className="w-[140px] flex-row items-center">
        <Feather name={props.icon} size={17} color={colors.icon} strokeWidth={0.2} />
        <Text className="ml-4 text-sm font-semibold text-text">{props.data}</Text>
      </View>
      <View className="flex-1 items-start">
        <Text className="w-full text-left text-xs font-normal uppercase text-text opacity-50">
          {props.label}
        </Text>
      </View>
    </View>
  );
};

const PrecipitationChart = ({ currentDayIndex }: { currentDayIndex: number }) => {
  // Precipitation data for each day (12 hours - probability of rain %)
  const weeklyPrecipitationData = [
    [20, 25, 30, 45, 60, 75, 80, 70, 55, 40, 25, 15], // Mon
    [40, 50, 65, 80, 85, 90, 95, 85, 70, 55, 45, 35], // Tue - Rainy
    [15, 20, 25, 35, 40, 45, 50, 45, 35, 25, 20, 15], // Wed
    [60, 70, 80, 85, 90, 95, 85, 75, 65, 55, 50, 45], // Thu - Stormy
    [5, 10, 15, 20, 15, 10, 5, 0, 5, 10, 15, 10], // Fri - Sunny
    [0, 5, 10, 15, 10, 5, 0, 0, 5, 10, 5, 0], // Sat - Hot
    [25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20], // Sun - Mild
  ];

  const hours = [
    '6AM',
    '8AM',
    '10AM',
    '12PM',
    '2PM',
    '4PM',
    '6PM',
    '8PM',
    '10PM',
    '12AM',
    '2AM',
    '4AM',
  ];
  const currentData = weeklyPrecipitationData[currentDayIndex];
  const maxPrecip = Math.max(...currentData);

  return (
    <View className="mb-6">
      <View className="h-24 flex-row items-end justify-between">
        {currentData.map((precip, index) => (
          <PrecipitationBar
            key={index}
            precipitation={precip}
            height={maxPrecip > 0 ? (precip / maxPrecip) * 80 + 8 : 8}
            index={index}
            dayIndex={currentDayIndex}
          />
        ))}
      </View>
    </View>
  );
};

const PrecipitationBar = ({
  precipitation,
  height,
  index,
  dayIndex,
}: {
  precipitation: number;
  height: number;
  index: number;
  dayIndex: number;
}) => {
  const animatedHeight = useRef(new Animated.Value(8)).current; // Fixed initial value
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayPrecip, setDisplayPrecip] = useState(precipitation);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Animate bar height to new value (smooth transition)
    Animated.timing(animatedHeight, {
      toValue: height,
      duration: hasAnimated.current ? 400 : 600, // Slower on first render
      delay: hasAnimated.current ? index * 20 : index * 30, // Faster on day change
      useNativeDriver: false,
    }).start();

    // Mark as having animated after first animation
    if (!hasAnimated.current) {
      hasAnimated.current = true;
    }

    // Animate precipitation counter
    const startPrecip = displayPrecip;
    const endPrecip = precipitation;

    countAnim.setValue(0);
    const listener = countAnim.addListener(({ value }) => {
      const currentPrecip = Math.round(startPrecip + (endPrecip - startPrecip) * value);
      setDisplayPrecip(currentPrecip);
    });

    Animated.timing(countAnim, {
      toValue: 1,
      duration: 300,
      delay: hasAnimated.current ? index * 20 : index * 30,
      useNativeDriver: false,
    }).start();

    return () => {
      countAnim.removeListener(listener);
    };
  }, [height, dayIndex, precipitation]);

  // Color based on precipitation level
  const getBarColor = (precip: number) => {
    if (precip >= 70) return 'bg-text opacity-80';
    if (precip >= 40) return 'bg-text opacity-50';
    if (precip >= 20) return 'bg-text opacity-70';
    return 'bg-text opacity-90';
  };

  return (
    <View className="items-center" style={{ width: 24 }}>
      <Animated.View
        style={{
          height: animatedHeight,
          minHeight: 4,
        }}
        className={`w-3 rounded-t-sm ${getBarColor(precipitation)}`}
      />
      <Text className="mt-2 text-xs font-medium text-text">{displayPrecip}</Text>
    </View>
  );
};

const SlidingIndicator = ({ currentDayIndex }: { currentDayIndex: number }) => {
  const slideAnim = useRef(new Animated.Value(currentDayIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentDayIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentDayIndex]);

  const leftPosition = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6],
    outputRange: [
      '6.25%', // Mon center
      '18.75%', // Tue center
      '31.25%', // Wed center
      '43.75%', // Thu center
      '56.25%', // Fri center
      '68.75%', // Sat center
      '81.25%', // Sun center
    ],
  });

  return (
    <Animated.View
      className="absolute -top-px h-1 rounded-b-full bg-background"
      style={{
        width: '12.5%',
        left: leftPosition,
      }}
    />
  );
};
