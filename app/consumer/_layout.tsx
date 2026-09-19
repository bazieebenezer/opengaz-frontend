import { Tabs } from "expo-router";
import { Home, ClipboardList, Settings, WifiOff, Wifi } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function useIsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval>;

    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        await fetch("https://clients3.google.com/generate_204", {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);
        if (active) setIsOnline(true);
      } catch (err) {
        if (active) setIsOnline(false);
      }
    };

    // Ajouter un délai initial de 2 secondes pour laisser le temps au réseau de se réveiller
    const timeoutId = setTimeout(() => {
      if (active) {
        checkConnection();
        interval = setInterval(checkConnection, 5000);
      }
    }, 2000);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}

export default function ConsumerLayout() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isOnline = useIsOnline();
  const [showStatus, setShowStatus] = useState(false);
  const [statusType, setStatusType] = useState<"offline" | "restored">("offline");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isOnline) {
      // Attendre 5 secondes avant de montrer la popup "perdue"
      timeoutId = setTimeout(() => {
        setStatusType("offline");
        setShowStatus(true);
      }, 5000);
    } else {
      // Si on était hors-ligne et que la connexion est rétablie
      if (statusType === "offline" && showStatus) {
        setStatusType("restored");
        // Le timer pour cacher la popup "restored"
        timeoutId = setTimeout(() => {
          setShowStatus(false);
          setStatusType("offline"); // Réinitialiser après avoir caché
        }, 3000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [isOnline]);

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#00A3E0", // Primary color from tailwind config
          tabBarInactiveTintColor: isDarkMode ? "#94A3B8" : "gray",
          tabBarStyle: {
            height: 80,
            paddingBottom: 10,
            paddingTop: 5,
            backgroundColor: isDarkMode ? "#0F172A" : "white", // gray-900 in dark mode
            borderTopColor: isDarkMode ? "#1E293B" : "#E2E8F0", // gray-800 or gray-200
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Commandes",
            tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Paramètres",
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="all-sellers"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="order-details"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="tracking"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="commander"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            href: null,
            tabBarItemStyle: { display: "none" },
          }}
        />
        </Tabs>

      {showStatus && (
        <SafeAreaView className="absolute top-14 left-4 right-4 z-[999]">
          {statusType === "offline" ? (
            <View className="bg-secondary px-6 py-6 rounded-xl flex-row items-center gap-8">
              <WifiOff size={24} color="#1E293B" />
              <View>
                <Text className="text-gray-800 font-bold text-[16px]">
                  Connexion internet perdue
                </Text>
                <Text className="text-gray-800 text-[14px]">
                  Mode hors-ligne
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-accent px-6 py-6 rounded-xl flex-row items-center gap-8">
              <Wifi size={24} color="white" />
              <View>
                <Text className="text-white font-bold text-[16px]">
                  Connexion rétablie
                </Text>
                <Text className="text-white text-[14px]">
                  Mode en ligne
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      )}
    </View>
  );
}