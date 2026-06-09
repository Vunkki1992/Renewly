import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@subpulse/hasOnboarded")
      .then((v) => setHasOnboarded(v === "true"))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={{ flex: 1, backgroundColor: "#F7F8FA" }} />;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href={__DEV__ ? "/(tabs)" : "/(auth)/login"} />;
}
