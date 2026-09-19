import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Mail,
  Navigation,
  Phone,
  MapPin,
  User as UserIcon,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
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
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import "../../global.css";
import CustomInput from "../../components/custom-input";
import { authService } from "../../services/auth.service";

type FormDataField = { value: any; isValid: boolean; isTouched: boolean };
type FormDataType = {
  name: FormDataField;
  phone: FormDataField;
  email: FormDataField;
  address: FormDataField;
  cnibRecto: FormDataField;
  cnibVerso: FormDataField;
  latitude: FormDataField;
  longitude: FormDataField;
};

const Step1 = ({ formData, handleInputChange, getErrorMessage, inputRefs, getCurrentLocation, isLocating }: any) => (
  <View className="w-full">
    <Animated.Text
      entering={FadeIn.delay(100)}
      className="text-gray-400 dark:text-gray-500 text-center mb-8 px-4 font-normal text-lg"
    >
      Informations personnelles du livreur
    </Animated.Text>
    
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <CustomInput
        icon={UserIcon}
        label="Nom complet"
        value={formData.name.value}
        onChangeText={(text: string) => handleInputChange("name", text)}
        isValid={formData.name.isValid}
        isTouched={formData.name.isTouched}
        errorMessage={getErrorMessage("name")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["phone"]?.focus()}
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["phone"] = el)}
        icon={Phone}
        label="Numéro de téléphone"
        keyboardType="phone-pad"
        value={formData.phone.value}
        onChangeText={(text: string) => handleInputChange("phone", text)}
        isValid={formData.phone.isValid}
        isTouched={formData.phone.isTouched}
        errorMessage={getErrorMessage("phone")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["email"]?.focus()}
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(400).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["email"] = el)}
        icon={Mail}
        label="Adresse Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email.value}
        onChangeText={(text: string) => handleInputChange("email", text)}
        isValid={formData.email.isValid}
        isTouched={formData.email.isTouched}
        errorMessage={getErrorMessage("email")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["address"]?.focus()}
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(450).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["address"] = el)}
        icon={MapPin}
        label="Adresse / Secteur"
        value={formData.address.value}
        onChangeText={(text: string) => handleInputChange("address", text)}
        isValid={formData.address.isValid}
        isTouched={formData.address.isTouched}
        errorMessage={getErrorMessage("address")}
        returnKeyType="done"
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(500).duration(500)} className="mb-6">
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
              {formData.latitude.value ? "Position capturée avec succès" : "Ma position GPS actuelle *"}
            </Text>
            {formData.latitude.value && <CheckCircle2 size={20} color="#00A3E0" className="ml-2" />}
          </>
        )}
      </TouchableOpacity>
      {!formData.latitude.isValid && formData.latitude.isTouched && (
        <Text className="text-red-500 text-sm mt-2 text-center">La position GPS est obligatoire</Text>
      )}
    </Animated.View>
  </View>
);

