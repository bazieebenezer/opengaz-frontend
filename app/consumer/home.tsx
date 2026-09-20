import {
  ChevronRight,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Star,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Plus,
  Minus,
  Check
} from "lucide-react-native";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  Linking,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";

import { productService, Product } from "../../services/product.service";
import { sellerService, Seller } from "../../services/seller.service";
import { useAuth } from "../../stores/auth.store";
import Toast from "react-native-toast-message";
import { SellerCard } from "../../components/SellerCard";

const { width } = Dimensions.get("window");

const FILTERS = ["A proximité", "Disponible", "Mieux notés"];

const GAS_BOTTLES = [
  { id: "b1", name: "Sodigaz 6kg", type: "Petite", price: "2 500 FCFA", available: true, image: "https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?q=80&w=200&h=200&auto=format&fit=crop" },
  { id: "b2", name: "Oryx 12kg", type: "Grande", price: "5 000 FCFA", available: true, image: "https://images.unsplash.com/photo-1624531059199-642f7802149b?q=80&w=200&h=200&auto=format&fit=crop" },
  { id: "b3", name: "Total 6kg", type: "Petite", price: "2 500 FCFA", available: false, image: "https://images.unsplash.com/photo-1521220598440-42145b25321a?q=80&w=200&h=200&auto=format&fit=crop" },
];

