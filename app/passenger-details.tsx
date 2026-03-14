import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PassengerDetailsScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPassengers = async () => {
    try {
      const res = await api.get(`/rides/${rideId}/bookings`);
      setPassengers(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassengers();
  }, [rideId]);

  const decide = async (bookingId: string, action: "accepted" | "rejected") => {
    if (processingId === bookingId) return;
    setProcessingId(bookingId);

    try {
      await api.patch(`/bookings/${bookingId}/decision`, {
        action,
        reason: action === "rejected" ? "Not available" : undefined,
      });

      setPassengers((prev) =>
        prev.map((p) => (p._id === bookingId ? { ...p, status: action } : p)),
      );
    } catch (e: any) {
      console.log("Decision error:", e?.response?.data || e?.message);
      alert(e?.response?.data?.message || "Failed to update booking");
    } finally {
      setProcessingId(null);
    }
  };

  const callPassenger = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#38bdf8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Passengers</Text>

      <FlatList
        data={passengers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isPending = item.status === "pending";
          const isAccepted = item.status === "accepted";
          const isRejected = item.status === "rejected";
          const isProcessing = processingId === item._id;

          return (
            <View style={styles.card}>
              {/* soft glossy highlight */}
              <View style={styles.gloss} />

              <View style={styles.headerRow}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={16} color="#38bdf8" />
                  </View>
                  <View>
                    <Text style={styles.name}>{item.passengerId.name}</Text>
                    <Text style={styles.subtle}>
                      {item.passengerId.age} • {item.passengerId.gender}
                    </Text>
                  </View>
                </View>

                {!isPending && (
                  <View
                    style={[
                      styles.statusPill,
                      isAccepted ? styles.pillAccepted : styles.pillRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isAccepted
                          ? styles.statusAcceptedText
                          : styles.statusRejectedText,
                      ]}
                    >
                      {isAccepted ? "Accepted" : "Rejected"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={14} color="#94a3b8" />
                <Text style={styles.meta}>{item.passengerId.phone}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>Seats: {item.seatsBooked}</Text>
              </View>

              <View style={styles.actionRow}>
                {isPending && (
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      isProcessing && styles.btnDisabled,
                    ]}
                    disabled={isProcessing}
                    onPress={() => decide(item._id, "accepted")}
                  >
                    <Text style={styles.primaryText}>Accept</Text>
                  </TouchableOpacity>
                )}

                {!isRejected && (
                  <TouchableOpacity
                    style={[
                      styles.rejectBtn,
                      isProcessing && styles.btnDisabled,
                    ]}
                    disabled={isProcessing}
                    onPress={() => decide(item._id, "rejected")}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => callPassenger(item.passengerId.phone)}
                >
                  <Ionicons name="call" size={18} color="#38bdf8" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 16 },
  title: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)", // subtle glossy rim
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: -30,
    left: -50,
    width: 160,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.06)", // subtle shine
    transform: [{ rotate: "-12deg" }],
    borderRadius: 40,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  name: { color: "#e5e7eb", fontWeight: "800" },
  subtle: { color: "#94a3b8", fontSize: 12 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  meta: { color: "#cbd5e1", fontSize: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#475569" },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  primaryBtn: {
    backgroundColor: "#38bdf8", // brand sky blue
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  primaryText: { color: "#020617", fontWeight: "900" },

  rejectBtn: {
    borderWidth: 1,
    borderColor: "#ef4444", // red-ish danger
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(239,68,68,0.06)", // subtle glossy tint
  },
  rejectText: { color: "#ef4444", fontWeight: "800" },

  iconBtn: {
    marginLeft: "auto",
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillAccepted: {
    backgroundColor: "rgba(34,197,94,0.18)", // green success
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },
  pillRejected: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
  },
  statusText: { fontSize: 11, fontWeight: "900" },
  statusAcceptedText: { color: "#22c55e" },
  statusRejectedText: { color: "#ef4444" },

  btnDisabled: { opacity: 0.6 },
});
