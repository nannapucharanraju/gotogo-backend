import { Ionicons } from "@expo/vector-icons";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const email = "hello@gotogocar.com";

  const openMail = () => {
    Linking.openURL(`mailto:${email}?subject=GoToGo App Feedback`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Feedback</Text>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={26}
            color="#38bdf8"
          />
        </View>

        <Text style={styles.title}>Tell us what you think</Text>

        <Text style={styles.sub}>
          Found a bug? Have an idea to improve GoToGo? We read every message and
          your feedback helps shape the product.
        </Text>

        <TouchableOpacity style={styles.emailBtn} onPress={openMail}>
          <Ionicons name="mail-outline" size={16} color="#020617" />
          <Text style={styles.emailText}>{email}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>We usually respond within 24 hours.</Text>
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

  note: {
    marginTop: 18,
    alignItems: "center",
  },

  noteText: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
