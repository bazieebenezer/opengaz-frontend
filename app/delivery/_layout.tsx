import React from "react";
import { Tabs } from "expo-router";
import { LayoutDashboard, ClipboardList, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function DeliveryLayout() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: isDarkMode ? "#94A3B8" : "gray",
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: isDarkMode ? "#0F172A" : "white",
          borderTopColor: isDarkMode ? "#1E293B" : "#E2E8F0",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Livraisons",
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
    </Tabs>
  );
}