const Step2 = ({ formData, pickImage }: any) => (
  <View className="w-full">
    <Animated.Text
      entering={FadeIn.delay(100)}
      className="text-gray-400 dark:text-gray-500 text-center mb-8 px-4 font-normal text-lg"
    >
      Pièce d'identité (CNIB)
    </Animated.Text>

    <Animated.View entering={FadeInUp.delay(200)} className="mb-4">
      <Text className="text-gray-500 dark:text-gray-400 font-semibold text-center text-[18px] mb-4">
        Photos Recto / Verso <Text className="text-secondary">*</Text>
      </Text>
      
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => pickImage("cnibRecto")}
          activeOpacity={0.7}
          className={`flex-1 h-40 rounded-xl border-2 border-dashed items-center justify-center overflow-hidden ${
            formData.cnibRecto.value 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          }`}
        >
          {formData.cnibRecto.value ? (
            <Image source={{ uri: formData.cnibRecto.value }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Camera size={32} color="#94a3b8" />
              <Text className="text-gray-400 text-sm mt-2 font-bold">RECTO</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pickImage("cnibVerso")}
          activeOpacity={0.7}
          className={`flex-1 h-40 rounded-xl border-2 border-dashed items-center justify-center overflow-hidden ${
            formData.cnibVerso.value 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          }`}
        >
          {formData.cnibVerso.value ? (
            <Image source={{ uri: formData.cnibVerso.value }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Camera size={32} color="#94a3b8" />
              <Text className="text-gray-400 text-sm mt-2 font-bold">VERSO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.View 
        entering={FadeIn.delay(400)}
        className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6"
      >
        <Text className="text-blue-800 text-[14px] font-medium text-center">
          Les photos doivent être claires et lisibles pour faciliter la validation de votre compte.
        </Text>
      </Animated.View>
    </Animated.View>
  </View>
);

export default function DeliverySignUpStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [formData, setFormData] = useState<FormDataType>({
    name: { value: "", isValid: false, isTouched: false },
    phone: { value: "", isValid: false, isTouched: false },
    email: { value: "", isValid: false, isTouched: false },
    address: { value: "", isValid: false, isTouched: false },
    cnibRecto: { value: null, isValid: false, isTouched: false },
    cnibVerso: { value: null, isValid: false, isTouched: false },
    latitude: { value: null, isValid: false, isTouched: false },
    longitude: { value: null, isValid: false, isTouched: false },
  });

  const handleInputChange = (fieldName: string, value: any) => {
    let isValid = false;
    switch (fieldName) {
      case "phone":
        isValid = /^\d{8}$/.test(value);
        break;
      case "email":
        isValid = /^[^ \s@]+@[^ \s@]+\.[^ \s@]+$/.test(value);
        break;
      case "address":
        isValid = value.trim().length > 2;
        break;
      case "cnibRecto":
      case "cnibVerso":
        isValid = value !== null;
        break;
      case "latitude":
      case "longitude":
        isValid = value !== null;
        break;
      default:
        isValid = value.trim().length > 2;
    }
    setFormData((prev) => ({
      ...prev,
      [fieldName as keyof FormDataType]: { value, isValid, isTouched: true },
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

      // Reverse geocoding to fill address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressGuess = addr.district || addr.street || addr.city || "";
        if (addressGuess && !formData.address.value) {
          handleInputChange("address", addressGuess);
        }
      }

      Toast.show({
        type: 'customSuccess',
        text1: 'Position capturée',
        text2: 'Vos coordonnées et adresse ont été enregistrées.'
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

  const pickImage = async (fieldName: "cnibRecto" | "cnibVerso") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      handleInputChange(fieldName, base64Image);
    }
  };

  const getErrorMessage = (fieldName: keyof FormDataType) => {
    const field = formData[fieldName];
    if (field.isTouched && !field.isValid) {
      if (fieldName === "phone") return "Format invalide (8 chiffres)";
      if (fieldName === "email") return "Email invalide";
      if (fieldName === "address") return "Adresse requise";
      return "Champ requis";
    }
    return undefined;
  };

  const handleSignup = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await authService.signupDelivery({
        name: formData.name.value,
        phone: formData.phone.value,
        email: formData.email.value,
        address: formData.address.value,
        cnibRecto: formData.cnibRecto.value,
        cnibVerso: formData.cnibVerso.value,
        latitude: formData.latitude.value,
        longitude: formData.longitude.value,
      });

      Toast.show({
        type: 'customSuccess',
        text1: 'Inscription initiée',
        text2: 'Veuillez vérifier le code OTP.'
      });

      router.push({
        pathname: "/auth/otp-verification",
        params: { email: formData.email.value }
      });
    } catch (error: any) {
      console.error('Signup delivery error:', error);
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

  const stepIsValid = currentStep === 1 
    ? formData.name.isValid && formData.phone.isValid && formData.email.isValid && formData.latitude.isValid && formData.address.isValid
    : formData.cnibRecto.isValid && formData.cnibVerso.isValid;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ImageBackground
        source={require("../../assets/images/background-1.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              <View className="px-6 pt-10 pb-4">
                
                <Animated.Text
                  entering={FadeInDown.duration(800)}
                  className="text-5xl font-semibold text-secondary text-center tracking-[-1.5px] mb-8 mt-8"
                >
                  Livreur
                </Animated.Text>

                <View className="flex-row items-center justify-center mb-6">
                  {[1, 2].map((step, index) => (
                    <React.Fragment key={step}>
                      <View
                        className={`w-12 h-12 rounded-full border-2 items-center justify-center ${currentStep >= step ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"}`}
                      >
                        <Text className={`text-xl font-bold ${currentStep >= step ? "text-primary" : "text-gray-300 dark:text-gray-600"}`}>
                          {step}
                        </Text>
                      </View>
                      {index < 1 && (
                        <View className={`h-[2px] w-20 ${currentStep > step ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </View>

                <Text className="text-primary text-center font-bold text-[18px]">
                  {currentStep === 1 ? "Informations personnelles" : "Documents d'identité"}
                </Text>
              </View>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                keyboardShouldPersistTaps="always"
              >
                <View>
                  {currentStep === 1 ? (
                    <Step1
                      formData={formData}
                      handleInputChange={handleInputChange}
                      getErrorMessage={getErrorMessage}
                      inputRefs={inputRefs}
                      getCurrentLocation={getCurrentLocation}
                      isLocating={isLocating}
                    />
                  ) : (
                    <Step2
                      formData={formData}
                      pickImage={pickImage}
                    />
                  )}
                </View>
              </ScrollView>

              <View className="px-6 py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <View className="flex-row items-center">
                  {currentStep > 1 && (
                    <TouchableOpacity
                      onPress={() => setCurrentStep(1)}
                      className="w-16 h-16 rounded-xl border-2 border-secondary items-center justify-center mr-4"
                    >
                      <ArrowLeft color="#FFDC82" size={32} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => currentStep === 1 ? setCurrentStep(2) : handleSignup()}
                    disabled={!stepIsValid || isSubmitting}
                    className={`h-16 bg-primary rounded-xl flex-row items-center justify-center flex-1 ${(!stepIsValid || isSubmitting) && "opacity-50"}`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-[18px] mr-2">
                          {currentStep === 2 ? "Finaliser" : "Suivant"}
                        </Text>
                        <ArrowRight color="white" size={24} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
