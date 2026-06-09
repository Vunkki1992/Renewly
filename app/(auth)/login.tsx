import { useState } from "react";
import {
  View, TextInput, Pressable, KeyboardAvoidingView,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { Text } from "@/components/Text";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedPressable } from "@/components/AnimatedPressable";

type Mode = "signup" | "login";

const BG     = "#F7F8FA";
const CARD   = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT   = "#11151C";
const MUTED  = "#6A7280";
const CORAL  = "#FF6B5C";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode]               = useState<Mode>("signup");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  async function handleContinue() {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // TODO: replace stub with supabase.auth.signUp / signInWithPassword
      await new Promise((r) => setTimeout(r, 700));
      await AsyncStorage.setItem("@subpulse/hasOnboarded", "true");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          gap: 28,
        }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: "#F0F2F5",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={20} color={TEXT} />
        </Pressable>

        {/* Logo */}
        <View style={{ alignItems: "center", gap: 6, paddingTop: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: "700", color: TEXT, letterSpacing: -1 }}>
            SubPulse
          </Text>
          <Text style={{ fontSize: 15, color: MUTED }}>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={{
          flexDirection: "row", backgroundColor: "#F0F2F5",
          borderRadius: 12, padding: 3, gap: 2,
        }}>
          {(["signup", "login"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10,
                alignItems: "center",
                backgroundColor: mode === m ? CARD : "transparent",
                ...(mode === m ? SHADOW : {}),
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: mode === m ? TEXT : MUTED }}>
                {m === "signup" ? "Sign up" : "Log in"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={{ gap: 12 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            style={{
              backgroundColor: CARD, borderRadius: 12,
              borderWidth: 1, borderColor: BORDER,
              paddingHorizontal: 16, paddingVertical: 14,
              fontSize: 15, color: TEXT,
            }}
            placeholderTextColor={MUTED}
          />

          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              style={{
                backgroundColor: CARD, borderRadius: 12,
                borderWidth: 1, borderColor: BORDER,
                paddingHorizontal: 16, paddingVertical: 14,
                paddingRight: 52, fontSize: 15, color: TEXT,
              }}
              placeholderTextColor={MUTED}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
              style={{
                position: "absolute", right: 16,
                top: 0, bottom: 0, justifyContent: "center",
              }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={MUTED}
              />
            </Pressable>
          </View>
        </View>

        {/* CTA */}
        <AnimatedPressable
          scaleDown={0.97}
          onPress={handleContinue}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#D1D5DB" : CORAL,
            borderRadius: 14, paddingVertical: 16, alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
              {mode === "signup" ? "Create account" : "Sign in"}
            </Text>
          )}
        </AnimatedPressable>

        {mode === "signup" && (
          <Text style={{ fontSize: 12, color: MUTED, textAlign: "center", lineHeight: 17 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
