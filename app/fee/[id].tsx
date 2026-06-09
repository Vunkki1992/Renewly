import { useState, useEffect, useRef } from "react";
import { View, ScrollView, Modal, Pressable, Alert,
  TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { BrandLogo } from "@/components/BrandLogo";
import { ALL_CATEGORIES } from "@/components/CategoryPicker";
import {
  getFeeById, deleteFee, updateFee, annualCost, paidSoFar,
  type Fee, type Cycle,
} from "@/lib/store";

const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW     = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

const INPUT = {
  backgroundColor: "#F9FAFB", borderRadius: 10,
  borderWidth: 1, borderColor: BORDER,
  paddingHorizontal: 14, paddingVertical: 12,
  fontSize: 16, color: TEXT,
} as const;

const LABEL = { fontSize: 13, fontWeight: "600" as const, color: MUTED, marginBottom: 6 };

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtEuro(n: number): string {
  return `€${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

function renewalLabel(fee: Fee): string {
  const n = fee.daysUntil;
  return n <= 0
    ? `Renews today · ${fee.nextRenewal}`
    : `Renews in ${n} day${n === 1 ? "" : "s"} · ${fee.nextRenewal}`;
}

// ─── TopBar ──────────────────────────────────────────────────────────────────

function TopBar() {
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
        flex: 1, textAlign: "center", marginRight: 36,
        fontSize: 17, fontWeight: "700", color: TEXT,
      }}>
        Subscription
      </Text>
    </View>
  );
}

// ─── FactRow ─────────────────────────────────────────────────────────────────

function FactRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <>
      <View style={{
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingVertical: 14,
      }}>
        <Text style={{ fontSize: 14, color: MUTED }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT, fontVariant: ["tabular-nums"] }}>
          {value}
        </Text>
      </View>
      {!last && <View style={{ height: 1, backgroundColor: BORDER }} />}
    </>
  );
}

// ─── EditSheet ───────────────────────────────────────────────────────────────

function EditSheet({
  fee, visible, onSave, onDismiss,
}: { fee: Fee; visible: boolean; onSave: (patch: Partial<Fee>) => void; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetY          = useRef(new Animated.Value(700)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName]         = useState(fee.name);
  const [amount, setAmount]     = useState(String(fee.amountRaw));
  const [cycle, setCycle]       = useState<Cycle>(fee.cycle);
  const [renewal, setRenewal]   = useState(fee.nextRenewal);
  const [category, setCategory] = useState(fee.category);

  useEffect(() => {
    if (visible) {
      setName(fee.name); setAmount(String(fee.amountRaw));
      setCycle(fee.cycle); setRenewal(fee.nextRenewal); setCategory(fee.category);
      setModalVisible(true);
      backdropOpacity.setValue(0);
      sheetY.setValue(700);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0.4, duration: 260, useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, damping: 28, stiffness: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: 700, duration: 220, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  function handleSave() {
    const raw = parseFloat(amount.replace(/[^0-9.]/g, "")) || fee.amountRaw;
    const amountDisplay = `€${raw % 1 === 0 ? raw.toFixed(0) : raw.toFixed(2)}`;
    onSave({ name, amountRaw: raw, amountDisplay, cycle, nextRenewal: renewal, category });
  }

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "#000", opacity: backdropOpacity,
        }} />
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onDismiss}
        />
        <Animated.View style={{
          transform: [{ translateY: sheetY }],
        }}>
          <View style={{
            backgroundColor: CARD,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: Dimensions.get("window").height * 0.92,
          }}>
          {/* handle */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" }} />
          </View>

          {/* header */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingHorizontal: 20, paddingVertical: 12,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }}>Edit subscription</Text>
            <AnimatedPressable
              scaleDown={0.88}
              onPress={onDismiss}
              style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: "#F3F4F6",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={16} color={MUTED} />
            </AnimatedPressable>
          </View>

          <View style={{ height: 1, backgroundColor: BORDER }} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, gap: 18, paddingBottom: 8 }}
          >
            {/* Name */}
            <View>
              <Text style={LABEL}>Service name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={INPUT}
                returnKeyType="done"
              />
            </View>

            {/* Amount */}
            <View>
              <Text style={LABEL}>Amount</Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#F9FAFB", borderRadius: 10,
                borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14,
              }}>
                <Text style={{ fontSize: 16, color: MUTED, marginRight: 4 }}>€</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  style={[INPUT, { flex: 1, backgroundColor: "transparent", borderWidth: 0, paddingHorizontal: 0 }]}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Billing cycle */}
            <View>
              <Text style={LABEL}>Billing cycle</Text>
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

            {/* Next renewal */}
            <View>
              <Text style={LABEL}>Next renewal</Text>
              <TextInput
                value={renewal}
                onChangeText={setRenewal}
                style={INPUT}
                placeholder="e.g. 21 Jun 2026"
                placeholderTextColor="#9CA3AF"
                returnKeyType="done"
              />
            </View>

            {/* Category */}
            <View>
              <Text style={LABEL}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {ALL_CATEGORIES.map((cat) => {
                  const sel = category === cat;
                  return (
                    <AnimatedPressable
                      key={cat}
                      scaleDown={0.95}
                      onPress={() => setCategory(cat)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 8,
                        borderRadius: 20, borderWidth: 1,
                        borderColor: sel ? CORAL : BORDER,
                        backgroundColor: sel ? CORAL_TINT : CARD,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: sel ? "600" : "400", color: sel ? CORAL : MUTED }}>
                        {cat}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={{
            paddingHorizontal: 20, paddingTop: 16,
            paddingBottom: insets.bottom + 24, gap: 10,
            borderTopWidth: 1, borderTopColor: BORDER,
          }}>
            <AnimatedPressable
              scaleDown={0.97}
              onPress={handleSave}
              style={{ backgroundColor: CORAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Save</Text>
            </AnimatedPressable>
            <AnimatedPressable scaleDown={0.97} onPress={onDismiss} style={{ alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: MUTED }}>Discard changes</Text>
            </AnimatedPressable>
          </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function FeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [editVisible, setEditVisible] = useState(false);

  const fee = getFeeById(id ?? "");

  if (!fee) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
          <TopBar />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: MUTED, fontSize: 15 }}>Subscription not found.</Text>
          </View>
        </View>
      </>
    );
  }

  const yearly = annualCost(fee);
  const paid   = paidSoFar(fee);

  function handleSave(patch: Partial<Fee>) {
    updateFee(fee.id, patch);
    setEditVisible(false);
  }

  function handleDelete() {
    Alert.alert(
      "Delete from SubPulse?",
      "This removes it completely and won't count toward savings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => { deleteFee(fee.id); router.back(); } },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
        <TopBar />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 12 }}
        >
          {/* ── Identity ── */}
          <View style={{ alignItems: "center", paddingVertical: 24, gap: 10 }}>
            <BrandLogo domain={fee.domain} name={fee.name} size={64} />
            <Text style={{ fontSize: 24, fontWeight: "700", color: TEXT, letterSpacing: -0.5, textAlign: "center" }}>
              {fee.name}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: CORAL, textAlign: "center" }}>
              {renewalLabel(fee)}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "500", color: MUTED, fontVariant: ["tabular-nums"] }}>
              {fee.amountDisplay} / {fee.cycle === "Monthly" ? "mo" : "yr"}
            </Text>
          </View>

          {/* ── Facts ── */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, ...SHADOW,
          }}>
            <FactRow label="Amount"        value={fee.amountDisplay} />
            <FactRow label="Billing cycle" value={fee.cycle} />
            <FactRow label="Next renewal"  value={fee.nextRenewal} />
            <FactRow label="Category"      value={fee.category} />
            <FactRow label="Date added"    value={fee.dateAdded} last />
          </View>

          {/* ── Cost context ── */}
          <View style={{
            backgroundColor: CARD, borderRadius: 16,
            borderWidth: 1, borderColor: BORDER, padding: 20, gap: 14, ...SHADOW,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 14, color: MUTED }}>Yearly cost</Text>
              <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5, fontVariant: ["tabular-nums"] }}>
                {fmtEuro(yearly)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: BORDER }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 14, color: MUTED }}>Paid so far</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: MUTED, fontVariant: ["tabular-nums"] }}>
                ≈ {fmtEuro(paid)}
              </Text>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={{ gap: 10, marginTop: 4 }}>
            <AnimatedPressable
              scaleDown={0.97}
              onPress={() => router.back()}
              style={{ backgroundColor: CORAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Keep</Text>
            </AnimatedPressable>

            <AnimatedPressable
              scaleDown={0.97}
              onPress={() => Linking.openURL(
                `https://www.google.com/search?q=${encodeURIComponent(`How to cancel ${fee.name} subscription`)}`
              )}
              style={{
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, ...SHADOW,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>How to cancel subscription</Text>
            </AnimatedPressable>

            <AnimatedPressable
              scaleDown={0.97}
              onPress={() => setEditVisible(true)}
              style={{
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
                borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, ...SHADOW,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>Edit</Text>
            </AnimatedPressable>
          </View>

          {/* ── Delete ── */}
          <View style={{ marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: BORDER, alignItems: "center" }}>
            <AnimatedPressable scaleDown={0.95} onPress={handleDelete}>
              <Text style={{ fontSize: 14, color: "#9CA3AF" }}>Delete from SubPulse</Text>
            </AnimatedPressable>
          </View>
        </ScrollView>

        <EditSheet
          fee={fee}
          visible={editVisible}
          onSave={handleSave}
          onDismiss={() => setEditVisible(false)}
        />
      </View>
    </>
  );
}
