import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingPending() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Request Sent 🚀</Text>
        <Text style={styles.subtitle}>
          Waiting for driver to accept your booking.
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.replace("/(tabs)/activity")}
        >
          <Text style={styles.ctaText}>Go to Activity</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  title: { color: "#e5e7eb", fontSize: 20, fontWeight: "900", marginBottom: 8 },
  subtitle: { color: "#9ca3af", textAlign: "center", marginBottom: 16 },
  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaText: { color: "#020617", fontWeight: "900" },
});
