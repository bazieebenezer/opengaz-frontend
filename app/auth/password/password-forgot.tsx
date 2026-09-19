import { router } from "expo-router";
import { ArrowRight, Mail as MailIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

import "../../../global.css";
import CustomInput from "../../../components/custom-input";
import { authService } from "../../../services/auth.service";

export default function ForgotPassword() {
  const [emailData, setEmailData] = useState({
    value: "",
    isValid: false,
    isTouched: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleInputChange = (text: string) => {
    const isValid = validateEmail(text);
    setEmailData({
      value: text,
      isValid: isValid,
      isTouched: true,
    });
  };

  const handleSendEmail = async () => {
    if (emailData.isValid) {
      try {
        setIsLoading(true);
        await authService.forgotPassword(emailData.value);
        
        Toast.show({
          type: 'customSuccess',
          text1: 'Code envoyé',
          text2: 'Veuillez vérifier votre boîte mail.'
        });

        router.push({
          pathname: "/auth/otp-verification",
          params: { email: emailData.value, mode: "reset" }
        });
      } catch (error: any) {
        Toast.show({
          type: 'customError',
          text1: 'Erreur',
          text2: error.response?.data?.message || "Une erreur est survenue."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <ImageBackground
        source={require("../../../assets/images/background-4.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="flex-1 px-6">
                <Animated.View
                  entering={ZoomIn.duration(800)}
                  className="self-center mt-32"
                >
                  <Image
                    source={require("../../../assets/images/lock.png")}
                    className="w-28 h-28"
                    resizeMode="contain"
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(300).duration(600)}
                  className="mt-10"
                >
                  <Text className="text-[32px] text-primary font-black text-center leading-tight">
                    Mot de passe oublié
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xl text-center mt-4 px-4">
                    Renseigner votre adresse email pour réinitialiser votre mot
                    de passe
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(500).duration(600)}
                  className="mt-12"
                >
                  <CustomInput
                    icon={MailIcon}
                    label="Email"
                    value={emailData.value}
                    onChangeText={handleInputChange}
                    isValid={emailData.isValid}
                    isTouched={emailData.isTouched}
                    errorMessage={
                      emailData.isTouched && !emailData.isValid
                        ? "Veuillez entrer une adresse email valide."
                        : undefined
                    }
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={handleSendEmail}
                    autoCapitalize="none"
                  />
                </Animated.View>

                <View className="flex-1 min-h-[40px]" />

                <Animated.View entering={FadeInUp.delay(700).springify()}>
                  <TouchableOpacity
                    onPress={handleSendEmail}
                    disabled={!emailData.isValid || isLoading}
                    activeOpacity={0.7}
                    className={`h-16 bg-primary rounded-xl flex-row items-center justify-center w-full mb-10 ${
                      !emailData.isValid || isLoading ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-[18px] mr-2">
                          Envoyer
                        </Text>
                        <ArrowRight color="white" size={24} />
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
