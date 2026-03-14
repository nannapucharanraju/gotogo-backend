import { MAPBOX_TOKEN } from "@/lib/maps";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Mapbox from "@rnmapbox/maps";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
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

import { SafeAreaView } from "react-native-safe-area-context";

export default function BookScreen() {
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const fetchRoute = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
  ) => {
    try {
      const res = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}`,
        {
          params: {
            geometries: "geojson",
            access_token: MAPBOX_TOKEN,
          },
        },
      );

      const coords = res.data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => ({
          latitude: c[1],
          longitude: c[0],
        }),
      );

      setRouteCoords(coords);
    } catch (e) {
      console.log("Route fetch error:", e);
    }
  };

  const [fromCoord, setFromCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [toCoord, setToCoord] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const router = useRouter();

  // ✅ map fix
  const mapRef = useRef<any>(null);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isTodaySelected, setIsTodaySelected] = useState(true);

  const fetchPlaces = async (query: string) => {
    if (!query || query.length < 2) return [];
    const res = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 5,
          country: "IN",
        },
      },
    );
    return res.data.features;
  };

  useEffect(() => {
    console.log("FROM:", fromCoord, "TO:", toCoord);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const center = [loc.coords.longitude, loc.coords.latitude];
      mapRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: 13,
      });
    })();
  }, [fromCoord, toCoord]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* Map */}
        <Mapbox.MapView style={styles.map} ref={mapRef}>
          <Mapbox.Camera
            zoomLevel={5}
            centerCoordinate={[78.486671, 17.385044]}
          />

          {routeCoords.length > 0 && (
            <>
              <Mapbox.PointAnnotation
                id="start"
                coordinate={[routeCoords[0].longitude, routeCoords[0].latitude]}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#38bdf8",
                    borderWidth: 2,
                    borderColor: "white",
                  }}
                />
              </Mapbox.PointAnnotation>

              <Mapbox.PointAnnotation
                id="end"
                coordinate={[
                  routeCoords[routeCoords.length - 1].longitude,
                  routeCoords[routeCoords.length - 1].latitude,
                ]}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#22c55e",
                    borderWidth: 2,
                    borderColor: "white",
                  }}
                />
              </Mapbox.PointAnnotation>
              {/* Route line */}
              <Mapbox.ShapeSource
                id="routeSource"
                shape={
                  {
                    type: "Feature",
                    geometry: {
                      type: "LineString",
                      coordinates: routeCoords.map((c) => [
                        c.longitude,
                        c.latitude,
                      ]),
                    },
                  } as any
                }
              >
                <Mapbox.LineLayer
                  id="routeLine"
                  style={{
                    lineColor: "#38bdf8",
                    lineWidth: 4,
                  }}
                />
              </Mapbox.ShapeSource>
            </>
          )}
        </Mapbox.MapView>

        {/* Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Book Ride</Text>

            {/* From */}
            <View style={styles.rowItem}>
              <Ionicons
                name="car-outline"
                size={20}
                color="#e5e7eb"
                style={{ marginRight: 10 }}
              />
              <View style={styles.autoWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="From"
                  placeholderTextColor="#9ca3af"
                  value={fromQuery}
                  onChangeText={async (text) => {
                    setFromQuery(text);
                    const places = await fetchPlaces(text);
                    setFromSuggestions(places);
                  }}
                />

                {fromSuggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    {fromSuggestions.map((s: any, i: number) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setFromQuery(s.place_name);
                          setFromCoord({ lat: s.center[1], lng: s.center[0] });
                          setFromSuggestions([]);

                          if (toCoord) {
                            fetchRoute(
                              { lat: s.center[1], lng: s.center[0] },
                              toCoord,
                            );
                          }
                        }}
                      >
                        <Text style={styles.suggestionText}>
                          {s.place_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* To */}
            <View style={styles.rowItem}>
              <Ionicons
                name="car-outline"
                size={20}
                color="#e5e7eb"
                style={{ marginRight: 10 }}
              />
              <View style={styles.autoWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="To"
                  placeholderTextColor="#9ca3af"
                  value={toQuery}
                  onChangeText={async (text) => {
                    setToQuery(text);
                    const places = await fetchPlaces(text);
                    setToSuggestions(places);
                  }}
                />

                {toSuggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    {toSuggestions.map((s: any, i: number) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setToQuery(s.place_name);
                          setToCoord({ lat: s.center[1], lng: s.center[0] });
                          setToSuggestions([]);

                          if (fromCoord) {
                            fetchRoute(fromCoord, {
                              lat: s.center[1],
                              lng: s.center[0],
                            });
                          }
                        }}
                      >
                        <Text style={styles.suggestionText}>
                          {s.place_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Swap */}
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={() => {
                const temp = fromQuery;
                setFromQuery(toQuery);
                setToQuery(temp);
              }}
            >
              <Text style={styles.swapIcon}>⇅</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Date */}
            <View style={styles.dateRow}>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <View>
                  <Text style={styles.dateLabel}>Date of Journey</Text>
                  <Text style={styles.dateValue}>{date.toDateString()}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.quickDates}>
                <TouchableOpacity
                  style={[
                    styles.quickPill,
                    isTodaySelected && styles.quickPillActive,
                  ]}
                  onPress={() => {
                    const d = new Date();
                    setDate(d);
                    setIsTodaySelected(true);
                  }}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      isTodaySelected && styles.quickPillTextActive,
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickPill,
                    !isTodaySelected && styles.quickPillActive,
                  ]}
                  onPress={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDate(d);
                    setIsTodaySelected(false);
                  }}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      !isTodaySelected && styles.quickPillTextActive,
                    ]}
                  >
                    Tomorrow
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, selected) => {
                  setShowPicker(false);
                  if (selected) setDate(selected);
                  setIsTodaySelected(false);
                }}
              />
            )}

            {/* Search */}
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() =>
                router.push({
                  pathname: "/results",
                  params: {
                    fromQuery,
                    toQuery,
                    date: date.toISOString().split("T")[0],
                  },
                })
              }
            >
              <Text style={styles.searchText}>Search Rides</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  cardWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 45,
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 20,
    padding: 16,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#020617",
  },
  input: {
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    borderRadius: 14,
    padding: 12,
  },
  autoWrap: {
    flex: 1,
    position: "relative",
  },
  suggestionsBox: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#020617",
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#020617",
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  suggestionText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  swapBtn: {
    position: "absolute",
    right: 20,
    top: 95,
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  swapIcon: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "900",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
  },
  dateLabel: { color: "#9ca3af", fontSize: 12 },
  dateValue: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  quickDates: { flexDirection: "row", gap: 8 },
  quickPill: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  quickPillActive: { backgroundColor: "#38bdf8" },
  quickPillText: { color: "#e5e7eb", fontWeight: "700" },
  quickPillTextActive: { color: "#020617", fontWeight: "900" },
  searchBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  searchText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "900",
  },
});
