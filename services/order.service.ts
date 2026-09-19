import api from "../services/http";
import { GasCategory } from "../services/product.service";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id?: string;
    stock?: number;
    categoryId?: string;
    sellerId?: string;
    category: GasCategory;
  };
}

export interface OrderActor {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  shopName?: string;
  shopImage?: string;
}

export interface OrderReview {
  id?: string;
  rating?: number;
  comment?: string | null;
  orderId?: string;
  sellerId?: string;
  consumerId?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  consumerId?: string;
  sellerId?: string;
  delivererId?: string | null;
  consumerHidden?: boolean;
  sellerHidden?: boolean;
  seller?: OrderActor | null;
  consumer?: OrderActor | null;
  deliverer?: OrderActor | null;
  items: OrderItem[];
  review?: OrderReview | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export const orderService = {
  getSellerOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<{ orders: Order[] }>("/orders/seller");
    return data.orders;
  },

  getConsumerOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<{ orders: Order[] }>("/orders/consumer");
    return data.orders;
  },

  getAvailableOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<{ orders: Order[] }>("/orders/delivery/available");
    return data.orders;
  },

  getMyDeliveryOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<{ orders: Order[] }>("/orders/delivery/my-orders");
    return data.orders;
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    const { data } = await api.get<{ order: Order }>(`/orders/${orderId}`);
    return data.order;
  },

  createOrder: async (
    sellerId: string,
    items: CreateOrderItem[]
  ): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>("/orders", { sellerId, items });
    return data.order;
  },

  updateStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<Order> => {
    const { data } = await api.patch<{ order: Order }>(`/orders/${orderId}/status`, {
      status,
    });
    return data.order;
  },

  validateOrder: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/validate`);
    return data.order;
  },

  markAsReady: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/ready`);
    return data.order;
  },

  confirmCompleted: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/completed`);
    return data.order;
  },

  confirmDelivered: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/delivered`);
    return data.order;
  },

  assignOrder: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/assign`);
    return data.order;
  },

  clearHistory: async (): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>("/orders/consumer/history");
    return data;
  },

  clearSellerHistory: async (): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>("/orders/seller/history");
    return data;
  },
};