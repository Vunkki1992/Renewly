import { View, Alert, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";

const BG     = "#F7F8FA";
const CARD   = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT   = "#11151C";
const MUTED  = "#6A7280";
const CORAL  = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

const PRO_FEATURES = [
  {
    icon: "scan-outline" as const,
    title: "AI invoice scan",
    desc: "Snap a receipt and SubPulse logs the subscription automatically.",
  },
  {
    icon: "infinite-outline" as const,
    title: "Unlimited fees",
    desc: "Track as many subscriptions as you have, with no cap.",
  },
  {
    icon: "bar-chart-outline" as const,
    title: "Advanced insights",
    desc: "Deeper spend analysis: trends, category breakdowns, and projections.",
  },
];

function purchaseStub(label: string) {
  // STUB: wire to expo-in-app-purchases / RevenueCat when ready.
  // Do NOT process real payments here.
  Alert.alert(
    "Coming soon",
    `In-app purchases are not yet available. ${label} will be available once payment is configured.`,
  );
}

function restoreStub() {
  // STUB: wire to restore purchases via RevenueCat / StoreKit when ready.
  Alert.alert("Restore purchases", "Restore functionality will be available once payments are configured.");
}

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* Close button */}
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, alignItems: "flex-end" }}>
          <AnimatedPressable
            scaleDown={0.88}
            onPress={() => router.back()}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: "#E5E7EB",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={16} color={MUTED} />
          </AnimatedPressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24, paddingTop: 24,
            paddingBottom: insets.bottom + 32, gap: 32,
          }}
        >
          {/* Header */}
          <View style={{ alignItems: "center", gap: 12 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: CORAL_TINT,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="star" size={30} color={CORAL} />
            </View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: TEXT, letterSpacing: -0.5, textAlign: "center" }}>
              SubPulse Pro
            </Text>
            <Text style={{ fontSize: 16, color: MUTED, textAlign: "center", lineHeight: 22 }}>
              Everything you need to stay on top of your subscriptions.
            </Text>
          </View>

          {/* Feature list */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, ...SHADOW,
            overflow: "hidden",
          }}>
            {PRO_FEATURES.map((f, i) => (
              <View key={f.title}>
                <View style={{
                  flexDirection: "row", alignItems: "flex-start",
                  padding: 18, gap: 14,
                }}>
                  <View style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: CORAL_TINT,
                    alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}>
                    <Ionicons name={f.icon} size={18} color={CORAL} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>{f.title}</Text>
                    <Text style={{ fontSize: 13, color: MUTED, lineHeight: 18 }}>{f.desc}</Text>
                  </View>
                </View>
                {i < PRO_FEATURES.length - 1 && (
                  <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 70 }} />
                )}
              </View>
            ))}
          </View>

          {/* Purchase options */}
          <View style={{ gap: 12 }}>
            {/* Monthly */}
            <AnimatedPressable
              scaleDown={0.97}
              onPress={() => purchaseStub("Monthly Pro")}
              style={{
                backgroundColor: CARD, borderRadius: 16,
                borderWidth: 1, borderColor: BORDER,
                paddingVertical: 18, paddingHorizontal: 20,
                flexDirection: "row", alignItems: "center", ...SHADOW,
              }}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>Monthly</Text>
                <Text style={{ fontSize: 13, color: MUTED }}>Billed monthly, cancel anytime</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT, fontVariant: ["tabular-nums"] }}>
                €2.99
                <Text style={{ fontSize: 13, fontWeight: "400", color: MUTED }}> / mo</Text>
              </Text>
            </AnimatedPressable>

            {/* Lifetime */}
            <AnimatedPressable
              scaleDown={0.97}
              onPress={() => purchaseStub("Lifetime Pro")}
              style={{
                backgroundColor: CORAL, borderRadius: 16,
                paddingVertical: 18, paddingHorizontal: 20,
                flexDirection: "row", alignItems: "center",
              }}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Lifetime</Text>
                  <View style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>Best value</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Pay once, own forever</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", fontVariant: ["tabular-nums"] }}>
                €29.99
              </Text>
            </AnimatedPressable>
          </View>

          {/* Restore + disclaimer */}
          <View style={{ alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={restoreStub}>
              <Text style={{ fontSize: 14, color: MUTED, textDecorationLine: "underline" }}>
                Restore purchases
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: "#C0C4CC", textAlign: "center", lineHeight: 16 }}>
              Prices are in EUR and may vary by region. Subscriptions auto-renew unless cancelled.
              Payment is charged to your App Store account at confirmation of purchase.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
