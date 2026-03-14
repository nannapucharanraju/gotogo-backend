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
import { api } from "../lib/api";

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      Number(age) >= 18 &&
      gender.length > 0 &&
      phone.trim().length >= 10 &&
      email.includes("@") &&
      password.length >= 6
    );
  }, [name, age, gender, phone, email, password]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.card}>
        {/* Gloss */}
        <View style={styles.gloss} />

        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join GoToGo and start carpooling</Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Ionicons name="person-outline" size={18} color="#38bdf8" />
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#64748b"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Ionicons name="calendar-outline" size={18} color="#38bdf8" />
          <TextInput
            placeholder="Age"
            placeholderTextColor="#64748b"
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Gender Selector */}
        <View style={styles.genderWrap}>
          {["Male", "Female", "Other"].map((g) => {
            const active = gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genderPill, active && styles.genderPillActive]}
                onPress={() => setGender(g as any)}
              >
                <Text
                  style={[styles.genderText, active && styles.genderTextActive]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Ionicons name="call-outline" size={18} color="#38bdf8" />
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#64748b"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
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
            placeholder="Password (min 6 chars)"
            placeholderTextColor="#64748b"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, !isValid && styles.ctaDisabled]}
          disabled={!isValid}
          onPress={async () => {
            try {
              await api.post("/signup", {
                name,
                age: Number(age),
                gender,
                phone,
                email,
                password,
              });
              alert("Verify OTP for successfull signup.");
              router.replace("/otp-verify");
            } catch (e: any) {
              alert(e?.response?.data?.message || "Signup failed");
            }
          }}
        >
          <Text style={styles.ctaText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>

        <Text style={styles.footNote}>
          By continuing, you agree to our Terms & Privacy Policy.
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

  genderWrap: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: {
    backgroundColor: "#38bdf8",
  },
  genderText: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 13,
  },
  genderTextActive: {
    color: "#020617",
    fontWeight: "900",
  },

  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#020617", fontWeight: "900", fontSize: 16 },

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
