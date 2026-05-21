import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import useThemeColors from '@/app/contexts/ThemeColors';

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString()}.00`;
};

export default function CounterCard() {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState('today');

  const todayValue = 1495;
  const yesterdayValue = 1375;

  const [displayValue, setDisplayValue] = useState(todayValue);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(todayValue);

  const duration = 500;

  const animateValue = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    const targetValue = activeTab === 'today' ? todayValue : yesterdayValue;
    const startValue = startValueRef.current;

    const currentValue = startValue + progress * (targetValue - startValue);
    setDisplayValue(Math.floor(currentValue));

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateValue);
    } else {
      setDisplayValue(targetValue);
      animationRef.current = null;
      startTimeRef.current = 0;
    }
  };

  useEffect(() => {
    startValueRef.current = displayValue;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeTab]);

  const percentageChange = activeTab === 'today' ? '+14.5%' : '+12.3%';

  const formattedValue = formatCurrency(displayValue);

  return (
    <View className="overflow-hidden rounded-2xl bg-secondary ">
      <View className="w-full p-5">
        <View className="mb-20 flex-row justify-between gap-2">
          <View className="flex-row items-center rounded-lg border border-border bg-background p-1">
            <Chip
              title="Today"
              isActive={activeTab === 'today'}
              onPress={() => setActiveTab('today')}
            />
            <Chip
              title="Yesterday"
              isActive={activeTab === 'yesterday'}
              onPress={() => setActiveTab('yesterday')}
            />
          </View>
          <Feather name="more-vertical" size={20} color={colors.icon} />
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-sm text-text opacity-50">Total sales</Text>
            <View className="w-full flex-row items-center justify-between">
              <Text className="w-[150px] text-3xl font-bold text-text">{formattedValue}</Text>
              <View className="ml-2 rounded-md border border-sky-500/20 bg-sky-500/20 px-2 py-1">
                <Text className="text-sm font-semibold text-sky-500">{percentageChange}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View className="flex-row justify-between border-t border-border bg-black/10 px-5 py-3">
        <Text className="flex-1 text-sm text-text opacity-50">This is just a fun card.</Text>
        <View className="flex-row items-center gap-4 opacity-50">
          <Feather name="chevron-right" size={20} color={colors.icon} />
        </View>
      </View>
    </View>
  );
}

const Chip = (props: any) => {
  return (
    <Pressable
      className={`rounded-md px-3 py-1 ${props.isActive ? 'bg-secondary' : ''}`}
      onPress={props.onPress}>
      <Text className={`text-xs text-text ${props.isActive ? 'text-text' : ''}`}>
        {props.title}
      </Text>
    </Pressable>
  );
};
