import { api } from "@/lib/api";
import { MAPBOX_TOKEN } from "@/lib/maps";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function RideDetailsScreen() {
  const [ctaEnabled, setCtaEnabled] = useState(false);
  const mapRef = useRef<any>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);

  // ETA
  const [etaText, setEtaText] = useState<string | null>(null);
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [arrivalTimeText, setArrivalTimeText] = useState<string | null>(null);

  // Avatar modal
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    if (!rideId) return;
    (async () => {
      try {
        const res = await api.get(`/rides/${rideId}`);
        const r = res.data;
        setRide({
          ...r,
          driverName: r.createdBy?.name,
          driverAge: r.createdBy?.age,
          driverGender: r.createdBy?.gender,
          driverAvatar: r.createdBy?.avatar,
        });
      } catch (e) {
        console.log("Load ride error:", e);
        alert("Failed to load ride details");
      } finally {
        setLoading(false);
      }
    })();
  }, [rideId]);

  useEffect(() => {
    if (!ride) return;

    const fromLat = Number(ride.fromLat);
    const fromLng = Number(ride.fromLng);
    const toLat = Number(ride.toLat);
    const toLng = Number(ride.toLng);

    if (!fromLat || !fromLng || !toLat || !toLng) return;

    fetchRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng });
  }, [ride]);

  const fetchRoute = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
  ) => {
    try {
      const res = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lng},${from.lat};${to.lng},${to.lat}`,
        { params: { geometries: "geojson", access_token: MAPBOX_TOKEN } },
      );

      const route = res.data.routes[0];

      const coords = route.geometry.coordinates.map((c: [number, number]) => ({
        latitude: c[1],
        longitude: c[0],
      }));
      setRouteCoords(coords);

      // ETA
      const seconds = Math.round(route.duration);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      setEtaText(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);

      // Distance
      const km = (route.distance / 1000).toFixed(1);
      setDistanceText(`${km} km`);

      // Arrival time parse: "Wed Feb 25 2026, 12:37 AM"
      const startRaw = (ride?.startTime || ride?.time || "").toString().trim();
      let startDate: Date | null = null;

      const m = startRaw.match(
        /^(\w{3})\s+(\w{3})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
      );
      if (m) {
        const [, , mon, day, year, hh, mm, mer] = m;
        const monthMap: Record<string, number> = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        let h = parseInt(hh, 10);
        const min = parseInt(mm, 10);
        const month = monthMap[mon];

        if (mer.toUpperCase() === "PM" && h < 12) h += 12;
        if (mer.toUpperCase() === "AM" && h === 12) h = 0;

        startDate = new Date(
          parseInt(year, 10),
          month,
          parseInt(day, 10),
          h,
          min,
          0,
          0,
        );
      }

      if (!startDate) {
        const d = new Date(startRaw);
        if (!isNaN(d.getTime())) startDate = d;
      }

      if (startDate) {
        const arrival = new Date(startDate.getTime() + seconds * 1000);
        const hh2 = arrival.getHours().toString().padStart(2, "0");
        const mm2 = arrival.getMinutes().toString().padStart(2, "0");
        setArrivalTimeText(`${hh2}:${mm2}`);
      } else {
        setArrivalTimeText(null);
      }
    } catch (e) {
      console.log("Route fetch error:", e);
      alert("Failed to load route from Mapbox");
    }
  };

  if (loading || !ride) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
          Loading ride...
        </Text>
      </SafeAreaView>
    );
  }

  const openInMaps = () => {
    if (routeCoords.length < 2) return;

    const origin = `${routeCoords[0].latitude},${routeCoords[0].longitude}`;
    const destination = `${routeCoords[routeCoords.length - 1].latitude},${routeCoords[routeCoords.length - 1].longitude}`;

    const url = Platform.select({
      ios: `http://maps.apple.com/?saddr=${origin}&daddr=${destination}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
      default: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
    });

    Linking.openURL(url!);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapWrapper}>
        <Mapbox.MapView style={{ flex: 1 }} ref={mapRef}>
          <Mapbox.Camera
            zoomLevel={5}
            centerCoordinate={
              routeCoords.length > 0
                ? [routeCoords[0].longitude, routeCoords[0].latitude]
                : [78.486671, 17.385044]
            }
          />

          {routeCoords.length > 0 && (
            <>
              {/* Start marker */}
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

              {/* End marker */}
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

        {/* Open in Maps button */}
        <View style={styles.mapActions}>
          <TouchableOpacity style={styles.mapBtn} onPress={openInMaps}>
            <Ionicons name="navigate" size={18} color="#38bdf8" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Sheet */}
      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Locations */}
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="radio-button-on" size={16} color="#38bdf8" />
              <View>
                <Text style={styles.locationLabel}>From</Text>
                <Text style={styles.locationValue}>{ride.from}</Text>
              </View>
            </View>
            <View style={styles.locationLine} />
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#22c55e" />
              <View>
                <Text style={styles.locationLabel}>To</Text>
                <Text style={styles.locationValue}>{ride.to}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.price}>₹{ride.price}</Text>
              <Text style={styles.priceHint}>per seat</Text>
            </View>
            <View style={styles.seatPill}>
              <Ionicons name="people-outline" size={16} color="#22c55e" />
              <Text style={styles.seatPillText}>{ride.seats} seats total</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Ionicons name="time-outline" size={16} color="#38bdf8" />
              <View>
                <Text style={styles.timelineLabel}>Start time</Text>
                <Text style={styles.timelineValue}>
                  {ride.departureTime
                    ? new Date(ride.departureTime).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <Ionicons name="flash-outline" size={16} color="#22c55e" />
              <View>
                <Text style={styles.timelineLabel}>Traffic-aware ETA</Text>
                <Text style={styles.timelineValue}>
                  {etaText || "—"} {distanceText ? `• ${distanceText}` : ""}
                </Text>
                {arrivalTimeText && (
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                    Arrives by {arrivalTimeText}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Driver */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver</Text>
            <View style={styles.driverCard}>
              {ride.driverAvatar ? (
                <Pressable onPress={() => setAvatarOpen(true)}>
                  <Image
                    source={{ uri: ride.driverAvatar }}
                    style={styles.avatar}
                  />
                </Pressable>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {ride.driverName?.[0] || "D"}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.driverName}>
                  {ride.driverName || "Driver"}
                </Text>
                <Text style={styles.driverMeta}>
                  {ride.driverAge || "—"} yrs • {ride.driverGender || "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <View style={styles.vehicleCard}>
              <Ionicons name="car-sport-outline" size={20} color="#38bdf8" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.vehicleTitle}>{ride.vehicleModel}</Text>
                <Text style={styles.vehicleSub}>{ride.vehicleNumber}</Text>
                <Text style={styles.vehicleDesc}>
                  {ride.vehicleDetails || "Comfortable ride"}
                </Text>
              </View>
            </View>
          </View>

          {/* Ultra Premium Seat Selector – Luxury Card */}
          <View style={styles.seatLuxCard}>
            <View style={styles.seatLuxHeader}>
              <Text style={styles.seatLuxTitle}>Seats</Text>
              <View style={styles.seatLuxBadge}>
                <Ionicons name="people" size={12} color="#0f172a" />
                <Text style={styles.seatLuxBadgeText}>
                  {ride.seats} available
                </Text>
              </View>
            </View>

            <View style={styles.seatLuxControls}>
              <TouchableOpacity
                style={[
                  styles.seatLuxBtn,
                  seats === 1 && styles.seatLuxBtnDisabled,
                ]}
                disabled={seats === 1}
                onPress={() => setSeats((s) => Math.max(1, s - 1))}
              >
                <Ionicons name="remove" size={22} color="#e5e7eb" />
              </TouchableOpacity>

              <View style={styles.seatLuxCounterWrap}>
                <Text style={styles.seatLuxCounter}>{seats}</Text>
                <Text style={styles.seatLuxSub}>Selected</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.seatLuxBtn,
                  seats === ride.seats && styles.seatLuxBtnDisabled,
                ]}
                disabled={seats === ride.seats}
                onPress={() => setSeats((s) => Math.min(ride.seats, s + 1))}
              >
                <Ionicons name="add" size={22} color="#e5e7eb" />
              </TouchableOpacity>
            </View>

            <View style={styles.seatLuxFooter}>
              <Text style={styles.seatLuxPriceHint}>
                ₹{ride.price} × {seats} seats
              </Text>
              <Text style={styles.seatLuxTotal}>
                ₹{ride.price * seats} total
              </Text>
            </View>
          </View>

          <View style={{ height: 90 }} />
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={async () => {
            try {
              await api.patch(`/rides/${rideId}/book`, { seats });
              router.replace("/booking-pending");
            } catch (e: any) {
              alert(
                e?.response?.data?.message || "Failed to send booking request",
              );
            }
          }}
        >
          <Text style={styles.ctaText}>Request to Book</Text>
        </TouchableOpacity>
      </View>

      {/* Seat Selector */}

      {/* Avatar Modal */}
      <Modal visible={avatarOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setAvatarOpen(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: ride.driverAvatar }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setAvatarOpen(false)}
            >
              <Ionicons name="close" size={22} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  mapWrapper: { height: height * 0.42 },
  mapActions: { position: "absolute", top: 12, right: 12 },
  mapBtn: {
    backgroundColor: "rgba(2,6,23,0.85)",
    borderRadius: 999,
    padding: 10,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
    paddingHorizontal: 18,
  },
  locationCard: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationLabel: { color: "#94a3b8", fontSize: 12 },
  locationValue: { color: "#e5e7eb", fontWeight: "800" },
  locationLine: {
    height: 18,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(148,163,184,0.3)",
    marginLeft: 7,
    marginVertical: 8,
  },
  heroRow: { flexDirection: "row", justifyContent: "space-between" },
  price: { color: "#38bdf8", fontSize: 28, fontWeight: "900" },
  priceHint: { color: "#94a3b8" },
  seatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seatPillText: { color: "#22c55e", fontWeight: "700", fontSize: 12 },
  timeline: {
    marginTop: 20,
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 16,
  },
  timelineItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  timelineLabel: { color: "#94a3b8", fontSize: 12 },
  timelineValue: { color: "#e5e7eb", fontWeight: "800", fontSize: 16 },
  timelineLine: {
    height: 24,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(148,163,184,0.3)",
    marginLeft: 7,
    marginVertical: 6,
  },
  section: { marginTop: 22 },
  sectionTitle: { color: "#e5e7eb", fontWeight: "800", marginBottom: 10 },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#38bdf8", fontWeight: "900" },
  driverName: { color: "#e5e7eb", fontWeight: "800" },
  driverMeta: { color: "#94a3b8", fontSize: 12 },
  vehicleCard: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 14,
  },
  vehicleTitle: { color: "#e5e7eb", fontWeight: "800" },
  vehicleSub: { color: "#94a3b8", fontSize: 12 },
  vehicleDesc: { color: "#cbd5e1", fontSize: 12, marginTop: 4 },
  cta: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    backgroundColor: "#38bdf8",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "#0f172a", fontWeight: "900", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  modalImage: { width: "100%", height: "100%" },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(2,6,23,0.7)",
    borderRadius: 999,
    padding: 8,
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seatBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  seatCountPill: {
    backgroundColor: "rgba(56,189,248,0.15)",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  seatCount: { color: "#38bdf8", fontSize: 22, fontWeight: "900" },

  seatLuxCard: {
    backgroundColor: "rgba(2,6,23,0.9)",
    borderRadius: 24,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  seatLuxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  seatLuxTitle: {
    color: "#e5e7eb",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  seatLuxBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seatLuxBadgeText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 11,
  },
  seatLuxControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  seatLuxBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(56,189,248,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  seatLuxBtnDisabled: {
    opacity: 0.4,
  },
  seatLuxCounterWrap: {
    alignItems: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
  },
  seatLuxCounter: {
    color: "#38bdf8",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  seatLuxSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: -2,
  },
  seatLuxFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seatLuxPriceHint: {
    color: "#94a3b8",
    fontSize: 12,
  },
  seatLuxTotal: {
    color: "#e5e7eb",
    fontWeight: "900",
    fontSize: 16,
  },
});
