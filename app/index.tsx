import { Link } from "expo-router";
import { ShoppingCart, Wallet, Truck } from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import "../global.css";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />

      <ImageBackground
        source={require("../assets/images/background-1.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 items-center justify-between py-10 px-6">
          <Animated.View
            entering={FadeInUp.duration(1000).springify()}
            className="items-center mt-6"
          >
            <View className="items-center mt-6">
              <Image
                source={require("../assets/images/icon.png")}
                className="w-40 h-40 mb-2"
                resizeMode="contain"
              />
              <Text className="font-axiforma italic text-[42px] text-secondary tracking-[-1.5px]">
                OPEN GAZ
              </Text>
              <Text className="font-bold w-80 text-[28px] text-gray-600 dark:text-gray-300 text-center mt-6 px-4">
                Commandez votre gaz en un clic
              </Text>
            </View>
          </Animated.View>

          <View className="w-full items-center mb-10 mt-28">
            <Animated.Text
              entering={FadeIn.delay(500).duration(800)}
              className="font-normal text-[21px] text-gray-500 dark:text-gray-400 mb-8"
            >
              Bienvenue ! Que désirez-vous ?
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(700).springify()}
              className="w-full items-center"
            >
              <Link href="/auth/signup-seller" asChild>
                <TouchableOpacity className="flex-row bg-primary w-full max-w-[261px] p-[16px] rounded-xl mb-4 items-center justify-center">
                  <Wallet size={26} color="white" />
                  <Text className="font-semibold text-white text-[18px] ml-3">
                    Vendre du gaz
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).springify()}
              className="w-full items-center"
            >
              <Link href="/auth/signup-consumer" asChild>
                <TouchableOpacity className="flex-row bg-primary w-full max-w-[261px] p-[16px] rounded-xl mb-4 items-center justify-center">
                  <ShoppingCart size={26} color="white" />
                  <Text className="font-semibold text-white text-[18px] ml-3">
                    Trouver du gaz
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(900).springify()}
              className="w-full items-center"
            >
              <Link href="/auth/signup-delivery" asChild>
                <TouchableOpacity className="flex-row bg-primary w-full max-w-[261px] p-[16px] rounded-xl mb-4 items-center justify-center">
                  <Truck size={26} color="white" />
                  <Text className="font-semibold text-white text-[18px] ml-3">
                    Devenir livreur
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>

          <View className="flex-row items-center ">
            <Animated.View
              entering={FadeIn.delay(1200)}
              className="flex-row items-center"
            >
              <Text className="font-regular text-gray-500 dark:text-gray-400 text-xl">
                Vous avez déjà un compte ?{" "}
              </Text>
              <Link href="/auth/login">
                <Text className="font-bold text-secondary text-xl">
                  Connectez-vous !
                </Text>
              </Link>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
