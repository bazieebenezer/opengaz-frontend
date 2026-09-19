import api from "../services/http";

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  orderId: string;
  sellerId: string;
  consumerId: string;
  createdAt: string;
}

export const reviewService = {
  createReview: async (
    orderId: string,
    rating: number,
    comment?: string
  ): Promise<{ review?: Review; message: string }> => {
    const { data } = await api.post<{ review?: Review; message: string }>("/reviews", {
      orderId,
      rating,
      comment,
    });
    return data;
  },
};