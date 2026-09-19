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
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { orderService, Order, OrderStatus } from "../../services/order.service";

const { width } = Dimensions.get("window");

const STATUS_COLORS = {
  PENDING: { text: "text-red-500", bg: "bg-red-500/10", label: "En attente" },
  PREPARING: { text: "text-blue-500", bg: "bg-blue-500/10", label: "Préparation" },
  READY_FOR_DELIVERY: { text: "text-orange-500", bg: "bg-orange-500/10", label: "Prêt à livrer" },
  PENDING_DELIVERY: { text: "text-orange-500", bg: "bg-orange-500/10", label: "Prêt à livrer" },
  IN_DELIVERY: { text: "text-amber-500", bg: "bg-amber-500/10", label: "En livraison" },
  SHIPPED: { text: "text-amber-500", bg: "bg-amber-500/10", label: "En livraison" },
  DELIVERED: { text: "text-emerald-500", bg: "bg-emerald-500/10", label: "Livré" },
  COMPLETED: { text: "text-emerald-500", bg: "bg-emerald-500/10", label: "Terminé" },
  CANCELLED: { text: "text-gray-400", bg: "bg-gray-400/10", label: "Annulé" },
};

const TABS = [
  { id: "ALL", label: "Tout" },
  { id: "PENDING", label: "Nouveaux" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "FINISHED", label: "Terminés" },
];

export default function SellerOrders() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await orderService.getSellerOrders();
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error);
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: "Impossible de charger les réservations.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrders(false);
  }, []);

  const handleValidate = async (orderId: string) => {
    try {
      await orderService.validateOrder(orderId);
      fetchOrders(false);
      Toast.show({ type: "customSuccess", text1: "Commande validée" });
    } catch (error) {
      Toast.show({ type: "customError", text1: "Erreur lors de la validation" });
    }
  };

  const handleMarkAsReady = async (orderId: string) => {
    try {
      await orderService.markAsReady(orderId);
      fetchOrders(false);
      Toast.show({ type: "customSuccess", text1: "Commande prête pour livraison" });
    } catch (error) {
      Toast.show({ type: "customError", text1: "Erreur" });
    }
  };

  const handleConfirmCompleted = async (orderId: string) => {
    try {
      await orderService.confirmCompleted(orderId);
      fetchOrders(false);
      Toast.show({ type: "customSuccess", text1: "Commande terminée" });
    } catch (error) {
      Toast.show({ type: "customError", text1: "Erreur" });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.consumer?.name || "Client Inconnu";
      const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (activeTab === "ALL") return true;
      if (activeTab === "PENDING") return order.status === "PENDING";
      if (activeTab === "IN_PROGRESS") return (
        order.status === "PREPARING" || 
        order.status === "READY_FOR_DELIVERY" || 
        order.status === "IN_DELIVERY" || 
        (order.status as any) === "PENDING_DELIVERY" || 
        (order.status as any) === "SHIPPED"
      );
      if (activeTab === "FINISHED") return (order.status === "DELIVERED" || order.status === "COMPLETED" || order.status === "CANCELLED");
      return true;
    });
  }, [activeTab, searchQuery, orders]);

  const renderStatusBadge = (status: OrderStatus) => {
    const config = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
    return (
      <View className={`px-3 py-1 ${config.bg} rounded-full`}>
        <Text className={`${config.text} text-[12px] font-bold uppercase`}>{config.label}</Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#00A3E0" />
        <Text className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-xs">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top']}>
      <View className="flex-1">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-3xl font-black text-primary mb-6">Réservations</Text>
          
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
                    ? "bg-primary border-primary" 
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

        <ScrollView 
          className="flex-1 bg-[#F8FAFC] dark:bg-gray-950"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#00A3E0"]} />
          }
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(100 * index).springify()}
                layout={Layout.springify()}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-5 border border-gray-100 dark:border-gray-800"
              >
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
                  <Text className="text-primary font-black text-[20px]">{order.totalAmount.toLocaleString('fr-FR')} F</Text>
                </View>

                <View className="flex-row gap-2 mb-4">
                  <View className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg flex-row items-center border border-gray-100/50 dark:border-gray-700/50">
                    <Phone size={12} color="#94A3B8" />
                    <Text className="text-gray-500 dark:text-gray-400 text-[12px] ml-2 font-medium">{order.consumer?.phone || "N/A"}</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg flex-row items-center border border-gray-100/50 dark:border-gray-700/50">
                    <MapPin size={12} color="#94A3B8" />
                    <Text className="text-gray-500 dark:text-gray-400 text-[12px] ml-2 font-medium" numberOfLines={1}>
                      {order.consumer?.neighborhood || order.consumer?.address || "Lieu non précisé"}
                    </Text>
                  </View>
                </View>

                <View className="mb-5">
                  {order.items.map((item, idx) => (
                    <View key={idx} className="flex-row items-center mb-1">
                      <Package size={14} color="#00A3E0" />
                      <Text className="text-gray-600 dark:text-gray-300 ml-2 font-bold text-[14px]">
                        {item.quantity}x {item.product.category.name}
                      </Text>
                    </View>
                  ))}
                  <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#94A3B8" />
                    <Text className="text-gray-400 dark:text-gray-500 ml-2 text-[12px]">
                      Le {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                  <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => router.push({
                      pathname: "/seller/order-details",
                      params: { id: order.id }
                    })}
                  >
                    <Text className="text-secondary font-bold text-[14px] uppercase tracking-widest mr-1">
                      Détails
                    </Text>
                    <ChevronRight size={16} color="#ffc74a" />
                  </TouchableOpacity>

                  <View className="flex-row gap-2">
                    {order.status === "PENDING" && (
                      <TouchableOpacity 
                        onPress={() => handleValidate(order.id)}
                        className="bg-primary px-5 py-2.5 rounded-xl"
                      >
                        <Text className="text-white font-bold text-[13px]">Valider</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === "PREPARING" && (
                      <TouchableOpacity 
                        onPress={() => handleMarkAsReady(order.id)}
                        className="bg-amber-500 px-5 py-2.5 rounded-xl"
                      >
                        <Text className="text-white font-bold text-[13px]">Prête</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === "DELIVERED" && (
                      <TouchableOpacity 
                        onPress={() => handleConfirmCompleted(order.id)}
                        className="bg-emerald-500 px-5 py-2.5 rounded-xl"
                      >
                        <Text className="text-white font-bold text-[13px]">Terminer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-3xl items-center justify-center mb-6">
                <ShoppingBag size={48} color="#CBD5E1" />
              </View>
              <Text className="text-primary font-black text-2xl mb-2">Aucune réservation</Text>
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
