import { api } from "@/lib/api";
import { MAPBOX_TOKEN } from "@/lib/maps";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostScreen() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCoord, setFromCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [toCoord, setToCoord] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [seats, setSeats] = useState(1);
  const [distanceKm, setDistanceKm] = useState(0);
  const [price, setPrice] = useState(0);
  const minPrice = distanceKm * 1;
  const maxPrice = distanceKm * 3;

  const highThreshold = minPrice + (maxPrice - minPrice) * 0.7;
  const veryHighThreshold = minPrice + (maxPrice - minPrice) * 0.85;

  const priceTone =
    price >= veryHighThreshold
      ? "danger"
      : price >= highThreshold
        ? "warn"
        : "normal";

  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const fetchPlaces = async (query: string) => {
    if (!query || query.length < 2) return [];
    const res = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      { params: { access_token: MAPBOX_TOKEN, limit: 5, country: "IN" } },
    );
    return res.data.features;
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkVerification = async () => {
        try {
          const res = await api.get("/verification/status");
          const data = res.data;

          if (!isActive) return;

          if (data.status === "none") {
            router.replace("/upload-docs");
            return;
          }

          if (data.status === "rejected") {
            router.replace({
              pathname: "/verification-rejected",
              params: { reason: data.rejectionReason },
            });
            return;
          }

          // pending or approved
          setStatus(data.status);
          setLoading(false);
        } catch (err) {
          console.log("Verification check failed:", err);
          setLoading(false);
        }
      };

      checkVerification();

      return () => {
        isActive = false;
      };
    }, []),
  );

  // Fetch distance when both coords exist
  useEffect(() => {
    (async () => {
      if (!fromCoord || !toCoord) return;
      try {
        const res = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}`,
          { params: { access_token: MAPBOX_TOKEN } },
        );
        const route = res.data.routes[0];

        const meters = route.distance;
        const duration = route.duration; // 👈 THIS IS THE NEW PART

        const km = Math.max(1, Math.round(meters / 1000));
        setDistanceKm(km);

        setDurationSeconds(duration); // 👈 SAVE ETA IN SECONDS

        const mid = Math.round(km * 2);
        setPrice(mid);
      } catch (e) {
        console.log("Distance error:", e);
      }
    })();
  }, [fromCoord, toCoord]);

  const isValid = useMemo(
    () =>
      from &&
      to &&
      fromCoord &&
      toCoord &&
      price > 0 &&
      vehicleModel &&
      vehicleNumber &&
      seats >= 1 &&
      seats <= 6,
    [from, to, fromCoord, toCoord, price, vehicleModel, vehicleNumber, seats],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b1220",
        }}
      >
        <Text style={{ color: "#e5e7eb" }}>Checking verification...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Post a Ride</Text>
        <Text style={styles.heroSub}>Share your journey. Earn on the way.</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route</Text>

          <View style={styles.locationBox}>
            <Ionicons name="radio-button-on" size={16} color="#38bdf8" />
            <TextInput
              placeholder="Pickup location"
              placeholderTextColor="#64748b"
              value={from}
              onChangeText={async (t) => {
                setFrom(t);
                setFromCoord(null);
                setFromSuggestions(await fetchPlaces(t));
              }}
              style={styles.locationInput}
            />
          </View>

          {fromSuggestions.length > 0 && (
            <View style={styles.suggestWrap}>
              {fromSuggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestItem}
                  onPress={() => {
                    setFrom(s.place_name);
                    setFromCoord({ lat: s.center[1], lng: s.center[0] });
                    setFromSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestText}>{s.place_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.routeDivider} />

          <View style={styles.locationBox}>
            <Ionicons name="location" size={16} color="#22c55e" />
            <TextInput
              placeholder="Drop location"
              placeholderTextColor="#64748b"
              value={to}
              onChangeText={async (t) => {
                setTo(t);
                setToCoord(null);
                setToSuggestions(await fetchPlaces(t));
              }}
              style={styles.locationInput}
            />
          </View>

          {toSuggestions.length > 0 && (
            <View style={styles.suggestWrap}>
              {toSuggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestItem}
                  onPress={() => {
                    setTo(s.place_name);
                    setToCoord({ lat: s.center[1], lng: s.center[0] });
                    setToSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestText}>{s.place_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.scheduleBox}
              onPress={() => setShowDate(true)}
            >
              <Ionicons name="calendar-outline" size={16} color="#38bdf8" />
              <Text style={styles.scheduleText}>{date.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scheduleBox}
              onPress={() => setShowTime(true)}
            >
              <Ionicons name="time-outline" size={16} color="#38bdf8" />
              <Text style={styles.scheduleText}>
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ride Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Seats</Text>
            <View style={styles.seatBox}>
              <TouchableOpacity
                onPress={() => setSeats((s) => Math.max(1, s - 1))}
                disabled={seats <= 1}
                style={[styles.seatBtn, seats <= 1 && { opacity: 0.4 }]}
              >
                <Text style={styles.seatBtnText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.seatValue}>{seats}</Text>

              <TouchableOpacity
                onPress={() => setSeats((s) => Math.min(6, s + 1))}
                disabled={seats >= 6}
                style={[styles.seatBtn, seats >= 6 && { opacity: 0.4 }]}
              >
                <Text style={styles.seatBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.hint}>Max 6 seats per ride</Text>

          {/* Price Slider */}
          {distanceKm > 0 && (
            <View style={styles.priceWrap}>
              <Text style={styles.label}>Price per seat</Text>
              <Text
                style={[
                  styles.priceLive,
                  priceTone === "danger" && { color: "#ef4444" },
                  priceTone === "warn" && { color: "#f59e0b" },
                ]}
              >
                ₹ {price}
              </Text>

              <Slider
                minimumValue={minPrice}
                maximumValue={maxPrice}
                step={1}
                value={price}
                minimumTrackTintColor="#38bdf8"
                maximumTrackTintColor="#1e293b"
                thumbTintColor="#38bdf8"
                onValueChange={(v) => setPrice(Math.round(v))}
              />

              <View style={styles.priceRangeRow}>
                <Text style={styles.hint}>Min ₹{minPrice}</Text>
                <Text style={styles.hint}>Max ₹{maxPrice}</Text>
              </View>
            </View>
          )}
          {priceTone === "danger" && (
            <Text style={styles.priceWarning}>
              Higher price may reduce booking chances
            </Text>
          )}
        </View>

        {/* Vehicle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle</Text>

          <TextInput
            placeholder="Vehicle model"
            placeholderTextColor="#64748b"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            style={styles.blockInput}
          />

          <TextInput
            placeholder="Vehicle number"
            placeholderTextColor="#64748b"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            style={styles.blockInput}
            autoCapitalize="characters"
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, !isValid && styles.ctaDisabled]}
          disabled={!isValid}
          onPress={() =>
            router.push({
              pathname: "/post-preview",
              params: {
                from,
                to,
                fromLat: String(fromCoord?.lat),
                fromLng: String(fromCoord?.lng),
                toLat: String(toCoord?.lat),
                toLng: String(toCoord?.lng),
                departureDateISO: date.toISOString(),
                departureTimeISO: time.toISOString(),

                durationSeconds: String(durationSeconds),
                seats: String(seats),
                price: String(price),
                model: vehicleModel,
                number: vehicleNumber,
              },
            })
          }
        >
          <Text style={styles.ctaText}>Review & Publish</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDate(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTime(false);
            if (!selectedTime) return;

            const now = new Date();

            // combine selected date + selected time
            const selectedDateTime = new Date(date);
            selectedDateTime.setHours(selectedTime.getHours());
            selectedDateTime.setMinutes(selectedTime.getMinutes());
            selectedDateTime.setSeconds(0);
            selectedDateTime.setMilliseconds(0);

            const isToday = date.toDateString() === now.toDateString();

            if (isToday) {
              const minAllowed = new Date(now.getTime() + 10 * 60 * 1000);

              if (selectedDateTime < minAllowed) {
                alert(
                  "Please choose a departure time at least 10 minutes from now so passengers can find your ride.",
                );

                setTime(minAllowed);
                return;
              }
            }

            setTime(selectedTime);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },

  hero: { paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16 },
  heroTitle: { color: "#e5e7eb", fontSize: 28, fontWeight: "900" },
  heroSub: { color: "#94a3b8", marginTop: 4 },

  content: { paddingHorizontal: 16, paddingBottom: 16 },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#020617",
  },
  cardTitle: { color: "#e5e7eb", fontWeight: "800", marginBottom: 10 },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  locationInput: { flex: 1, color: "#e5e7eb", paddingVertical: 12 },
  routeDivider: { height: 1, backgroundColor: "#020617", marginVertical: 6 },

  suggestWrap: {
    backgroundColor: "#020617",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
  },
  suggestItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  suggestText: { color: "#e5e7eb", fontSize: 13 },

  row: { flexDirection: "row", gap: 10 },
  scheduleBox: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingVertical: 12,
  },
  scheduleText: { color: "#e5e7eb", fontWeight: "700" },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  label: { color: "#9ca3af", fontSize: 12 },

  seatBox: { flexDirection: "row", alignItems: "center", gap: 12 },
  seatBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  seatBtnText: { color: "#e5e7eb", fontWeight: "900", fontSize: 18 },
  seatValue: { color: "#38bdf8", fontWeight: "900", fontSize: 18 },

  hint: { color: "#94a3b8", fontSize: 12, marginBottom: 6 },

  priceWrap: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },
  priceValue: {
    color: "#38bdf8",
    fontWeight: "900",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  priceRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  blockInput: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    color: "#e5e7eb",
    marginBottom: 8,
  },

  priceLive: {
    color: "#38bdf8",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 2,
  },
  priceWarning: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },

  cta: {
    backgroundColor: "#38bdf8",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#020617", fontWeight: "900", fontSize: 16 },
});
