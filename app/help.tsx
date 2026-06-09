import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";

const BG     = "#F7F8FA";
const CARD   = "#FFFFFF";
const BORDER = "#ECEEF1";
const TEXT   = "#11151C";
const MUTED  = "#6A7280";
const CORAL  = "#FF6B5C";
const SHADOW = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I add a subscription?",
    a: "Tap the + button on the Home or Fees tab. Enter the service name, amount, billing cycle, and renewal date. SubPulse will track it automatically.",
  },
  {
    q: "What happens when I cancel a subscription?",
    a: "Cancelled fees move to the Cancelled section. SubPulse uses them to calculate how much you have saved since cancelling.",
  },
  {
    q: "How are insights calculated?",
    a: "Monthly totals are based on your active fees. Yearly fees are divided by 12 for monthly comparisons. Savings reflect fees you cancelled this calendar year.",
  },
  {
    q: "What is SubPulse Pro?",
    a: "Pro unlocks unlimited fees, AI invoice scanning, and advanced insights. Free accounts can track up to 5 fees.",
  },
  {
    q: "Is my data stored securely?",
    a: "Your data is stored in Supabase and protected by row-level security. We do not sell or share your personal information.",
  },
];

function FaqItem({ item, last }: { item: { q: string; a: string }; last?: boolean }) {
  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT, lineHeight: 20 }}>{item.q}</Text>
        <Text style={{ fontSize: 14, color: MUTED, lineHeight: 20 }}>{item.a}</Text>
      </View>
      {!last && <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 16 }} />}
    </View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

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
            Help
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16, paddingTop: 8,
            paddingBottom: insets.bottom + 40, gap: 20,
          }}
        >
          {/* FAQ */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER,
            overflow: "hidden", ...SHADOW,
          }}>
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} last={i === FAQS.length - 1} />
            ))}
          </View>

          {/* Contact */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER,
            overflow: "hidden", ...SHADOW,
          }}>
            <AnimatedPressable
              scaleDown={0.98}
              onPress={() => Linking.openURL("mailto:support@subpulse.app")}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, minHeight: 52, gap: 12,
              }}
            >
              <Ionicons name="mail-outline" size={18} color={MUTED} />
              <Text style={{ flex: 1, fontSize: 15, color: TEXT }}>Email support</Text>
              <Text style={{ fontSize: 13, color: MUTED }}>support@subpulse.app</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </AnimatedPressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
