import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function OtpVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const onChangeOtp = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    const next = [...otp];
    next[i] = val;
    setOtp(next);

    if (val && i < 5) {
      inputs.current[i + 1]?.focus();
    }
    if (!val && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      alert("Please enter the full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      // 🔁 DEV MODE: mock success
      // TODO (later): Firebase OTP confirm goes here

      router.replace("/(tabs)/book");
    } catch (e) {
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    // TODO: trigger resend OTP API / Firebase resend
    setTimer(30);
    alert("OTP resent");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.card}>
        {/* Gloss highlight */}
        <View style={styles.gloss} />

        <Text style={styles.title}>Verify your phone</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{" "}
          <Text style={{ color: "#38bdf8", fontWeight: "800" }}>{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((v, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r!;
              }}
              style={[styles.otpBox, v ? styles.otpFilled : styles.otpEmpty]}
              keyboardType="number-pad"
              maxLength={1}
              value={v}
              onChangeText={(t) => onChangeOtp(i, t)}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.cta, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={verifyOtp}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#020617" />
          <Text style={styles.ctaText}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendWrap}
          disabled={timer > 0}
          onPress={resendOtp}
        >
          <Text style={styles.resendText}>
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)",
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: -30,
    left: -40,
    width: 180,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 40,
  },

  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 6, marginBottom: 20 },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: "#e5e7eb",
  },
  otpEmpty: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#020617",
  },
  otpFilled: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
  },

  cta: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#020617", fontWeight: "900", fontSize: 16 },

  resendWrap: { marginTop: 14, alignItems: "center" },
  resendText: {
    color: "#94a3b8",
    fontWeight: "700",
  },
});
