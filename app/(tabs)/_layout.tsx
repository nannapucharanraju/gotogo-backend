import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const active = colorScheme === "dark" ? "#38bdf8" : "#2563eb";
  const inactive = colorScheme === "dark" ? "#94a3b8" : "#64748b";
  const bg = colorScheme === "dark" ? "#0f172a" : "#ffffff";
  const divider = colorScheme === "dark" ? "#020617" : "#e5e7eb";

  const bottomInset = Platform.OS === "android" ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: divider,
          height: Platform.OS === "ios" ? 84 : 64 + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="book"
        options={{
          title: "Search",
          tabBarIcon: ({ focused, size }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={focused ? size + 7 : size}
                color={focused ? active : inactive}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ focused, size }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name="add-circle"
                size={focused ? size + 7 : size}
                color={focused ? active : inactive}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused, size }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name="time"
                size={focused ? size + 7 : size}
                color={focused ? active : inactive}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, size }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name="person"
                size={focused ? size + 7 : size}
                color={focused ? active : inactive}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
