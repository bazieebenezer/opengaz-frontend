import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    Dimensions, 
    RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../context/AuthContext";
import { orderService, Order } from "../../services/order.service";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { 
    Truck, 
    Clock, 
    CheckCircle, 
    ChevronRight, 
    ShoppingBag, 
    RefreshCw,
    MapPin,
    Phone
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const REFRESH_INTERVAL_MS = 10000;

const rejectedKeyFor = (userId?: string) =>
  userId ? `deliveryRejectedOrderIds_${userId}` : "deliveryRejectedOrderIds";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [isOpen, setIsOpen] = useState(user?.isShopOpen ?? true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [directSalesToday, setDirectSalesToday] = useState(0);

  const rejectedKey = rejectedKeyFor(user?.id);

  const fetchAvailableOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await orderService.getAvailableOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les commandes.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Charger les commandes refusées pour ce livreur
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(rejectedKey);
        if (raw && active) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRejectedIds(parsed);
        }
      } catch (e) {}
    })();
    return () => {
      active = false;
    };
  }, [rejectedKey]);

  // Chargement initial + polling automatique pour voir les nouvelles commandes
  useEffect(() => {
    fetchAvailableOrders();
  }, [fetchAvailableOrders]);

  useEffect(() => {
    const timer = setInterval(() => fetchAvailableOrders(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchAvailableOrders]);

  const handleAssign = async (orderId: string) => {
    try {
        await orderService.assignOrder(orderId);
        Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Commande acceptée !",
        });
        fetchAvailableOrders(false);
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Erreur",
            text2: "Impossible d'accepter cette commande.",
        });
    }
  }

  const handleRefuse = (orderId: string) => {
    setRejectedIds(prev => {
      if (prev.includes(orderId)) return prev;
      const next = [...prev, orderId];
      SecureStore.setItemAsync(rejectedKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
    Toast.show({
        type: "info",
        text1: "Commande refusée",
        text2: "Cette mission reste visible pour les autres livreurs.",
    });
  }

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAvailableOrders(false);
  }, [fetchAvailableOrders]);

  const visibleOrders = useMemo(
    () => orders.filter((o) => !rejectedIds.includes(o.id)),
    [orders, rejectedIds]
  );

  const stats = useMemo(() => {
    const pendingOrders = visibleOrders.length; 
    return [
        { 
          id: "1", 
          label: "Disponibles", 
          value: pendingOrders < 10 ? `0${pendingOrders}` : `${pendingOrders}`, 
          icon: Truck, 
          color: "#00A3E0", 
          bgColor: "bg-blue-500/10" 
        },
        { 
            id: "2", 
            label: "En cours", 
            value: "00", 
            icon: Clock, 
            color: "#F59E0B", 
            bgColor: "bg-amber-500/10" 
        },
        { 
            id: "3", 
            label: "Livrés", 
            value: "00", 
            icon: CheckCircle, 
            color: "#10B981", 
            bgColor: "bg-emerald-500/10" 
        },
      ];
  }, [visibleOrders]);

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#00A3E0" />
        <Text className="mt-4 text-gray-500 font-medium">Chargement du dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView 
        className="flex-1 bg-white dark:bg-gray-900" 
        edges={['top']}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="bg-[#F8FAFC] dark:bg-gray-950"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#00A3E0"]} tintColor="#00A3E0" />
          }
        >
          <View className="px-6 pt-6 pb-8 bg-white dark:bg-gray-900 rounded-b-3xl border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center">
                <View className="w-14 h-14 bg-primary/10 rounded-xl items-center justify-center mr-4 border border-primary/5 overflow-hidden">
                    <Truck size={28} color="#00A3E0" />
                </View>
                <View>
                  <Text className="text-gray-400 dark:text-gray-500 font-medium">Bonjour 👋</Text>
                  <Text className="text-2xl font-black text-gray-900 dark:text-white" numberOfLines={1}>
                    {user?.name || "Livreur"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-6 mt-6">
            <View className="flex-row justify-between">
              {stats.map((stat, index) => (
                <Animated.View 
                  key={stat.id}
                  entering={FadeInDown.delay(100 * index).springify()}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl items-center justify-center border border-gray-100 dark:border-gray-800"
                  style={{ width: (width - 60) / 3 }}
                >
                  <View className={`${stat.bgColor} w-10 h-10 rounded-lg items-center justify-center mb-3`}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text className="text-gray-900 dark:text-white font-black text-[18px] text-center">{stat.value}</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-bold text-center uppercase" numberOfLines={1}>
                    {stat.label}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </View>
          
          <View className="px-6 mt-10 mb-20">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <Text className="text-xl font-black text-gray-900 dark:text-white">Missions disponibles</Text>
                <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <Text className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase">En direct</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onRefresh} className="p-2 rounded-xl">
                <RefreshCw size={20} color="#F97316" />
              </TouchableOpacity>
            </View>
            {visibleOrders.length === 0 ? (
                <View className="bg-white dark:bg-gray-900 p-10 rounded-xl items-center justify-center border border-gray-100 dark:border-gray-800">
                    <Truck size={40} color="#94A3B8" />
                    <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                        Aucune mission disponible pour le moment.
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-[13px] text-center mt-2">
                        Les nouvelles commandes apparaissent automatiquement.
                    </Text>
                </View>
            ) : (
                visibleOrders.map((order, index) => (
                    <Animated.View 
                        key={order.id}
                        entering={FadeInDown.delay(400 + (index * 100)).springify()}
                        className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 mb-4"
                    >
                        <View className="flex-row items-center mb-4">
                            <View className="bg-orange-500/10 p-3 rounded-xl mr-4">
                                <ShoppingBag size={24} color="#F97316" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 dark:text-white font-bold text-[16px]">
                                    Commande #{order.id.slice(-6)}
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-[14px]">
                                    {order.totalAmount.toLocaleString('fr-FR')} F
                                </Text>
                            </View>
                        </View>

                        {/* Articles commandés */}
                        {order.items.length > 0 && (
                            <View className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                {order.items.map((item) => (
                                    <View key={item.id} className="flex-row justify-between items-center py-1.5">
                                        <Text className="text-gray-700 dark:text-gray-300 font-medium flex-1 mr-2">
                                            {item.quantity} × {item.product.category.brand} {item.product.category.weight}kg
                                        </Text>
                                        <Text className="text-gray-900 dark:text-white font-bold">
                                            {(item.price * item.quantity).toLocaleString('fr-FR')} F
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View className="flex-row items-center mb-2">
                            <MapPin size={14} color="#94A3B8" />
                            <Text className="text-gray-600 dark:text-gray-300 ml-2 font-medium">
                                Départ: {order.seller?.shopName || "Inconnu"}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <MapPin size={14} color="#94A3B8" />
                            <Text className="text-gray-600 dark:text-gray-300 ml-2 font-medium">
                                Client: {order.consumer?.name || "Inconnu"}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-4">
                            <Phone size={14} color="#94A3B8" />
                            <Text className="text-gray-600 dark:text-gray-300 ml-2 font-medium" numberOfLines={1}>
                                {order.consumer?.address || "Lieu non précisé"}
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => handleRefuse(order.id)}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl items-center"
                            >
                                <Text className="text-gray-600 dark:text-gray-300 font-bold text-[16px]">Refuser</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => handleAssign(order.id)}
                                className="flex-1 bg-orange-500 p-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold text-[16px]">Accepter</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}