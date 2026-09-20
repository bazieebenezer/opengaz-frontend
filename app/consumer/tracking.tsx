import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Phone,
  Navigation,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  X,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Verified,
  Star,
  Scale,
  RotateCw,
} from "lucide-react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useColorScheme } from "nativewind";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  FadeInDown,
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";

import { useOrders, OrderStatus } from "../../stores/order.store";
import { useAuth } from "../../stores/auth.store";
import Toast from "react-native-toast-message";

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
  Pressable,
  Modal,
} from "react-native";

const { width, height } = Dimensions.get("window");
const userPlaceholder = require("../../assets/images/user-profile.jpg");

const TIMELINE_STEPS_BASE = [
  { id: "PENDING", label: "Commande reçue", time: "À l'instant" },
  { id: "PREPARING", label: "Préparation", time: "En cours" },
  { id: "READY_FOR_DELIVERY", label: "Prête pour livraison", time: "En attente" },
  { id: "IN_DELIVERY", label: "En cours de livraison", time: "En route" },
  { id: "DELIVERED", label: "Livré", time: "Vérification" },
  { id: "COMPLETED", label: "Terminée", time: "Terminé" },
];

export default function Tracking() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const orderId = (id as string);
  const { orders, refreshOrders, updateOrderStatus, completeOrder } = useOrders();
  
  const currentOrder = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentOrder) {
      const initTracking = async () => {
        setIsLoading(true);
        await refreshOrders();
        setIsLoading(false);
      };
      initTracking();
    } else {
      setIsLoading(false);
    }
  }, [orderId]); 

  useEffect(() => {
    console.log("Tracking - Current Order:", currentOrder?.id, "Status:", currentOrder?.status);
    if (currentOrder?.deliverer) {
        console.log("Tracking - Delivery Person Assigned:", currentOrder.deliverer);
    } else {
        console.log("Tracking - No deliverer assigned yet.");
    }
    
    if (isLoading) return;

    if (currentOrder && user?.role === 'CONSUMER' && (currentOrder.status === "COMPLETED" || currentOrder.status === "CANCELLED")) {
      setTimeout(() => {
        router.replace("/consumer/orders");
      }, 0);
    }
  }, [currentOrder?.id, currentOrder?.status, isLoading]);


  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    setRating(0);
    setIsSubmittingRating(false);
    setShowRatingModal(false);
  }, [orderId]);

  
  console.log("DEBUG - currentOrder:", currentOrder);
  const customerLocation = currentOrder?.consumer?.latitude && currentOrder?.consumer?.longitude
    ? { latitude: currentOrder.consumer.latitude, longitude: currentOrder.consumer.longitude }
    : null;
  
  console.log("DEBUG - customerLocation:", customerLocation);

  const delivererLocation = currentOrder?.deliverer?.latitude && currentOrder?.deliverer?.longitude
    ? { latitude: currentOrder.deliverer.latitude, longitude: currentOrder.deliverer.longitude }
    : null;
    
  console.log("DEBUG - delivererLocation:", delivererLocation);

  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const snapPoints = useMemo(() => ["28%", "85%"], []);

  const mapStyle = isDarkMode ? [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  ] : [
    { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }
  ];

  const getStepStatus = (stepId: string) => {
    const statuses: OrderStatus[] = ["PENDING", "PREPARING", "READY_FOR_DELIVERY", "IN_DELIVERY", "DELIVERED", "COMPLETED"];
    const currentIndex = statuses.indexOf(currentOrder?.status || "PENDING");
    const stepIndex = statuses.indexOf(stepId as OrderStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const handleCompleteOrder = () => {
    setRating(0);
    setIsSubmittingRating(false);
    setShowRatingModal(true);
  };

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && customerLocation) {
      mapRef.current.animateToRegion({
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }, 1000);
    }
  }, [customerLocation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white dark:bg-gray-950">
        <MapView
          ref={mapRef}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          initialRegion={customerLocation ? {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          } : {
            latitude: 12.3714,
            longitude: -1.5197,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          customMapStyle={mapStyle}
        >
          {customerLocation && (
            <Marker coordinate={customerLocation} title="Ma position">
              <View className="bg-primary p-2 rounded-full border-2 border-white">
                <MapPin size={20} color="white" />
              </View>
            </Marker>
          )}

          {delivererLocation && (
            <Marker coordinate={delivererLocation} title="Livreur">
              <View className="bg-secondary p-2.5 rounded-xl border-2 border-white">
                <Truck size={24} color="white" />
              </View>
            </Marker>
          )}
        </MapView>

        <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
          <View className="px-6 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.replace("/consumer/orders")}
              className="w-14 h-14 bg-white/95 dark:bg-gray-800/95 rounded-xl items-center justify-center border border-white/20"
            >
              <X size={24} color={isDarkMode ? "white" : "#111827"} />
            </TouchableOpacity>
            
            <View className="flex-row">
              <View className="bg-white/95 dark:bg-gray-800/95 px-5 py-2.5 rounded-xl border border-white/20 flex-row items-center">
                <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                <Text className="text-gray-900 dark:text-white font-bold tracking-tight">
                  Suivi Commande • #{orderId.slice(-6).toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={async () => {
                  setIsLoading(true);
                  await refreshOrders();
                  setIsLoading(false);
                }}
                disabled={isLoading}
                className="w-14 h-14 bg-white/95 dark:bg-gray-800/95 rounded-xl items-center justify-center border border-white/20 ml-2"
              >
                {isLoading ? (
                  <ActivityIndicator color={isDarkMode ? "white" : "#111827"} />
                ) : (
                  <RotateCw size={24} color={isDarkMode ? "white" : "#111827"} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowSafetyModal(true)}
              className="w-14 h-14 bg-white/95 dark:bg-gray-800/95 rounded-xl items-center justify-center border border-white/20"
            >
              <ShieldCheck size={24} color="#00A3E0" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{ 
            backgroundColor: isDarkMode ? "#111827" : "white",
            borderRadius: 20,
          }}
          handleIndicatorStyle={{ 
            backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
            width: 50,
          }}
        >
          <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
            
            <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-row items-center justify-between py-2 mb-6">
              <View className="flex-row items-center flex-1">

                {(currentOrder?.status === "PENDING") && (
                  <>
                    <View className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl items-center justify-center">
                      <Clock size={28} color="#D97706" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-black text-gray-900 dark:text-white mb-1">En attente du vendeur</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">Votre commande est en cours de validation...</Text>
                    </View>
                  </>
                )}

                {(currentOrder?.status === "PREPARING" || currentOrder?.status === "READY_FOR_DELIVERY") && !currentOrder?.deliverer && (
                  <>
                    <Image
                      source={currentOrder?.sellerImage ? { uri: currentOrder.sellerImage } : userPlaceholder}
                      className="w-14 h-14 rounded-xl bg-gray-100"
                      contentFit="cover"
                    />
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-black text-gray-900 dark:text-white mb-1">{currentOrder?.sellerName}</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        {currentOrder?.status === "PREPARING"
                          ? "Prépare votre commande..."
                          : "Les informations du livreur sont en cours de chargement..."}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => currentOrder?.sellerPhone && Linking.openURL(`tel:${currentOrder.sellerPhone}`)}
                      disabled={!currentOrder?.sellerPhone}
                      className={`w-14 h-14 rounded-xl items-center justify-center ml-3 ${currentOrder?.sellerPhone ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <Phone size={22} color="white" />
                    </TouchableOpacity>
                  </>
                )}

                {currentOrder?.deliverer && (
                  <>
                    <Image
                      source={currentOrder.deliverer.shopImage ? { uri: currentOrder.deliverer.shopImage } : userPlaceholder}
                      style={{ width: 56, height: 56, borderRadius: 99, backgroundColor: '#f3f4f6' }}
                      contentFit="cover"
                    />
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-black text-gray-900 dark:text-white mb-1">{currentOrder.deliverer.name}</Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">Votre livreur</Text>
                      <View className="flex-row items-center mt-1">
                        <Clock size={14} color="#00A3E0" />
                        <Text className="text-primary font-bold ml-1 text-[13px]">
                          {currentOrder?.status === "DELIVERED" ? "Arrivé ✓" : "En route"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${currentOrder.deliverer!.phone}`)}
                      className="w-14 h-14 bg-primary rounded-xl items-center justify-center ml-3"
                    >
                      <Phone size={22} color="white" />
                    </TouchableOpacity>
                  </>
                )}

                {!currentOrder && (
                  <>
                    <View className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center">
                      <Clock size={28} color="#94A3B8" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-black text-gray-900 dark:text-white mb-1">Chargement...</Text>
                      <Text className="text-gray-400 text-sm">Récupération de votre commande</Text>
                    </View>
                  </>
                )}

              </View>
            </Animated.View>

            <View className="h-[1px] bg-gray-100 dark:bg-white/5 mb-8" />

            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8">
              <Text className="text-primary font-bold uppercase text-[14px] tracking-widest mb-2">Statut actuel</Text>
              <Text className="text-[18px] font-black text-gray-900 dark:text-white">
                {currentOrder?.status === "PENDING" && "En attente de validation..."}
                {currentOrder?.status === "PREPARING" && "Préparation en cours..."}
                {currentOrder?.status === "READY_FOR_DELIVERY" && "Prête pour livraison"}
                {currentOrder?.status === "IN_DELIVERY" && "En cours de livraison"}
                {currentOrder?.status === "DELIVERED" && "Livraison effectuée"}
                {currentOrder?.status === "COMPLETED" && "Commande terminée"}
                {!currentOrder?.status && "—"}
              </Text>
            </Animated.View>

            <View className="mb-10">
              <Animated.Text entering={FadeInDown.delay(300).springify()} className="text-primary font-bold uppercase text-[14px] tracking-widest mb-6">Suivi détaillé</Animated.Text>
              {TIMELINE_STEPS_BASE.map((step, idx) => {
                const status = getStepStatus(step.id);
                return (
                  <Animated.View 
                    key={step.id} 
                    entering={FadeInDown.delay(400 + (idx * 100)).springify()}
                    className="flex-row mb-6"
                  >
                    <View className="items-center mr-4">
                      <View className={`w-6 h-6 rounded-full items-center justify-center ${status === 'completed' ? 'bg-primary' : status === 'current' ? 'bg-secondary' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {status === 'completed' ? <CheckCircle2 size={12} color="white" /> : <View className={`w-1.5 h-1.5 rounded-full ${status === 'current' ? 'bg-white' : 'bg-gray-400'}`} />}
                      </View>
                      {idx !== TIMELINE_STEPS_BASE.length - 1 && (
                        <View className={`w-0.5 h-8 ${status === 'completed' ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'}`} />
                      )}
                    </View>
                    <View className="flex-1 flex-row justify-between items-start">
                      <Text className={`text-[15px] font-bold ${status === 'pending' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {step.label}
                      </Text>
                      <Text className="text-gray-400 font-bold text-xs">{step.time}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            <Animated.View 
              entering={FadeInDown.delay(800).springify()}
              className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 flex-row items-center border border-gray-100 dark:border-white/5 mb-8"
            >
              <View className="w-14 h-14 bg-white dark:bg-gray-800 rounded-lg items-center justify-center">
                <Truck size={24} color="#00A3E0" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-[15px] font-bold text-gray-900 dark:text-white">Détails de la commande</Text>
                <Text className="text-gray-400 text-sm">
                  {(currentOrder?.items || []).reduce((acc: any, item: any) => acc + (item.quantity || 0), 0)} article{(currentOrder?.items || []).reduce((acc: any, item: any) => acc + (item.quantity || 0), 0) > 1 ? 's' : ''} • {(currentOrder?.totalPrice || 0).toLocaleString('fr-FR')} F
                </Text>
              </View>
            </Animated.View>

            {currentOrder?.status === "DELIVERED" && !currentOrder?.hasReview && (
              <Animated.View entering={FadeInDown.delay(900).springify()}>
                <TouchableOpacity
                  onPress={handleCompleteOrder}
                  className="bg-primary w-full py-5 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-bold text-[18px]">Valider la livraison</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

          </BottomSheetScrollView>
        </BottomSheet>

        <Modal
          visible={showSafetyModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowSafetyModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <Pressable 
              className="absolute top-0 left-0 right-0 bottom-0"
              onPress={() => setShowSafetyModal(false)}
            />
            <Animated.View 
              entering={ZoomIn.duration(400)}
              className="bg-white dark:bg-gray-900 w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <View className="bg-primary p-8 items-center relative">
                <View className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
                   <View className="flex-1 rotate-12 flex-row flex-wrap">
                      {Array(20).fill(0).map((_, i) => (
                        <ShieldCheck key={i} size={40} color="white" style={{ margin: 10 }} />
                      ))}
                   </View>
                </View>
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                   <ShieldCheck size={48} color="white" />
                </View>
                <Text className="text-white text-2xl font-black text-center">Garantie gaz sûr</Text>
                <Text className="text-white/80 text-center font-medium mt-1">Votre sécurité est notre priorité</Text>
              </View>

              <View className="p-6">
                <View className="space-y-6">
                  <View className="flex-row items-start mb-6">
                    <View className="w-12 h-12 bg-emerald-500/10 rounded-xl items-center justify-center mr-4">
                       <Verified size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                       <Text className="text-gray-900 dark:text-white font-bold text-lg">Revendeur agréé</Text>
                       <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">Ce partenaire a été rigoureusement vérifié et respecte toutes les normes de sécurité.</Text>
                    </View>
                  </View>
                  <View className="flex-row items-start mb-6">
                    <View className="w-12 h-12 bg-amber-500/10 rounded-xl items-center justify-center mr-4">
                       <Star size={24} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                       <Text className="text-gray-900 dark:text-white font-bold text-lg">Qualité garanti</Text>
                       <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">Chaque bouteille est vérifiée au dépôt pour vous garantir la quantité exacte payée.</Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
                       <ShieldAlert size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                       <Text className="text-gray-900 dark:text-white font-bold text-lg">Protection & Assurance</Text>
                       <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">Votre livraison est couverte par notre assurance partenaire.</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowSafetyModal(false)}
                  className="bg-primary w-full py-5 rounded-xl items-center justify-center mt-8"
                >
                   <Text className="text-white font-bold text-lg">J'ai compris</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={showRatingModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowRatingModal(false);
          }}
        >
          <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <Pressable 
              className="absolute top-0 left-0 right-0 bottom-0"
              onPress={() => setShowRatingModal(false)}
            />
            <Animated.View 
              entering={ZoomIn.duration(400)}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 items-center border border-gray-100 dark:border-gray-800"
            >
              <View className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full items-center justify-center mb-6 mt-2">
                <View className="w-14 h-14 bg-primary rounded-full items-center justify-center">
                  <Star size={28} color="white" fill="white" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Votre avis compte !</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center text-sm leading-5 mb-6 px-2">Comment avez trouvé le service ?</Text>
              <View className="flex-row items-center justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const isFilled = starIndex <= rating;
                  return (
                    <TouchableOpacity
                      key={starIndex}
                      onPress={() => setRating(starIndex)}
                      activeOpacity={0.7}
                      className="p-1"
                    >
                      <Star
                        size={40}
                        color={isFilled ? "#ffc74a" : (isDarkMode ? "#374151" : "#E2E8F0")}
                        fill={isFilled ? "#ffc74a" : "transparent"}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View className="h-6 justify-center mb-8">
                {rating > 0 && (
                  <Text className="text-secondary font-extrabold text-[15px]">
                    {rating === 1 && "Très insatisfaisant 😞"}
                    {rating === 2 && "Insatisfaisant 😐"}
                    {rating === 3 && "Moyen 🙂"}
                    {rating === 4 && "Très bien ! 😊"}
                    {rating === 5 && "Excellent ! 🤩"}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  if (rating === 0) return;
                  setIsSubmittingRating(true);
                  try {
                    await completeOrder(orderId, rating);
                    setShowRatingModal(false);
                    Toast.show({
                      type: "success",
                      text1: "Merci !",
                      text2: "Votre avis a été enregistré.",
                    });
                  } catch (error: any) {
                    setIsSubmittingRating(false);
                    Toast.show({
                      type: "customError",
                      text1: "Erreur",
                      text2: error.message || "Impossible d'enregistrer votre avis.",
                    });
                  }
                }}
                disabled={isSubmittingRating || rating === 0}
                className={`w-full py-4 rounded-xl items-center justify-center mb-3 ${rating === 0 ? "bg-gray-100 dark:bg-gray-800" : "bg-primary"}`}
              >
                {isSubmittingRating ? <ActivityIndicator color="white" /> : <Text className={`font-bold text-[16px] ${rating === 0 ? "text-gray-400" : "text-white"}`}>Confirmer</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  setIsSubmittingRating(true);
                  try {
                    await completeOrder(orderId, 0); 
                    setShowRatingModal(false);
                  } catch (error: any) {
                    setIsSubmittingRating(false);
                    Toast.show({
                      type: "customError",
                      text1: "Erreur",
                      text2: error.message || "Impossible de finaliser la commande.",
                    });
                  }
                }}
                disabled={isSubmittingRating}
                className="w-full py-3 rounded-xl items-center justify-center"
              >
                {isSubmittingRating ? <ActivityIndicator color="#94A3B8" /> : <Text className="text-gray-400 dark:text-gray-500 font-bold text-sm">Passer</Text>}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

