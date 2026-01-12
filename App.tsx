import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { AppNavigator } from './src/navigation';
import { FavoritesProvider } from './src/context';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#8B9D83',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6B6B6B',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#C4785A',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6B6B6B',
      }}
    />
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <AppNavigator />
        <Toast config={toastConfig} position="top" topOffset={60} />
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
