import { useState, useRef, useCallback } from "react";
import { ScrollView, View, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { BrandLogo } from "@/components/BrandLogo";
import { Ionicons } from "@expo/vector-icons";
import { useFees, useCancelledFees } from "@/lib/store";

const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW     = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

const CARD_STYLE = {
  backgroundColor: CARD,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: BORDER,
  paddingVertical: 14,
  paddingHorizontal: 16,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 12,
  ...SHADOW,
};

function EmptyState({ type }: { type: "active" | "cancelled" }) {
  const isActive = type === "active";
  return (
    <View style={{
      alignItems: "center", justifyContent: "center",
      paddingVertical: 64, gap: 12, paddingHorizontal: 32,
    }}>
      <View style={{
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: "#F3F4F6",
        alignItems: "center", justifyContent: "center", marginBottom: 4,
      }}>
        <Ionicons
          name={isActive ? "receipt-outline" : "checkmark-circle-outline"}
          size={26} color="#9CA3AF"
        />
      </View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT, textAlign: "center" }}>
        {isActive ? "No subscriptions yet" : "Nothing cancelled yet"}
      </Text>
      <Text style={{ fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 20 }}>
        {isActive
          ? "Add your first fee and SubPulse will track the renewals."
          : "Fees you cancel will show up here."}
      </Text>
      {isActive && (
        <AnimatedPressable
          onPress={() => router.push("/add-fee")}
          style={{
            marginTop: 8, backgroundColor: CORAL,
            borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Add subscription</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

export default function SubscriptionsScreen() {
  const insets          = useSafeAreaInsets();
  const { width }       = useWindowDimensions();
  const [tab, setTab]   = useState<"active" | "cancelled">("active");
  const active          = useFees();
  const cancelled       = useCancelledFees();
  const slideX          = useRef(new Animated.Value(0)).current;

  const switchTab = useCallback((next: "active" | "cancelled") => {
    if (next === tab) return;
    setTab(next);
    Animated.spring(slideX, {
      toValue: next === "active" ? 0 : -width,
      useNativeDriver: true,
      damping: 28,
      stiffness: 260,
      mass: 0.8,
    }).start();
  }, [tab, slideX, width]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top, overflow: "hidden" }}>

        {/* Top bar */}
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>
            Subscriptions
          </Text>
          <AnimatedPressable
            scaleDown={0.88}
            onPress={() => router.push("/add-fee")}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: CORAL,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </AnimatedPressable>
        </View>

        {/* Segmented toggle */}
        <View style={{
          flexDirection: "row", marginHorizontal: 16, marginBottom: 12,
          backgroundColor: "#F0F2F5", borderRadius: 12, padding: 3, gap: 2,
        }}>
          {(["active", "cancelled"] as const).map((t) => {
            const selected = tab === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => switchTab(t)}
                activeOpacity={0.8}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                  backgroundColor: selected ? CORAL_TINT : "transparent",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: selected ? CORAL : MUTED }}>
                  {t === "active" ? "Active" : "Cancelled"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sliding panels */}
        <Animated.View style={{
          flex: 1,
          flexDirection: "row",
          width: width * 2,
          transform: [{ translateX: slideX }],
        }}>
          {/* Active panel */}
          <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 8,
            }}
          >
            {active.length === 0 ? (
              <EmptyState type="active" />
            ) : (
              <>
                {active.map((sub) => (
                  <AnimatedPressable
                    key={sub.id}
                    style={CARD_STYLE}
                    onPress={() => router.push(`/fee/${sub.id}`)}
                  >
                    <BrandLogo domain={sub.domain} name={sub.name} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>{sub.name}</Text>
                      <Text style={{ fontSize: 12, color: MUTED }}>
                        renews in {sub.daysUntil} days
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT, fontVariant: ["tabular-nums"] }}>
                        {sub.amountDisplay}
                      </Text>
                      <Text style={{ fontSize: 12, color: MUTED }}>
                        / {sub.cycle === "Monthly" ? "mo" : "yr"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </AnimatedPressable>
                ))}
                <Text style={{
                  fontSize: 13, color: MUTED, textAlign: "center",
                  marginTop: 8, fontVariant: ["tabular-nums"],
                }}>
                  {active.length} active
                </Text>
              </>
            )}
          </ScrollView>

          {/* Cancelled panel */}
          <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 8,
            }}
          >
            {cancelled.length === 0 ? (
              <EmptyState type="cancelled" />
            ) : (
              <>
                {cancelled.map((sub) => (
                  <AnimatedPressable
                    key={sub.id}
                    style={CARD_STYLE}
                    onPress={() => router.push(`/cancelled/${sub.id}`)}
                  >
                    <BrandLogo domain={sub.domain} name={sub.name} muted />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#6A7280" }}>
                        {sub.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        cancelled {sub.cancelledWhen} · was {sub.wasDisplay}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: "#F3F4F6", borderRadius: 20,
                      paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#9CA3AF" }}>
                        Cancelled
                      </Text>
                    </View>
                  </AnimatedPressable>
                ))}
                <Text style={{ fontSize: 13, color: MUTED, textAlign: "center", marginTop: 8 }}>
                  {cancelled.length} cancelled
                </Text>
              </>
            )}
          </ScrollView>
        </Animated.View>

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
