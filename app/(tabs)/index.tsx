import { ScrollView, View, Text, Pressable } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CORAL = "#FF6B5C";
const CORAL_TINT = "#FFF1EF";
const BG = "#F7F8FA";
const CARD = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT = "#11151C";
const MUTED = "#6A7280";

const SHADOW = {
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const subscriptions = [
  { id: "1", name: "Adobe Creative Cloud", price: "€79.99/yr", days: 12 },
  { id: "2", name: "Spotify",              price: "€11.99/mo", days: 5  },
  { id: "3", name: "Elixia Gym",           price: "€399/yr",   days: 21 },
  { id: "4", name: "Viaplay",              price: "€11.99/mo", days: 3  },
];

const segments = [
  { label: "Entertainment", color: TEXT,    flex: 3 },
  { label: "Software",      color: "#9CA3AF", flex: 2.5 },
  { label: "Fitness",       color: CORAL,   flex: 2 },
  { label: "Other",         color: "#D1D5DB", flex: 1.5 },
];

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 8,
            paddingBottom: 120,
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          {/* Top bar */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 8,
          }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>
              Renewly
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
            backgroundColor: CARD,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: BORDER,
            padding: 20,
            gap: 4,
            ...SHADOW,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "500", color: MUTED }}>per year</Text>
            <Text style={{
              fontSize: 48,
              fontWeight: "700",
              color: TEXT,
              letterSpacing: -2,
              fontVariant: ["tabular-nums"],
              lineHeight: 54,
            }}>
              €1,284
            </Text>
            <Text style={{ fontSize: 15, color: MUTED, fontVariant: ["tabular-nums"] }}>
              ≈ €107 / month
            </Text>

            {/* Segmented bar */}
            <View style={{ marginTop: 14, gap: 8 }}>
              <View style={{ flexDirection: "row", borderRadius: 4, overflow: "hidden", height: 8 }}>
                {segments.map((s, i) => (
                  <View
                    key={s.label}
                    style={{
                      flex: s.flex,
                      backgroundColor: s.color,
                      marginLeft: i === 0 ? 0 : 2,
                    }}
                  />
                ))}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {segments.map((s) => (
                  <View key={s.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: s.color }} />
                    <Text style={{ fontSize: 11, color: MUTED }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { value: "9",    label: "active"    },
              { value: "2",    label: "cancelled" },
              { value: "€240", label: "saved"     },
            ].map((stat) => (
              <View key={stat.label} style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: BORDER,
                paddingVertical: 14,
                alignItems: "center",
                gap: 2,
                ...SHADOW,
              }}>
                <Text style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: TEXT,
                  letterSpacing: -0.5,
                  fontVariant: ["tabular-nums"],
                }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 12, color: MUTED }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Renewing soon */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>Renewing soon</Text>
            <Text style={{ fontSize: 14, color: MUTED, fontVariant: ["tabular-nums"] }}>4</Text>
          </View>

          <View style={{ gap: 8 }}>
            {subscriptions.map((sub) => (
              <Pressable
                key={sub.id}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#FAFAFA" : CARD,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: BORDER,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...SHADOW,
                })}
              >
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>{sub.name}</Text>
                  <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>{sub.price}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{
                    backgroundColor: CORAL_TINT,
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: CORAL }}>
                      in {sub.days} days
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, color: MUTED }}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* FAB */}
        <Pressable
          style={({ pressed }) => ({
            position: "absolute",
            bottom: insets.bottom + 72,
            right: 20,
            backgroundColor: pressed ? "#E85A4C" : CORAL,
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(255,107,92,0.4)",
          })}
        >
          <Text style={{ fontSize: 18, color: "#fff", lineHeight: 20 }}>+</Text>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Add fee</Text>
        </Pressable>
      </View>
    </>
  );
}
