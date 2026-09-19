import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export const useAuthDeepLink = () => {
  const { loginWithGoogleToken } = useAuth();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes('auth-success')) {
        const token = event.url.split('token=')[1];
        console.log("Token reçu via useAuthDeepLink:", token);
        loginWithGoogleToken(token);
        Toast.show({
          type: 'customSuccess',
          text1: 'Connexion réussie',
          text2: 'Bienvenue sur Open Gaz !'
        });
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [loginWithGoogleToken]);
};
