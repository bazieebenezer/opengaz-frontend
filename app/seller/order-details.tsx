import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { orderService, Order, OrderStatus } from "../../services/order.service";

const { width } = Dimensions.get("window");

export default function SellerOrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrderDetails = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await orderService.getOrderDetails(id as string);
      setOrder(data);
    } catch (error) {
      console.error("Fetch order details error:", error);
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: "Impossible de charger les détails de la commande.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrderDetails(false);
  }, [id]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      const updatedOrder = await orderService.updateStatus(id as string, newStatus);
      setOrder(updatedOrder);
      Toast.show({
        type: "customSuccess",
        text1: "Statut mis à jour",
        text2: `La commande est maintenant en statut : ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: "La mise à jour du statut a échoué.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": return "Nouveau";
      case "PREPARING": return "En préparation";
      case "READY_FOR_DELIVERY":
      case "PENDING_DELIVERY" as any:
        return "Prêt à livrer";
      case "IN_DELIVERY":
      case "SHIPPED" as any:
        return "En livraison";
      case "DELIVERED": return "Livré";
      case "COMPLETED": return "Terminée";
      case "CANCELLED": return "Annulé";
      default: return "Inconnu";
    }
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": 
        return { 
          color: "text-red-600", 
          iconColor: "#DC2626", 
          bg: "bg-red-50", 
          border: "border-red-200",
          icon: Clock,
          next: "Accepter", 
          nextStatus: "PREPARING" as OrderStatus 
        };
      case "PREPARING": 
        return { 
          color: "text-blue-600", 
          iconColor: "#2563EB", 
          bg: "bg-blue-50", 
          border: "border-blue-200",
          icon: Package,
          next: "Prêt à livrer", 
          nextStatus: "READY_FOR_DELIVERY" as OrderStatus 
        };
      case "READY_FOR_DELIVERY":
      case "PENDING_DELIVERY" as any:
        return { 
          color: "text-orange-600", 
          iconColor: "#EA580C", 
          bg: "bg-orange-50", 
          border: "border-orange-200",
          icon: Truck,
          next: null 
        };
      case "IN_DELIVERY":
      case "SHIPPED" as any: 
        return { 
          color: "text-amber-600", 
          iconColor: "#D97706", 
          bg: "bg-amber-50", 
          border: "border-amber-200",
          icon: Truck,
          next: null 
        };
      case "DELIVERED": 
        return { 
          color: "text-emerald-600", 
          iconColor: "#059669", 
          bg: "bg-emerald-50", 
          border: "border-emerald-200",
          icon: CheckCircle2,
          next: "Terminer", 
          nextStatus: "COMPLETED" as OrderStatus 
        };
      case "COMPLETED": 
        return { 
          color: "text-emerald-700", 
          iconColor: "#065F46", 
          bg: "bg-emerald-50", 
          border: "border-emerald-200",
          icon: CheckCircle2,
          next: null 
        };
      case "CANCELLED": 
        return { 
          color: "text-gray-500", 
          iconColor: "#6B7280", 
          bg: "bg-gray-50", 
          border: "border-gray-200",
          icon: XCircle,
          next: null 
        };
      default: 
        return { 
          color: "text-gray-500", 
          iconColor: "#6B7280", 
          bg: "bg-gray-50", 
          border: "border-gray-200",
          icon: Clock,
          next: null 
        };
    }
  };

  const handleCall = () => {
    if (order?.consumer?.phone) {
      Linking.openURL(`tel:${order.consumer.phone}`);
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#00A3E0" />
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <View className="px-6 py-4 flex-row items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
          <ChevronLeft size={24} color={isDarkMode ? "white" : "#111827"} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-primary">Détails réservation</Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#00A3E0"]} />
        }
      >
        <Animated.View 
          entering={FadeInDown.springify()}
          className="mb-8 items-center"
        >
          <View className={`${statusConfig.bg} ${statusConfig.border} px-6 py-3 rounded-xl flex-row items-center border`}>
            <statusConfig.icon size={20} color={statusConfig.iconColor} />
            <Text className={`ml-2 font-bold ${statusConfig.color} text-lg uppercase`}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
          <Text className="mt-3 text-gray-400 font-bold uppercase tracking-widest text-xs">
            Commande #{order.id.slice(-8).toUpperCase()}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-8">
          <Text className="text-[14px] font-black text-primary uppercase mb-4 tracking-widest">Client</Text>
          <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center mb-5">
              <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mr-4">
                <User size={24} color="#00A3E0" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">{order.consumer?.name || "Inconnu"}</Text>
                <Text className="text-gray-400 text-sm">Client OpenGaz</Text>
              </View>
              <TouchableOpacity 
                onPress={handleCall}
                disabled={!order.consumer?.phone}
                className={`w-12 h-12 rounded-xl items-center justify-center border ${
                  order.consumer?.phone ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 opacity-50'
                }`}
              >
                <Phone size={22} color={order.consumer?.phone ? "#10B981" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <Phone size={14} color="#94A3B8" />
              <Text className="text-gray-600 dark:text-gray-300 ml-3 font-bold">
                {order.consumer?.phone || "Non assigné"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8">
          <Text className="text-[14px] font-black text-primary uppercase mb-4 tracking-widest">Lieu de livraison</Text>
          <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex-row items-start">
            <View className="w-12 h-12 bg-amber-500/10 rounded-xl items-center justify-center mr-4">
              <MapPin size={24} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {order.consumer?.neighborhood || "Ouagadougou"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 leading-5 mt-1">
                {order.consumer?.address || "Adresse non fournie"}
              </Text>
              {order.consumer?.landmark && (
                <Text className="text-primary/70 text-xs font-bold mt-2 italic">
                  Repère : {order.consumer.landmark}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
          <Text className="text-[14px] font-black text-primary uppercase mb-4 tracking-widest">Articles commandés</Text>
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {order.items.map((item, idx) => (
              <View key={item.id} className={`flex-row items-center p-4 ${idx !== 0 ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}>
                <View className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl items-center justify-center border border-gray-100 dark:border-gray-700">
                  <Image 
                    source={{ uri: item.product.category.imageUrl }} 
                    className="w-12 h-12" 
                    resizeMode="contain" 
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-[16px] font-bold text-gray-900 dark:text-white">{item.product.category.name}</Text>
                  <Text className="text-gray-400 text-[13px]">Quantité : {item.quantity}</Text>
                </View>
                <Text className="text-[16px] font-black text-primary">{item.price.toLocaleString()} F</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8">
          <View className="flex-row items-center mb-6">
            <CreditCard size={18} color="#00A3E0" />
            <Text className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Paiement à la livraison</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 dark:text-gray-400">Total articles</Text>
            <Text className="text-gray-900 dark:text-white font-bold">{order.totalAmount.toLocaleString()} F</Text>
          </View>
          <View className="flex-row justify-between mb-6">
            <Text className="text-gray-500 dark:text-gray-400">Frais de service</Text>
            <Text className="text-gray-900 dark:text-white font-bold">0 F</Text>
          </View>
          <View className="h-[1px] bg-gray-50 dark:bg-gray-800 mb-6" />
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-900 dark:text-white text-xl font-bold">À percevoir</Text>
            <Text className="text-primary text-2xl font-black">{order.totalAmount.toLocaleString()} F</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {statusConfig.next && (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
        >
          <TouchableOpacity
            disabled={isUpdating}
            onPress={() => handleUpdateStatus(statusConfig.nextStatus as OrderStatus)}
            className={`h-16 rounded-xl items-center justify-center ${
              isUpdating ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {isUpdating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-xl font-black tracking-widest">{statusConfig.next}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
