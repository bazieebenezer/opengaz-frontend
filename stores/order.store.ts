import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { orderService, Order as BackendOrder, OrderStatus as BackendOrderStatus } from '../services/order.service';
import { reviewService } from '../services/review.service';
import { useAuthStore } from './auth.store';

export type OrderStatus = "PENDING" | "PREPARING" | "READY_FOR_DELIVERY" | "IN_DELIVERY" | "DELIVERED" | "COMPLETED" | "CANCELLED";

export interface Order {
  id: string;
  sellerName: string;
  sellerImage?: string;
  sellerPhone?: string;
  customerName?: string;
  date: string;
  totalPrice: number;
  status: OrderStatus;
  items: { id: string; name: string; quantity: number; price: string; image: string; productId: string }[];
  sellerId?: string;
  consumer?: { latitude?: number; longitude?: number };
  deliverer?: { id: string; name: string; phone: string; shopImage?: string; latitude?: number; longitude?: number };
  createdAt: string;
  hasReview: boolean;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string, rating: number, comment?: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'createdAt' | 'hasReview'>) => Promise<Order>;
  clearOrders: () => Promise<void>;
}

const mapBackendOrderToContextOrder = (bo: BackendOrder): Order => {
  let status = bo.status;
  if (status as any === "PENDING_DELIVERY") status = "READY_FOR_DELIVERY";
  if (status as any === "SHIPPED") status = "IN_DELIVERY";

  return {
    id: bo.id,
    sellerName: bo.seller?.shopName || "Vendeur inconnu",
    sellerImage: bo.seller?.shopImage,
    sellerPhone: bo.seller?.phone,
    customerName: bo.consumer?.name || "Client inconnu",
    date: new Date(bo.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
    totalPrice: bo.totalAmount,
    status: status,
    items: bo.items.map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.product.category.name,
      quantity: item.quantity,
      price: item.price.toString(),
      image: item.product.category.imageUrl
    })),
    sellerId: bo.sellerId,
    consumer: bo.consumer ? {
      latitude: bo.consumer.latitude,
      longitude: bo.consumer.longitude
    } : undefined,
    deliverer: (bo as any).deliverer ? {
      id: (bo as any).deliverer.id,
      name: (bo as any).deliverer.name,
      phone: (bo as any).deliverer.phone,
      shopImage: (bo as any).deliverer.shopImage,
      latitude: (bo as any).deliverer.latitude,
      longitude: (bo as any).deliverer.longitude
    } : undefined,
    createdAt: bo.createdAt,
    hasReview: !!bo.review
  };
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,

  refreshOrders: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ loading: true });
    try {
      let backendOrders: BackendOrder[] = [];
      if (user.role === 'SELLER') backendOrders = await orderService.getSellerOrders();
      else if (user.role === 'CONSUMER') backendOrders = await orderService.getConsumerOrders();
      else return;
      set({ orders: backendOrders.map(mapBackendOrderToContextOrder) });
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    }));
  },

  completeOrder: async (orderId: string, rating: number, comment?: string) => {
    try {
      await reviewService.createReview(orderId, rating, comment);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status: 'COMPLETED', hasReview: rating > 0 } : order
        )
      }));
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || 'Erreur lors de la notation.';
      throw new Error(serverMessage);
    }
  },

  addOrder: async (newOrder: Omit<Order, 'id' | 'date' | 'status' | 'createdAt' | 'hasReview'>) => {
    const items = newOrder.items.map(item => ({
      productId: (item as any).productId || item.id,
      quantity: item.quantity
    }));
    const createdOrder = await orderService.createOrder(newOrder.sellerId!, items);
    const mappedOrder = mapBackendOrderToContextOrder(createdOrder);
    set((state) => ({ orders: [mappedOrder, ...state.orders] }));
    return mappedOrder;
  },

  clearOrders: async () => {
    await orderService.clearHistory();
    set({ orders: [] });
  },
}));


// Alias de compatibilite (ASCII): expose les memes commandes que l'ancien useOrders (Context -> Zustand)

export const useOrders = useOrderStore;

