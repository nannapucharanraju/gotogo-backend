import { api } from "@/lib/api";
import { saveUser } from "@/lib/user";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/me");

        setName(res.data.name || "");
        setAge(String(res.data.age || ""));
        setGender(res.data.gender || "male");
        setPhone(res.data.phone || "");
        setAvatar(res.data.avatar || null);
      } catch (e) {
        console.log("Load profile error:", e);
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      return Alert.alert("Permission required", "Allow photo access");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!name.trim() || !gender || !age) {
      return Alert.alert("Invalid", "All fields required");
    }

    const form = new FormData();
    form.append("name", name);
    form.append("gender", gender);
    form.append("age", String(age));

    if (avatar && avatar.startsWith("file://")) {
      form.append("avatar", {
        uri: avatar,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
    }

    try {
      setSaving(true);

      const res = await api.put("/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await saveUser(res.data); // update local cache immediately

      console.log("Profile update response:", res.data);

      Alert.alert(
        "Profile updated",
        "Changes may take a few seconds to appear.",
      );

      router.back();
    } catch (e: any) {
      console.log("Update error:", e?.response?.data || e.message);

      Alert.alert(
        "Update failed",
        e?.response?.data?.message || "Server error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
            <Image
              source={{
                uri:
                  avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png" +
                    phone,
              }}
              style={styles.avatar}
            />

            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={16} color="#0f172a" />
            </View>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSub}>Keep your info fresh & real</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#9ca3af" />

            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />

            <TextInput
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={2}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={18} color="#9ca3af" />

            <TextInput value={phone} editable={false} style={styles.input} />

            <Ionicons name="lock-closed-outline" size={16} color="#64748b" />
          </View>

          <Text style={styles.lockNote}>
            Phone number cannot be changed after verification
          </Text>

          <View style={styles.genderRow}>
            {(["male", "female", "other"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderPill, gender === g && styles.genderActive]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === g && styles.genderTextActive,
                  ]}
                >
                  {g.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cta, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={styles.ctaText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { alignItems: "center", marginTop: 10, marginBottom: 12 },

  avatarWrap: { position: "relative" },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },

  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    padding: 6,
  },

  headerTitle: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },

  headerSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 16,
    marginTop: 12,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    color: "#e5e7eb",
    paddingVertical: 12,
    marginLeft: 8,
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  genderPill: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#020617",
  },

  genderActive: {
    backgroundColor: "rgba(56,189,248,0.15)",
    borderColor: "#38bdf8",
  },

  genderText: {
    color: "#9ca3af",
    fontWeight: "800",
    fontSize: 12,
  },

  genderTextActive: {
    color: "#38bdf8",
  },

  lockNote: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 10,
  },

  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  ctaText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 16,
  },
});
