import { Redirect, Slot } from "expo-router";
import { useState } from "react";

export default function RootLayout() {
  // Fake auth state for now
  const [isLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}
