import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  Navigation,
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
  shopName: FormDataField;
  neighborhood: FormDataField;
  landmark: FormDataField;
  phone: FormDataField;
  email: FormDataField;
  password: FormDataField;
  openingTime: FormDataField;
  closingTime: FormDataField;
  description: FormDataField;
  shopImage: FormDataField;
  selectedGases: FormDataField;
  latitude: FormDataField;
  longitude: FormDataField;
};

const GAS_TYPES = [
  { id: "sodigaz-6", name: "Sodigaz 6kg", brand: "Sodigaz" },
  { id: "sodigaz-12", name: "Sodigaz 12kg", brand: "Sodigaz" },
  { id: "oryx-6", name: "Oryx 6kg", brand: "Oryx" },
  { id: "oryx-12", name: "Oryx 12kg", brand: "Oryx" },
  { id: "total-6", name: "Total 6kg", brand: "Total" },
  { id: "total-12", name: "Total 12kg", brand: "Total" },
];

const Step1 = ({
  formData,
  handleInputChange,
  getErrorMessage,
  inputRefs,
  pickImage,
  getCurrentLocation,
  isLocating,
}: any) => (
  <View className="w-full bg-transparent">
    <Animated.Text
      entering={FadeIn.delay(100)}
      className="text-gray-400 dark:text-gray-500 text-center mb-8 px-4 font-normal text-lg"
    >
      Les champs marqués d'un astérisque{" "}
      <Text className="text-secondary">(*)</Text> sont obligatoires
    </Animated.Text>
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <CustomInput
        icon={Building2}
        label="Nom de la boutique"
        value={formData.shopName.value}
        onChangeText={(text: string) => handleInputChange("shopName", text)}
        isValid={formData.shopName.isValid}
        isTouched={formData.shopName.isTouched}
        errorMessage={getErrorMessage("shopName")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["neighborhood"]?.focus()}
      />
    </Animated.View>
    


    <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["neighborhood"] = el)}
        icon={MapPin}
        label="Quartier / Secteur"
        value={formData.neighborhood.value}
        onChangeText={(text: string) => handleInputChange("neighborhood", text)}
        isValid={formData.neighborhood.isValid}
        isTouched={formData.neighborhood.isTouched}
        errorMessage={getErrorMessage("neighborhood")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["landmark"]?.focus()}
      />
    </Animated.View>
    <Animated.View entering={FadeInDown.delay(350).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["landmark"] = el)}
        icon={AlignLeft}
        label="Point de repère"
        optional={true}
        placeholder="ex: Face à l'église"
        value={formData.landmark.value}
        onChangeText={(text: string) => handleInputChange("landmark", text)}
        isValid={formData.landmark.isValid}
        isTouched={formData.landmark.isTouched}
        errorMessage={getErrorMessage("landmark")}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />
    </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
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

    <Animated.View entering={FadeInUp.delay(500)} className="mt-6 mb-4">
      <Text className="text-gray-500 dark:text-gray-400 font-semibold text-center text-[18px] mb-4">
        Photo de la boutique <Text className="text-secondary">*</Text>
      </Text>
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.7}
        className={`w-full h-48 rounded-xl border-2 border-dashed items-center justify-center overflow-hidden ${
          formData.shopImage.value 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        }`}
      >
        {formData.shopImage.value ? (
          <Image 
            source={{ uri: formData.shopImage.value }} 
            className="w-full h-full" 
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <Camera size={40} color="#94a3b8" />
            <Text className="text-gray-400 mt-2 font-medium">Ajouter une photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {formData.shopImage.isTouched && !formData.shopImage.isValid && (
        <Text className="text-red-500 text-sm mt-2 text-center">La photo est obligatoire</Text>
      )}
    </Animated.View>
  </View>
);

const Step2 = ({
  formData,
  handleInputChange,
  getErrorMessage,
  inputRefs,
}: any) => (
  <View className="w-full bg-transparent">
    <Animated.Text
      entering={FadeIn.delay(100)}
      className="text-gray-400 dark:text-gray-500 text-center mb-8 px-4 font-normal text-lg"
    >
      Les informations du responsable
    </Animated.Text>
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <CustomInput
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
    <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["email"] = el)}
        icon={Mail}
        label="Email"
        keyboardType="email-address"
        value={formData.email.value}
        onChangeText={(text: string) => handleInputChange("email", text)}
        isValid={formData.email.isValid}
        isTouched={formData.email.isTouched}
        errorMessage={getErrorMessage("email")}
        returnKeyType="next"
        onSubmitEditing={() => inputRefs.current["password"]?.focus()}
      />
    </Animated.View>
    <Animated.View entering={FadeInDown.delay(400).duration(500)}>
      <CustomInput
        ref={(el: any) => (inputRefs.current["password"] = el)}
        icon={Lock}
        label="Mot de passe"
        secure
        value={formData.password.value}
        onChangeText={(text: string) => handleInputChange("password", text)}
        isValid={formData.password.isValid}
        isTouched={formData.password.isTouched}
        errorMessage={getErrorMessage("password")}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />
    </Animated.View>
  </View>
);

