import api from "../services/http";

export interface GasCategory {
  id: string;
  name: string;
  brand: string;
  weight: number;
  price: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  stock: number;
  categoryId?: string;
  sellerId?: string;
  seller?: {
    id?: string;
    shopName?: string;
    name?: string;
    shopImage?: string;
  };
  category: GasCategory;
  createdAt?: string;
  updatedAt?: string;
}

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const { data } = await api.get<{ products: Product[] }>("/products");
    return data.products;
  },

  getMyProducts: async (): Promise<Product[]> => {
    const { data } = await api.get<{ products: Product[] }>("/products/me");
    return data.products;
  },

  updateStock: async (
    productId: string,
    stock: number
  ): Promise<{ product: Product }> => {
    const { data } = await api.patch<{ product: Product }>(
      `/products/${productId}/stock`,
      { stock }
    );
    return data;
  },
};