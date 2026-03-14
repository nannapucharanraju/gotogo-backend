import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveToken } from "../lib/auth";
import { getPushToken } from "../lib/notifications";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    return email.trim().length > 3 && password.length >= 1;
  }, [email, password]);

  const onLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = res?.data?.token;

      if (!token) {
        alert("Token missing from response");
        return;
      }

      await saveToken(token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("Token saved");

      // Register push token
      const pushToken = await getPushToken();

      if (pushToken) {
        console.log("Push Token:", pushToken);

        await api.post("/save-token", {
          token: pushToken,
        });
      }

      router.replace("/book");
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      alert("Login failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.card}>
        <View style={styles.gloss} />

        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Login to continue to GoToGo</Text>
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Ionicons name="mail-outline" size={18} color="#38bdf8" />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#64748b"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Ionicons name="lock-closed-outline" size={18} color="#38bdf8" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#64748b"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.cta, (!isValid || loading) && styles.ctaDisabled]}
          disabled={!isValid || loading}
          onPress={onLogin}
        >
          <Text style={styles.ctaText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.link}>Don’t have an account? Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.footNote}>
          Secure login • Your data stays private
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.12)",
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
  header: { marginBottom: 16 },
  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "900" },
  subtitle: { color: "#9ca3af", marginTop: 4 },

  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "#e5e7eb",
    fontSize: 14,
  },

  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  ctaDisabled: { opacity: 0.5 },

  ctaText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 16,
  },

  link: {
    color: "#38bdf8",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },

  footNote: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
});
