import React from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "../../src/features/auth/auth.service";

export default function AppDrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerTitle: "AI Note Summarizer",
        headerTitleStyle: { fontWeight: "900" },
        headerLeft: () => <DrawerToggleButton tintColor="#111827" />,
        headerRight: () => (
          <Pressable
            onPress={logout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#eef2ff",
              borderRadius: 9999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 10,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#111827" />
            <Text style={{ fontWeight: "700", color: "#111827" }}>Logout</Text>
          </Pressable>
        ),
        drawerActiveTintColor: "#111827",
        drawerInactiveTintColor: "#374151",
        drawerStyle: { width: 260 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "My Notes",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="new"
        options={{ title: "New Note", drawerItemStyle: { display: "none" } }}
      />

      <Drawer.Screen
        name="camera"
        options={{
          title: "Scan Text",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
