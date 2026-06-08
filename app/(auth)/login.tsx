import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink() {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "renewly://auth/callback" },
    });
    if (error) Alert.alert("Error", error.message);
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32, gap: 24 }}>
        {/* Logo / wordmark */}
        <View style={{ gap: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 36, fontWeight: "700", letterSpacing: -1 }}>
            Renewly
          </Text>
          <Text style={{ fontSize: 15, color: "#6b7280" }}>
            Track subscriptions with AI
          </Text>
        </View>

        {sent ? (
          <View style={{ gap: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 17, fontWeight: "600" }}>Check your email</Text>
            <Text style={{ fontSize: 15, color: "#6b7280", textAlign: "center" }}>
              Magic link sent to {email}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {/* Google */}
            <Pressable
              onPress={handleGoogle}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: pressed ? "#f9fafb" : "#fff",
              })}
            >
              <Text style={{ fontSize: 16 }}>G</Text>
              <Text style={{ fontSize: 15, fontWeight: "500" }}>Continue with Google</Text>
            </Pressable>

            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            </View>

            {/* Email */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
              }}
            />

            <Pressable
              onPress={handleMagicLink}
              disabled={loading || !email.trim()}
              style={({ pressed }) => ({
                backgroundColor: loading || !email.trim() ? "#d1d5db" : pressed ? "#1d4ed8" : "#2563eb",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              })}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                  Send magic link
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