const Step3 = ({
  formData,
  handleInputChange,
  getErrorMessage,
  inputRefs,
  toggleGasSelection,
}: any) => (
  <View className="w-full bg-transparent">
    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <CustomInput
            icon={Clock}
            label="Ouverture"
            placeholder="08:00"
            value={formData.openingTime.value}
            onChangeText={(text: string) => handleInputChange("openingTime", text)}
            isValid={formData.openingTime.isValid}
            isTouched={formData.openingTime.isTouched}
            errorMessage={getErrorMessage("openingTime")}
            returnKeyType="next"
            onSubmitEditing={() => inputRefs.current["closingTime"]?.focus()}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            ref={(el: any) => (inputRefs.current["closingTime"] = el)}
            icon={Clock}
            label="Fermeture"
            placeholder="20:00"
            value={formData.closingTime.value}
            onChangeText={(text: string) => handleInputChange("closingTime", text)}
            isValid={formData.closingTime.isValid}
            isTouched={formData.closingTime.isTouched}
            errorMessage={getErrorMessage("closingTime")}
            returnKeyType="next"
            onSubmitEditing={() => inputRefs.current["description"]?.focus()}
          />
        </View>
      </View>
    </Animated.View>

    <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
      <Text className="text-gray-500 dark:text-gray-400 font-semibold text-center text-[18px] mb-4">
        Types de gaz vendus <Text className="text-secondary">*</Text>
      </Text>
      <View className="flex-row flex-wrap justify-center gap-3">
        {GAS_TYPES.map((gas) => {
          const isSelected = formData.selectedGases.value.includes(gas.id);
          return (
            <TouchableOpacity
              key={gas.id}
              onPress={() => toggleGasSelection(gas.id)}
              activeOpacity={0.7}
              className={`px-4 py-3 rounded-xl border flex-row items-center ${
                isSelected 
                  ? "bg-primary/10 border-primary" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text className={`font-bold mr-2 ${isSelected ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                {gas.name}
              </Text>
              {isSelected && <CheckCircle2 size={16} color="#00A3E0" />}
            </TouchableOpacity>
          );
        })}
      </View>
      {formData.selectedGases.isTouched && !formData.selectedGases.isValid && (
        <Text className="text-red-500 text-sm mt-2 text-center">Sélectionnez au moins un type de gaz</Text>
      )}
    </Animated.View>

    <Animated.View
      entering={FadeInDown.delay(300).duration(500)}
      className="w-full mb-5"
    >
      <Text className="text-gray-500 dark:text-gray-400 font-semibold text-center text-[18px] mb-2">
        Décrivez votre boutique{" "}
        <Text className="text-gray-400 dark:text-gray-500">(optionnel)</Text>
      </Text>
      <View className="flex-row border-2 border-gray-300 dark:border-gray-700 rounded-xl px-4 py-4 min-h-[120px] bg-white dark:bg-gray-800">
        <AlignLeft size={22} color="#94a3b8" />
        <TextInput
          ref={(el) => {
            inputRefs.current["description"] = el;
          }}
          multiline
          className="flex-1 ml-3 font-manrope text-2xl text-gray-500 dark:text-gray-300 pt-0"
          value={formData.description.value}
          onChangeText={(text) => handleInputChange("description", text)}
          textAlignVertical="top"
          blurOnSubmit={false}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </Animated.View>
  </View>
);

export default function SellerSignUpStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [formData, setFormData] = useState<FormDataType>({
    shopName: { value: "", isValid: false, isTouched: false },
    neighborhood: { value: "", isValid: false, isTouched: false },
    landmark: { value: "", isValid: true, isTouched: false },
    phone: { value: "", isValid: false, isTouched: false },
    email: { value: "", isValid: false, isTouched: false },
    password: { value: "", isValid: false, isTouched: false },
    openingTime: { value: "", isValid: false, isTouched: false },
    closingTime: { value: "", isValid: false, isTouched: false },
    description: { value: "", isValid: true, isTouched: false },
    shopImage: { value: null, isValid: false, isTouched: false },
    selectedGases: { value: [], isValid: false, isTouched: false },
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
      case "password":
        isValid = value.length >= 8;
        break;
      case "shopImage":
        isValid = value !== null;
        break;
      case "selectedGases":
        isValid = value.length > 0;
        break;
      case "landmark":
      case "description":
        isValid = true;
        break;
      case "latitude":
      case "longitude":
        isValid = value !== null;
        break;
      case "openingTime":
      case "closingTime":
        isValid = /^([01]?[0-9]|2[0-3])[:h][0-5][0-9]$/.test(value.toLowerCase());
        break;
      default:
        isValid = value.trim().length > 0;
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

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const neighborhoodGuess = address.district || address.street || "";
        if (neighborhoodGuess && !formData.neighborhood.value) {
          handleInputChange("neighborhood", neighborhoodGuess);
        }
      }

      Toast.show({
        type: 'customSuccess',
        text1: 'Position capturée',
        text2: 'Vos coordonnées ont été enregistrées.'
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true, // Demander le base64
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      handleInputChange("shopImage", base64Image);
    }
  };

  const toggleGasSelection = (gasId: string) => {
    const currentSelection = [...formData.selectedGases.value];
    const index = currentSelection.indexOf(gasId);
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(gasId);
    }
    handleInputChange("selectedGases", currentSelection);
  };

  const getErrorMessage = (fieldName: keyof FormDataType) => {
    const field = formData[fieldName];
    if (field.isTouched && !field.isValid) {
      if (fieldName === "password") return "Minimum 8 caractères";
      if (fieldName === "phone") return "Format invalide (8 chiffres)";
      if (fieldName === "openingTime" || fieldName === "closingTime") return "Format invalide (ex: 08:00)";
      return "Champ requis";
    }
    return undefined;
  };

  const handleSignup = async () => {
    if (isSubmitting) return;

    const fullAddress = `${formData.neighborhood.value} (${formData.landmark.value})`;
    const fullHours = `${formData.openingTime.value} - ${formData.closingTime.value}`;

    const dataToSubmit = {
      shopName: formData.shopName.value,
      address: fullAddress,
      neighborhood: formData.neighborhood.value,
      landmark: formData.landmark.value,
      phone: formData.phone.value,
      email: formData.email.value,
      password: formData.password.value,
      openingHours: fullHours,
      openingTime: formData.openingTime.value,
      closingTime: formData.closingTime.value,
      description: formData.description.value,
      shopImage: formData.shopImage.value,
      selectedGases: formData.selectedGases.value,
      name: formData.shopName.value, 
      latitude: formData.latitude.value,
      longitude: formData.longitude.value,
    };

    try {
      setIsSubmitting(true);
      await authService.signupSeller(dataToSubmit);

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
      console.error('Signup seller error:', error);
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

  const stepIsValid = (() => {
    if (currentStep === 1)
      return (
        formData.shopName.isValid && 
        formData.neighborhood.isValid && 
        formData.latitude.isValid &&
        formData.shopImage.isValid
      );
    if (currentStep === 2)
      return (
        formData.phone.isValid &&
        formData.email.isValid &&
        formData.password.isValid
      );
    return (
      formData.openingTime.isValid && 
      formData.closingTime.isValid && 
      formData.selectedGases.isValid
    );
  })();

  const stepsInfo = [
    "Informations de la boutique",
    "Informations du responsable",
    "Finalisation",
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* FIXED HEADER */}
            <View className="px-6 pt-10 pb-4">
              <Animated.Text
                entering={FadeInDown.duration(800)}
                className="text-5xl font-semibold text-secondary text-center tracking-[-1.5px] mb-8"
              >
                Revendeur
              </Animated.Text>

              <View className="flex-row items-center justify-center mb-4">
                {[1, 2, 3].map((step, index) => (
                  <React.Fragment key={step}>
                    <View
                      className={`w-14 h-14 rounded-full border items-center justify-center ${currentStep >= step ? "border-primary" : "border-gray-300 dark:border-gray-700"}`}
                    >
                      <Text
                        className={`text-2xl font-medium ${currentStep >= step ? "text-primary" : "text-gray-300 dark:text-gray-600"}`}
                      >
                        {step}
                      </Text>
                    </View>
                    {index < 2 && (
                      <View
                        className={`h-[1px] w-12 ${currentStep > step ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>

              <Text className="text-primary text-center font-semibold text-[16px] mb-2 px-10">
                {stepsInfo[currentStep - 1]}
              </Text>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 40,
              }}
              keyboardShouldPersistTaps="always"
            >
              <View key={currentStep}>
                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    handleInputChange={handleInputChange}
                    getErrorMessage={getErrorMessage}
                    inputRefs={inputRefs}
                    pickImage={pickImage}
                    getCurrentLocation={getCurrentLocation}
                    isLocating={isLocating}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    formData={formData}
                    handleInputChange={handleInputChange}
                    getErrorMessage={getErrorMessage}
                    inputRefs={inputRefs}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    formData={formData}
                    handleInputChange={handleInputChange}
                    getErrorMessage={getErrorMessage}
                    inputRefs={inputRefs}
                    toggleGasSelection={toggleGasSelection}
                  />
                )}
              </View>
            </ScrollView>

            {/* FIXED FOOTER */}
            <View className="px-6 py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <Animated.View
                entering={FadeInUp.delay(200)}
                className={`flex-row items-center ${currentStep === 1 ? "justify-center" : "justify-between"}`}
              >
                {currentStep > 1 && (
                  <TouchableOpacity
                    onPress={() => setCurrentStep(currentStep - 1)}
                    className="w-16 h-16 rounded-xl border border-secondary items-center justify-center"
                  >
                    <ArrowLeft color="#FFDC82" size={32} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() =>
                    currentStep < 3
                      ? setCurrentStep(currentStep + 1)
                      : handleSignup()
                  }
                  disabled={!stepIsValid || isSubmitting}
                  className={`h-16 bg-primary rounded-xl flex-row items-center justify-center ${currentStep === 1 ? "w-full" : "flex-1 ml-4"} ${(!stepIsValid || isSubmitting) && "opacity-50"}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#F8FAFC" />
                  ) : (
                    <>
                      <Text className="text-gray-50 font-bold text-[18px] mr-2">
                        {currentStep === 3 ? "Terminer" : "Suivant"}
                      </Text>
                      <ArrowRight color="#F8FAFC" size={24} />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
