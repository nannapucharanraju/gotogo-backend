import { useThemeColors } from "@/hooks/use-theme-colours";
import { ReactNode, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const theme = useThemeColors();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
        onPress={onPress}
        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
      >
        <Text style={[styles.primaryText, { color: theme.surface }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  const theme = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {children}
    </View>
  );
}

export function H1({ children }: { children: ReactNode }) {
  const theme = useThemeColors();
  return <Text style={[styles.h1, { color: theme.text }]}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  const theme = useThemeColors();
  return <Text style={[styles.body, { color: theme.muted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { fontWeight: "900", fontSize: 16 },
  card: { borderRadius: 16, padding: 14 },
  h1: { fontSize: 20, fontWeight: "800" },
  body: { fontSize: 13 },
});
