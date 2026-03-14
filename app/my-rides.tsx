import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const UPCOMING = [
  {
    id: "1",
    route: "Hyderabad → Vijayawada",
    time: "Today • 08:30 AM",
    status: "Booked",
  },
  {
    id: "2",
    route: "Hyderabad → Guntur",
    time: "Tomorrow • 06:00 AM",
    status: "Posted",
  },
];

const PAST = [
  {
    id: "3",
    route: "Hyderabad → Warangal",
    time: "Jan 10 • 09:00 AM",
    status: "Completed",
  },
];

export default function MyRidesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>

      <Text style={styles.section}>Upcoming</Text>
      <FlatList
        data={UPCOMING}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.route}>{item.route}</Text>
            <Text style={styles.meta}>{item.time}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.section}>Past</Text>
      <FlatList
        data={PAST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.pastCard]}>
            <Text style={styles.route}>{item.route}</Text>
            <Text style={styles.meta}>{item.time}</Text>
            <Text style={styles.statusMuted}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 16 },
  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  section: { color: "#9ca3af", marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: "#0f172a", borderRadius: 14, padding: 12 },
  pastCard: { opacity: 0.7 },
  route: { color: "#e5e7eb", fontWeight: "700" },
  meta: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  status: { color: "#38bdf8", marginTop: 4, fontWeight: "700" },
  statusMuted: { color: "#9ca3af", marginTop: 4 },
});
