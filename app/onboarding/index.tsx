import { useRef, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useWindowDimensions } from "react-native";
import { Text } from "@/components/Text";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";

const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";

// ── Visuals ───────────────────────────────────────────────────────────────────

function CostVisual() {
  const cards = [
    { letter: "S", label: "Streaming plan", amount: "€12.99/mo", color: "#F97316", bg: "#FFF3E8" },
    { letter: "C", label: "Cloud storage",  amount: "€2.99/mo",  color: "#38BDF8", bg: "#E8F4FF" },
    { letter: "F", label: "Fitness app",    amount: "€33.25/mo", color: "#EF4444", bg: "#FFE8E8" },
    { letter: "N", label: "News & media",   amount: "€9.99/mo",  color: "#8B5CF6", bg: "#F3E8FF" },
  ];
  return (
    <View style={{ gap: 16 }}>
      <View style={{ alignItems: "center", gap: 2 }}>
        <Text style={{
          fontSize: 52, fontWeight: "800", color: TEXT,
          letterSpacing: -2, lineHeight: 56, fontVariant: ["tabular-nums"],
        }}>
          €1,284
        </Text>
        <Text style={{ fontSize: 15, color: MUTED }}>per year</Text>
      </View>
      <View style={{ gap: 8 }}>
        {cards.map((c) => (
          <View key={c.letter} style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: CARD, borderRadius: 12,
            borderWidth: 1, borderColor: BORDER,
            paddingVertical: 10, paddingHorizontal: 14, gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <View style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: c.bg, alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: c.color }}>{c.letter}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: TEXT }}>{c.label}</Text>
            <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>{c.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ListVisual() {
  const fees = [
    { letter: "S", label: "Streaming plan", renewal: "Jun 12", badge: "3 days",  color: "#F97316", bg: "#FFF3E8" },
    { letter: "M", label: "Music service",  renewal: "Jun 18", badge: "9 days",  color: "#38BDF8", bg: "#E8F4FF" },
    { letter: "C", label: "Cloud storage",  renewal: "Jul 2",  badge: "23 days", color: "#8B5CF6", bg: "#F3E8FF" },
  ];
  return (
    <View style={{ gap: 8 }}>
      {fees.map((f) => (
        <View key={f.letter} style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: CARD, borderRadius: 14,
          borderWidth: 1, borderColor: BORDER,
          paddingVertical: 12, paddingHorizontal: 14, gap: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: f.bg, alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: f.color }}>{f.letter}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>{f.label}</Text>
            <Text style={{ fontSize: 12, color: MUTED }}>Renews {f.renewal}</Text>
          </View>
          <View style={{
            backgroundColor: CORAL_TINT, borderRadius: 20,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: CORAL }}>{f.badge}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function AlertVisual() {
  return (
    <View style={{ gap: 10 }}>
      <View style={{
        backgroundColor: CARD, borderRadius: 16,
        borderWidth: 1, borderColor: BORDER,
        padding: 16, gap: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: CORAL_TINT,
            alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="notifications" size={18} color={CORAL} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT }}>SubPulse</Text>
            <Text style={{ fontSize: 12, color: MUTED }}>now</Text>
          </View>
        </View>
        <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>
          Streaming plan renews in 3 days
        </Text>
        <Text style={{ fontSize: 13, color: MUTED, lineHeight: 18 }}>
          €12.99 will be charged on Jun 12. Tap to review.
        </Text>
      </View>

      <View style={{
        backgroundColor: CARD, borderRadius: 14,
        borderWidth: 1, borderColor: BORDER,
        paddingVertical: 12, paddingHorizontal: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
        opacity: 0.45,
      }}>
        <View style={{
          width: 30, height: 30, borderRadius: 8,
          backgroundColor: "#E8F4FF", alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="notifications-outline" size={14} color="#38BDF8" />
        </View>
        <Text style={{ fontSize: 13, color: TEXT }}>Music service renews in 9 days</Text>
      </View>
    </View>
  );
}

// ── Slide data ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: "cost",
    headline: "You're probably paying for\nthings you forgot about",
    subline: "The average person underestimates their subscriptions by more than half.",
    Visual: CostVisual,
  },
  {
    id: "list",
    headline: "All your fees in one place",
    subline: "No bank connection. No account access. You stay in control.",
    Visual: ListVisual,
  },
  {
    id: "alert",
    headline: "Never get blindsided\nby a charge",
    subline: "Reminders before you're charged, on your schedule.",
    Visual: AlertVisual,
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OnboardingSlides() {
  const { width }  = useWindowDimensions();
  const insets     = useSafeAreaInsets();
  const scrollRef  = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  function onMomentumScrollEnd(e: { nativeEvent: { contentOffset: { x: number } } }) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function goNext() {
    if (page < SLIDES.length - 1) {
      const next = page + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setPage(next);
    } else {
      router.push("/onboarding/plans");
    }
  }

  function skipToPlans() {
    router.push("/onboarding/plans");
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingHorizontal: 24, height: 52,
      }}>
        {page > 0 ? (
          <Pressable
            onPress={() => {
              const prev = page - 1;
              scrollRef.current?.scrollTo({ x: prev * width, animated: true });
              setPage(prev);
            }}
            hitSlop={8}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "#F0F2F5",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={20} color={TEXT} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>SubPulse</Text>
        {page < SLIDES.length - 1 ? (
          <Pressable onPress={skipToPlans} hitSlop={12} style={{ width: 36, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 15, color: MUTED }}>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={{ width, paddingHorizontal: 24, paddingTop: 8, gap: 28 }}>
            <View style={{ justifyContent: "center", flex: 1 }}>
              <slide.Visual />
            </View>
            <View style={{ gap: 10, paddingBottom: 8 }}>
              <Text style={{
                fontSize: 26, fontWeight: "700", color: TEXT,
                letterSpacing: -0.5, lineHeight: 32,
              }}>
                {slide.headline}
              </Text>
              <Text style={{ fontSize: 15, color: MUTED, lineHeight: 22 }}>
                {slide.subline}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
        gap: 20,
      }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width: page === i ? 20 : 6,
              height: 6, borderRadius: 3,
              backgroundColor: page === i ? CORAL : "#D1D5DB",
            }} />
          ))}
        </View>

        <AnimatedPressable
          scaleDown={0.97}
          onPress={goNext}
          style={{
            backgroundColor: CORAL,
            borderRadius: 14, paddingVertical: 16, alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
            {page === SLIDES.length - 1 ? "See plans" : "Next"}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
