import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://opengaz-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignorer les erreurs de lecture du stockage sécurisé
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;