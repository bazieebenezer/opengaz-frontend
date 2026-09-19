import { router } from "expo-router";
import { ArrowRight, Lock, Mail, Navigation, CheckCircle2 } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";

import "../../global.css";
import CustomInput from "../../components/custom-input";
import { useAuthDeepLink } from "../../hooks/useAuthDeepLink";
import { authService } from "../../services/auth.service";

type FormDataField = { value: any; isValid: boolean; isTouched: boolean };

type FormDataType = {
  email: FormDataField;
  password: FormDataField;
  latitude: FormDataField;
  longitude: FormDataField;
};

export default function ConsumerSignUp() {
  const passwordRef = useRef<TextInput>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  useAuthDeepLink();

  const [formData, setFormData] = useState<FormDataType>({
    email: { value: "", isValid: false, isTouched: false },
    password: { value: "", isValid: false, isTouched: false },
    latitude: { value: null, isValid: true, isTouched: false },
    longitude: { value: null, isValid: true, isTouched: false },
  });

  const getErrorMessage = (fieldName: keyof FormDataType) => {
    const field = formData[fieldName];
    if (field.isTouched && !field.isValid) {
      switch (fieldName) {
        case "email":
          return "Veuillez entrer une adresse email valide.";
        case "password":
          return "Le mot de passe doit contenir au moins 8 caractères.";
        default:
          return "Ce champ n'est pas valide.";
      }
    }
    return undefined;
  };

  const validateField = (fieldName: string, value: any) => {
    let isValid = false;
    switch (fieldName) {
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case "password":
        isValid = value.length >= 8;
        break;
      case "latitude":
      case "longitude":
        isValid = true; // Optionnel
        break;
      default:
        isValid = true;
    }
    return isValid;
  };

  const handleInputChange = (fieldName: string, value: any) => {
    const isValid = validateField(fieldName, value);
    setFormData((prev) => ({
      ...prev,
      [fieldName as keyof FormDataType]: {
        ...prev[fieldName as keyof FormDataType],
        value,
        isValid,
        isTouched: true,
      },
    }));
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'customError',
          text1: 'Permission refusée',
          text2: 'Veuillez autoriser la géolocalisation pour continuer.'
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      handleInputChange("latitude", location.coords.latitude);
      handleInputChange("longitude", location.coords.longitude);

      Toast.show({
        type: 'customSuccess',
        text1: 'Position capturée',
        text2: 'Votre position a été enregistrée.'
      });
    } catch (error) {
      console.error("Location error:", error);
      Toast.show({
        type: 'customError',
        text1: 'Erreur GPS',
        text2: 'Impossible de récupérer votre position.'
      });
    } finally {
      setIsLocating(false);
    }
  };

  const isFormValid = formData.email.isValid && formData.password.isValid;

  const handleSignUp = async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await authService.signupConsumer({
        email: formData.email.value,
        password: formData.password.value,
        latitude: formData.latitude.value,
        longitude: formData.longitude.value,
      });

      Toast.show({
        type: 'customSuccess',
        text1: 'Inscription réussie',
        text2: 'Veuillez vérifier votre email.'
      });
      
      router.push({
        pathname: "/auth/otp-verification",
        params: { email: formData.email.value }
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
      
      Toast.show({
        type: 'customError',
        text1: "Erreur d'inscription",
        text2: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const url = 'https://opengaz-backend.onrender.com/api/auth/google';
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ImageBackground
        source={require("../../assets/images/background-2.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            automaticallyAdjustKeyboardInsets={true}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="px-6 pt-16 flex-1">
                <Animated.View
                  entering={FadeInDown.duration(800).springify()}
                  className="mt-16 mb-8 px-10"
                >
                  <Text className="text-[32px] font-black text-center leading-tight tracking-[-0.5px]">
                    <Text className="text-primary">Commencez avec </Text>
                    <Text className="font-axiforma italic text-secondary">
                      OPEN GAZ
                    </Text>
                  </Text>
                </Animated.View>

                <Animated.Text
                  entering={FadeIn.delay(300)}
                  className="text-gray-400 dark:text-gray-500 text-center mb-8 px-4 font-normal text-lg"
                >
                  Les champs marqués d'un astérisque{" "}
                  <Text className="text-secondary">(*)</Text> sont obligatoires
                </Animated.Text>

                <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                  <CustomInput
                    icon={Mail}
                    label="Email"
                    value={formData.email.value}
                    onChangeText={(text: string) =>
                      handleInputChange("email", text)
                    }
                    isValid={formData.email.isValid}
                    isTouched={formData.email.isTouched}
                    errorMessage={getErrorMessage("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                  <CustomInput
                    ref={passwordRef}
                    icon={Lock}
                    label="Mot de passe"
                    secure
                    value={formData.password.value}
                    onChangeText={(text: string) =>
                      handleInputChange("password", text)
                    }
                    isValid={formData.password.isValid}
                    isTouched={formData.password.isTouched}
                    errorMessage={getErrorMessage("password")}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(550).duration(600)} className="mb-6">
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={isLocating}
                    activeOpacity={0.7}
                    className={`w-full h-16 rounded-xl border-2 flex-row items-center justify-center px-4 ${
                      formData.latitude.value 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {isLocating ? (
                      <ActivityIndicator color="#00A3E0" />
                    ) : (
                      <>
                        <Navigation size={22} color={formData.latitude.value ? "#00A3E0" : "#94a3b8"} />
                        <Text className={`ml-3 font-bold text-[16px] ${formData.latitude.value ? "text-primary" : "text-gray-400"}`}>
                          {formData.latitude.value ? "Position enregistrée" : "Ma position actuelle (optionnel)"}
                        </Text>
                        {formData.latitude.value && <CheckCircle2 size={20} color="#00A3E0" className="ml-2" />}
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View
                  entering={FadeIn.delay(600)}
                  className="flex-row justify-center items-center mb-2 mt-6"
                >
                  <View className="flex-1 max-w-[18px] h-[1px] bg-gray-200 dark:bg-gray-700" />
                  <Text className="mx-2 text-gray-400 dark:text-gray-500 text-xl">
                    Ou continuer avec
                  </Text>
                  <View className="flex-1 max-w-[18px] h-[1px] bg-gray-200 dark:bg-gray-700" />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(700).duration(600)}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleGoogleSignUp}
                    className="h-16 max-w-[196px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex-row items-center justify-center w-full self-center my-4"
                  >
                    <Image
                      source={require("../../assets/images/google.png")}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                    <Text className="text-gray-500 dark:text-gray-300 font-bold text-[18px] ml-2">
                      Google
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <View className="flex-1 min-h-[40px]" />

                <Animated.View
                  entering={FadeInUp.delay(800).duration(600)}
                  className="mb-10"
                >
                  <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={!isFormValid || isSubmitting}
                    activeOpacity={0.7}
                    className={`h-16 bg-primary rounded-xl flex-row items-center justify-center w-full self-center ${
                      !isFormValid || isSubmitting ? "opacity-50" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#F8FAFC" />
                    ) : (
                      <>
                        <Text className="text-gray-50 font-bold text-[18px] mr-2">
                          S'inscrire
                        </Text>
                        <ArrowRight color="#F8FAFC" size={24} />
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
