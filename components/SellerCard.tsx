import React from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { Navigation, Star } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Seller } from '../services/seller.service';

interface SellerCardProps {
  item: Seller;
  index: number;
  onPress: (seller: Seller) => void;
  getDistance: (seller: Seller) => string | null;
}

export const SellerCard: React.FC<SellerCardProps> = ({ item, index, onPress, getDistance }) => {
  return (
    <Animated.View 
      key={item.id} 
      entering={FadeInDown.delay(100 * index).springify()}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item)}
        className="flex-row items-center bg-white dark:bg-white/5 rounded-2xl p-3.5 mb-4 border border-gray-200/70 dark:border-white/5"
      >
        <Image source={{ uri: item.shopImage || "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?q=80" }} className="w-[90px] h-[90px] rounded-lg bg-gray-100 dark:bg-[#1A1A1A]" />
        <View className="flex-1 ml-4 justify-between h-[90px]">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text numberOfLines={1} className="text-xl font-black tracking-tight text-black dark:text-white">
                {item.shopName}
              </Text>
              <Text className="mt-1 text-[14px] font-medium text-gray-400 dark:text-gray-500 flex-shrink">
                {item.selectedGases?.join(", ") || "Gaz non spécifié"}
              </Text>
            </View>
            <View className={`px-2.5 py-1 rounded-full ${item.isShopOpen ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <Text className={`text-[13px] font-semibold ${item.isShopOpen ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                {item.isShopOpen ? "Ouvert" : "Fermé"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-end justify-between">
            <View className="flex-row items-center">
              <Navigation size={14} color="#9CA3AF" />
              <Text className="ml-1.5 text-[13px] font-medium text-gray-400 dark:text-gray-500">
                {getDistance(item) || "Distance inconnue"}
              </Text>
            </View>
            <View className="flex-row items-center px-2.5 py-1.5 rounded-full bg-amber-400/10">
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text className="ml-1 text-[13px] font-semibold text-amber-500">
                {item.rating && item.rating > 0 ? item.rating.toFixed(1) : "Nouveau"}
              </Text>
              {item.reviewCount && item.reviewCount > 0 ? (
                <Text className="text-[10px] text-gray-400 ml-1">({item.reviewCount})</Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
