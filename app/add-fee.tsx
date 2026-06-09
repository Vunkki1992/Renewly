import { useEffect, useRef, useState } from "react";
import { View, TextInput, ScrollView,
  Animated, Dimensions, Alert } from "react-native";
import { Text } from "@/components/Text";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { BrandLogo } from "@/components/BrandLogo";
import { CategoryPicker } from "@/components/CategoryPicker";
import { getDomain } from "@/lib/brands";

const BG = "#F7F8FA";
const CARD = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT = "#11151C";
const MUTED = "#6A7280";
const CORAL = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const CORAL_DASHED = "#FFD9D3";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

type ScreenState = "empty" | "processing" | "review";
type Cycle = "Monthly" | "Yearly";

const SCREEN_W = Dimensions.get("window").width;

function TopBar({ title }: { title: string }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, height: 52, gap: 8,
    }}>
      <AnimatedPressable
        scaleDown={0.88}
        onPress={() => router.back()}
        style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: "#F3F4F6",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Ionicons name="chevron-back" size={20} color={TEXT} />
      </AnimatedPressable>
      <Text style={{
        flex: 1, textAlign: "center",
        fontSize: 17, fontWeight: "700", color: TEXT,
        marginRight: 36,
      }}>
        {title}
      </Text>
    </View>
  );
}

