import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ChevronRight
} from "lucide-react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  ZoomIn,
  FadeIn
} from "react-native-reanimated";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";

import "../../global.css";

export default function PendingVerification() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  
  // Simulation de l'état de validation (en réalité, cela viendrait d'une API ou d'un WebSocket)
  const [status, setStatus] = useState<{
    emailVerified: boolean;
    cnibVerified: boolean;
    isValidated: boolean;
    tempPassword?: string;
  }>({
    emailVerified: true, 
    cnibVerified: false,
    isValidated: false,
  });

  const copyToClipboard = async () => {
    if (status.tempPassword) {
      await Clipboard.setStringAsync(status.tempPassword);
      Toast.show({
        type: 'customSuccess',
        text1: 'Copié !',
        text2: 'Mot de passe copié dans le presse-papier.'
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={require("../../assets/images/background-1.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-10 pb-10 flex-1">
            {/* Header Back Button */}
            <TouchableOpacity 
              onPress={() => router.replace("/auth/login")} 
              className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mb-8 border border-primary/10"
            >
              <ArrowLeft color="#00A3E0" size={24} />
            </TouchableOpacity>

            <Animated.View 
              entering={FadeInDown.duration(800).springify()} 
              className="items-center mb-10"
            >
              <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6 border-4 border-primary">
                <ShieldCheck size={48} color="#00A3E0" />
              </View>
              
                <Text className="text-4xl font-semibold text-secondary text-center">
                  Vérification en cours...
                </Text>
              
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-3 text-lg font-medium px-4">
                Notre équipe examine vos documents pour valider votre compte.
              </Text>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(300).duration(600)}
              className="bg-white/90 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 mb-8"
            >
              <Text className="text-gray-900 dark:text-white font-bold text-xl mb-6 ml-1">Progression</Text>
              
              <StepItem 
                label="Validation de l'email" 
                description="Votre adresse email a été confirmée"
                isCompleted={status.emailVerified} 
                isLast={false}
              />
              <StepItem 
                label="Vérification CNIB" 
                description="Examen de votre pièce d'identité"
                isCompleted={status.cnibVerified} 
                isCurrent={!status.cnibVerified}
                isLast={false}
              />
              <StepItem 
                label="Activation du compte" 
                description="Génération de vos accès sécurisés"
                isCompleted={status.isValidated} 
                isCurrent={status.cnibVerified && !status.isValidated}
                isLast={true}
              />
            </Animated.View>

            <View className="flex-1 justify-end">
              {status.isValidated && status.tempPassword ? (
                <Animated.View 
                  entering={ZoomIn.duration(600)}
                  className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/50 items-center"
                >
                  <View className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center mb-4">
                    <CheckCircle2 size={32} color="white" />
                  </View>
                  <Text className="text-emerald-800 dark:text-emerald-400 font-extrabold text-2xl mb-2 text-center">Compte Validé !</Text>
                  <Text className="text-emerald-600 dark:text-emerald-500 text-center mb-6 font-medium">Vos accès sont prêts. Utilisez ce mot de passe temporaire :</Text>
                  
                  <View className="flex-row items-center bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-5 py-5 w-full justify-between mb-6">
                    <Lock size={20} color="#10B981" />
                    <Text className="text-2xl font-black tracking-[4px] text-gray-800 dark:text-white ml-2">
                      {showPassword ? status.tempPassword : "••••••••"}
                    </Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={22} color="#94a3b8" /> : <Eye size={22} color="#94a3b8" />}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={copyToClipboard}>
                        <Copy size={22} color="#00A3E0" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => router.replace("/auth/login")}
                    activeOpacity={0.8}
                    className="bg-primary w-full h-16 rounded-xl items-center justify-center flex-row"
                  >
                    <Text className="text-white font-bold text-lg mr-2">Se connecter</Text>
                    <ChevronRight size={20} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View 
                  entering={FadeIn.delay(600)}
                  className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 flex-row items-center"
                >
                  <View className="w-12 h-12 bg-secondary/20 rounded-xl items-center justify-center mr-4">
                    <Clock size={24} color="#ffc74a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-bold text-lg mb-1">Délai estimé</Text>
                    <Text className="text-gray-500 dark:text-gray-400 leading-5 font-medium">
                      Généralement moins de 24h. Vous recevrez une notification par email.
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function StepItem({ 
  label, 
  description, 
  isCompleted, 
  isCurrent, 
  isLast 
}: { 
  label: string, 
  description: string, 
  isCompleted: boolean, 
  isCurrent?: boolean, 
  isLast: boolean 
}) {
  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
          isCompleted 
            ? 'bg-emerald-500 border-emerald-500' 
            : isCurrent 
              ? 'bg-white border-primary shadow-sm' 
              : 'bg-white border-gray-200'
        }`}>
          {isCompleted ? (
            <CheckCircle2 size={18} color="white" />
          ) : (
            <View className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </View>
        {!isLast && (
          <View className={`w-[2px] h-10 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-100'}`} />
        )}
      </View>
      <View className="flex-1 pb-6">
        <Text className={`text-[17px] font-bold ${
          isCompleted 
            ? 'text-emerald-600' 
            : isCurrent 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-400'
        }`}>
          {label}
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-0.5">
          {description}
        </Text>
      </View>
    </View>
  );
}

