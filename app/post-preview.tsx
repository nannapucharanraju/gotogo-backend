import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostPreviewScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    from: string;
    to: string;
    fromLat: string;
    fromLng: string;
    toLat: string;
    toLng: string;
    departureDateISO: string;
    departureTimeISO: string;
    durationSeconds: string;
    seats: string;
    price: string;
    model: string;
    number: string;
  }>();

  const [loading, setLoading] = useState(false);
  const dateObj = new Date(params.departureDateISO);
  const timeObj = new Date(params.departureTimeISO);

  const readableDate = dateObj.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const readableTime = timeObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const departureTime = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    timeObj.getHours(),
    timeObj.getMinutes(),
    0,
    0,
  );
  const onConfirmPost = async () => {
    console.log("PARAMS:", params);
    console.log("departureDateISO:", params.departureDateISO);
    console.log("departureTimeISO:", params.departureTimeISO);
    console.log("durationSeconds:", params.durationSeconds);
    try {
      setLoading(true);
      const dateObj = new Date(params.departureDateISO);
      const timeObj = new Date(params.departureTimeISO);

      const departureTime = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        timeObj.getHours(),
        timeObj.getMinutes(),
        0,
        0,
      );
      const arrivalTime = new Date(
        departureTime.getTime() + Number(params.durationSeconds) * 1000,
      );

      const payload = {
        from: params.from,
        to: params.to,
        fromLat: Number(params.fromLat),
        fromLng: Number(params.fromLng),
        toLat: Number(params.toLat),
        toLng: Number(params.toLng),
        departureTime,
        arrivalTime,
        seats: Number(params.seats),
        price: Number(params.price),
        vehicleModel: params.model,
        vehicleNumber: params.number,
      };

      console.log("🚀 Posting ride:", payload);

      const res = await api.post("/rides", payload);

      console.log("✅ Ride created:", res.data);

      router.replace("/post-success");
    } catch (e: any) {
      console.log("❌ POST /rides error:", e?.response?.data || e.message);
      Alert.alert(
        "Failed to post ride",
        e?.response?.data?.message || "Server error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        <Text style={styles.title}>Review Ride</Text>

        {/* Route */}
        <View style={styles.routeRow}>
          <Text style={styles.routeText} numberOfLines={1}>
            {params.from}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
          <Text style={styles.routeText} numberOfLines={1}>
            {params.to}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Meta */}
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{readableDate}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{readableTime}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="people-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Seats</Text>
          <Text style={styles.value}>{params.seats}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="cash-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>₹{params.price}</Text>
        </View>

        <View style={styles.divider} />

        {/* Vehicle */}
        <View style={styles.row}>
          <Ionicons name="car-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>{params.model}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="key-outline" size={16} color="#9ca3af" />
          <Text style={styles.label}>Number</Text>
          <Text style={styles.value}>{params.number}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.editBtn} onPress={() => router.back()}>
          <Text style={styles.editText}>Edit Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cta, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={onConfirmPost}
        >
          <Text style={styles.ctaText}>
            {loading ? "Posting..." : "Confirm & Post Ride"}
          </Text>
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
  },
  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
    textAlign: "center",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  routeText: {
    color: "#e5e7eb",
    fontWeight: "800",
    fontSize: 16,
    maxWidth: "40%",
  },
  divider: {
    height: 1,
    backgroundColor: "#020617",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  label: {
    color: "#9ca3af",
    width: 70,
    fontSize: 12,
  },
  value: {
    color: "#e5e7eb",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  editBtn: {
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  editText: {
    color: "#e5e7eb",
    fontWeight: "800",
    fontSize: 14,
  },
  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  ctaText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 16,
  },
});
