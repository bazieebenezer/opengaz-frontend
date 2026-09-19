import api from "../services/http";

export interface Seller {
  id: string;
  shopName?: string | null;
  name?: string | null;
  shopImage?: string | null;
  description?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  isShopOpen: boolean;
  selectedGases?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number;
  reviewCount?: number;
}

export const sellerService = {
  getAllSellers: async (): Promise<Seller[]> => {
    const { data } = await api.get<{ sellers: Seller[] }>("/sellers");
    return data.sellers;
  },
};