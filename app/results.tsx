import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultsScreen() {
  const router = useRouter();

  const { fromQuery, toQuery, date } = useLocalSearchParams<{
    fromQuery?: string;
    toQuery?: string;
    date?: string;
  }>();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fromQuery || !toQuery) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/rides/search", {
          params: {
            from: fromQuery,
            to: toQuery,
            date: date,
          },
        });

        const mapped = (Array.isArray(res.data) ? res.data : []).map((r) => ({
          ...r,
          seatsLeft: r.seats,
          driverName: r.createdBy?.name || "Driver",
          driverAvatar: r.createdBy?.avatar || null,

          // TEMP for UI (replace with backend later)
          driverVerified: Math.random() > 0.5,
        }));

        setResults(mapped);
      } catch (e) {
        setError("Failed to load rides");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fromQuery, toQuery, date]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>Available Rides</Text>

      {loading && (
        <View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
          <ActivityIndicator
            size="small"
            color="#38bdf8"
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {!loading && error.length > 0 && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && results.length === 0 && (
        <Text style={styles.muted}>No rides found.</Text>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/ride-details",
                  params: { rideId: item._id },
                })
              }
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.route}>
                  {item.from} → {item.to}
                </Text>

                <View style={styles.pricePill}>
                  <Text style={styles.price}>₹{item.price}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>
                    {new Date(item.departureTime).toDateString()}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>
                    {new Date(item.departureTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.bottomRow}>
                <View style={styles.driverRow}>
                  {item.driverAvatar ? (
                    <Image
                      source={{ uri: item.driverAvatar }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.driverName?.[0] || "D"}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.driverName}>{item.driverName}</Text>
                </View>

                <View style={styles.badgesRow}>
                  <View style={styles.seatBadge}>
                    <Ionicons name="people-outline" size={14} color="#22c55e" />
                    <Text style={styles.seatText}>{item.seatsLeft} left</Text>
                  </View>

                  <View
                    style={[
                      styles.verificationBadge,
                      item.driverVerified
                        ? styles.verifiedBadge
                        : styles.unverifiedBadge,
                    ]}
                  >
                    <Ionicons
                      name={
                        item.driverVerified
                          ? "shield-checkmark"
                          : "close-circle"
                      }
                      size={14}
                      color={item.driverVerified ? "#38bdf8" : "#ef4444"}
                    />
                    <Text
                      style={[
                        styles.verificationText,
                        {
                          color: item.driverVerified ? "#38bdf8" : "#ef4444",
                        },
                      ]}
                    >
                      {item.driverVerified ? "Verified" : "Unverified"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 999,
    marginRight: 8,
  },

  header: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },

  muted: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 24,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  route: {
    color: "#e5e7eb",
    fontWeight: "900",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },

  pricePill: {
    backgroundColor: "rgba(56,189,248,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },

  price: {
    color: "#38bdf8",
    fontWeight: "900",
  },

  metaRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  metaText: {
    color: "#9ca3af",
    marginLeft: 6,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  avatarText: {
    color: "#38bdf8",
    fontWeight: "900",
  },

  driverName: {
    color: "#e5e7eb",
    fontWeight: "600",
  },

  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },

  seatBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },

  seatText: {
    color: "#22c55e",
    marginLeft: 4,
    fontWeight: "700",
    fontSize: 12,
  },

  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  verifiedBadge: {
    backgroundColor: "rgba(98, 248, 56, 0.15)",
    borderColor: "rgba(56,189,248,0.35)",
  },

  unverifiedBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.35)",
  },

  verificationText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  skeletonCard: {
    height: 110,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 14,
  },
});
