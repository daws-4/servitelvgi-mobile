import React from 'react';
import { View, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomBar from '@/components/BottomBar';
import Header from '@/components/Header';

export default function VideoCardScreen() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <Header showBackButton />
      <ImageBackground
        style={{
          paddingBottom: insets.bottom,
          flex: 1,
          alignContent: 'flex-end',
          justifyContent: 'flex-end',
        }}
        source={{
          uri: 'https://images.unsplash.com/photo-1511860810434-a92f84c6f01e?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        }}
        className="flex-1">
        <CameraButton />
        <BottomBar />
      </ImageBackground>
    </>
  );
}

const CameraButton = () => {
  return (
    <View className="mx-auto h-20 w-20 items-center justify-center rounded-full border border-white p-2">
      <View
        style={{
          elevation: 10,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
        className="h-full w-full items-center justify-center  rounded-full bg-white"
      />
    </View>
  );
};
