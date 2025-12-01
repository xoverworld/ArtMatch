//main/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import "./globals.css";

export default function RootLayout() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 1. Add loading state

  useEffect(() => {
    const loadData = async () => {
      try {
        // const savedValue = await SecureStore.getItemAsync("userId");
        const savedValue = await AsyncStorage.getItem("userId");
        setUserId(savedValue);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (!userId && isLoading === false) {
    return <Redirect href="/pages/loginPage" />;
  }
  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
