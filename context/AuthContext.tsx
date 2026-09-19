import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService, User } from '../services/auth.service';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleToken: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserData: (newData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          const { user: freshUser } = await authService.getMe();
          setUser(freshUser);
          await SecureStore.setItemAsync('userData', JSON.stringify(freshUser));
        } catch (e) {
          await logout();
        }
      }
    } catch (e) {
      console.error('Erreur chargement stockage:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const loginWithGoogleToken = async (token: string) => {
    setToken(token);
    await SecureStore.setItemAsync('userToken', token);
    
    // Après avoir reçu le token, on récupère les infos utilisateur
    try {
        const { user: freshUser } = await authService.getMe();
        setUser(freshUser);
        await SecureStore.setItemAsync('userData', JSON.stringify(freshUser));
        
        if (freshUser.role === 'SELLER') router.replace('/seller/dashboard');
        else if (freshUser.role === 'DELIVERY') router.replace('/delivery/dashboard');
        else router.replace('/consumer/home');
    } catch (e) {
        console.error('Erreur récupération user:', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
      await SecureStore.setItemAsync('userToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      
      if (response.user.role === 'SELLER') router.replace('/seller/dashboard');
      else if (response.user.role === 'DELIVERY') router.replace('/delivery/dashboard');
      else router.replace('/consumer/home');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    // Clear all storage to ensure complete reset
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    
    // Clear local state
    setToken(null);
    setUser(null);
    
    // Force reload/navigation to login
    router.replace('/auth/login');
  };

  const updateUserData = async (newData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      loginWithGoogleToken,
      logout, 
      isAuthenticated: !!token,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
