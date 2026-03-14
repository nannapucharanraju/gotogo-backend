import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/activity");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={72} color="#22c55e" />

        <Text style={styles.title}>Ride Posted</Text>
        <Text style={styles.subtitle}>
          Your ride is now live and visible to passengers.
        </Text>

        <Text style={styles.hint}>
          You’ll be redirected to Activity shortly…
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },

  title: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
  },

  hint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 16,
  },
});
