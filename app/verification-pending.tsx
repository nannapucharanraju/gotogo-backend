import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationPending() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons
          name="time-outline"
          size={60}
          color="#38bdf8"
          style={{ marginBottom: 20 }}
        />

        <Text style={styles.title}>Documents Submitted</Text>

        <Text style={styles.subtitle}>
          Your documents are currently under review.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            • Review usually takes a short time
          </Text>
          <Text style={styles.infoText}>• You can continue posting rides</Text>
          <Text style={styles.infoText}>
            • You’ll be notified once approved
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/post")}
        >
          <Text style={styles.primaryText}>Continue to Post Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)/book")}
        >
          <Text style={styles.secondaryText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 20,
    width: "100%",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  infoText: {
    color: "#e5e7eb",
    marginBottom: 8,
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  secondaryText: {
    color: "#94a3b8",
    fontWeight: "700",
  },
});
