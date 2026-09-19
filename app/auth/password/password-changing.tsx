import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, KeyRound, Lock } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
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

export default function ResetPassword() {
  const { email, otp } = useLocalSearchParams();
  const confirmPasswordRef = useRef<TextInput>(null);

  const [passwordData, setPasswordData] = useState({
    password: { value: "", isTouched: false },
    confirmPassword: { value: "", isTouched: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);


  const isPasswordLengthValid = passwordData.password.value.length >= 8;
  const doPasswordsMatch =
    passwordData.password.value === passwordData.confirmPassword.value &&
    passwordData.confirmPassword.value !== "";

  const isFormValid = isPasswordLengthValid && doPasswordsMatch;

  const handleInputChange = (
    field: "password" | "confirmPassword",
    text: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: { value: text, isTouched: true },
    }));
  };

  const handleResetSubmit = async () => {
    if (isFormValid) {
      try {
        setIsSubmitting(true);
        await authService.resetPassword({
          email: email as string,
          otp: otp as string,
          password: passwordData.password.value,
        });

        Toast.show({
          type: 'customSuccess',
          text1: 'Succès',
          text2: 'Votre mot de passe a été réinitialisé.'
        });

        router.replace("/auth/login");
      } catch (error: any) {
        Toast.show({
          type: 'customError',
          text1: 'Erreur',
          text2: error.response?.data?.message || "Une erreur est survenue."
        });
      } finally {
        setIsSubmitting(false);
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
                    Nouveau mot de passe
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xl text-center mt-4 px-4">
                    Veuillez définir votre nouveau mot de passe pour sécuriser votre compte
                  </Text>
                </Animated.View>

                <View className="mt-12 gap-y-4">
                  <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                    <CustomInput
                      icon={KeyRound}
                      label="Nouveau mot de passe"
                      secure
                      value={passwordData.password.value}
                      onChangeText={(text: string) =>
                        handleInputChange("password", text)
                      }
                      isValid={isPasswordLengthValid}
                      isTouched={passwordData.password.isTouched}
                      errorMessage={
                        passwordData.password.isTouched &&
                        !isPasswordLengthValid
                          ? "Le mot de passe doit contenir au moins 8 caractères."
                          : undefined
                      }
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                      blurOnSubmit={false}
                    />
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(650).duration(600)}>
                    <CustomInput
                      ref={confirmPasswordRef}
                      icon={Lock}
                      label="Confirmer le mot de passe"
                      secure
                      value={passwordData.confirmPassword.value}
                      onChangeText={(text: string) =>
                        handleInputChange("confirmPassword", text)
                      }
                      isValid={doPasswordsMatch}
                      isTouched={passwordData.confirmPassword.isTouched}
                      errorMessage={
                        passwordData.confirmPassword.isTouched &&
                        !doPasswordsMatch
                          ? "Les mots de passe ne sont pas identiques."
                          : undefined
                      }
                      returnKeyType="done"
                      onSubmitEditing={handleResetSubmit}
                    />
                  </Animated.View>
                </View>

                <View className="flex-1 min-h-[40px]" />

                <Animated.View entering={FadeInUp.delay(800).springify()}>
                  <TouchableOpacity
                    onPress={handleResetSubmit}
                    disabled={!isFormValid || isSubmitting}
                    activeOpacity={0.7}
                    className={`h-16 bg-primary rounded-xl flex-row items-center justify-center w-full mb-10 ${
                      !isFormValid || isSubmitting ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-[18px] mr-2">
                          Mettre à jour
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
