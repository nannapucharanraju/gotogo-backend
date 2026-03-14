import { useColorScheme } from "@/hooks/use-color-scheme";
import { api, setAuthToken } from "@/lib/api";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { getPushToken } from "../lib/notifications";

import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [booting, setBooting] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  // Restore auth token when app starts
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");

        if (token) {
          setAuthToken(token);
          setHasToken(true);
          console.log("Token restored");
        }
      } catch (err) {
        console.log("Token restore failed:", err);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // Setup push notifications
  useEffect(() => {
    async function setupNotifications() {
      try {
        const token = await getPushToken();

        if (!token) return;

        console.log("Push Token:", token);

        await api.post("/save-token", {
          token: token,
        });
      } catch (err) {
        console.log("Notification setup failed:", err);
      }
    }

    setupNotifications();
  }, []);

  // Wait until token restore finishes
  if (booting) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName={hasToken ? "(tabs)" : "login"}
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
