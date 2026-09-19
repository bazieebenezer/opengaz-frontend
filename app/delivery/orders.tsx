import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  ChevronRight,
  XCircle,
  Package,
  Clock,
  ShoppingBag,
  MapPin,
  Phone,
  Truck
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { orderService, Order } from "../../services/order.service";

const STATUS_COLORS = {
  PENDING: { text: "text-red-500", bg: "bg-red-500/10", label: "En attente" },
  PREPARING: { text: "text-blue-500", bg: "bg-blue-500/10", label: "Préparation" },
  READY_FOR_DELIVERY: { text: "text-orange-500", bg: "bg-orange-500/10", label: "Prêt à livrer" },
  IN_DELIVERY: { text: "text-amber-500", bg: "bg-amber-500/10", label: "En livraison" },
  SHIPPED: { text: "text-amber-500", bg: "bg-amber-500/10", label: "En livraison" },
  DELIVERED: { text: "text-emerald-500", bg: "bg-emerald-500/10", label: "Livré" },
  COMPLETED: { text: "text-emerald-500", bg: "bg-emerald-500/10", label: "Terminé" },
  CANCELLED: { text: "text-gray-400", bg: "bg-gray-400/10", label: "Annulé" },
};

const TABS = [
  { id: "ALL", label: "Tout" },
  { id: "ACTIVE", label: "En cours" },
  { id: "URGENT", label: "Urgent" },
  { id: "FINISHED", label: "Terminés" },
];

export default function DeliveryOrders() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyOrders = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await orderService.getMyDeliveryOrders();
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger vos livraisons.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMyOrders(false);
  }, []);

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
        await orderService.confirmDelivered(orderId);
        Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Livraison marquée comme terminée !",
        });
        fetchMyOrders(false);
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Erreur",
            text2: "Impossible de mettre à jour le statut.",
        });
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.consumer?.name || "Client Inconnu";
      const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (activeTab === "ALL") return true;
      if (activeTab === "ACTIVE") return (order.status === "IN_DELIVERY" || (order.status as any) === "SHIPPED");
      if (activeTab === "URGENT") return (order.status === "PREPARING");
      if (activeTab === "FINISHED") return (order.status === "DELIVERED" || order.status === "COMPLETED" || order.status === "CANCELLED");
      return true;
    });
  }, [activeTab, searchQuery, orders]);

  const renderStatusBadge = (status: string) => {
    const config = (STATUS_COLORS as any)[status] || STATUS_COLORS.PENDING;
    return (
      <View className={`px-3 py-1 ${config.bg} rounded-full`}>
        <Text className={`${config.text} text-[12px] font-bold uppercase`}>{config.label}</Text>
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-xs">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-3xl font-black text-orange-500 mb-6">Mes livraisons</Text>
          
          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 h-14 mb-6">
            <Search size={20} color="#94A3B8" />
            <TextInput
              placeholder="Rechercher un client ou N°..."
              className="flex-1 ml-3 text-[16px] font-medium text-gray-700 dark:text-gray-200"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XCircle size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`mr-3 px-6 py-2.5 rounded-xl border ${
                  activeTab === tab.id 
                    ? "bg-orange-500 border-orange-500" 
                    : "bg-transparent border-gray-100 dark:border-gray-700"
                }`}
              >
                <Text className={`font-bold text-[15px] ${
                  activeTab === tab.id ? "text-white" : "text-gray-400 dark:text-gray-500"
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <ScrollView 
          className="flex-1 bg-[#F8FAFC] dark:bg-gray-950"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#F97316"]} />
          }
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(100 * index).springify()}
                layout={Layout.springify()}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 mb-5 border border-gray-100 dark:border-gray-800"
              >
                {/* Order Header */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-bold text-[18px] mb-1">
                      {order.consumer?.name || "Client"}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-tighter mr-2">
                        #{order.id.slice(-6).toUpperCase()}
                      </Text>
                      {renderStatusBadge(order.status)}
                    </View>
                  </View>
                  <Text className="text-orange-500 font-black text-[20px]">{order.totalAmount.toLocaleString('fr-FR')} F</Text>
                </View>

                {/* Info Pills */}
                <View className="flex-row gap-2 mb-4">
                  <View className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl flex-row items-center border border-gray-100/50 dark:border-gray-700/50">
                    <Phone size={12} color="#94A3B8" />
                    <Text className="text-gray-500 dark:text-gray-400 text-[12px] ml-2 font-medium">{order.consumer?.phone || "N/A"}</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl flex-row items-center border border-gray-100/50 dark:border-gray-700/50">
                    <MapPin size={12} color="#94A3B8" />
                    <Text className="text-gray-500 dark:text-gray-400 text-[12px] ml-2 font-medium" numberOfLines={1}>
                      {order.consumer?.address || "Lieu non précisé"}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    {(order.status === "IN_DELIVERY" || (order.status as any) === "SHIPPED") && (
                      <TouchableOpacity 
                        onPress={() => handleMarkAsDelivered(order.id)}
                        className="bg-emerald-500 w-full p-4 rounded-xl items-center flex-row justify-center"
                      >
                        <Truck size={20} color="white" />
                        <Text className="text-white font-bold text-[14px] ml-2">Marquer comme livré</Text>
                      </TouchableOpacity>
                    )}
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-3xl items-center justify-center mb-6">
                <Truck size={48} color="#CBD5E1" />
              </View>
              <Text className="text-orange-500 font-black text-2xl mb-2">Aucune livraison</Text>
              <Text className="text-gray-400 text-center px-10 leading-6">
                {searchQuery 
                  ? "Aucun résultat pour votre recherche." 
                  : "Votre liste est vide pour le moment. Tirez vers le bas pour actualiser."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
