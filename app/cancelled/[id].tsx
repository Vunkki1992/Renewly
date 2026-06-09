import { View, ScrollView } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { BrandLogo } from "@/components/BrandLogo";
import { getCancelledFeeById, savedSinceCancel } from "@/lib/store";

const BG     = "#F7F8FA";
const CARD   = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT   = "#11151C";
const MUTED  = "#6A7280";
const GREEN  = "#16A34A";
const GREEN_TINT = "#F0FDF4";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

function fmtEuro(n: number): string {
  return `€${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

function daysSince(isoDate: string): number {
  const d = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDuration(days: number): string {
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  const rem = days % 30;
  const mStr = `${months} month${months === 1 ? "" : "s"}`;
  return rem > 0 ? `${mStr} and ${rem} day${rem === 1 ? "" : "s"}` : mStr;
}

export default function CancelledDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const fee = getCancelledFeeById(id ?? "");

  if (!fee) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
          <View style={{
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 16, height: 52,
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
          </View>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: MUTED, fontSize: 15 }}>Subscription not found.</Text>
          </View>
        </View>
      </>
    );
  }

  const saved = savedSinceCancel(fee);
  const days = daysSince(fee.cancelledWhenISO);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>

        {/* Top bar */}
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
            flex: 1, textAlign: "center", marginRight: 36,
            fontSize: 17, fontWeight: "700", color: TEXT,
          }}>
            Cancelled
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 12 }}
        >
          {/* Identity */}
          <View style={{ alignItems: "center", paddingVertical: 24, gap: 10 }}>
            <BrandLogo domain={fee.domain} name={fee.name} size={64} muted />
            <Text style={{ fontSize: 24, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>
              {fee.name}
            </Text>
            <View style={{
              backgroundColor: "#F3F4F6", borderRadius: 20,
              paddingHorizontal: 12, paddingVertical: 4,
            }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: MUTED }}>
                Cancelled {fee.cancelledWhen}
              </Text>
            </View>
          </View>

          {/* Savings hero */}
          <View style={{
            backgroundColor: GREEN_TINT, borderRadius: 20,
            borderWidth: 1, borderColor: "#BBF7D0",
            padding: 24, alignItems: "center", gap: 6, ...SHADOW,
          }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: "#DCFCE7",
              alignItems: "center", justifyContent: "center",
              marginBottom: 4,
            }}>
              <Ionicons name="trending-down" size={22} color={GREEN} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: GREEN, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Saved since cancelling
            </Text>
            <Text style={{ fontSize: 40, fontWeight: "800", color: GREEN, letterSpacing: -1, fontVariant: ["tabular-nums"] }}>
              {fmtEuro(saved)}
            </Text>
            <Text style={{ fontSize: 13, color: GREEN, opacity: 0.7, textAlign: "center" }}>
              over {formatDuration(days)}
            </Text>
          </View>

          {/* Details card */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, ...SHADOW,
          }}>
            {[
              { label: "Was paying", value: fee.wasDisplay },
              { label: "Billing cycle", value: fee.cycle },
              { label: "Cancelled", value: fee.cancelledWhen },
            ].map((row, i, arr) => (
              <View key={row.label}>
                <View style={{
                  flexDirection: "row", justifyContent: "space-between",
                  alignItems: "center", paddingVertical: 14,
                }}>
                  <Text style={{ fontSize: 14, color: MUTED }}>{row.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>{row.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: BORDER }} />}
              </View>
            ))}
          </View>

          {/* Yearly savings projection */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, padding: 20, gap: 6, ...SHADOW,
          }}>
            <Text style={{ fontSize: 13, color: MUTED }}>Yearly saving</Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5, fontVariant: ["tabular-nums"] }}>
              {fmtEuro(fee.cycle === "Monthly" ? fee.amountRaw * 12 : fee.amountRaw)}
            </Text>
            <Text style={{ fontSize: 13, color: MUTED }}>
              {fee.cycle === "Monthly"
                ? `${fmtEuro(fee.amountRaw)} × 12 months`
                : "Annual subscription"}
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
