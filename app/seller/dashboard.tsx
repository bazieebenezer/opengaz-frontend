import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Modal,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  ChevronRight,
  Package,
  Bell,
  Store,
  X,
  ShoppingBag,
  RefreshCw,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown, FadeInRight, ZoomIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useOrders } from "../../stores/order.store";
import { useAuth } from "../../stores/auth.store";
import { authService } from "../../services/auth.service";
import { productService, Product } from "../../services/product.service";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_layout";

const { width } = Dimensions.get("window");

const MOCK_NOTIFICATIONS: any[] = [];

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { orders } = useOrders();

  const [isOpen, setIsOpen] = useState(user?.isShopOpen ?? true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [directSalesToday, setDirectSalesToday] = useState(0);

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showManageStockModal, setShowManageStockModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (error) {
      console.error("Fetch products error:", error);
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: "Impossible de charger vos produits.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts(false);
  }, []);

  const handleToggleShop = async (value: boolean) => {
    try {
      console.log("[DEBUG] Tentative de changement de statut vers:", value);
      setIsOpen(value);
      const response = await authService.updateShopStatus(value);
      console.log("[DEBUG] Réponse du serveur:", response);
    } catch (error: any) {
      console.error("[DEBUG] Erreur complÃ¨te handleToggleShop:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      setIsOpen(!value); 
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: error.response?.data?.message || "Impossible de changer le statut.",
      });
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const previousProducts = [...products];

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

    try {
      await productService.updateStock(productId, newStock);
    } catch (error) {
      setProducts(previousProducts);
      
      Toast.show({
        type: "customError",
        text1: "Erreur",
        text2: "Mise Ã  jour du stock échouée.",
      });
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return (o.status === "DELIVERED" || o.status === "COMPLETED") && orderDate >= today;
      })
      .reduce((acc, curr) => acc + curr.totalPrice, 0) + directSalesToday;
    
    const pendingOrders = orders.filter(o => 
      o.status === "PENDING" || 
      (o.status as any) === "VALIDATED" || 
      o.status === "PREPARING" ||
      (o.status as any) === "SHIPPED"
    ).length;
    
    const stockAlerts = products.filter(p => p.stock < 5).length;

    return [
      { 
        id: "1", 
        label: "Ventes (Jour)", 
        value: `${todaySales.toLocaleString('fr-FR')} F`, 
        icon: TrendingUp, 
        color: "#10B981", 
        bgColor: "bg-emerald-500/10" 
      },
      { 
        id: "2", 
        label: "Ã€ traiter", 
        value: pendingOrders < 10 ? `0${pendingOrders}` : `${pendingOrders}`, 
        icon: Clock, 
        color: "#00A3E0", 
        bgColor: "bg-blue-500/10" 
      },
      { 
        id: "3", 
        label: "Alertes Stock", 
        value: stockAlerts < 10 ? `0${stockAlerts}` : `${stockAlerts}`, 
        icon: AlertTriangle, 
        color: "#F59E0B", 
        bgColor: "bg-amber-500/10" 
      },
    ];
  }, [orders, directSalesToday, products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [orders]);

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const openNotifications = () => {
    bottomSheetRef.current?.snapToIndex(0);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, 1000);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsAt={-1}
        appearsAt={0}
        opacity={0.5}
      />
    ),
    []
  );

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
                  {user?.shopImage ? (
                    <Image 
                      source={{ uri: user.shopImage }} 
                      className="w-full h-full" 
                      resizeMode="cover" 
                    />
                  ) : (
                    <Store size={28} color="#00A3E0" />
                  )}
                </View>
                <View>
                  <Text className="text-gray-400 dark:text-gray-500 font-medium">Bonjour ðŸ‘‹</Text>
                  <Text className="text-2xl font-black text-gray-900 dark:text-white" numberOfLines={1}>
                    {user?.shopName || user?.name || "Boutique"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={openNotifications}
                className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl items-center justify-center relative border border-gray-100 dark:border-gray-700"
              >
                <Bell size={24} color={isDarkMode ? "#94A3B8" : "#475569"} />
                {hasUnread && (
                  <View className="absolute top-3 right-3 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </TouchableOpacity>
            </View>

            <View className="px-6 py-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-row items-center">
              <View className="flex-row items-center flex-1 pr-2">
                <View className={`w-3 h-3 rounded-full mr-3 ${isOpen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-bold text-[17px] leading-tight">
                    {isOpen ? "Boutique Ouverte" : "Boutique Fermée"}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-[13px] mt-0.5" numberOfLines={1}>
                    {isOpen ? "PrÃªt Ã  recevoir des commandes" : "Inactif pour les clients"}
                  </Text>
                </View>
              </View>
              
              <View className="ml-2">
                <Switch
                  value={isOpen}
                  onValueChange={handleToggleShop}
                  trackColor={{ false: "#CBD5E1", true: "#00A3E0" }}
                  thumbColor="#fff"
                  style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                />
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

          <View className="px-6 mt-10">
            <Text className="text-xl font-black text-gray-900 dark:text-white mb-4">Actions rapides</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={() => {
                  setSelectedItems({});
                  setShowNewSaleModal(true);
                }}
                className="bg-white dark:bg-gray-900 p-5 rounded-xl flex-row items-center flex-1 mr-3 border border-gray-100 dark:border-gray-800"
              >
                <View className="bg-amber-500/10 p-3 rounded-xl mr-4">
                  <PlusCircle size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-bold text-[14px]">Nouvelle</Text>
                  <Text className="text-gray-400 text-[14px]">Vente directe</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowManageStockModal(true)}
                className="bg-white dark:bg-gray-900 p-5 rounded-xl flex-row items-center flex-1 border border-gray-100 dark:border-gray-800"
              >
                <View className="bg-primary/10 p-3 rounded-xl mr-4">
                  <Package size={24} color="#00A3E0" />
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-bold text-[14px]">Gérer</Text>
                  <Text className="text-gray-400 text-[14px]">Les stocks</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 mt-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-gray-900 dark:text-white">Inventaire & Stocks</Text>
              <TouchableOpacity onPress={onRefresh} className="p-2">
                <RefreshCw size={20} color="#00A3E0" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const getStockColor = (stock: number) => {
                    if (stock === 0) return '#EF4444';
                    if (stock < 5) return '#F97316';
                    return '#10B981';
                  };
                  
                  const stockColor = getStockColor(product.stock);
                  const percentage = Math.min(100, (product.stock / 20) * 100); 

                  return (
                    <View key={product.id} className={`p-4 ${index !== 0 ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}>
                      <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl items-center justify-center mr-4 border border-gray-100 dark:border-gray-700">
                          <Image 
                            source={{ uri: product.category.imageUrl }} 
                            className="w-12 h-12" 
                            resizeMode="contain" 
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-900 dark:text-white font-bold text-[16px]">{product.category.name}</Text>
                            <Text style={{ color: stockColor }} className="font-black text-[16px]">{product.stock} u.</Text>
                          </View>
                          <Text className="text-gray-400 text-[13px] mb-2">{product.category.price.toLocaleString('fr-FR')} F / recharge</Text>
                          <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <Animated.View 
                              entering={FadeInRight.delay(200 + (index * 100)).duration(1000)}
                              className="h-full rounded-full"
                              style={{ width: `${percentage}%`, backgroundColor: stockColor }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className="py-10 items-center">
                  <Package size={40} color="#CBD5E1" />
                  <Text className="text-gray-400 mt-2">Aucun produit configuré</Text>
                </View>
              )}
            </View>
          </View>

          <View className="px-6 mt-10">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-xl font-black text-gray-900 dark:text-white">Commandes Récentes</Text>
              <TouchableOpacity onPress={() => router.push("/seller/orders")} className="flex-row items-center">
                <Text className="text-primary font-bold text-lg mr-1 underline">Tout voir</Text>
                <ChevronRight size={20} color="#00A3E0" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <TouchableOpacity
                    key={order.id}
                    onPress={() => router.push({
                      pathname: "/seller/order-details",
                      params: { 
                        id: order.id, 
                        customer: order.customerName || "Client Inconnu", 
                        items: order.items.map(i => `${i.quantity}x ${i.name}`).join(", "), 
                        price: `${order.totalPrice} F`, 
                        status: order.status 
                      }
                    })}
                  >
                    <Animated.View 
                      entering={FadeInDown.delay(400 + (index * 100)).springify()}
                      className="bg-white dark:bg-gray-900 p-5 rounded-xl flex-row items-center border border-gray-100 dark:border-gray-800 mb-4"
                    >
                      <View className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${order.status === 'PENDING' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                        <ShoppingBag size={24} color={order.status === 'PENDING' ? '#EF4444' : '#00A3E0'} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-900 dark:text-white font-bold text-[16px]">{order.customerName || "Client Inconnu"}</Text>
                          <Text className="text-primary font-black text-[16px]">{order.totalPrice.toLocaleString('fr-FR')} F</Text>
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 mb-1 text-[14px]">{order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</Text>
                        <View className="flex-row items-center">
                          <Clock size={12} color="#94A3B8" />
                          <Text className="text-gray-400 text-[12px] ml-1 font-medium">{order.date}</Text>
                          <View className="mx-2 w-1 h-1 bg-gray-300 rounded-full" />
                          <Text className={`text-[14px] font-bold ${
                            order.status === 'PENDING' ? 'text-red-500' : 
                            order.status === 'CANCELLED' ? 'text-gray-400' : 'text-blue-500'
                          }`}>
                            {order.status === 'PENDING' ? 'Ã€ valider' : 
                             (order.status as any) === 'VALIDATED' ? 'Validé' :
                             order.status === 'PREPARING' ? 'En préparation' :
                             (order.status as any) === 'SHIPPED' ? 'En livraison' :
                             order.status === 'DELIVERED' ? 'Livré' :
                             order.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color="#CBD5E1" className="ml-2" />
                    </Animated.View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-white dark:bg-gray-900 p-10 rounded-xl items-center justify-center border border-gray-100 dark:border-gray-800">
                  <ShoppingBag size={40} color="#94A3B8" />
                  <Text className="text-gray-500 dark:text-gray-400 mt-4">Aucune commande récente</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: isDarkMode ? '#111827' : 'white', borderRadius: 20 }}
          handleIndicatorStyle={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB', width: 50 }}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <View className="px-6 pt-2 pb-4 flex-row justify-between items-center border-b border-gray-100 dark:border-white/5">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Notifications</Text>
              <TouchableOpacity 
                onPress={() => bottomSheetRef.current?.close()}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
              >
                <X size={20} color={isDarkMode ? "white" : "#111827"} />
              </TouchableOpacity>
            </View>

            {notifications.length > 0 ? (
              <BottomSheetScrollView contentContainerStyle={{ padding: 24 }}>
                {notifications.map((notif, idx) => (
                  <Animated.View 
                    key={notif.id}
                    entering={FadeInDown.delay(100 * idx).springify()}
                    className="flex-row items-start mb-8"
                  >
                    <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${notif.type === 'ORDER' ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
                      {notif.type === 'ORDER' ? <ShoppingBag size={22} color="#00A3E0" /> : <AlertTriangle size={22} color="#F59E0B" />}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-gray-900 dark:text-white font-bold text-[16px] flex-1 mr-2">{notif.title}</Text>
                        <Text className="text-gray-400 text-[12px] font-medium">{notif.time}</Text>
                      </View>
                      <Text className="text-gray-500 dark:text-gray-400 leading-5">{notif.description}</Text>
                    </View>
                  </Animated.View>
                ))}
                
                <TouchableOpacity 
                  onPress={() => setNotifications([])}
                  className="mt-4 py-4 items-center"
                >
                  <Text className="text-primary font-bold">Tout effacer</Text>
                </TouchableOpacity>
              </BottomSheetScrollView>
            ) : (
              <View className="flex-1 items-center justify-center px-8 pb-20">
                <Animated.View entering={ZoomIn.duration(500)} className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full items-center justify-center mt-8 mb-6">
                  <Bell size={40} color="#CBD5E1" />
                </Animated.View>
                <Text className="text-[18px] font-bold text-gray-900 dark:text-white text-center mb-2">Aucune notification</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-[16px]">
                  Vous Ãªtes Ã  jour ! Toutes les nouvelles alertes apparaÃ®tront ici.
                </Text>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>

        <Modal
          visible={showNewSaleModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowNewSaleModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <View className="bg-white dark:bg-gray-800 w-full rounded-xl p-6 items-center border border-gray-100 dark:border-gray-800">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Vente au comptoir
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center text-[14px] mb-8">
                Renseignez le modÃ¨le de bouteille vendu physiquement.
              </Text>
              
              <ScrollView className="max-h-96 w-full mb-6" showsVerticalScrollIndicator={false}>
                <View className="gap-3 w-full">
                  {products.map((product) => {
                    const quantity = selectedItems[product.id] || 0;
                    const isSelected = quantity > 0;
                    
                    return (
                      <View key={product.id} className={`p-4 rounded-xl border ${
                          isSelected ? "border-primary bg-primary/10" : "border-gray-100 dark:border-gray-700"
                        }`}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedItems(prev => ({
                              ...prev,
                              [product.id]: isSelected ? 0 : 1
                            }));
                          }}
                          className="flex-row justify-between items-center mb-2"
                        >
                          <View className="flex-row items-center flex-1">
                            <Image source={{ uri: product.category.imageUrl }} className="w-8 h-8 mr-3" resizeMode="contain" />
                            <View>
                              <Text className="font-bold text-gray-900 dark:text-white text-[15px]">{product.category.name}</Text>
                              <Text className="text-gray-400 text-[13px]">{product.category.price.toLocaleString('fr-FR')} F</Text>
                            </View>
                          </View>
                          <Text className="font-black text-secondary text-[14px]">{isSelected ? 'SÃ‰LECTIONNÃ‰' : 'CHOISIR'}</Text>
                        </TouchableOpacity>
                        
                        {isSelected && (
                          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Text className="font-bold text-gray-700 dark:text-gray-300">Quantité</Text>
                            <View className="flex-row items-center gap-4">
                              <TouchableOpacity
                                onPress={() => setSelectedItems(prev => ({ ...prev, [product.id]: Math.max(1, quantity - 1) }))}
                                className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center"
                              >
                                <Text className="text-2xl font-bold text-gray-700 dark:text-white">-</Text>
                              </TouchableOpacity>
                              <Text className="text-xl font-bold text-gray-900 dark:text-white">{quantity}</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  if (quantity >= product.stock) {
                                    Toast.show({
                                      type: "customError",
                                      text1: "Stock insuffisant",
                                      text2: `Il ne reste que ${product.stock} bouteilles.`,
                                    });
                                  } else {
                                    setSelectedItems(prev => ({ ...prev, [product.id]: quantity + 1 }));
                                  }
                                }}
                                className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center"
                              >
                                <Text className="text-2xl font-bold text-gray-700 dark:text-white">+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              {(() => {
                const total = products.reduce((acc, p) => acc + (p.category.price * (selectedItems[p.id] || 0)), 0);
                return (
                  <View className="flex-row justify-between items-center w-full mb-8">
                    <Text className="text-gray-500 dark:text-gray-400 font-bold text-[14px]">Total Ã  encaisser</Text>
                    <Text className="text-primary font-black text-2xl">{total.toLocaleString("fr-FR")} F</Text>
                  </View>
                );
              })()}

              <View className="w-full gap-3">
                <TouchableOpacity
                  onPress={async () => {
                    const itemsToProcess = Object.entries(selectedItems).filter(([_, qty]) => qty > 0);
                    if (itemsToProcess.length > 0) {
                      let totalSale = 0;
                      
                      for (const [prodId, qty] of itemsToProcess) {
                        const product = products.find(p => p.id === prodId);
                        if (product) {
                          totalSale += product.category.price * qty;
                          await handleUpdateStock(prodId, product.stock - qty);
                        }
                      }
                      
                      setDirectSalesToday(prev => prev + totalSale);
                      setShowNewSaleModal(false);
                      setSelectedItems({});
                      
                      Toast.show({
                        type: "customSuccess",
                        text1: "Vente enregistrée !",
                        text2: `La caisse et les stocks ont été mis Ã  jour.`,
                      });
                    }
                  }}
                  className="bg-primary w-full py-6 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-bold text-[16px]">Confirmer la vente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowNewSaleModal(false)}
                  className="w-full py-2 items-center justify-center"
                >
                  <Text className="text-gray-400 font-bold text-sm">Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showManageStockModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowManageStockModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <View className="bg-white dark:bg-gray-800 w-full rounded-xl p-6 items-center border border-gray-100 dark:border-gray-800">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Mise Ã  jour inventaire
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center text-[14px] mb-8">
                Ajustez le nombre exact de bouteilles pleines disponibles.
              </Text>

              <ScrollView className="w-full max-h-96 mb-8" showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  {products.map((product) => (
                    <View key={product.id} className="border border-gray-100 dark:border-gray-700 p-4 rounded-xl flex-row items-center">
                      <Image source={{ uri: product.category.imageUrl }} className="w-10 h-10 mr-4" resizeMode="contain" />
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 dark:text-white mb-2 text-[15px]">{product.category.name}</Text>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-primary font-black text-xl">{product.stock}</Text>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() => handleUpdateStock(product.id, Math.max(0, product.stock - 1))}
                              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center"
                            >
                              <Text className="font-bold text-gray-700 dark:text-gray-300 text-xl">-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleUpdateStock(product.id, product.stock + 1)}
                              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center"
                            >
                              <Text className="font-bold text-gray-700 dark:text-gray-300 text-xl">+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View className="w-full">
                <TouchableOpacity
                  onPress={() => {
                    setShowManageStockModal(false);
                    Toast.show({
                      type: "customSuccess",
                      text1: "Inventaire synchronisé",
                      text2: "Vos stocks sont Ã  jour pour les clients.",
                    });
                  }}
                  className="bg-primary w-full py-6 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-bold text-[16px]">Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

