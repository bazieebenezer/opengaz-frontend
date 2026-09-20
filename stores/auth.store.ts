import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authService, User } from "../services/auth.service";
import { router } from "expo-router";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadStorageData: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (newData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadStorageData: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("userToken");
      const storedUser = await SecureStore.getItemAsync("userData");

      if (storedToken && storedUser) {
        set({ token: storedToken, isAuthenticated: true });
        set({ user: JSON.parse(storedUser) });

        try {
          const { user: freshUser } = await authService.getMe();
          set({ user: freshUser });
          await SecureStore.setItemAsync("userData", JSON.stringify(freshUser));
        } catch (e) {
          await get().logout();
        }
      }
    } catch (e) {
      console.error("Erreur chargement stockage:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      set({ token: response.token, isAuthenticated: true, user: response.user });
      await SecureStore.setItemAsync("userToken", response.token);
      await SecureStore.setItemAsync("userData", JSON.stringify(response.user));

      if (response.user.role === "SELLER") router.replace("/seller/dashboard");
      else if (response.user.role === "DELIVERY") router.replace("/delivery/dashboard");
      else router.replace("/consumer/home");
    } catch (error: any) {
      throw error;
    }
  },

  loginWithGoogleToken: async (token: string) => {
    set({ token, isAuthenticated: true });
    await SecureStore.setItemAsync("userToken", token);

    try {
      const { user: freshUser } = await authService.getMe();
      set({ user: freshUser });
      await SecureStore.setItemAsync("userData", JSON.stringify(freshUser));

      if (freshUser.role === "SELLER") router.replace("/seller/dashboard");
      else if (freshUser.role === "DELIVERY") router.replace("/delivery/dashboard");
      else router.replace("/consumer/home");
    } catch (e) {
      console.error("Erreur récupération user via Google:", e);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");

    set({ token: null, user: null, isAuthenticated: false });
    router.replace("/auth/login");
  },

  updateUserData: async (newData: Partial<User>) => {
    const user = get().user;
    if (user) {
      const updatedUser = { ...user, ...newData };
      set({ user: updatedUser });
      await SecureStore.setItemAsync("userData", JSON.stringify(updatedUser));
    }
  },
}));


// Alias de compatibilite (ASCII): meme API que l'ancien useAuth (Context -> Zustand)
export const useAuth = useAuthStore;