function EmptyState({ onUpload, onPhoto, onManual }: {
  onUpload: () => void;
  onPhoto: () => void;
  onManual: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, gap: 12 }}>
      {/* Drop zone */}
      <View style={{
        borderWidth: 2, borderColor: CORAL_DASHED, borderStyle: "dashed",
        borderRadius: 20, backgroundColor: CORAL_TINT,
        paddingVertical: 48, alignItems: "center", gap: 10,
      }}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: "#FFE8E5",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="cloud-upload-outline" size={28} color={CORAL} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: TEXT }}>
          Upload an invoice or screenshot
        </Text>
        <Text style={{ fontSize: 13, color: MUTED, textAlign: "center", paddingHorizontal: 24 }}>
          PDF or image — SubPulse fills in the details for you.
        </Text>
      </View>

      {/* Buttons */}
      <AnimatedPressable
        scaleDown={0.97}
        onPress={onUpload}
        style={{
          backgroundColor: CORAL, borderRadius: 14,
          paddingVertical: 15, alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Upload file</Text>
      </AnimatedPressable>

      <AnimatedPressable
        scaleDown={0.97}
        onPress={onPhoto}
        style={{
          backgroundColor: CARD, borderRadius: 14,
          borderWidth: 1, borderColor: BORDER,
          paddingVertical: 15, alignItems: "center",
          ...SHADOW,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>Take photo</Text>
      </AnimatedPressable>

      <AnimatedPressable scaleDown={0.95} onPress={onManual} style={{ alignItems: "center", paddingVertical: 8 }}>
        <Text style={{ fontSize: 14, color: MUTED }}>Enter manually instead</Text>
      </AnimatedPressable>
    </View>
  );
}

function ProcessingState() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: SCREEN_W - 32 - 40,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={{
      margin: 16, padding: 24, gap: 16,
      backgroundColor: CARD, borderRadius: 16,
      borderWidth: 1, borderColor: BORDER, alignItems: "center",
      ...SHADOW,
    }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>Reading your invoice…</Text>
      <View style={{ width: "100%", height: 3, backgroundColor: "#F0F2F5", borderRadius: 2, overflow: "hidden" }}>
        <Animated.View style={{ height: 3, width: progress, backgroundColor: CORAL, borderRadius: 2 }} />
      </View>
      <Text style={{ fontSize: 13, color: MUTED }}>This only takes a moment.</Text>
    </View>
  );
}

function ReviewState({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) {
  const [name, setName] = useState("Adobe Creative Cloud");
  const [amount, setAmount] = useState("79.99");
  const [cycle, setCycle] = useState<Cycle>("Yearly");
  const [renewal, setRenewal] = useState("15 Jan 2027");
  const [category, setCategory] = useState<string | null>("Software");
  const AI_SUGGESTED = "Software";

  const inputStyle = {
    backgroundColor: "#F9FAFB", borderRadius: 10,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: TEXT,
  };

  const labelStyle = { fontSize: 13, fontWeight: "600" as const, color: MUTED, marginBottom: 6 };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 20, paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }}>Review details</Text>
          <Text style={{ fontSize: 14, color: MUTED }}>Check these before saving.</Text>
        </View>
        <View style={{
          backgroundColor: CORAL_TINT, borderRadius: 20,
          paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: CORAL }}>AI-filled</Text>
        </View>
      </View>

      {/* Service preview */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: CORAL_TINT, borderRadius: 14, padding: 14,
      }}>
        <BrandLogo domain={getDomain(name) ?? undefined} name={name} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>{name}</Text>
          <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>
            €{amount} / {cycle.toLowerCase()}
          </Text>
        </View>
      </View>

      {/* File chip */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: "#F3F4F6", borderRadius: 10,
          paddingHorizontal: 12, paddingVertical: 8, flex: 1,
        }}>
          <Ionicons name="document-outline" size={16} color={MUTED} />
          <Text style={{ fontSize: 13, color: TEXT, flex: 1 }} numberOfLines={1}>
            adobe-invoice.pdf
          </Text>
        </View>
        <AnimatedPressable scaleDown={0.9}>
          <Text style={{ fontSize: 14, color: CORAL, fontWeight: "500" }}>Replace</Text>
        </AnimatedPressable>
      </View>

      {/* Form */}
      <View style={{ gap: 4 }}>
        <Text style={labelStyle}>Service name</Text>
        <TextInput value={name} onChangeText={setName} style={inputStyle} />
      </View>

      <View style={{ gap: 4 }}>
        <Text style={labelStyle}>Amount</Text>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#F9FAFB", borderRadius: 10,
          borderWidth: 1, borderColor: BORDER,
          paddingHorizontal: 14,
        }}>
          <Text style={{ fontSize: 16, color: MUTED, marginRight: 4 }}>€</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[inputStyle, { flex: 1, backgroundColor: "transparent", borderWidth: 0, paddingHorizontal: 0 }]}
          />
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={labelStyle}>Billing cycle</Text>
        <View style={{
          flexDirection: "row", backgroundColor: "#F0F2F5",
          borderRadius: 12, padding: 3, gap: 2,
        }}>
          {(["Monthly", "Yearly"] as Cycle[]).map((c) => {
            const sel = cycle === c;
            return (
              <AnimatedPressable
                key={c}
                scaleDown={0.97}
                onPress={() => setCycle(c)}
                style={{
                  flex: 1, paddingVertical: 9, borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: sel ? CARD : "transparent",
                  ...(sel ? SHADOW : {}),
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: sel ? TEXT : MUTED }}>{c}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={labelStyle}>Next renewal</Text>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: CORAL, marginBottom: 6 }} />
        </View>
        <TextInput value={renewal} onChangeText={setRenewal} style={inputStyle} />
        <Text style={{ fontSize: 12, color: CORAL, marginTop: 2 }}>Double-check this one.</Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={labelStyle}>Category</Text>
        <CategoryPicker
          value={category}
          onChange={setCategory}
          suggested={AI_SUGGESTED}
        />
      </View>

      {/* Actions */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <AnimatedPressable scaleDown={0.95} onPress={onDiscard} style={{ alignItems: "center", paddingVertical: 4 }}>
          <Text style={{ fontSize: 14, color: MUTED }}>Discard</Text>
        </AnimatedPressable>
        <AnimatedPressable
          scaleDown={0.97}
          onPress={onSave}
          style={{
            backgroundColor: CORAL, borderRadius: 14,
            paddingVertical: 15, alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Save fee</Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

export default function AddFeeScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScreenState>("empty");

  async function startUpload() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setState("processing");
    setTimeout(() => setState("review"), 1500);
  }

  async function startPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera access needed", "Allow camera access in Settings to scan invoices.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;
    setState("processing");
    setTimeout(() => setState("review"), 1500);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
        <TopBar title="Add fee" />

        <View style={{ flex: 1, paddingTop: 8 }}>
          {state === "empty" && (
            <EmptyState
              onUpload={startUpload}
              onPhoto={startPhoto}
              onManual={() => setState("review")}
            />
          )}
          {state === "processing" && <ProcessingState />}
          {state === "review" && (
            <ReviewState
              onSave={() => router.back()}
              onDiscard={() => router.back()}
            />
          )}
        </View>
      </View>
    </>
  );
}
