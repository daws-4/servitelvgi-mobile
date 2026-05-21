import React from 'react';
import { View } from 'react-native';

import CounterCard from '@/components/CounterCard';
import Header from '@/components/Header';

export default function MasonryScreen() {
  return (
    <>
      <Header showBackButton />
      <View className="flex-1 bg-background p-6 pt-[140px]">
        <CounterCard />
      </View>
    </>
  );
}
