import { api } from "@/lib/api";
import { clearUser, loadUser, saveUser } from "@/lib/user";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ridesTaken, setRidesTaken] = useState(0);
  const [ridesPosted, setRidesPosted] = useState(0);

  const loadProfile = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const [meRes, bookingsRes, ridesRes] = await Promise.all([
        api.get("/me"),
        api.get("/my-bookings"),
        api.get("/my-rides"),
      ]);

      if (!mountedRef.current) return;

      setUser(meRes.data);
      await saveUser(meRes.data);

      setRidesTaken((bookingsRes.data || []).length);
      setRidesPosted((ridesRes.data || []).length);
    } catch (e: any) {
      console.log("Profile load error:", e?.response?.data || e?.message || e);
    } finally {
      loadingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;

      const init = async () => {
        setLoading(true);

        try {
          const cached = await loadUser();

          if (cached && mountedRef.current) {
            setUser(cached);
            setLoading(false);
          }

          await loadProfile();
        } catch (e) {
          console.log("Init profile error:", e);
        }
      };

      init();

      return () => {
        mountedRef.current = false;
      };
    }, []),
  );

  const logout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("auth_token");
          await clearUser();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#38bdf8"
        />
      }
    >
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri:
                user?.avatar ||
                user?.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png" +
                  user?._id,
            }}
            style={styles.avatar}
          />

          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <Text style={styles.name}>{user?.name}</Text>

        <Text style={styles.sub}>
          {user?.role === "driver" ? "Driver" : "Passenger"} • {user?.age} yrs •{" "}
          {user?.gender}
        </Text>

        <View style={styles.quickRow}>
          <View style={styles.quickChip}>
            <Ionicons name="call-outline" size={14} color="#38bdf8" />
            <Text style={styles.quickText}>{user?.phone}</Text>
          </View>

          <View style={styles.quickChip}>
            <Ionicons name="mail-outline" size={14} color="#38bdf8" />
            <Text style={styles.quickText}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{ridesTaken}</Text>
          <Text style={styles.statLabel}>Rides Taken</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{ridesPosted}</Text>
          <Text style={styles.statLabel}>Rides Posted</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your account</Text>

        <ProfileItem
          icon="car-outline"
          title="My Rides"
          sub="Rides you posted"
          onPress={() => router.push("/(tabs)/activity")}
        />

        <ProfileItem
          icon="people-outline"
          title="My Bookings"
          sub="Trips you booked"
          onPress={() => router.push("/(tabs)/activity")}
        />

        <ProfileItem
          icon="create-outline"
          title="Edit Profile"
          sub="Update your personal info"
          onPress={() => router.push("/edit-profile")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <ProfileItem
          icon="wallet-outline"
          title="Wallet & Payments"
          sub="UPI, cards, payouts"
          onPress={() => router.push("/wallet")}
        />

        <ProfileItem
          icon="shield-checkmark-outline"
          title="Safety & Support"
          sub="Help center, emergency"
          onPress={() => router.push("/support")}
        />

        <ProfileItem
          icon="chatbubble-ellipses-outline"
          title="Feedback"
          sub="Report issues, suggestions"
          onPress={() => router.push("/feedback")}
        />

        <ProfileItem
          icon="document-text-outline"
          title="Privacy & Terms"
          sub="Privacy policy and terms of use"
          onPress={() => router.push("/legal")}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ProfileItem({ icon, title, sub, onPress }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIconWrap}>
          <Ionicons name={icon} size={18} color="#38bdf8" />
        </View>

        <View>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSub}>{sub}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#475569" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerCard: {
    margin: 16,
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
  },

  avatarWrap: { alignItems: "center" },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },

  verifiedPill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },

  verifiedText: { color: "#22c55e", fontSize: 12, fontWeight: "700" },

  name: { color: "#e5e7eb", fontSize: 22, fontWeight: "900", marginTop: 10 },
  sub: { color: "#94a3b8", fontSize: 12, marginTop: 4 },

  quickRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },

  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  quickText: { color: "#cbd5e1", fontSize: 12 },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 4,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  statValue: { color: "#e5e7eb", fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#94a3b8", fontSize: 12, marginTop: 2 },

  section: { marginTop: 22, paddingHorizontal: 16, gap: 10 },
  sectionTitle: { color: "#9ca3af", fontSize: 12 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 14,
  },

  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  itemTitle: { color: "#e5e7eb", fontSize: 15, fontWeight: "800" },
  itemSub: { color: "#9ca3af", fontSize: 12 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1f0b12",
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },

  logoutText: { color: "#f87171", fontWeight: "900", fontSize: 15 },
});
