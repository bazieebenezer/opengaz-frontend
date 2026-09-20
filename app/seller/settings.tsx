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
  ChessQueen,
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
import { useOrders } from "../../stores/order.store";
import { useAuth } from "../../stores/auth.store";
import { authService } from "../../services/auth.service";
import { orderService } from "../../services/order.service";
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
        <View className="bg-primary/10 p-2 rounded-xl mr-4">
          <Icon size={24} color="#00A3E0" />
        </View>
        <Text className="font-medium text-xl text-gray-800 dark:text-gray-100">
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </Animated.View>
);

export default function SellerSettings() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user, logout, updateUserData } = useAuth();
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCGUModalVisible, setIsCGUModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isPrefsModalVisible, setIsPrefsModalVisible] = useState(false);
  const { clearOrders } = useOrders();

  // Form states for profile update
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editAddress, setEditAddress] = useState(user?.address || "");
  const [editCoords, setEditCoords] = useState<{ lat: number; lng: number } | null>(
    user?.latitude && user?.longitude ? { lat: user.latitude, lng: user.longitude } : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      if (user.latitude && user.longitude) {
        setEditCoords({ lat: user.latitude, lng: user.longitude });
      }
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
          text2: 'Photo de boutique mise à jour !'
        });
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Toast.show({
        type: 'customError',
        text1: 'Erreur',
        text2: 'Impossible de mettre à jour la photo.'
      });
    }
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission refusée',
          text2: 'L\'accès à la position est nécessaire.'
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setEditCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });

      // Reverse geocoding to get human-readable address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = [
          addr.streetNumber,
          addr.street,
          addr.district || addr.subregion,
          addr.city
        ].filter(Boolean).join(", ");
        
        if (formattedAddress) {
          setEditAddress(formattedAddress);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Position récupérée',
        text2: 'Votre adresse a été mise à jour automatiquement.'
      });
    } catch (error) {
      console.error("Location error:", error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de récupérer votre position.'
      });
    } finally {
      setIsLocating(false);
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
        address: editAddress,
        latitude: editCoords?.lat,
        longitude: editCoords?.lng,
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
              type: 'customSuccess',
              text1: 'Déconnecté',
              text2: 'À bientôt sur OpenGaz !'
            });
          }
        }
      ]
    );
  };

  const handleResetHistory = () => {
    Alert.alert(
      "Réinitialiser l'historique",
      "Voulez-vous vraiment supprimer tout votre historique de réservations ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              await orderService.clearSellerHistory();
              Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: "L'historique des réservations a été réinitialisé."
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: "Impossible de supprimer l'historique."
              });
            }
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
    { 
      label: "Réinitialiser l'historique", 
      icon: Trash2,
      onPress: handleResetHistory
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
            <Text className="font-black text-axiforma text-4xl text-primary text-center mb-2">
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
                <Text className="font-black text-2xl text-primary">
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
                        source={{ uri: user?.shopImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=1000" }}
                        style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#E2E8F0' }}
                        contentFit="cover"
                      />
                      <View className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full border-4 border-white dark:border-gray-800">
                        <Camera size={18} color="white" />
                      </View>
                    </TouchableOpacity>
                    <Text className="font-bold text-3xl text-gray-900 dark:text-white mt-4 text-center">{user?.shopName || user?.name}</Text>
                    <View className="flex-row items-center p-3 mt-2 border border-secondary rounded-xl bg-secondary/10">
                      <ChessQueen size={16} color="#ffc74a" />
                      <Text className="font-medium text-secondary ml-2 text-sm uppercase tracking-widest">Partenaire vendeur</Text>
                    </View>
                  </View>

                  <View className="space-y-4">
                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-primary/10 p-2 rounded-xl mr-4">
                        <User size={24} color="#00A3E0" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Responsable</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.name}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-primary/10 p-2 rounded-xl mr-4">
                        <Mail size={24} color="#00A3E0" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Email</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.email}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-primary/10 p-2 rounded-xl mr-4">
                        <Phone size={24} color="#00A3E0" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Téléphone</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.phone || "Non renseigné"}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800">
                      <View className="bg-primary/10 p-2 rounded-xl mr-4">
                        <MapPin size={24} color="#00A3E0" />
                      </View>
                      <View>
                        <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Adresse</Text>
                        <Text className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{user?.address || "Non renseignée"}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setIsEditMode(true)}
                    className="bg-primary mt-8 py-5 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-xl">Modifier le profil</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
                  <View className="mt-4">
                    <CustomInput
                      label="Nom du responsable"
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
                    <CustomInput
                      label="Adresse de la boutique"
                      icon={MapPin}
                      value={editAddress}
                      onChangeText={setEditAddress}
                      isValid={true}
                      isTouched={true}
                      placeholder="Quartier, Secteur..."
                      optional
                    />

                    <TouchableOpacity
                      onPress={handleGetLocation}
                      disabled={isLocating}
                      className={`flex-row items-center justify-center p-4 rounded-xl border-2 border-primary/20 bg-primary/5 mb-6 ${isLocating ? 'opacity-50' : ''}`}
                    >
                      <MapPin size={20} color="#00A3E0" />
                      <Text className="font-bold text-primary text-lg ml-2">
                        {isLocating ? "Localisation..." : editCoords ? "Position boutique enregistrée" : "Détecter la position de la boutique"}
                      </Text>
                      {editCoords && !isLocating && <Check size={16} color="#00A3E0" className="ml-2" />}
                    </TouchableOpacity>

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
                        className={`flex-1 bg-primary py-5 rounded-xl items-center flex-row justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                      >
                        <Check size={20} color="white" />
                        <Text className="text-white font-bold text-xl ml-2">Enregistrer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </Modal>

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
                <Text className="font-black text-2xl text-primary">Conditions générales</Text>
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
                className="bg-primary mt-6 py-5 rounded-xl items-center"
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
                <Text className="font-black text-2xl text-primary">A propos de nous</Text>
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
                    <View className="bg-blue-500/10 p-2 rounded-xl mr-4">
                      <Globe size={24} color="#00A3E0" />
                    </View>
                    <Text className="text-gray-800 dark:text-gray-100 font-semibold text-xl">Site Internet</Text>
                  </View>
                  <ExternalLink size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://facebook.com')}
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="bg-blue-600/10 p-2 rounded-xl mr-4">
                      <Facebook size={24} color="#00A3E0" />
                    </View>
                    <View>
                      <Text className="text-gray-800 dark:text-gray-100 font-semibold text-xl">Lévi & Léa</Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-2xs">Page Facebook</Text>
                    </View>
                  </View>
                  <ExternalLink size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://linkedin.com')}
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="bg-blue-700/10 p-2 rounded-xl mr-4">
                      <Linkedin size={24} color="#00A3E0" />
                    </View>
                    <View>
                      <Text className="text-gray-800 dark:text-gray-100 font-semibold text-xl">Aorte Inc</Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-2xs">Page LinkedIn</Text>
                    </View>
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
                <Text className="font-black text-2xl text-primary">Préférences</Text>
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
                    <View className="bg-primary/10 p-2 rounded-xl mr-4">
                      {isDarkMode ? <Moon size={24} color="#00A3E0" /> : <Sun size={24} color="#00A3E0" />}
                    </View>
                    <View>
                      <Text className="text-gray-800 dark:text-gray-100 font-bold text-xl">Thème</Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-2xs">Changer l'apparence</Text>
                    </View>
                  </View>
                  <Switch
                    trackColor={{ false: "#E2E8F0", true: "#00A3E0" }}
                    thumbColor={isDarkMode ? "#FFFFFF" : "#F8FAFC"}
                    onValueChange={toggleColorScheme}
                    value={isDarkMode}
                  />
                </View>

                <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl opacity-50 mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 p-2 rounded-xl mr-4">
                      <Sliders size={24} color="#00A3E0" />
                    </View>
                    <View>
                      <Text className="text-gray-800 dark:text-gray-100 font-bold text-xl">Notifications</Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-2xs">Bientôt disponible</Text>
                    </View>
                  </View>
                  <Switch disabled value={true} />
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setIsPrefsModalVisible(false)}
                activeOpacity={0.8}
                className="bg-primary mt-10 py-5 rounded-xl items-center"
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

