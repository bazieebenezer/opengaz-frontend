import {
  ChevronRight,
  FileText,
  Info,
  Sliders,
  User,
  CircleUserRound,
  X,
  Mail,
  Phone,
  MapPin,
  Camera,
  Truck,
  Globe,
  Facebook,
  Linkedin,
  ExternalLink,
  Moon,
  Sun,
  Trash2,
  Check
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
const userPlaceholder = require("../../assets/images/user-profile.jpg");
import {
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Linking,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn, ZoomIn, FadeOut } from "react-native-reanimated";
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useColorScheme } from "nativewind";
import { useAuth } from "../../stores/auth.store";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";
import CustomInput from "../../components/custom-input";

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  index: number;
}

const SettingsItem = ({
  icon: Icon,
  label,
  onPress,
  index,
}: SettingsItemProps) => (
  <Animated.View entering={FadeInDown.delay(100 * index).springify()}>
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4"
    >
      <View className="flex-row items-center">
        <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
          <Icon size={24} color="#F97316" />
        </View>
        <Text className="font-medium text-xl text-gray-800 dark:text-gray-100">
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </Animated.View>
);

export default function DeliverySettings() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user, logout, updateUserData } = useAuth();
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCGUModalVisible, setIsCGUModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isPrefsModalVisible, setIsPrefsModalVisible] = useState(false);

  // Form states for profile update
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
    }
  }, [user]);

  const isDarkMode = colorScheme === "dark";

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        Toast.show({
          type: 'info',
          text1: 'Mise à jour...',
          text2: 'Envoi de votre nouvelle photo en cours.'
        });

        const response = await authService.updateProfileImage(base64Image);
        await updateUserData({ shopImage: response.shopImage });

        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: 'Photo de profil mise à jour !'
        });
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de mettre à jour la photo.'
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom est requis.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.updateProfile({
        name: editName,
        phone: editPhone,
      });

      await updateUserData(response.user);
      setIsEditMode(false);
      
      Toast.show({
        type: 'success',
        text1: 'Profil mis à jour',
        text2: 'Vos informations ont été enregistrées.'
      });
    } catch (error) {
      console.error("Update profile error:", error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de mettre à jour le profil.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            await logout();
            Toast.show({
              type: 'success',
              text1: 'Déconnecté',
              text2: 'À bientôt sur OpenGaz !'
            });
          }
        }
      ]
    );
  };

  const settingsOptions = [
    { 
      label: "Mes informations", 
      icon: CircleUserRound,
      onPress: () => {
        setIsEditMode(false);
        setIsInfoModalVisible(true);
      }
    },
    { 
      label: "Conditions générales d'utilisation", 
      icon: FileText,
      onPress: () => setIsCGUModalVisible(true)
    },
    { 
      label: "A propos de nous", 
      icon: Info,
      onPress: () => setIsAboutModalVisible(true)
    },
    { 
      label: "Préférences", 
      icon: Sliders,
      onPress: () => setIsPrefsModalVisible(true)
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ImageBackground
        source={require("../../assets/images/background-2.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.springify()} className="mb-12 mt-6">
            <Text className="font-black text-axiforma text-4xl text-orange-500 text-center mb-2">
              Paramètres
            </Text>
            <Text className="font-regular text-xl text-gray-500 dark:text-gray-400 mb-10 text-center">
              Gérez votre compte et vos préférences
            </Text>
          </Animated.View>

          <View className="mt-4">
            {settingsOptions.map((item, index) => (
              <SettingsItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                index={index}
                onPress={item.onPress || (() => {})}
              />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(500).springify()} className="mt-8">
            <TouchableOpacity 
              onPress={handleLogout}
              className="flex-row items-center justify-center p-5 rounded-xl border border-red-500 bg-red-500/10 mt-8"
            >
              <Text className="font-bold text-red-500 text-xl">
                Déconnexion
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <Modal
          visible={isInfoModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsInfoModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Pressable 
              className="absolute inset-0" 
              onPress={() => setIsInfoModalVisible(false)} 
            />
            
            <Animated.View 
              entering={ZoomIn.springify()}
              exiting={FadeOut}
              className="w-[95%] bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-black text-2xl text-orange-500">
                   {isEditMode ? "Modifier mon profil" : "Vos informations"}
                </Text>
                <TouchableOpacity 
                  onPress={() => setIsInfoModalVisible(false)}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
                >
                  <X size={20} color={isDarkMode ? "#F1F5F9" : "#64748B"} />
                </TouchableOpacity>
              </View>

              {!isEditMode ? (
                <>
                  <View className="items-center mb-12 mt-6">
                    <TouchableOpacity 
                      onPress={handleImagePick}
                      activeOpacity={0.7}
                      className="relative"
                    >
                      <Image
                        source={user?.shopImage ? { uri: user.shopImage } : userPlaceholder}
                        style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#E2E8F0' }}
                        contentFit="cover"
                      />
                      <View className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-4 border-white dark:border-gray-800">
                        <Camera size={18} color="white" />
                      </View>
                    </TouchableOpacity>
                    <Text className="font-bold text-3xl text-gray-900 dark:text-white mt-4 text-center">{user?.name}</Text>
                    <View className="flex-row items-center p-3 mt-2 border border-orange-500 rounded-xl bg-orange-500/10">
                      <Truck size={16} color="#F97316" />
                      <Text className="font-medium text-orange-500 ml-2 text-sm uppercase tracking-widest">Partenaire livreur</Text>
                    </View>
                  </View>

                  <View className="space-y-4">
                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
                        <User size={24} color="#F97316" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Nom</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.name}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
                        <Mail size={24} color="#F97316" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Email</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.email}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
                        <Phone size={24} color="#F97316" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Téléphone</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.phone || "Non renseigné"}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setIsEditMode(true)}
                    className="bg-orange-500 mt-8 py-5 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-xl">Modifier le profil</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="mt-4">
                    <CustomInput
                      label="Nom complet"
                      icon={User}
                      value={editName}
                      onChangeText={setEditName}
                      isValid={editName.length > 2}
                      isTouched={true}
                      placeholder="Votre nom"
                    />
                    <CustomInput
                      label="Téléphone"
                      icon={Phone}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      isValid={editPhone.length >= 8}
                      isTouched={true}
                      placeholder="ex: 06000000"
                      keyboardType="phone-pad"
                    />

                    <View className="flex-row space-x-4 mt-4 gap-3">
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => setIsEditMode(false)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-xl items-center"
                      >
                        <Text className="text-gray-600 dark:text-gray-300 font-bold text-xl">Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={handleUpdateProfile}
                        disabled={isSubmitting}
                        className={`flex-1 bg-orange-500 py-5 rounded-xl items-center flex-row justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                      >
                        <Check size={20} color="white" />
                        <Text className="text-white font-bold text-xl ml-2">Enregistrer</Text>
                      </TouchableOpacity>
                    </View>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* Modal CGU */}
        <Modal
          visible={isCGUModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsCGUModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Pressable 
              className="absolute inset-0" 
              onPress={() => setIsCGUModalVisible(false)} 
            />
            
            <Animated.View 
              entering={ZoomIn.springify()}
              exiting={FadeOut}
              className="w-[95%] h-[80%] bg-white dark:bg-gray-800 rounded-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-black text-2xl text-orange-500">Conditions générales</Text>
                <TouchableOpacity 
                  onPress={() => setIsCGUModalVisible(false)}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
                >
                  <X size={20} color={isDarkMode ? "#F1F5F9" : "#64748B"} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">1. Objet du service</Text>
                <Text className="text-gray-600 text-[16px] 0 dark:text-gray-400 mb-6 leading-6">
                  OPEN GAZ est une plateforme de mise en relation permettant la commande et la livraison de bouteilles de gaz à domicile. En utilisant cette application, vous acceptez les présentes conditions.
                </Text>

                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">2. Inscription et compte</Text>
                <Text className="text-gray-600 text-[16px] 0 dark:text-gray-400 mb-6 leading-6">
                  L'utilisateur s'engage à fournir des informations exactes lors de son inscription. Le compte est personnel et l'utilisateur est responsable de la confidentialité de ses identifiants.
                </Text>

                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">3. Commandes et livraison</Text>
                <Text className="text-gray-600 text-[16px] dark:text-gray-400 mb-6 leading-6">
                  Les commandes sont traitées dès validation. Les délais de livraison sont donnés à titre indicatif. L'utilisateur doit être présent pour réceptionner la commande et remettre la bouteille vide correspondante si nécessaire.
                </Text>

                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">4. Prix et paiement</Text>
                <Text className="text-gray-600 text-[16px] dark:text-gray-400 mb-6 leading-6">
                  Les prix affichés incluent la recharge de gaz et les frais de livraison. Le paiement s'effectue via les moyens de paiement intégrés à l'application ou à la livraison selon les options disponibles.
                </Text>

                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">5. Sécurité</Text>
                <Text className="text-gray-600 text-[16px] dark:text-gray-400 mb-6 leading-6">
                  Le gaz est un produit inflammable. L'utilisateur s'engage à manipuler les bouteilles avec précaution et à respecter les consignes de sécurité en vigueur. OPEN GAZ ne saurait être tenu responsable d'une mauvaise manipulation.
                </Text>

                <Text className="font-black text-xl text-gray-800 dark:text-gray-100 mb-2">6. Données personnelles</Text>
                <Text className="text-gray-600 text-[16px] dark:text-gray-400 mb-6 leading-6">
                  Vos données sont collectées uniquement pour le bon fonctionnement du service de livraison. Conformément à la loi, vous disposez d'un droit d'accès et de rectification de vos données.
                </Text>

                <Text className="text-gray-400 text-2sm text-center mt-4 mb-8">
                  Dernière mise à jour : 24 Mai 2026
                </Text>
              </ScrollView>

              <TouchableOpacity 
                onPress={() => setIsCGUModalVisible(false)}
                activeOpacity={0.8}
                className="bg-orange-500 mt-6 py-5 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-xl">J'ai compris</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
        
        <Modal
          visible={isAboutModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsAboutModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Pressable 
              className="absolute inset-0" 
              onPress={() => setIsAboutModalVisible(false)} 
            />
            
            <Animated.View 
              entering={ZoomIn.springify()}
              exiting={FadeOut}
              className="w-[95%] bg-white dark:bg-gray-800 rounded-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-black text-2xl text-orange-500">A propos de nous</Text>
                <TouchableOpacity 
                  onPress={() => setIsAboutModalVisible(false)}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
                >
                  <X size={20} color={isDarkMode ? "#F1F5F9" : "#64748B"} />
                </TouchableOpacity>
              </View>

              <View className="mb-8">
                <View className="p-4 rounded-3xl mb-4 bg-gray-50 dark:bg-gray-900/50 items-center">
                  <Image
                    source={require("../../assets/images/aorte_logo.png")}
                    style={{ width: 160, height: 120 }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-gray-800 dark:text-white font-bold px-2 text-2xl mb-2">Aorte Inc.</Text>
                <Text className="text-gray-500 dark:text-gray-400 leading-6 px-2 text-[16px]">
                  Nous sommes une entreprise technologique panafricaine basée au Burkina Faso dédiée à la simplification du quotidien à travers des solutions numériques innovantes.
                </Text>
              </View>

              <View className="space-y-3 mb-6">
                <Text className="font-bold text-gray-400 dark:text-gray-500 text-2xs uppercase tracking-widest mb-2 px-1">Liens utiles</Text>
                
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://aorte.africa')}
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
                      <Globe size={24} color="#F97316" />
                    </View>
                    <Text className="text-gray-800 dark:text-gray-100 font-semibold text-xl">Site Internet</Text>
                  </View>
                  <ExternalLink size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-400 text-center text-2xs mb-2">
                "Innover pour l'Afrique, par l'Afrique."
              </Text>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal Préférences */}
        <Modal
          visible={isPrefsModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsPrefsModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Pressable 
              className="absolute inset-0" 
              onPress={() => setIsPrefsModalVisible(false)} 
            />
            
            <Animated.View 
              entering={ZoomIn.springify()}
              exiting={FadeOut}
              className="w-[90%] bg-white dark:bg-gray-800 rounded-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-8">
                <Text className="font-black text-2xl text-orange-500">Préférences</Text>
                <TouchableOpacity 
                  onPress={() => setIsPrefsModalVisible(false)}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
                >
                  <X size={20} color={isDarkMode ? "#F1F5F9" : "#64748B"} />
                </TouchableOpacity>
              </View>

              <View className="space-y-6">
                <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-orange-500/10 p-2 rounded-xl mr-4">
                      {isDarkMode ? <Moon size={24} color="#F97316" /> : <Sun size={24} color="#F97316" />}
                    </View>
                    <View>
                      <Text className="text-gray-800 dark:text-gray-100 font-bold text-xl">Thème</Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-2xs">Changer l'apparence</Text>
                    </View>
                  </View>
                  <Switch
                    trackColor={{ false: "#E2E8F0", true: "#F97316" }}
                    thumbColor={isDarkMode ? "#FFFFFF" : "#F8FAFC"}
                    onValueChange={toggleColorScheme}
                    value={isDarkMode}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setIsPrefsModalVisible(false)}
                activeOpacity={0.8}
                className="bg-orange-500 mt-10 py-5 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-xl">Enregistrer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

