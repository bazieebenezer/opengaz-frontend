import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Image,
  Pressable,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { ArrowLeft, AlertCircle, Star, Phone, Clock, Info, CheckCircle2, Plus, Minus, X } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { sellerService, Seller } from "../../services/seller.service";
import { productService, Product } from "../../services/product.service";
import Toast from "react-native-toast-message";
import { SellerCard } from "../../components/SellerCard";

export default function AllSellers() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const isDarkMode = colorScheme === "dark";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellerData, productData] = await Promise.all([
        sellerService.getAllSellers(),
        productService.getAllProducts()
      ]);
      setSellers(sellerData);
      setProducts(productData);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      Toast.show({ type: "customError", text1: "Erreur", text2: "Impossible de charger les données." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    Location.getCurrentPositionAsync({}).then(setLocation).catch(console.error);
  }, []);

  const openSellerDetails = useCallback((seller: Seller) => {
    setSelectedSeller(seller);
  }, []);

  const closeSellerDetails = useCallback(() => {
    setSelectedSeller(null);
    setQuantities({});
  }, []);

  const getDistance = (seller: Seller) => {
    if (!location || !seller.latitude || !seller.longitude) return null;
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const dist = calculateDistance(location.coords.latitude, location.coords.longitude, seller.latitude, seller.longitude);
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
  };

  const filteredBottles = useMemo(() => {
    if (!selectedSeller) return [];
    return products
        .filter(p => p.sellerId === selectedSeller.id)
        .map(p => ({
            ...p,
            name: `${p.category.brand} ${p.category.weight}kg`,
            type: p.category.weight > 6 ? "Grande" : "Petite",
            price: `${p.category.price.toLocaleString('fr-FR')} FCFA`,
            available: p.stock > 0,
            image: p.category.imageUrl,
        }));
  }, [products, selectedSeller]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    const bottle = products.find(p => p.id === id);
    if (!bottle) return;
    setQuantities(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      if (newQty > bottle.stock && delta > 0) return prev;
      return { ...prev, [id]: newQty };
    });
  }, [products]);

  const totalPrice = useMemo(() => {
    return filteredBottles.reduce((sum, bottle) => {
      const qty = quantities[bottle.id] || 0;
      const priceNum = bottle.category.price;
      return sum + (qty * priceNum);
    }, 0);
  }, [quantities, filteredBottles]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <Animated.View entering={FadeInDown.springify()} className="px-6 py-6 mb-4 mt-8">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <ArrowLeft size={24} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <Text className="font-black text-4xl text-primary text-center">Tous les revendeurs</Text>
            </Animated.View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 50 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={["#00A3E0"]} />}>
                {loading ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <ActivityIndicator color="#00A3E0" size="large" />
                    </View>
                ) : sellers.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="flex-1 items-center justify-center pt-20">
                        <AlertCircle size={40} color="#94A3B8" />
                        <Text className="text-gray-400 text-lg font-medium mt-4">Aucun vendeur trouvé.</Text>
                    </Animated.View>
                ) : (
                    sellers.map((seller, index) => (
                        <SellerCard 
                            key={seller.id}
                            item={seller} 
                            index={index} 
                            onPress={openSellerDetails}
                            getDistance={getDistance}
                        />
                    ))
                )}
            </ScrollView>

            <Modal
              visible={!!selectedSeller}
              transparent
              animationType="slide"
              statusBarTranslucent
              onRequestClose={closeSellerDetails}
            >
              {selectedSeller && (
                <View className="flex-1 justify-end">
                  <TouchableWithoutFeedback onPress={closeSellerDetails}>
                    <View className="absolute inset-0 bg-black/50" />
                  </TouchableWithoutFeedback>

                  <View style={{ height: "92%" }} className="bg-white dark:bg-gray-900 rounded-t-3xl overflow-hidden">
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="relative">
                      <Image source={{ uri: selectedSeller.shopImage || "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?q=80" }} className="w-full h-52 bg-gray-100" resizeMode="cover" />
                      <TouchableOpacity onPress={closeSellerDetails} className="absolute top-6 right-6 w-12 h-12 bg-black/40 rounded-full items-center justify-center border border-white/20">
                        <X size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    <View className="px-6 py-8">
                      {/* Seller Main Info */}
                      <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 mr-4">
                          <Text className="text-3xl font-black text-gray-900 dark:text-white mb-2">{selectedSeller.shopName}</Text>
                          <View className="flex-row items-center flex-wrap">
                            <View className="flex-row items-center bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-lg mr-3">
                              <Star size={16} color="#FBBF24" fill="#FBBF24" />
                              <Text className="ml-1 text-amber-700 dark:text-amber-400 font-bold">
                                {selectedSeller.rating && selectedSeller.rating > 0 ? selectedSeller.rating.toFixed(1) : "Nouveau"}
                              </Text>
                            </View>
                            <Text className="text-gray-400 font-medium">
                              {selectedSeller.reviewCount && selectedSeller.reviewCount > 0 
                                ? `${selectedSeller.reviewCount} avis` 
                                : selectedSeller.selectedGases?.join(", ")}
                            </Text>
                          </View>
                        </View>
                        <View className={`px-4 py-2 rounded-2xl ${selectedSeller.isShopOpen ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                          <Text className={`font-bold ${selectedSeller.isShopOpen ? "text-emerald-600" : "text-red-500"}`}>
                            {selectedSeller.isShopOpen ? "Ouvert" : "Fermé"}
                          </Text>
                        </View>
                      </Animated.View>

                      {/* Contact & Hours Quick Info */}
                      <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row mb-12 bg-gray-50 dark:bg-white/5 p-4 rounded-xl justify-between">
                        <View className="flex-1 items-center border-r border-gray-200 dark:border-white/10">
                          <Phone size={24} color="#64748B" />
                          <Text className="text-[14px] text-gray-400 uppercase mt-2 font-black">Appeler</Text>
                          <Text className="text-gray-700 dark:text-gray-300 font-bold text-[14px] mt-0.5">{selectedSeller.phone}</Text>
                        </View>
                        <View className="flex-1 items-center">
                          <Clock size={24} color="#64748B" />
                          <Text className="text-[14px] text-gray-400 uppercase mt-2 font-black">Horaires</Text>
                          <Text className="text-gray-700 dark:text-gray-300 font-bold text-[14px] mt-0.5">{selectedSeller.openingHours || "Non spécifié"}</Text>
                        </View>
                      </Animated.View>

                      {/* Description */}
                      <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-16">
                        <View className="flex-row items-center mb-3">
                          <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-2">
                            <Info size={24} color="#00A3E0" />
                          </View>
                          <Text className="text-primary font-black uppercase tracking-wider text-[16px]">À propos</Text>
                        </View>
                        <Text className="text-gray-600 dark:text-gray-400 text-[16px] leading-7">
                          {selectedSeller.description || "Aucune description fournie par ce vendeur."}
                        </Text>
                      </Animated.View>

                      {/* Products Section */}
                      <View>
                        <Animated.View entering={FadeInDown.delay(400).springify()} className="flex-row items-center justify-between mb-6">
                          <Text className="text-2xl font-black text-gray-900 dark:text-white">Bouteilles disponibles</Text>
                          <View className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-[12px]">{filteredBottles.length} modèles</Text>
                          </View>
                        </Animated.View>

                        <View>
                          {products.length === 0 ? (
                            <View className="py-10 items-center">
                              <AlertCircle size={40} color="#94A3B8" />
                              <Text className="text-gray-500 text-center mt-4 px-10">
                                Aucun produit n'est disponible dans l'application actuellement.
                              </Text>
                            </View>
                          ) : filteredBottles.length > 0 ? (
                            filteredBottles.map((bottle, index) => (
                              <Animated.View 
                                key={bottle.id} 
                                entering={FadeInDown.delay(500 + (index * 100)).springify()}
                                className={`flex-row items-center bg-white dark:bg-white/5 p-4 rounded-xl border ${quantities[bottle.id] > 0 ? 'border-secondary' : 'border-gray-100 dark:border-white/5'} mb-4`}
                              >
                                <View className="w-24 h-24 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center overflow-hidden">
                                  <Image source={{ uri: bottle.image }} className="w-full h-full" resizeMode="cover" />
                                </View>
                                <View className="flex-1 ml-4">
                                  <Text className="text-[18px] font-black text-gray-900 dark:text-white">{bottle.name}</Text>
                                  <Text className="text-gray-400 font-medium mb-4">{bottle.type} bouteille</Text>
                                  <View className="flex-row items-center">
                                    <Text className="text-primary text-xl font-extrabold mr-3">{bottle.price}</Text>
                                  </View>
                                </View>
                                {bottle.available && (
                                  <View className="flex items-center gap-3">
                                    <View className="bg-emerald-500/10 px-2 py-1 rounded-lg flex-row items-center">
                                      <CheckCircle2 size={14} color="#10B981" />
                                      <Text className="text-emerald-600 dark:text-emerald-400 text-[12px] font-bold ml-1">
                                        {bottle.stock} en stock
                                      </Text>
                                    </View>
                                    <View className="flex-row items-center bg-gray-100 dark:bg-white/10 rounded-xl p-1 border border-gray-100 dark:border-white/5">
                                      <TouchableOpacity onPress={() => updateQuantity(bottle.id, -1)} className="w-8 h-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                                        <Minus size={10} color={isDarkMode ? "white" : "#111827"} />
                                      </TouchableOpacity>
                                      <View className="w-8 items-center">
                                        <Text className="text-[16px] font-black text-gray-900 dark:text-white">{quantities[bottle.id] || 0}</Text>
                                      </View>
                                      <TouchableOpacity onPress={() => updateQuantity(bottle.id, 1)} className="w-8 h-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                                        <Plus size={10} color={isDarkMode ? "white" : "#111827"} />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                )}
                              </Animated.View>
                            ))
                          ) : (
                            <View className="py-10 items-center">
                              <Info size={40} color="#00A3E0" />
                              <Text className="text-gray-500 text-center mt-4">
                                Ce vendeur n'a pas encore ajouté de produits à son inventaire.
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                  
                  {/* Floating Order Button - Sticky at the bottom of the sheet */}
                  <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/5">
                    <Pressable 
                      disabled={Object.values(quantities).reduce((a,b)=>a+b, 0) === 0}
                      onPress={() => {
                        const totalQty = Object.values(quantities).reduce((a,b)=>a+b, 0);
                        if (totalQty > 0 && selectedSeller) {
                          const selectedBottles = filteredBottles
                            .filter(b => quantities[b.id] > 0)
                            .map(b => ({ ...b, quantity: quantities[b.id] }));

                          closeSellerDetails();
                          router.push({
                            pathname: "/consumer/order-details",
                            params: {
                              bottles: JSON.stringify(selectedBottles),
                              totalPrice: totalPrice,
                              sellerName: selectedSeller.shopName,
                              sellerId: selectedSeller.id
                            }
                          });
                        }
                      }}
                      className={`${Object.values(quantities).reduce((a,b)=>a+b, 0) > 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'} w-full h-20 rounded-2xl items-center justify-center`}
                    >
                      <View className="flex-row items-center justify-between px-6 w-full">
                        <View>
                          <Text className="text-white text-[18px] font-bold">Commander</Text>
                          {Object.values(quantities).reduce((a,b)=>a+b, 0) > 0 && (
                            <Text className="text-white/80 text-[12px] font-bold uppercase tracking-wider">
                              {Object.values(quantities).reduce((a,b)=>a+b, 0)} bouteille{Object.values(quantities).reduce((a,b)=>a+b, 0) > 1 ? 's' : ''}
                            </Text>
                          )}
                        </View>
                        {Object.values(quantities).reduce((a,b)=>a+b, 0) > 0 ? (
                          <View className="bg-white/20 px-4 py-2 rounded-xl">
                            <Text className="text-white text-[18px] font-black">
                              {totalPrice.toLocaleString('fr-FR')} F
                            </Text>
                          </View>
                        ) : (
                          <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                            <Text className="text-[18px] text-gray-600 dark:text-white">--</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </View>
                  </View>
                </View>
              )}
            </Modal>
        </SafeAreaView>
    </GestureHandlerRootView>
  );
}
