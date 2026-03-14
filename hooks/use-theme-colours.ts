import { useColorScheme } from "./use-color-scheme";

const LightTheme = {
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#f1f5f9",
  primary: "#2563eb",
  text: "#0f172a",
  muted: "#475569",
  border: "#e2e8f0",
  danger: "#ef4444",
  success: "#16a34a",
};

const DarkTheme = {
  background: "#0b1220",
  surface: "#0f172a",
  card: "#020617",
  primary: "#38bdf8",
  text: "#e5e7eb",
  muted: "#9ca3af",
  border: "#020617",
  danger: "#f87171",
  success: "#22c55e",
};

export type ThemeColors = typeof LightTheme;

// ✅ New API (for your components)
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkTheme : LightTheme;
}

// ✅ Backward-compatible API (for Expo template)
export function useThemeColor(
  _props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : LightTheme;
  return theme[colorName];
}
