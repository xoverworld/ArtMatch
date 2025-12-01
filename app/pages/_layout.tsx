//pages/_layout.tsx
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import "../main/globals.css";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>("");
  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        setUserId(userId);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    if (userId !== "" && userId !== null && isLoading === false) {
      router.push("/main");
    }
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
