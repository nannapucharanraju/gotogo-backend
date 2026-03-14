import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}/driver`);
        setDriver(res.data);
      } catch (e) {
        console.log("Load driver error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const callDriver = (phone?: string) => {
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

  if (!driver) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Failed to load driver details.</Text>
      </SafeAreaView>
    );
  }

  const initials = driver?.name
    ? driver.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "D";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        {/* subtle glossy highlight */}
        <View style={styles.gloss} />

        {/* Avatar */}
        <Pressable
          style={styles.avatarWrap}
          onPress={() => driver.avatar && setAvatarOpen(true)}
        >
          {driver.avatar ? (
            <Image source={{ uri: driver.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.title}>Driver Details</Text>

        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="person-outline" size={18} color="#38bdf8" />
            <Text style={styles.label}>Name</Text>
          </View>
          <Text style={styles.value}>{driver.name}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="male-female-outline" size={18} color="#38bdf8" />
            <Text style={styles.label}>Gender</Text>
          </View>
          <Text style={styles.value}>{driver.gender}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="calendar-outline" size={18} color="#38bdf8" />
            <Text style={styles.label}>Age</Text>
          </View>
          <Text style={styles.value}>{driver.age}</Text>
        </View>

        {driver.phone && (
          <View style={styles.row}>
            <View style={styles.left}>
              <Ionicons name="call-outline" size={18} color="#38bdf8" />
              <Text style={styles.label}>Phone</Text>
            </View>
            <Text style={styles.value}>{driver.phone}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="car-outline" size={18} color="#38bdf8" />
            <Text style={styles.label}>Vehicle</Text>
          </View>
          <Text style={styles.value}>{driver.vehicleModel}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="key-outline" size={18} color="#38bdf8" />
            <Text style={styles.label}>Number</Text>
          </View>
          <Text style={styles.value}>{driver.vehicleNumber}</Text>
        </View>

        {driver.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => callDriver(driver.phone)}
          >
            <Ionicons name="call" size={18} color="#020617" />
            <Text style={styles.callText}>Call Driver</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar Modal */}
      <Modal visible={avatarOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setAvatarOpen(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: driver.avatar }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setAvatarOpen(false)}
            >
              <Ionicons name="close" size={22} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 16,
    justifyContent: "center",
  },
  muted: { color: "#9ca3af", textAlign: "center" },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)",
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: -30,
    left: -50,
    width: 160,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 40,
  },

  avatarWrap: {
    alignSelf: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.4)",
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#38bdf8",
    fontWeight: "900",
    fontSize: 22,
  },

  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#020617",
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 110,
  },

  label: { color: "#94a3b8", fontSize: 12 },
  value: { color: "#e5e7eb", fontWeight: "800", flex: 1, textAlign: "right" },

  callBtn: {
    marginTop: 16,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  callText: { color: "#020617", fontWeight: "900" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  modalImage: { width: "100%", height: "100%" },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(2,6,23,0.7)",
    borderRadius: 999,
    padding: 8,
  },
});
