import { useState } from "react";
import { View, TextInput, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useProfile, updateProfile } from "@/lib/store";

const BG     = "#F7F8FA";
const CARD   = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT   = "#11151C";
const MUTED  = "#6A7280";
const CORAL  = "#FF6B5C";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

const INPUT_STYLE = {
  backgroundColor: CARD, borderRadius: 12,
  borderWidth: 1, borderColor: BORDER,
  paddingHorizontal: 16, paddingVertical: 14,
  fontSize: 16, color: TEXT,
} as const;

const LABEL_STYLE = {
  fontSize: 13, fontWeight: "600" as const,
  color: MUTED, marginBottom: 6,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EditProfileScreen() {
  const insets  = useSafeAreaInsets();
  const profile = useProfile();

  const [name, setName] = useState(profile.name);

  const dirty = name.trim() !== profile.name;

  function handleSave() {
    if (!name.trim()) return;
    updateProfile({ name: name.trim() });
    router.back();
  }

  function handleAvatarPress() {
    // STUB: image picker — wire to expo-image-picker when ready
    Alert.alert("Change photo", "Photo picker will be available in a future update.");
  }

  function handleChangeEmail() {
    // STUB: email change requires Supabase Auth re-auth flow
    Alert.alert(
      "Change email",
      "For security, email changes are handled via your account settings. This will be available soon.",
    );
  }

  function handleChangePassword() {
    // STUB: triggers Supabase Auth password reset email
    Alert.alert(
      "Reset password",
      "A password reset link will be sent to your email address. This will be wired to Supabase Auth.",
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* Top bar */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 12,
          backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
        }}>
          <AnimatedPressable scaleDown={0.9} onPress={() => router.back()} style={{ minWidth: 60 }}>
            <Text style={{ fontSize: 16, color: MUTED }}>Cancel</Text>
          </AnimatedPressable>
          <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>Edit profile</Text>
          <AnimatedPressable
            scaleDown={0.9}
            onPress={handleSave}
            disabled={!dirty}
            style={{ minWidth: 60, alignItems: "flex-end" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: dirty ? CORAL : "#C0C4CC" }}>
              Save
            </Text>
          </AnimatedPressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16, paddingTop: 32,
            paddingBottom: insets.bottom + 40, gap: 24,
          }}
        >
          {/* Avatar */}
          <View style={{ alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.8}
              style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: "#E5E7EB",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 26, fontWeight: "700", color: TEXT }}>
                {initials(name || profile.name)}
              </Text>
              <View style={{
                position: "absolute", bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: 13,
                backgroundColor: CORAL,
                alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: BG,
              }}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: MUTED }}>Tap to change photo</Text>
          </View>

          {/* Name */}
          <View>
            <Text style={LABEL_STYLE}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={INPUT_STYLE}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email — stub */}
          <View>
            <Text style={LABEL_STYLE}>Email</Text>
            <View style={{
              ...INPUT_STYLE, flexDirection: "row",
              alignItems: "center", justifyContent: "space-between",
            }}>
              <Text style={{ fontSize: 16, color: TEXT, flex: 1 }}>{profile.email}</Text>
              <TouchableOpacity onPress={handleChangeEmail} style={{ paddingLeft: 8 }}>
                <Text style={{ fontSize: 14, color: CORAL, fontWeight: "500" }}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 6, marginLeft: 2 }}>
              Email changes require identity verification.
            </Text>
          </View>

          {/* Password — stub */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, ...SHADOW,
          }}>
            <AnimatedPressable
              scaleDown={0.98}
              onPress={handleChangePassword}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, minHeight: 52, gap: 12,
              }}
            >
              <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
              <Text style={{ flex: 1, fontSize: 15, color: TEXT }}>Change password</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </AnimatedPressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
