import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, {
  BounceInUp,
  FadeIn,
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

import "../../global.css";
import { authService } from "../../services/auth.service";

export default function OtpVerification() {
  const { email, mode } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (value && index === 3) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      await authService.resendOtp(email as string);
      setTimeLeft(180); // Reset timer to 3 minutes
      Toast.show({
        type: 'customSuccess',
        text1: 'Code renvoyé',
        text2: 'Vérifier à nouveau votre messagerie !'
      });
    } catch (error: any) {
      Toast.show({
        type: 'customError',
        text1: 'Erreur',
        text2: 'Impossible de renvoyer le code.'
      });
    }
  };

  const handleOtpVerified = async () => {
    if (isSubmitting) return;

    const otpValue = otp.join("");

    try {
      setIsSubmitting(true);
      
      if (mode === 'reset') {
        await authService.verifyResetOtp(email as string, otpValue);
        Toast.show({
          type: 'customSuccess',
          text1: 'Code validé',
          text2: 'Veuillez définir votre nouveau mot de passe.'
        });
        router.push({
          pathname: "/auth/password/password-changing",
          params: { email, otp: otpValue }
        });
      } else {
        await authService.verifyOtp(email as string, otpValue);
        Toast.show({
          type: 'customSuccess',
          text1: 'Vérification réussie',
          text2: 'Votre compte est activé !'
        });
        router.replace("/auth/login");
      }
    } catch (error: any) {
      console.error('OTP error:', error);
      Toast.show({
        type: 'customError',
        text1: 'Erreur',
        text2: error.response?.data?.message || "Code invalide."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);


  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 items-center px-6 pt-10 pb-10">
              <Animated.View
                entering={BounceInUp.duration(1000).delay(200)}
                className="items-center mt-10"
              >
                <Image
                  source={require("../../assets/images/otp.png")}
                  className="w-64 h-64"
                  resizeMode="contain"
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(400).duration(600)}
                className="items-center mt-12"
              >
                <Text className="text-primary text-[32px] font-bold text-center">
                  Vérification OTP
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-xl mt-4">
                  Veuillez entrer le code reçu dans votre adresse email
                </Text>
              </Animated.View>

              <View className="flex-row justify-center gap-4 w-full mt-10">
                {otp.map((digit, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInRight.delay(500 + index * 100).duration(
                      500
                    )}
                  >
                    <TextInput
                      keyboardType="number-pad"
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      className={`w-16 h-16 border ${
                        digit ? "border-green-500" : "border-gray-300 dark:border-gray-700"
                      } rounded-xl text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300`}
                    />
                  </Animated.View>
                ))}
              </View>

              <Animated.View
                entering={FadeIn.delay(1000)}
                className="items-center mt-12"
              >
                <View className="flex-row items-center">
                    <Text className="text-gray-400 dark:text-gray-500 text-lg">
                      Vous n'avez pas reçu le code ?{" "}
                    </Text>
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text className="text-secondary font-bold text-lg">
                        Envoyer à nouveau
                      </Text>
                    </TouchableOpacity>
                </View>
                <Text className={`mt-4 font-bold text-lg ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : "Code expiré"}
                </Text>
              </Animated.View>

              <View className="flex-1 min-h-[40px]" />

              <Animated.View
                entering={FadeInDown.delay(1100).springify()}
                className="flex-row items-center justify-between w-full"
              >
                <TouchableOpacity
                  onPress={handleOtpVerified}
                  disabled={!isOtpComplete || isSubmitting}
                  className={`flex-1 h-16 bg-primary rounded-xl flex-row items-center justify-center ${
                    !isOtpComplete || isSubmitting ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-xl mr-2">
                        Vérifier
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
    </SafeAreaView>
  );
}