// Haversine formula to calculate distance between two points in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function ConsumerHome() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ selectedSellerId?: string }>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [activeFilter, setActiveFilter] = useState("A proximité");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>("Chargement...");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productData, sellerData] = await Promise.all([
        productService.getAllProducts(),
        sellerService.getAllSellers()
      ]);
      setProducts(productData);
      setSellers(sellerData);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      Toast.show({ type: "customError", text1: "Erreur", text2: "Impossible de charger les données." });
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchData();
    getLocation();
  }, []);

  useEffect(() => {
    if (hasFetched && params.selectedSellerId && sellers.length > 0) {
      const seller = sellers.find(s => s.id === params.selectedSellerId);
      if (seller) {
        setSelectedSeller(seller);
      }
    }
  }, [hasFetched, params.selectedSellerId, sellers]);

  const isDarkMode = colorScheme === "dark";
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: any }>({});

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const gasBottles = useMemo(() => {
    console.log("[DEBUG] Mapping products:", products.length);
    return products.map(p => ({
      id: p.id,
      name: `${p.category.brand} ${p.category.weight}kg`,
      type: p.category.weight > 6 ? "Grande" : "Petite",
      price: `${p.category.price.toLocaleString('fr-FR')} FCFA`,
      available: p.stock > 0,
      image: p.category.imageUrl,
      stock: p.stock,
      sellerId: p.sellerId || (p as any).seller?.id
    }));
  }, [products]);

  const filteredBottles = useMemo(() => {
    if (!selectedSeller) return [];
    const filtered = gasBottles.filter(b => b.sellerId === selectedSeller.id);
    console.log(`[DEBUG] Filtered bottles for seller ${selectedSeller.shopName}:`, filtered.length);
    return filtered;
  }, [gasBottles, selectedSeller]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    console.log(`[DEBUG] updateQuantity called for id: ${id}, delta: ${delta}`);
    const bottle = gasBottles.find(b => b.id === id);
    if (!bottle) {
      console.log(`[DEBUG] Bottle not found for id: ${id}`);
      return;
    }

    console.log(`[DEBUG] Found bottle: ${bottle.name}, stock: ${bottle.stock}`);

    setQuantities(prev => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + delta;
      console.log(`[DEBUG] currentQty: ${currentQty}, newQty: ${newQty}`);

      if (newQty > bottle.stock && delta > 0) {
        console.log(`[DEBUG] Insufficient stock: requested ${newQty}, available ${bottle.stock}`);
        Toast.show({
          type: "customError",
          text1: "Stock insuffisant",
          text2: `Désolé, seulement ${bottle.stock} bouteille(s) disponible(s).`,
        });
        return prev;
      }

      return {
        ...prev,
        [id]: Math.max(0, newQty)
      };
    });
  }, [gasBottles]);

  const currentSellerTotalItems = useMemo(() => {
    return filteredBottles.reduce((sum, b) => sum + (quantities[b.id] || 0), 0);
  }, [quantities, filteredBottles]);

  const totalPrice = useMemo(() => {
    return filteredBottles.reduce((sum, bottle) => {
      const qty = quantities[bottle.id] || 0;
      const priceNum = parseInt(bottle.price.replace(/\s/g, '').replace('FCFA', ''));
      return sum + (qty * priceNum);
    }, 0);
  }, [quantities, filteredBottles]);

  const sortedAndFilteredSellers = useMemo(() => {
    let result = [...sellers];

    // 1. Filtrage "Disponible"
    if (activeFilter === "Disponible") {
      result = result.filter(s => s.isShopOpen);
    }

    // 2. Filtrage "Mieux notés"
    if (activeFilter === "Mieux notés") {
      // Pour l'instant on simule une note de 5.0, donc on garde tout
      // Mais on pourrait filtrer sur s.rating >= 4.5 plus tard
      result = result.sort((a, b) => 0); 
    }

    // 3. Calcul des distances et tri "A proximité"
    if (location) {
      result = result.map(s => {
        if (!s.latitude || !s.longitude) return { ...s, distance: Infinity };
        const d = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          s.latitude,
          s.longitude
        );
        return { ...s, distance: d };
      });

      if (activeFilter === "A proximité") {
        result.sort((a, b) => (a as any).distance - (b as any).distance);
      }
    }

    return result;
  }, [sellers, activeFilter, location]);

  const topSellers = useMemo(() => {
    return [...sellers].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  }, [sellers]);

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // If permission denied, try to use user's saved location
        if (user?.latitude && user?.longitude) {
          const mockLocation = {
            coords: { latitude: user.latitude, longitude: user.longitude },
            timestamp: Date.now()
          } as Location.LocationObject;
          setLocation(mockLocation);
          setAddress(user.address || "Ma position enregistrée");
          centerMap(user.latitude, user.longitude);
        } else {
          setAddress("Localisation non définie");
        }
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const city = addr.city || addr.subregion || "";
        const district = addr.district || addr.name || "";
        setAddress(`${city}${district ? ', ' + district : ''}`);
      } else {
        setAddress("Position détectée");
      }

      centerMap(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error("Location error:", error);
      setAddress("Localisation non définie");
    } finally {
      setLoading(false);
    }
  };

  const centerMap = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 1000);
    }
  };

  const openSellerDetails = useCallback((seller: Seller) => {
    setSelectedSeller(seller);
  }, []);

  const closeSellerDetails = useCallback(() => {
    setSelectedSeller(null);
    setQuantities({});
  }, []);

  const mapStyle = [
    { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] },
    { "featureType": "poi.business", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
  ];

  const getSellerDistance = (seller: Seller) => {
    if (!location || !seller.latitude || !seller.longitude) return null;
    const dist = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      seller.latitude,
      seller.longitude
    );
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
  };

  // SellerCard removed


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'left', 'right']}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 150 }} 
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={isDarkMode ? "#fff" : "#000"} />
          }
        >
          <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 pt-6 pb-4">
            <Text className="text-gray-400 dark:text-gray-500 text-lg font-medium">Localisation actuelle</Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={20} color="#ffc74a" />
              <Text className="text-gray-800 dark:text-gray-100 text-xl font-black ml-2">
                {address}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mb-6">
            <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 h-16">
              <Search size={22} color="#94A3B8" />
              <TextInput
                placeholder="Rechercher un revendeur..."
                className="flex-1 ml-3 text-lg font-manrope text-gray-700 dark:text-gray-200"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6 mb-6" contentContainerStyle={{ paddingRight: 40 }}>
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-xl mr-3 ${activeFilter === filter ? "bg-primary" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}
                >
                  <Text className={`font-bold text-[16px] ${activeFilter === filter ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-6 mb-8">
            <View className="h-64 bg-blue-100 dark:bg-blue-900/20 rounded-2xl overflow-hidden relative border-4 border-white dark:border-gray-800">
              {loading ? (
                <View className="absolute inset-0 items-center justify-center bg-blue-50 dark:bg-blue-900/10">
                  <ActivityIndicator size="large" color="#ffc74a" />
                </View>
              ) : location ? (
                <MapView
                  ref={mapRef}
                  style={{ width: '100%', height: '100%' }}
                  customMapStyle={isDarkMode ? [] : mapStyle}
                  initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                >
                  <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Ma position" />
                  {sortedAndFilteredSellers.filter(s => s.latitude && s.longitude).map((seller) => (
                    <Marker
                      key={seller.id}
                      ref={(el) => { markerRefs.current[seller.id] = el }}
                      coordinate={{
                        latitude: seller.latitude!,
                        longitude: seller.longitude!,
                      }}
                    >
                      <View className="bg-primary p-2 rounded-full border-2 border-white">
                        <MapPin size={18} color="white" />
                      </View>
                      <Callout tooltip onPress={() => openSellerDetails(seller)}>
                        <View className="bg-white p-3 rounded-xl border border-gray-100 dark:border-gray-700 min-w-[150px]">
                          <Text className="text-gray-900 font-bold text-[16px] mb-1">{seller.shopName}</Text>
                          <Text className="text-gray-500 text-[12px] mb-3" numberOfLines={1}>{seller.selectedGases?.join(", ")}</Text>
                          <View className="bg-primary py-2 px-3 rounded-lg items-center">
                            <Text className="text-white font-bold text-[14px]">Voir boutique</Text>
                          </View>
                        </View>
                      </Callout>
                    </Marker>
                  ))}
                </MapView>
              ) : (
                <View className="absolute inset-0 bg-blue-50/50 dark:bg-blue-950/30 items-center justify-center p-8">
                  <View className="mb-4 opacity-40">
                    <MapPin size={48} color="#94A3B8" />
                  </View>
                  <Text className="text-gray-900 dark:text-white font-bold text-center text-xl mb-2">
                    Localisation désactivée
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 text-[15px] leading-5 max-w-[260px]">
                    Autorisez l'accÃ¨s Ã  votre position dans les réglages pour voir les revendeurs proches.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      Linking.openSettings();
                    }}
                    className="bg-primary px-6 py-4 rounded-xl shadow-sm"
                  >
                    <Text className="text-white font-bold text-[16px]">Ouvrir les réglages</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={getLocation} className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center">
                <RefreshCw size={24} color="#00A3E0" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()} className="px-6 flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-black text-gray-800 dark:text-white">Revendeurs</Text>
            <TouchableOpacity onPress={() => router.push("/consumer/all-sellers")} className="flex-row items-center">
              <Text className="text-primary font-bold text-lg mr-1 underline">Tout voir</Text>
              <ChevronRight size={20} color="#00A3E0" />
            </TouchableOpacity>
          </Animated.View>

          <View className="px-6">
            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color="#00A3E0" size="large" />
                <Text className="mt-4 text-gray-500 dark:text-gray-400 font-medium text-lg">Chargement...</Text>
              </View>
            ) : hasFetched && sortedAndFilteredSellers.length === 0 ? (
                <View className="py-10 items-center">
                  <AlertCircle size={40} color="#94A3B8" />
                  <Text className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Aucun revendeur disponible...</Text>
                </View>
            ) : (
                topSellers.map((seller, index) => (
                    <SellerCard 
                        key={seller.id}
                        item={seller} 
                        index={index} 
                        onPress={openSellerDetails}
                        getDistance={getSellerDistance}
                    />
                ))
            )}
          </View>
        </ScrollView>

        {/* Boutique sélectionnée â€“ Modale glissante */}
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
                {/* Header Image with overlay close button */}
                <View className="relative">
                  <Image source={{ uri: selectedSeller.shopImage || "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?q=80" }} className="w-full h-52 bg-gray-100" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={closeSellerDetails} 
                    className="absolute top-6 right-6 w-12 h-12 bg-black/40 rounded-full items-center justify-center border border-white/20"
                  >
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
                      <Text className="text-primary font-black uppercase tracking-wider text-[16px]">Ã€ propos</Text>
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
                        <Text className="text-gray-500 dark:text-gray-400 font-bold text-[12px]">{filteredBottles.length} modÃ¨les</Text>
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
                                {bottle.available ? (
                                  <View className="bg-emerald-500/10 px-2 py-1 rounded-lg flex-row items-center">
                                    <CheckCircle2 size={14} color="#10B981" />
                                    <Text className="text-emerald-600 dark:text-emerald-400 text-[12px] font-bold ml-1">
                                      {bottle.stock} en stock
                                    </Text>
                                  </View>
                                ) : (
                                  <View className="bg-red-500/10 px-2 py-1 rounded-lg flex-row items-center">
                                    <AlertCircle size={14} color="#EF4444" />
                                    <Text className="text-red-600 dark:text-red-400 text-[12px] font-bold ml-1">Ã‰puisé</Text>
                                  </View>
                                )}
                                <View className="flex-row items-center bg-gray-100 dark:bg-white/10 rounded-xl p-1 border border-gray-100 dark:border-white/5">
                                <TouchableOpacity 
                                  onPress={() => {
                                    console.log(`[DEBUG] Minus pressed for bottle: ${bottle.id}`);
                                    updateQuantity(bottle.id, -1);
                                  }}
                                  className="w-8 h-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800"
                                >
                                  <Minus size={10} color={isDarkMode ? "white" : "#111827"} />
                                </TouchableOpacity>
                                <View className="w-8 items-center">
                                  <Text className="text-[16px] font-black text-gray-900 dark:text-white">
                                    {quantities[bottle.id] || 0}
                                  </Text>
                                </View>
                                <TouchableOpacity 
                                  onPress={() => {
                                    console.log(`[DEBUG] Plus pressed for bottle: ${bottle.id}`);
                                    updateQuantity(bottle.id, 1);
                                  }}
                                  className="w-8 h-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800"
                                >
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
                            Ce vendeur n'a pas encore ajouté de produits Ã  son inventaire.
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
                  disabled={currentSellerTotalItems === 0}
                  onPress={() => {
                    if (currentSellerTotalItems > 0 && selectedSeller) {
                      const selectedBottles = filteredBottles
                        .filter(b => quantities[b.id] > 0)
                        .map(b => ({
                          ...b,
                          quantity: quantities[b.id]
                        }));
                      
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
                  className={`${currentSellerTotalItems > 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'} w-full h-20 rounded-2xl items-center justify-center`}
                >
                  <View className="flex-row items-center justify-between px-6 w-full">
                    <View>
                      <Text className="text-white text-[18px] font-bold">Commander</Text>
                      {currentSellerTotalItems > 0 && (
                        <Text className="text-white/80 text-[12px] font-bold uppercase tracking-wider">
                          {currentSellerTotalItems} bouteille{currentSellerTotalItems > 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                    {currentSellerTotalItems > 0 ? (
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

