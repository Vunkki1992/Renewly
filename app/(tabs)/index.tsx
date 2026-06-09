import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { BrandLogo } from "@/components/BrandLogo";
import { useFees, useCancelledFees, annualCost, savedSinceCancel } from "@/lib/store";
import { getPlanIntent, setPlanIntent } from "@/lib/onboarding-state";

const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const SHADOW     = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

const CATEGORY_COLORS: Record<string, string> = {
  "Entertainment":           "#F97316",
  "Software":                "#38BDF8",
  "Fitness & Health":        "#EF4444",
  "Utilities":               "#8B5CF6",
  "Insurance":               "#10B981",
  "News & Media":            "#F59E0B",
  "Shopping & Memberships":  "#EC4899",
  "Food & Drink":            "#84CC16",
  "Finance":                 "#06B6D4",
  "Other":                   "#D1D5DB",
};

export default function OverviewScreen() {
  const insets    = useSafeAreaInsets();
  const fees      = useFees();
  const cancelled = useCancelledFees();

  useEffect(() => {
    const intent = getPlanIntent();
    if (intent !== "free") {
      setPlanIntent("free");
      router.push("/paywall");
    }
  }, []);

  const sorted    = [...fees].sort((a, b) => a.daysUntil - b.daysUntil);
  const renewing  = sorted.slice(0, 4);
  const totalYear = fees.reduce((sum, f) => sum + annualCost(f), 0);
  const totalMo   = totalYear / 12;
  const totalSaved = cancelled.reduce((sum, f) => sum + savedSinceCancel(f), 0);

  const categoryTotals = fees.reduce<Record<string, number>>((acc, f) => {
    const key = f.category || "Other";
    acc[key] = (acc[key] ?? 0) + annualCost(f);
    return acc;
  }, {});
  const segments = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([label, total]) => ({ label, color: CATEGORY_COLORS[label] ?? "#D1D5DB", flex: total }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 8, paddingBottom: 120, paddingHorizontal: 16, gap: 12,
          }}
        >
          {/* Top bar */}
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", paddingVertical: 8,
          }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>
              SubPulse
            </Text>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "#E5E7EB",
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT }}>AK</Text>
            </View>
          </View>

          {/* Hero card */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, padding: 20, gap: 4, ...SHADOW,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "500", color: MUTED }}>Your annual spending</Text>
            <Text style={{
              fontSize: 48, fontWeight: "700", color: TEXT,
              letterSpacing: -2, fontVariant: ["tabular-nums"], lineHeight: 54,
            }}>
              €{totalYear.toFixed(0)}
            </Text>
            <Text style={{ fontSize: 15, color: MUTED, fontVariant: ["tabular-nums"] }}>
              ≈ €{totalMo.toFixed(0)} / month
            </Text>

            {/* Segmented bar */}
            <View style={{ marginTop: 14, gap: 8 }}>
              <View style={{ flexDirection: "row", borderRadius: 4, overflow: "hidden", height: 8 }}>
                {segments.length === 0 ? (
                  <View style={{ flex: 1, backgroundColor: "#E5E7EB" }} />
                ) : segments.map((s, i) => (
                  <View
                    key={s.label}
                    style={{ flex: s.flex, backgroundColor: s.color, marginLeft: i === 0 ? 0 : 2 }}
                  />
                ))}
              </View>
              {segments.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {segments.map((s) => (
                    <View key={s.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: s.color }} />
                      <Text style={{ fontSize: 11, color: MUTED }}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { value: String(fees.length),               label: "active"    },
              { value: String(cancelled.length),          label: "cancelled" },
              { value: `€${totalSaved.toFixed(0)}`,       label: "saved"     },
            ].map((stat) => (
              <View key={stat.label} style={{
                flex: 1, backgroundColor: CARD, borderRadius: 16,
                borderWidth: 1, borderColor: BORDER,
                paddingVertical: 14, alignItems: "center", gap: 2, ...SHADOW,
              }}>
                <Text style={{
                  fontSize: 22, fontWeight: "700", color: TEXT,
                  letterSpacing: -0.5, fontVariant: ["tabular-nums"],
                }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 12, color: MUTED }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Renewing soon */}
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginTop: 16,
          }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>Renewing soon</Text>
            <Text style={{ fontSize: 14, color: MUTED, fontVariant: ["tabular-nums"] }}>
              {renewing.length}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {renewing.length === 0 && (
              <View style={{
                backgroundColor: CARD, borderRadius: 16,
                borderWidth: 1, borderColor: BORDER,
                paddingVertical: 28, alignItems: "center", gap: 4, ...SHADOW,
              }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: MUTED }}>No fees yet</Text>
                <Text style={{ fontSize: 13, color: MUTED }}>Tap + Add fee to get started</Text>
              </View>
            )}
            {renewing.map((sub) => (
              <AnimatedPressable
                key={sub.id}
                onPress={() => router.push(`/fee/${sub.id}`)}
                style={{
                  backgroundColor: CARD, borderRadius: 16,
                  borderWidth: 1, borderColor: BORDER,
                  paddingVertical: 12, paddingHorizontal: 16,
                  flexDirection: "row", alignItems: "center", gap: 12, ...SHADOW,
                }}
              >
                <BrandLogo domain={sub.domain} name={sub.name} size={40} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>{sub.name}</Text>
                  <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>
                    {sub.amountDisplay}/{sub.cycle === "Monthly" ? "mo" : "yr"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{
                    backgroundColor: CORAL_TINT, borderRadius: 20,
                    paddingHorizontal: 10, paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: CORAL }}>
                      in {sub.daysUntil} days
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, color: MUTED }}>›</Text>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        </ScrollView>

        {/* FAB */}
        <AnimatedPressable
          scaleDown={0.94}
          onPress={() => router.push("/add-fee")}
          style={{
            position: "absolute", bottom: insets.bottom + 16, right: 20,
            backgroundColor: CORAL, borderRadius: 28,
            paddingHorizontal: 20, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(255,107,92,0.4)",
          }}
        >
          <Text style={{ fontSize: 18, color: "#fff", lineHeight: 20 }}>+</Text>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Add fee</Text>
        </AnimatedPressable>
      </View>
    </>
  );
}
