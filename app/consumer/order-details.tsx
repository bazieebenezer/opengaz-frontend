import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Info,
  Truck,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import { useOrders } from "../../context/OrderContext";
import { orderService } from "../../services/order.service";

const defaultProfileImage = require("../../assets/images/user-profile.jpg");

export default function OrderDetails() {
  const { bottles, totalPrice, sellerName, sellerId, status, id } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addOrder } = useOrders();

  const isCompleted = status === "COMPLETED";
  const isPending = !status || status === "PENDING";

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      orderService.getOrderDetails(id as string)
        .then(setOrderData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const selectedBottles = orderData ? orderData.items : (bottles ? JSON.parse(bottles as string) : []);
  const total = orderData ? orderData.totalAmount : (totalPrice ? parseInt(totalPrice as string) : 0);
  const seller = orderData ? orderData.seller : { shopName: sellerName };
  const deliverer = orderData?.deliverer;
  const deliveryFee = 500; 

  const [isSearching, setIsSearching] = useState(false);

  const handleAction = async () => {
    const finalSellerId = orderData?.sellerId || sellerId;
    
    if (!finalSellerId) {
      Toast.show({ type: "error", text1: "Erreur", text2: "Vendeur introuvable pour cette commande." });
      return;
    }

    setIsConfirming(true);
    try {
      const orderItems = selectedBottles.map((b: any) => ({
        productId: b.productId || b.id,
        quantity: b.quantity
      }));

      const newOrder = await addOrder({
        sellerName: sellerName as string,
        sellerId: finalSellerId as string,
        totalPrice: total + deliveryFee,
        items: orderItems as any
      });

      if (!newOrder || !newOrder.id) {
        throw new Error("Order ID missing");
      }

      setIsConfirming(false);
      router.replace({
        pathname: "/consumer/tracking",
        params: { id: newOrder.id }
      });
    } catch (error: any) {
      setIsConfirming(false);
      console.error("Error confirming order:", error);
      Toast.show({
        type: "customError",
        text1: "Échec de la commande",
        text2: error.message || "Impossible de confirmer la commande.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      
      {isSearching && (
        <Animated.View 
          entering={FadeInDown} 
          exiting={FadeOut}
          className="absolute top-20 left-6 right-6 z-[100] bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex-row items-center"
        >
          <ActivityIndicator size="small" color="#00A3E0" />
          <Text className="ml-3 font-bold text-gray-900 dark:text-white">Recherche d'un livreur...</Text>
        </Animated.View>
      )}

      <Animated.View 
        entering={FadeIn.duration(600)}
        className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-white/5"
      >
        <TouchableOpacity
          onPress={() => router.replace("/consumer/orders")}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800"
        >
          <ChevronLeft size={24} color={isDarkMode ? "white" : "#111827"} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {isCompleted ? "Détails de la commande" : "Récapitulatif"}
        </Text>
        <View className="w-10" />
      </Animated.View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {isCompleted && (
          <Animated.View 
            entering={FadeInDown.springify()}
            className="mb-8 items-center"
          >
            <View className="bg-emerald-500/5 dark:bg-emerald-900/20 px-6 py-3 rounded-xl border border-emerald-500/20 flex-row items-center">
              <CheckCircle2 size={20} color="#059669" />
              <Text className="ml-2 font-bold text-emerald-600 text-lg uppercase">Livraison effectuée</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          className="mb-12"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-9 h-9 bg-primary/10 rounded-full items-center justify-center mr-2">
              <MapPin size={24} color="#00A3E0" />
            </View>
            <Text className="text-[18px] font-bold text-primary uppercase tracking-widest">
              Adresse de livraison
            </Text>
          </View>
          <View className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-gray-900 dark:text-white mb-1">
                  {orderData?.consumer?.address ? "Adresse de livraison" : "Ouagadougou, BF"}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 leading-6">
                  {orderData?.consumer?.address || "Secteur 28, Rue des Gazelles, Porte 123"}
                </Text>
              </View>
              {isPending && (
                <TouchableOpacity>
                  <Text className="text-secondary font-bold">Modifier</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          className="mb-12"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 bg-primary/10 rounded-full items-center justify-center mr-2">
                <ShoppingBag size={24} color="#00A3E0" />
              </View>
              <Text className="text-[18px] font-bold text-primary uppercase tracking-widest">
                Votre panier
              </Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400 font-medium">
              chez {sellerName}
            </Text>
          </View>
          
          <View className="bg-gray-50 dark:bg-white/5 rounded-xl p-2 border border-gray-100 dark:border-white/5">
            {selectedBottles.map((bottle: any, index: number) => {
              const name = bottle.name || bottle.product?.category?.name || "Bouteille";
              const image = bottle.image || bottle.product?.category?.imageUrl;
              const quantity = bottle.quantity;
              const price = typeof bottle.price === 'string' 
                ? parseInt(bottle.price.replace(/\s/g, '').replace('FCFA', '')) 
                : bottle.price;

              return (
                <View 
                  key={bottle.id} 
                  className={`flex-row items-center p-3 ${index !== selectedBottles.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
                >
                  <Image source={{ uri: image }} className="w-16 h-16 rounded-lg bg-white" />
                  <View className="flex-1 ml-4">
                    <Text className="text-[16px] font-bold text-gray-900 dark:text-white">{name}</Text>
                    <Text className="text-gray-500 text-[14px]">Quantité : {quantity}</Text>
                  </View>
                  <Text className="text-[16px] font-bold text-gray-900 dark:text-white">
                    {(price * quantity).toLocaleString('fr-FR')} F
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          className="mb-12"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-9 h-9 bg-primary/10 rounded-full items-center justify-center mr-2">
              <CreditCard size={24} color="#00A3E0" />
            </View>
            <Text className="text-[18px] font-bold text-primary uppercase tracking-widest">
              Mode de paiement
            </Text>
          </View>
          <View className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20 flex-row items-center">
            <View className="w-12 h-12 bg-emerald-500 rounded-lg items-center justify-center mr-4">
              <Text className="text-white font-black text-xl">F</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[18px] font-bold text-gray-900 dark:text-white">
                Paiement à la livraison
              </Text>
              <Text className="text-emerald-600 text-[14px] font-medium">
                Prévoyez l'appoint si possible
              </Text>
            </View>
            <CheckCircle2 size={24} color="#10B981" />
          </View>
        </Animated.View>

        {isCompleted && deliverer && (
          <Animated.View 
            entering={FadeInDown.delay(350).springify()}
            className="mb-12"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-9 h-9 bg-primary/10 rounded-full items-center justify-center mr-2">
                <Truck size={24} color="#00A3E0" />
              </View>
              <Text className="text-[18px] font-bold text-primary uppercase tracking-widest">
                Votre livreur
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 flex-row items-center">
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4 overflow-hidden">
                <Image 
                  source={deliverer.shopImage ? { uri: deliverer.shopImage } : defaultProfileImage} 
                  className="w-12 h-12" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-gray-900 dark:text-white">
                  {deliverer.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">
                  {deliverer.phone}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          className="bg-gray-900 dark:bg-white/5 p-6 rounded-2xl mb-24"
        >
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400 text-[16px]">Sous-total</Text>
            <Text className="text-white text-[16px] font-bold">{total.toLocaleString('fr-FR')} F</Text>
          </View>
          <View className="flex-row justify-between mb-6">
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-[16px] mr-1">Livraison</Text>
              <Info size={14} color="#94A3B8" />
            </View>
            <Text className="text-white text-[16px] font-bold">{deliveryFee.toLocaleString('fr-FR')} F</Text>
          </View>
          <View className="h-[1px] bg-white/10 mb-6" />
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-xl font-bold">Total à payer</Text>
            <Text className="text-primary text-3xl font-black">
              {(total + deliveryFee).toLocaleString('fr-FR')} F
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {isPending && (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/5"
        >
          <TouchableOpacity
            onPress={handleAction}
            disabled={isConfirming}
            activeOpacity={0.8}
            className="bg-primary w-full h-20 rounded-xl items-center justify-center"
          >
            {isConfirming ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-bold ml-2">
                  Confirmer la commande
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
      {isCompleted && (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/5"
        >
          <TouchableOpacity
            onPress={handleAction}
            disabled={isConfirming}
            activeOpacity={0.8}
            className="bg-primary w-full h-20 rounded-xl items-center justify-center"
          >
            {isConfirming ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-xl font-bold ml-2">Commander à nouveau</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
