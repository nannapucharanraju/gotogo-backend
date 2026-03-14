import { Ionicons } from "@expo/vector-icons";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  const email = "support@gotogocar.com";

  const openMail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Safety & Support</Text>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={26} color="#38bdf8" />
        </View>

        <Text style={styles.title}>Need help with a ride?</Text>
        <Text style={styles.sub}>
          If something went wrong during a trip or you feel unsafe, contact our
          support team. We usually reply within a few hours.
        </Text>

        <TouchableOpacity style={styles.emailBtn} onPress={openMail}>
          <Ionicons name="mail-outline" size={16} color="#020617" />
          <Text style={styles.emailText}>{email}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#94a3b8" />
        <Text style={styles.infoText}>
          For urgent safety issues, contact local emergency services
          immediately.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 16 },

  header: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },

  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  title: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "900",
  },

  sub: {
    color: "#94a3b8",
    marginTop: 6,
    lineHeight: 18,
  },

  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
  },

  emailText: {
    color: "#020617",
    fontWeight: "900",
  },

  infoBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },

  infoText: {
    color: "#94a3b8",
    flex: 1,
    fontSize: 12,
  },
});
