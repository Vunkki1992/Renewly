import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { setPlanIntent, type PlanIntent } from "@/lib/onboarding-state";

const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW     = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

type Plan = {
  id: PlanIntent;
  label: string;
  price: string;
  period?: string;
  features: string[];
  badge?: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    label: "Free",
    price: "€0",
    features: ["Up to 5 fees", "Renewal reminders"],
  },
  {
    id: "monthly",
    label: "Pro Monthly",
    price: "€2.99",
    period: "/ mo",
    features: ["Unlimited fees", "Spending trends & charts", "Multi-currency totals"],
  },
  {
    id: "lifetime",
    label: "Pro Lifetime",
    price: "€29.99",
    features: ["Unlimited fees", "Spending trends & charts", "Multi-currency totals"],
    badge: "Best value",
  },
];

export default function PlansScreen() {
  const insets   = useSafeAreaInsets();
  const [selected, setSelected] = useState<PlanIntent>("free");

  function handleContinue() {
    setPlanIntent(selected);
    // TODO: setItem seam — replace with Supabase profile flag when backend is wired
    AsyncStorage.setItem("@subpulse/hasOnboarded", "true");
    router.push("/(auth)/login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: insets.bottom + 32,
          gap: 24,
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

        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{
            fontSize: 28, fontWeight: "700", color: TEXT, letterSpacing: -0.5,
          }}>
            Choose how to start
          </Text>
          <Text style={{ fontSize: 15, color: MUTED }}>
            You can always upgrade later.
          </Text>
        </View>

        {/* Plan cards */}
        <View style={{ gap: 10 }}>
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <AnimatedPressable
                key={plan.id}
                scaleDown={0.98}
                onPress={() => setSelected(plan.id)}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? CORAL : BORDER,
                  padding: 16,
                  gap: 12,
                  ...(active
                    ? { boxShadow: "0 2px 8px rgba(255,107,92,0.14)" }
                    : SHADOW),
                }}
              >
                {/* Row: radio + label + badge + price */}
                <View style={{
                  flexDirection: "row", alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={{
                      width: 20, height: 20, borderRadius: 10,
                      borderWidth: 2,
                      borderColor: active ? CORAL : "#D1D5DB",
                      backgroundColor: active ? CORAL : "transparent",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {active && (
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>{plan.label}</Text>
                    {plan.badge && (
                      <View style={{
                        backgroundColor: CORAL_TINT, borderRadius: 6,
                        paddingHorizontal: 7, paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: CORAL }}>{plan.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                    <Text style={{
                      fontSize: 16, fontWeight: "700",
                      color: active ? CORAL : TEXT,
                      fontVariant: ["tabular-nums"],
                    }}>
                      {plan.price}
                    </Text>
                    {plan.period && (
                      <Text style={{ fontSize: 12, color: MUTED }}>{plan.period}</Text>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View style={{ gap: 5, paddingLeft: 30 }}>
                  {plan.features.map((f) => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={active ? CORAL : MUTED}
                      />
                      <Text style={{ fontSize: 13, color: MUTED }}>{f}</Text>
                    </View>
                  ))}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Primary CTA */}
        <AnimatedPressable
          scaleDown={0.97}
          onPress={handleContinue}
          style={{
            backgroundColor: CORAL, borderRadius: 14,
            paddingVertical: 16, alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
            {selected === "free" ? "Start free" : "Continue"}
          </Text>
        </AnimatedPressable>

        {selected !== "free" && (
          <Text style={{ fontSize: 12, color: MUTED, textAlign: "center", lineHeight: 17 }}>
            You will sign in before completing your purchase.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
