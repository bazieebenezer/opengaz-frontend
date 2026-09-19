import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { orderService, Order as BackendOrder, OrderStatus as BackendOrderStatus } from '../services/order.service';
import { reviewService } from '../services/review.service';
import { useAuth } from './AuthContext';

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
  deliverer?: { id: string; name: string; phone: string; shopImage?: string; latitude?: number; longitude?: number; };
  createdAt: string;
  hasReview: boolean;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string, rating: number, comment?: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'createdAt' | 'hasReview'>) => Promise<Order>;
  clearOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const mapBackendOrderToContextOrder = (bo: BackendOrder): Order => {
  console.log("[DEBUG] Mapping order:", bo.id, "Raw bo:", JSON.stringify(bo, null, 2));
  
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

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let backendOrders: BackendOrder[] = [];
      if (user.role === 'SELLER') {
        backendOrders = await orderService.getSellerOrders();
      } else if (user.role === 'CONSUMER') {
        backendOrders = await orderService.getConsumerOrders();
      } else {
        return;
      }
      console.log("[DEBUG] RAW BACKEND RESPONSE (CONSUMER ORDERS):", JSON.stringify(backendOrders, null, 2));
      const mapped = backendOrders.map(mapBackendOrderToContextOrder);
      console.log("[DEBUG] MAPPED ORDERS IN CONTEXT:", JSON.stringify(mapped, null, 2));
      setOrders(mapped);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Automatic refresh on mount or user change only, without depending on refreshOrders function itself
  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user?.id]); // Only re-run if the logged-in user changes, not on function updates

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const completeOrder = async (orderId: string, rating: number, comment?: string) => {
    try {
      console.log("[DEBUG] completeOrder context started. OrderId:", orderId, "Rating:", rating);
      await reviewService.createReview(orderId, rating, comment);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "COMPLETED", hasReview: rating > 0 } : order
        )
      );
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Erreur lors de la notation.";
      console.error("Error completing order with review:", serverMessage);
      throw new Error(serverMessage);
    }
  };

  const addOrder = async (newOrder: Omit<Order, 'id' | 'date' | 'status' | 'createdAt' | 'hasReview'>): Promise<Order> => {
    try {
      console.log("[DEBUG] addOrder context started. SellerId:", newOrder.sellerId);
      const items = newOrder.items.map(item => ({
        productId: (item as any).productId || item.id,
        quantity: item.quantity
      }));
      
      console.log("[DEBUG] Final items for backend:", items);
      
      const createdOrder = await orderService.createOrder(newOrder.sellerId!, items);
      console.log("[DEBUG] Backend createdOrder success:", createdOrder.id);
      
      const mappedOrder = mapBackendOrderToContextOrder(createdOrder);
      setOrders((prevOrders) => [mappedOrder, ...prevOrders]);
      return mappedOrder;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Erreur lors de la création de la commande.";
      console.error("Error creating order on backend:", serverMessage);
      throw new Error(serverMessage);
    }
  };

  const clearOrders = async () => {
    try {
      await orderService.clearHistory();
      setOrders([]);
    } catch (error) {
      console.error("Error clearing order history:", error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, refreshOrders, updateOrderStatus, completeOrder, addOrder, clearOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
