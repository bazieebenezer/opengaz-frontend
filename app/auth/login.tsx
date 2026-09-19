import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

import "../../global.css";
import CustomInput from "../../components/custom-input";
import { loginSchema } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";
import { useAuthDeepLink } from "../../hooks/useAuthDeepLink";

type FormDataType = {
  email: { value: string; error?: string; isTouched: boolean };
  password: { value: string; error?: string; isTouched: boolean };
};

export default function ConsumerLogin() {
  const passwordRef = useRef<TextInput>(null);
  const { login } = useAuth();
  useAuthDeepLink();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    email: { value: "", isTouched: false },
    password: { value: "", isTouched: false },
  });

  const handleInputChange = (fieldName: keyof FormDataType, value: string) => {
    const newFormData = {
      ...formData,
      [fieldName]: { ...formData[fieldName], value, isTouched: true },
    };

    const result = loginSchema.safeParse({
      email: newFormData.email.value,
      password: newFormData.password.value,
    });

    if (!result.success) {
      const fieldErrors = result.error.format();
      const fieldError = (fieldErrors as any)[fieldName]?._errors[0];
      
      setFormData({
        ...newFormData,
        [fieldName]: { ...newFormData[fieldName], error: fieldError }
      });
    } else {
      setFormData({
        ...newFormData,
        [fieldName]: { ...newFormData[fieldName], error: undefined }
      });
    }
  };

  const isFormValid = !formData.email.error && !formData.password.error && formData.email.value && formData.password.value;

  const handleLogin = async () => {
    if (isSubmitting) return;

    const result = loginSchema.safeParse({
      email: formData.email.value,
      password: formData.password.value,
    });

    if (result.success) {
      try {
        setIsSubmitting(true);
        await login(formData.email.value, formData.password.value);
        
        Toast.show({
          type: 'customSuccess',
          text1: 'Connexion réussie',
          text2: 'Bienvenue sur Open Gaz !'
        });
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Gérer le cas spécifique du livreur non validé
        if (error.response?.status === 403 && error.response?.data?.message?.includes("validation")) {
          router.replace({
            pathname: "/auth/pending-verification",
            params: { email: formData.email.value }
          });
          return;
        }

        const errorMessage = error.response?.data?.message || "Impossible de se connecter. Vérifiez vos identifiants.";
        
        Toast.show({
          type: 'customError',
          text1: 'Erreur de connexion',
          text2: errorMessage
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Erreur',
        text2: 'Veuillez vérifier vos informations.'
      });
    }
  };

  const handleGoogleLogin = async () => {
    const callbackUrl = Linking.createURL('auth-success');
    const url = `https://opengaz-backend.onrender.com/api/auth/google?mobile_redirect=${encodeURIComponent(callbackUrl)}`;
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ImageBackground
        source={require("../../assets/images/background-3.png")}
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
              <View className="px-6 pt-16 flex-1">
                <Animated.View entering={FadeInDown.duration(800).springify()}>
                  <Text className="text-[32px] mt-36 px-16 text-primary font-black text-center leading-tight tracking-[-0.5px]">
                    Connexion
                  </Text>
                  <Text className="font-normal mt-2 mb-16 text-xl text-center text-gray-500 dark:text-gray-400">
                    Ravi de vous revoir !
                  </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                  <CustomInput
                    icon={Mail}
                    label="Email"
                    value={formData.email.value}
                    onChangeText={(text: string) =>
                      handleInputChange("email", text)
                    }
                    isValid={!formData.email.error}
                    isTouched={formData.email.isTouched}
                    errorMessage={formData.email.error}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                  <CustomInput
                    ref={passwordRef}
                    icon={Lock}
                    label="Mot de passe"
                    secure
                    value={formData.password.value}
                    onChangeText={(text: string) =>
                      handleInputChange("password", text)
                    }
                    isValid={!formData.password.error}
                    isTouched={formData.password.isTouched}
                    errorMessage={formData.password.error}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeIn.delay(500)}
                  className="flex-row justify-center items-center mb-2 mt-8"
                >
                  <View className="flex-1 max-w-[18px] h-[1px] bg-gray-200 dark:bg-gray-700" />
                  <Text className="mx-2 text-gray-400 dark:text-gray-500 text-xl">
                    Ou continuer avec
                  </Text>
                  <View className="flex-1 max-w-[18px] h-[1px] bg-gray-200 dark:bg-gray-700" />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(600).duration(600)}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleGoogleLogin}
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

                <Animated.View entering={FadeIn.delay(700)}>
                  <Link href="/auth/password/password-forgot">
                    <Text className="font-normal text-primary text-lg text-center">
                      Mot de passe oublié ?
                    </Text>
                  </Link>
                </Animated.View>

                <View className="flex-1 min-h-[40px]" />

                <Animated.View
                  entering={FadeInUp.delay(800).duration(600)}
                  className="mb-10"
                >
                  <TouchableOpacity
                    onPress={handleLogin}
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
                          Se connecter
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
