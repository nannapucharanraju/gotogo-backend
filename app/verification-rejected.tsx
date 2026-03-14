import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationRejected() {
  const router = useRouter();
  const { reason } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#ef4444" />
        </View>

        <Text style={styles.title}>Verification Not Approved</Text>

        <Text style={styles.subtitle}>
          Our review team could not verify your documents.
        </Text>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>Reason</Text>
          <Text style={styles.reasonText}>
            {reason || "Document quality or mismatch detected."}
          </Text>
        </View>

        <Text style={styles.note}>
          Please upload clear and valid documents. Ensure your selfie matches
          your ID and the license image is readable.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/upload-docs")}
        >
          <Text style={styles.primaryText}>Re-upload Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)/book")}
        >
          <Text style={styles.secondaryText}>Back to Home</Text>
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
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  reasonCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 20,
  },
  reasonLabel: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 1,
  },
  reasonText: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 30,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    borderRadius: 16,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
  },
  secondaryText: {
    color: "#94a3b8",
    fontWeight: "700",
  },
});
