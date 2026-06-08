import { Redirect, Stack } from "expo-router";
import { use } from "react";
import { SessionContext } from "@/lib/session-context";

export default function AuthLayout() {
  const session = use(SessionContext);
  if (session) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
