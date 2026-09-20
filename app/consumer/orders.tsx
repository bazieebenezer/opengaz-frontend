import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useOrders, OrderStatus } from "../../stores/order.store";

export default function Orders() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { orders, loading, refreshOrders } = useOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "En attente",
          color: "text-amber-600",
          bgColor: "bg-amber-100 dark:bg-amber-900/20",
          icon: <Clock size={14} color="#D97706" />,
        };
      case "PREPARING":
        return {
          label: "Préparation",
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          icon: <Package size={14} color="#2563EB" />,
        };
      case "READY_FOR_DELIVERY":
      case "PENDING_DELIVERY" as any:
        return {
          label: "Prête pour livraison",
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/20",
          icon: <Package size={14} color="#EA580C" />,
        };
      case "IN_DELIVERY":
      case "SHIPPED" as any:
        return {
          label: "En livraison",
          color: "text-primary",
          bgColor: "bg-primary/10",
          icon: <Truck size={14} color="#00A3E0" />,
        };
      case "DELIVERED":
        return {
          label: "Livré",
          color: "text-emerald-600",
          bgColor: "bg-emerald-500/10 dark:bg-emerald-900/20",
          icon: <CheckCircle2 size={14} color="#059669" />,
        };
      case "COMPLETED":
        return {
          label: "Terminée",
          color: "text-emerald-700",
          bgColor: "bg-emerald-500/20 dark:bg-emerald-900/30",
          icon: <CheckCircle2 size={14} color="#065F46" />,
        };
      case "CANCELLED":
        return {
          label: "Annulé",
          color: "text-red-600",
          bgColor: "bg-red-500/10 dark:bg-red-900/20",
          icon: <AlertCircle size={14} color="#DC2626" />,
        };
      default:
        return {
          label: "Inconnu (" + status + ")",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: <AlertCircle size={14} color="#4B5563" />,
        };
    }
  };

  const handleOrderPress = (order: any) => {
    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
      router.push({
        pathname: "/consumer/order-details",
        params: {
          id: order.id,
          status: order.status,
          sellerName: order.sellerName,
          sellerId: order.sellerId,
          totalPrice: order.totalPrice - 500,
          bottles: JSON.stringify(order.items)
        }
      });
    } else {
      router.push({
        pathname: "/consumer/tracking",
        params: { id: order.id }
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <Animated.View entering={FadeInDown.springify()} className="px-6 py-6 font-axiforma dark:border-white/5 mb-16 mt-12">
        <Text className="font-black text-axiforma text-4xl text-primary text-center mb-2">Commandes</Text>
      </Animated.View>

      <ScrollView 
        className="flex-1 px-6 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#00A3E0"]} />
        }
      >
        {loading && !isRefreshing ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#00A3E0" />
          </View>
        ) : orders.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()} className="flex-1 items-center justify-center pt-20">
            <View className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-2xl items-center justify-center mb-4">
              <Package size={40} color="#94A3B8" />
            </View>
            <Text className="text-gray-400 text-lg font-medium">Aucune commande pour le moment</Text>
          </Animated.View>
        ) : (
          orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Animated.View 
                key={order.id} 
                entering={FadeInDown.delay(100 * index).springify()}
              >
                <TouchableOpacity
                  onPress={() => handleOrderPress(order)}
                  activeOpacity={0.8}
                  className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 mb-4 border border-gray-100 dark:border-white/5"
                >
                  <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center border border-gray-100 dark:border-white/10">
                        <Package size={22} color="#00A3E0" />
                      </View>
                      <View className="ml-4">
                        <Text className="text-[18px] font-extrabold text-gray-900 dark:text-white">
                          {order.sellerName}
                        </Text>
                        <Text className="text-gray-400 font-bold text-sm uppercase tracking-wider">#{order.id.slice(-6).toUpperCase()}</Text>
                      </View>
                    </View>
                    <View className={`px-4 py-2 rounded-lg ${statusInfo.bgColor}`}>
                      <Text className={`font-black text-[12px] ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-6 border-t border-gray-200/50 dark:border-white/10">
                    <View>
                      <Text className="text-gray-400 font-bold text-[14px] mb-1">Date & Total</Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-900 dark:text-white font-bold">{order.date}</Text>
                        <View className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-2" />
                        <Text className="text-primary font-black text-xl">{order.totalPrice.toLocaleString('fr-FR')} F</Text>
                      </View>
                    </View>
                    <View className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl items-center justify-center border border-gray-100 dark:border-white/10">
                      <ChevronRight size={18} color={isDarkMode ? "white" : "#111827"} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

