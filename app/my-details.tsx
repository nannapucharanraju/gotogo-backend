import { useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyDetailsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={styles.identityCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Charan</Text>
        <Text style={styles.sub}>Personal information</Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.item}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>21</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>Male</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>+91 9XXXXXXXXX</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>charan@example.com</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>
            Loves road trips and meeting new people.
          </Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={styles.ctaText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },

  identityCard: {
    margin: 16,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#38bdf8",
    marginBottom: 8,
  },
  name: { color: "#e5e7eb", fontSize: 18, fontWeight: "800" },
  sub: { color: "#9ca3af", fontSize: 12, marginTop: 4 },

  section: { paddingHorizontal: 16, gap: 10, marginTop: 8 },
  item: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 14,
  },
  label: { color: "#9ca3af", fontSize: 12 },
  value: { color: "#e5e7eb", fontSize: 14, marginTop: 2 },

  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  ctaText: { color: "#020617", fontWeight: "900", fontSize: 16 },
});
