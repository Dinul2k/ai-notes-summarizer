// app/_layout.tsx
import React from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { listenAuth } from "../src/features/auth/auth.service";

export default function RootLayout() {
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    // subscribe once
    const unsub = listenAuth((u) => {
      setUserEmail(u?.email ?? null);
      setHydrated(true);
    });
    return unsub;
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === "auth"; // your folder is "auth" (not a () group)
    if (!userEmail && !inAuth) {
      router.replace("/auth/login");   // not signed in -> login screen
    } else if (userEmail && inAuth) {
      router.replace("/");             // signed in -> home (/(tabs)/index)
    }
  }, [hydrated, userEmail, segments, router]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />; // renders either /auth/* or /(tabs)/*
}