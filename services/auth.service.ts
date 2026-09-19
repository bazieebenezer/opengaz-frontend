import api from "../services/http";

export type Role = "CONSUMER" | "SELLER" | "DELIVERY" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isValidated?: boolean;
  cnibRecto?: string | null;
  cnibVerso?: string | null;
  shopName?: string | null;
  shopImage?: string | null;
  selectedGases?: string[];
  region?: string | null;
  openingHours?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  description?: string | null;
  isShopOpen?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  otp?: string;
}

interface SignupBase {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  shopName?: string;
  shopImage?: string;
  selectedGases?: string[];
  region?: string;
  openingHours?: string;
  openingTime?: string;
  closingTime?: string;
  description?: string;
  cnibRecto?: string;
  cnibVerso?: string;
}

const signup = async (data: SignupBase & { role: Role }): Promise<SignupResponse> => {
  const { data: response } = await api.post<SignupResponse>("/auth/signup", data);
  return response;
};

export const authService = {
  signupConsumer: (data: {
    email: string;
    password: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<SignupResponse> =>
    signup({
      ...data,
      role: "CONSUMER",
    }),

  signupSeller: (data: SignupBase): Promise<SignupResponse> =>
    signup({
      ...data,
      role: "SELLER",
    }),

  signupDelivery: (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    cnibRecto: string;
    cnibVerso: string;
    latitude: number;
    longitude: number;
  }): Promise<SignupResponse> =>
    signup({
      ...data,
      // Le mot de passe initial des livreurs est temporaire : l'admin
      // fournit un mot de passe lors de la validation du compte.
      password: Math.random().toString(36).slice(-8),
      role: "DELIVERY",
    }),

  verifyOtp: async (email: string, otp: string): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/verify-otp", { email, otp });
    return data;
  },

  verifyResetOtp: async (email: string, otp: string): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/verify-reset-otp", { email, otp });
    return data;
  },

  resendOtp: async (email: string): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/resend-code", { email });
    return data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data;
  },

  forgotPassword: async (email: string): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
  }): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/reset-password", payload);
    return data;
  },

  updateProfileImage: async (image: string): Promise<{ shopImage: string }> => {
    const { data } = await api.patch<{ shopImage: string }>("/auth/profile-image", { image });
    return data;
  },

  updateProfile: async (payload: {
    name?: string;
    phone?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<{ user: User }> => {
    const { data } = await api.patch<{ user: User }>("/auth/profile", payload);
    return data;
  },

  updateShopStatus: async (isOpen: boolean): Promise<{ isOpen: boolean }> => {
    const { data } = await api.patch<{ isOpen: boolean }>("/auth/shop-status", {
      isOpen,
    });
    return data;
  },
};