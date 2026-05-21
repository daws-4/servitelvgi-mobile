import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ScrollView } from 'react-native';

import Header from '@/components/Header';
import JournalCard from '@/components/JournalCard';

export default function JournalCardsScreen() {
  return (
    <>
      <Header showBackButton />
      <View className="flex-1 bg-background">
        <ScrollView className="flex-1 ">
          <View
            style={{
              //elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 5.84,
            }}
            className="space-y-6 p-6 pt-[140px]">
            <JournalCard
              title="Morning coffee ritual"
              imageUrl="https://images.unsplash.com/photo-1462917882517-e150004895fa?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              description="Started my day with a perfect cup of coffee and some quiet reflection. "
              date="Monday, Feb 12"
            />

            <JournalCard
              title="Sunset at the Beach"
              imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              description="Watched the most incredible sunset today. The colors painted across the sky."
              date="Tuesday, Feb 13"
            />

            <JournalCard
              title="Reading in the Garden"
              imageUrl="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=3086&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              description="Found the perfect spot in the garden to finish my book. The gentle breeze."
              date="Wednesday, Feb 14"
            />

            <JournalCard
              title="City Lights Adventure"
              imageUrl="https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              description="Explored the city at night and was amazed by how different everything looks when the lights come on."
              date="Thursday, Feb 15"
            />

            <JournalCard
              title="Mountain Hiking Day"
              imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              description="Conquered a challenging trail today and the view from the summit was absolutely worth every step."
              date="Friday, Feb 16"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
