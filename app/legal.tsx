import { Ionicons } from "@expo/vector-icons";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LegalScreen() {
  const openPrivacy = () => {
    Linking.openURL("https://gotogocar.com/privacy");
  };

  const openTerms = () => {
    Linking.openURL("https://gotogocar.com/terms");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Privacy & Terms</Text>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={90} color="#38bdf8" />
        </View>

        <Text style={styles.subtitle}>
          Learn how GoToGo protects your data and the rules that keep the
          platform safe for everyone.
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={openPrivacy}>
            <View style={styles.cardLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#38bdf8" />
              <View>
                <Text style={styles.cardTitle}>Privacy Policy</Text>
                <Text style={styles.cardSub}>
                  How we collect and use your data
                </Text>
              </View>
            </View>

            <Ionicons name="open-outline" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={openTerms}>
            <View style={styles.cardLeft}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#38bdf8"
              />
              <View>
                <Text style={styles.cardTitle}>Terms of Use</Text>
                <Text style={styles.cardSub}>
                  Rules and responsibilities on GoToGo
                </Text>
              </View>
            </View>

            <Ionicons name="open-outline" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
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
  },

  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  cardContainer: {
    width: "100%",
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardTitle: {
    color: "#e5e7eb",
    fontWeight: "900",
    fontSize: 15,
  },

  cardSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
});
