import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Wallet & Payments</Text>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name="wallet-outline" size={90} color="#38bdf8" />
        </View>

        <Text style={styles.title}>Wallet Coming Soon</Text>

        <Text style={styles.subtitle}>
          Soon you'll be able to pay for rides directly inside GoToGo, manage
          transactions, and track your payment history.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.featureText}>UPI & secure payments</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.featureText}>Instant driver payouts</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.featureText}>Ride payment history</Text>
          </View>
        </View>

        <Text style={styles.note}>
          For now, payments are handled directly between passengers and drivers.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 16,
  },

  header: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(56,189,248,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  featureList: {
    marginTop: 26,
    gap: 12,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  featureText: {
    color: "#cbd5f5",
    fontSize: 14,
  },

  note: {
    marginTop: 30,
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
});
