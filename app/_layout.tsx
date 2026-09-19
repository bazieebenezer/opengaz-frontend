import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import Toast, { BaseToast } from "react-native-toast-message";
import { View, Text } from "react-native";
import { CheckCircle2, Truck, AlertTriangle } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { OrderProvider } from "../context/OrderContext";
import { AuthProvider } from "../context/AuthContext";

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="bg-white dark:bg-gray-800 mx-5 px-5 py-4 rounded-xl flex-row items-center shadow-xl shadow-black/10 border-l-4 border-emerald-500">
      <View className="w-14 h-14 bg-emerald-500/10 rounded-2xl items-center justify-center mr-4">
        <CheckCircle2 size={24} color="#34D399" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-extrabold text-[18px]">
          {text1}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-[14px] mt-1 leading-4">
          {text2}
        </Text>
      </View>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View className="bg-white dark:bg-gray-800 mx-5 px-5 py-4 rounded-xl flex-row items-center shadow-xl shadow-black/10 border-l-4 border-emerald-500">
      <View className="w-14 h-14 bg-emerald-500/10 rounded-2xl items-center justify-center mr-4">
        <CheckCircle2 size={24} color="#34D399" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-extrabold text-[18px]">
          {text1}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-[14px] mt-1 leading-4">
          {text2}
        </Text>
      </View>
    </View>
  ),
  customSuccess: ({ text1, text2 }: any) => (
    <View className="bg-emerald-600 mx-6 px-6 py-4 rounded-xl flex-row items-center shadow-xl shadow-emerald-500/10 border-l-4 border-secondary">
      <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4">
        <CheckCircle2 size={24} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-[17px] tracking-tight">{text1}</Text>
        <Text className="text-emerald-50 text-[13px] font-medium leading-4 mt-0.5">{text2}</Text>
      </View>
    </View>
  ),
  customError: ({ text1, text2 }: any) => (
    <View className="bg-white mx-6 px-6 py-4 rounded-xl flex-row items-center shadow-xl shadow-red-500/10 border-l-4 border-red-700">
      <View className="w-12 h-12 bg-red-700/20 rounded-full items-center justify-center mr-4">
        <AlertTriangle size={24} color="#DA4167" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-[16px]">{text1}</Text>
        <Text className="text-gray-500 text-[14px] font-medium mt-0.5">{text2}</Text>
      </View>
    </View>
  ),
  delivery: ({ text1, text2 }: any) => (
    <View className="bg-white dark:bg-gray-800 mx-5 px-5 py-4 rounded-xl flex-row items-center shadow-xl shadow-black/10 border-l-4 border-accent">
      <View className="w-14 h-14 bg-secondary/10 rounded-2xl items-center justify-center mr-4">
        <View className="p-4 bg-emerald-500/10 rounded-full">
          <CheckCircle2 size={24} color="#34D399" />
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-extrabold text-[18px]">
          {text1}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-[14px] mt-1 leading-4">
          {text2}
        </Text>
      </View>
    </View>
  ),
};

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ManropeRegular: require("../assets/fonts/Manrope-Regular.otf"),
    ManropeLight: require("../assets/fonts/Manrope-Light.otf"),
    ManropeBold: require("../assets/fonts/Manrope-Bold.otf"),
    ManropeExtraBold: require("../assets/fonts/Manrope-ExtraBold.otf"),
    ManropeMedium: require("../assets/fonts/Manrope-Medium.otf"),
    ManropeSemiBold: require("../assets/fonts/Manrope-SemiBold.otf"),
    ManropeExtraLight: require("../assets/fonts/Manrope-ExtraLight.otf"),
    Axiforma: require("../assets/fonts/Axiforma-HeavyItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function hideSplashScreen() {
      if (loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {}
      }
    }
    hideSplashScreen();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OrderProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="consumer" />
            <Stack.Screen name="seller" />
            <Stack.Screen name="delivery" />
          </Stack>
          <Toast config={toastConfig} topOffset={60} />
        </OrderProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
