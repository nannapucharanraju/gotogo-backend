import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadDocsScreen() {
  const validateImage = (file: any) => {
    if (!file?.uri) return "Invalid image";

    if (file.fileSize && file.fileSize > 8 * 1024 * 1024) {
      return "Image too large (max 8MB)";
    }

    return null;
  };
  const router = useRouter();

  const [license, setLicense] = useState<any>(null);
  const [selfie, setSelfie] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- PICK LICENSE ---------------- */

  const pickLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setLicense(result.assets[0]);
    }
  };

  /* ---------------- TAKE SELFIE ---------------- */

  const takeSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access needed.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      allowsEditing: true,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      setSelfie(result.assets[0]);
    }
  };

  /* ---------------- HANDLE UPLOAD ---------------- */
  const handleUpload = async () => {
    if (loading) return;

    if (!license || !selfie) {
      Alert.alert("Missing documents");
      return;
    }

    const licenseError = validateImage(license);
    const selfieError = validateImage(selfie);

    if (licenseError || selfieError) {
      Alert.alert("Upload Error", licenseError || selfieError || "");
      return;
    }

    try {
      setLoading(true);

      // 🔒 Android file flush delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const formData = new FormData();

      formData.append("license", {
        uri: license.uri,
        name: "license.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("selfie", {
        uri: selfie.uri,
        name: "selfie.jpg",
        type: "image/jpeg",
      } as any);

      const token =
        typeof api.defaults.headers.common["Authorization"] === "string"
          ? api.defaults.headers.common["Authorization"]
          : "";

      const response = await fetch(
        `${api.defaults.baseURL}/api/verification/upload`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      Alert.alert("Success", "Documents submitted for review.", [
        {
          text: "Continue",
          onPress: () => router.replace("/verification-pending"),
        },
      ]);
    } catch (err: any) {
      console.log("UPLOAD ERROR:", err);
      Alert.alert("Upload Failed", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Stack.Screen
        options={{
          title: "Driver Verification",
          headerStyle: { backgroundColor: "#0b1220" },
          headerTintColor: "#e5e7eb",
        }}
      />

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.hero}>
            <Ionicons
              name="shield-checkmark-outline"
              size={48}
              color="#38bdf8"
            />
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              Upload required documents to start posting rides securely.
            </Text>
          </View>

          <UploadCard
            title="Driver License"
            selected={license}
            icon="image-outline"
            onPress={pickLicense}
          />

          <UploadCard
            title="Live Selfie"
            selected={selfie}
            icon="camera-outline"
            onPress={takeSelfie}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!license || !selfie || loading) && { opacity: 0.5 },
            ]}
            disabled={!license || !selfie || loading}
            onPress={handleUpload}
          >
            {loading ? (
              <ActivityIndicator color="#0b1220" />
            ) : (
              <Text style={styles.submitText}>Submit for Review</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace("/(tabs)/book")}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ---------------- REUSABLE CARD ---------------- */

function UploadCard({ title, selected, icon, onPress }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{title}</Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
        )}
      </View>

      <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
        {selected ? (
          <Image source={{ uri: selected.uri }} style={styles.preview} />
        ) : (
          <>
            <Ionicons name={icon} size={28} color="#38bdf8" />
            <Text style={styles.uploadText}>Tap to upload</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 24 },

  hero: {
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    color: "#e5e7eb",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    fontSize: 13,
  },

  card: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  uploadBox: {
    backgroundColor: "#020617",
    height: 190,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  uploadText: {
    color: "#38bdf8",
    fontWeight: "700",
    marginTop: 6,
  },

  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  submitBtn: {
    backgroundColor: "#38bdf8",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },

  submitText: {
    color: "#0b1220",
    fontWeight: "900",
    fontSize: 16,
  },

  cancelBtn: {
    marginTop: 20,
    alignItems: "center",
  },

  cancelText: {
    color: "#64748b",
  },
});
