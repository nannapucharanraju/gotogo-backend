import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Booking = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  rideId: {
    _id: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
  } | null;
};

type Ride = {
  _id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
};

export default function ActivityScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<"bookings" | "rides">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const res = await api.get("/my-bookings");
      setBookings(res.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRides = async () => {
    try {
      const res = await api.get("/my-rides");
      setRides(res.data || []);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    mode === "bookings" ? loadBookings() : loadRides();
  }, [mode]);

  const getRideLifecycle = (
    departure: string,
    arrival: string,
  ): "upcoming" | "live" | "completed" => {
    const now = new Date();
    const dep = new Date(departure);
    const arr = new Date(arrival);

    if (now >= arr) return "completed";
    if (now >= dep) return "live";
    return "upcoming";
  };

  const renderLifecyclePill = (type: "upcoming" | "live" | "completed") => {
    const map = {
      upcoming: {
        bg: "rgba(34,197,94,0.15)",
        text: "#22c55e",
        label: "Upcoming",
      },
      live: {
        bg: "rgba(250,204,21,0.18)",
        text: "#facc15",
        label: "Live",
      },
      completed: {
        bg: "rgba(148,163,184,0.15)",
        text: "#94a3b8",
        label: "Completed",
      },
    } as const;

    const s = map[type];

    return (
      <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
        <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
      </View>
    );
  };

  const renderStatus = (status: Booking["status"]) => {
    const map = {
      pending: {
        bg: "rgba(250,204,21,0.12)",
        text: "#facc15",
        label: "Pending",
      },
      accepted: {
        bg: "rgba(34,197,94,0.18)",
        text: "#22c55e",
        label: "Accepted",
      },
      rejected: {
        bg: "rgba(239,68,68,0.15)",
        text: "#ef4444",
        label: "Rejected",
      },
      cancelled: {
        bg: "rgba(148,163,184,0.15)",
        text: "#94a3b8",
        label: "Cancelled",
      },
    } as const;

    const s = map[status];

    return (
      <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
        <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
      </View>
    );
  };

  const confirmDeleteRide = (rideId: string) => {
    Alert.alert("Delete Ride", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/rides/${rideId}`);
            loadRides();
          } catch {
            Alert.alert("Error", "Failed to delete ride");
          }
        },
      },
    ]);
  };

  const data =
    mode === "bookings" ? bookings.filter((b) => b.rideId !== null) : rides;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>My Activity</Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "bookings" && styles.toggleActive]}
          onPress={() => setMode("bookings")}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "bookings" && styles.toggleTextActive,
            ]}
          >
            My Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === "rides" && styles.toggleActive]}
          onPress={() => setMode("rides")}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "rides" && styles.toggleTextActive,
            ]}
          >
            My Rides
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item: any) => item._id}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          mode === "bookings" ? loadBookings() : loadRides();
        }}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={() => {
          if (loading) return null;

          return (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={60} color="#64748b" />
              <Text style={styles.emptyTitle}>
                {mode === "bookings" ? "No bookings yet" : "No rides posted"}
              </Text>
              <Text style={styles.emptySub}>
                {mode === "bookings"
                  ? "Your booked rides will appear here"
                  : "Post a ride to start sharing trips"}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }: any) => {
          if (mode === "bookings") {
            if (!item.rideId) return null;

            const lifecycle = getRideLifecycle(
              item.rideId.departureTime,
              item.rideId.arrivalTime,
            );

            const departure = new Date(item.rideId.departureTime);
            const arrival = new Date(item.rideId.arrivalTime);

            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <Text style={styles.route}>
                    {item.rideId.from} → {item.rideId.to}
                  </Text>

                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    {renderStatus(item.status)}
                    {renderLifecyclePill(lifecycle)}
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.metaText}>
                    {departure.toLocaleDateString("en-GB")}
                  </Text>

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#94a3b8"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.metaText}>
                    {departure.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                  Arrives by{" "}
                  {arrival.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {item.status === "accepted" && (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/driver-details",
                        params: { bookingId: item._id },
                      })
                    }
                  >
                    <Text style={styles.primaryText}>View Driver</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }

          const lifecycle = getRideLifecycle(
            item.departureTime,
            item.arrivalTime,
          );
          const departure = new Date(item.departureTime);
          const arrival = new Date(item.arrivalTime);

          const canDelete = lifecycle === "upcoming";

          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.route}>
                  {item.from} → {item.to}
                </Text>

                {renderLifecyclePill(lifecycle)}
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.metaText}>
                  {departure.toLocaleDateString("en-GB")}
                </Text>

                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#94a3b8"
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.metaText}>
                  {departure.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                Arrives by{" "}
                {arrival.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() =>
                    router.push({
                      pathname: "/passenger-details",
                      params: { rideId: item._id },
                    })
                  }
                >
                  <Text style={styles.primaryText}>View Passengers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!canDelete}
                  style={[
                    styles.deleteBtn,
                    { flex: 1 },
                    !canDelete && { opacity: 0.35 },
                  ]}
                  onPress={() => confirmDeleteRide(item._id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text style={styles.deleteText}>Delete</Text>
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
  header: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 14,
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 4,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#38bdf8" },
  toggleText: { color: "#94a3b8", fontWeight: "800" },
  toggleTextActive: { color: "#020617" },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)", // slightly brighter rim
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: -30,
    left: -50,
    width: 160,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 40,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  route: {
    flex: 1,
    color: "#e5e7eb",
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 22,
  },
  statusWrap: { flexShrink: 0, alignSelf: "flex-start" },

  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: "900" },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  metaText: { color: "#94a3b8", marginLeft: 6, fontSize: 12 },

  primaryBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryText: { color: "#020617", fontWeight: "900" },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.7)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: { color: "#ef4444", fontWeight: "800" },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },

  deleteBtn: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.7)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  deleteText: { color: "#ef4444", fontWeight: "800" },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyTitle: { color: "#e5e7eb", fontWeight: "900", marginTop: 10 },
  emptySub: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  cardHighlight: {
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    borderColor: "#38bdf8",
  },
});
