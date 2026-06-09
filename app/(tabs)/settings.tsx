import { useState, useRef, useEffect } from "react";
import { View, Switch, Alert, ScrollView, Modal, Pressable,
  Animated, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Stack, router } from "expo-router";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import {
  useProfile, useSettings, updateSettings,
  useIsPro, CURRENCIES, currencyMeta,
} from "@/lib/store";

const BG         = "#F7F8FA";
const CARD       = "#FFFFFF";
const BORDER     = "#ECEEF1";
const DIVIDER    = "#F3F4F6";
const TEXT       = "#11151C";
const MUTED      = "#6A7280";
const CORAL      = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW     = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;

// ── Shared bottom-sheet helpers ───────────────────────────────────────────────

function useSheet(onClose?: () => void) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetY          = useRef(new Animated.Value(600)).current;
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted]  = useState(false);

  function open() {
    setMounted(true);
    setVisible(true);
    backdropOpacity.setValue(0);
    sheetY.setValue(600);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0.4, duration: 260, useNativeDriver: true }),
      Animated.spring(sheetY, { toValue: 0, damping: 28, stiffness: 220, useNativeDriver: true }),
    ]).start();
  }

  function close() {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 600, duration: 220, useNativeDriver: true }),
    ]).start(() => { setMounted(false); setVisible(false); onClose?.(); });
  }

  return { visible, mounted, backdropOpacity, sheetY, open, close };
}

// ── Reminder timing sheet ─────────────────────────────────────────────────────

const PRESET_DAYS = [1, 3, 7, 14];

function ReminderTimingSheet({
  currentTiming, onSave, sheet,
}: {
  currentTiming: number;
  onSave: (days: number) => void;
  sheet: ReturnType<typeof useSheet>;
}) {
  const insets  = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | "custom">(
    PRESET_DAYS.includes(currentTiming) ? currentTiming : "custom",
  );
  const [customDays, setCustomDays] = useState(
    PRESET_DAYS.includes(currentTiming) ? "" : String(currentTiming),
  );

  useEffect(() => {
    if (sheet.visible) {
      const isPreset = PRESET_DAYS.includes(currentTiming);
      setSelected(isPreset ? currentTiming : "custom");
      setCustomDays(isPreset ? "" : String(currentTiming));
    }
  }, [sheet.visible]);

  function handleSave() {
    if (selected === "custom") {
      const parsed = parseInt(customDays, 10);
      if (!parsed || parsed < 1) return;
      onSave(parsed);
    } else {
      onSave(selected);
    }
    sheet.close();
  }

  const saveEnabled =
    selected !== "custom" || (parseInt(customDays, 10) >= 1);

  return (
    <Modal
      visible={sheet.mounted}
      transparent
      animationType="none"
      onRequestClose={sheet.close}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "#000", opacity: sheet.backdropOpacity,
        }} />
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={sheet.close}
        />
        <Animated.View style={{ transform: [{ translateY: sheet.sheetY }] }}>
          <View style={{
            backgroundColor: CARD,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: insets.bottom + 24, gap: 20,
          }}>
            {/* Handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center" }} />

            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }}>Reminder timing</Text>
            <Text style={{ fontSize: 14, color: MUTED }}>
              One reminder per renewal, applied to all fees.
            </Text>

            <View style={{ gap: 8 }}>
              {PRESET_DAYS.map((days) => (
                <AnimatedPressable
                  key={days}
                  scaleDown={0.97}
                  onPress={() => setSelected(days)}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingVertical: 14, paddingHorizontal: 16,
                    borderRadius: 12, borderWidth: 1,
                    borderColor: selected === days ? CORAL : BORDER,
                    backgroundColor: selected === days ? CORAL_TINT : CARD,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: selected === days ? CORAL : TEXT }}>
                    {days === 1 ? "1 day before" : `${days} days before`}
                  </Text>
                  {selected === days && <Ionicons name="checkmark-circle" size={20} color={CORAL} />}
                </AnimatedPressable>
              ))}

              {/* Custom */}
              <AnimatedPressable
                scaleDown={0.97}
                onPress={() => setSelected("custom")}
                style={{
                  paddingVertical: 14, paddingHorizontal: 16,
                  borderRadius: 12, borderWidth: 1,
                  borderColor: selected === "custom" ? CORAL : BORDER,
                  backgroundColor: selected === "custom" ? CORAL_TINT : CARD,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: selected === "custom" ? CORAL : TEXT }}>
                    Choose yourself
                  </Text>
                  {selected === "custom" && <Ionicons name="checkmark-circle" size={20} color={CORAL} />}
                </View>
                {selected === "custom" && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      value={customDays}
                      onChangeText={setCustomDays}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor: CARD, borderRadius: 8,
                        borderWidth: 1, borderColor: BORDER,
                        paddingHorizontal: 12, paddingVertical: 8,
                        fontSize: 15, color: TEXT, width: 72, textAlign: "center",
                      }}
                      placeholder="7"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                    />
                    <Text style={{ fontSize: 14, color: MUTED }}>days before renewal</Text>
                  </View>
                )}
              </AnimatedPressable>
            </View>

            <AnimatedPressable
              scaleDown={0.97}
              onPress={handleSave}
              disabled={!saveEnabled}
              style={{
                backgroundColor: saveEnabled ? CORAL : "#E5E7EB",
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: saveEnabled ? "#fff" : MUTED }}>
                Save
              </Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Currency sheet ────────────────────────────────────────────────────────────

function CurrencySheet({
  current, onSave, sheet,
}: {
  current: string;
  onSave: (code: string) => void;
  sheet: ReturnType<typeof useSheet>;
}) {
  const insets  = useSafeAreaInsets();
  const [selected, setSelected] = useState(current);

  useEffect(() => {
    if (sheet.visible) setSelected(current);
  }, [sheet.visible]);

  function handleSave() {
    onSave(selected);
    sheet.close();
  }

  return (
    <Modal
      visible={sheet.mounted}
      transparent
      animationType="none"
      onRequestClose={sheet.close}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "#000", opacity: sheet.backdropOpacity,
        }} />
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={sheet.close}
        />
        <Animated.View style={{ transform: [{ translateY: sheet.sheetY }] }}>
          <View style={{
            backgroundColor: CARD,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: insets.bottom + 24, gap: 20,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center" }} />
            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }}>Display currency</Text>
            <Text style={{ fontSize: 14, color: MUTED }}>
              Fee amounts are stored in their native currency. This sets the reporting view.
            </Text>

            <View style={{ gap: 2 }}>
              {CURRENCIES.map((c) => (
                <AnimatedPressable
                  key={c.code}
                  scaleDown={0.97}
                  onPress={() => setSelected(c.code)}
                  style={{
                    flexDirection: "row", alignItems: "center",
                    paddingVertical: 13, paddingHorizontal: 4,
                    borderBottomWidth: 1, borderBottomColor: DIVIDER,
                    gap: 12,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: selected === c.code ? CORAL_TINT : "#F3F4F6",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: selected === c.code ? CORAL : MUTED }}>
                      {c.symbol}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "500", color: TEXT }}>{c.label}</Text>
                    <Text style={{ fontSize: 12, color: MUTED }}>{c.code}</Text>
                  </View>
                  {selected === c.code && (
                    <Ionicons name="checkmark-circle" size={20} color={CORAL} />
                  )}
                </AnimatedPressable>
              ))}
            </View>

            <AnimatedPressable
              scaleDown={0.97}
              onPress={handleSave}
              style={{ backgroundColor: CORAL, borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Save</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── UI components ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{
      fontSize: 12, fontWeight: "600", color: MUTED,
      textTransform: "uppercase", letterSpacing: 0.6,
      paddingHorizontal: 4, marginBottom: 4, marginTop: 4,
    }}>
      {label}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: CARD, borderRadius: 16,
      borderWidth: 1, borderColor: BORDER, overflow: "hidden", ...SHADOW,
    }}>
      {children}
    </View>
  );
}

function Row({
  label, value, chevron, onPress, left, disabled,
}: {
  label: string; value?: string; chevron?: boolean;
  onPress?: () => void; left?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <AnimatedPressable
      scaleDown={0.98}
      onPress={onPress}
      disabled={!onPress || disabled}
      style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, minHeight: 48, gap: 12,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {left}
      <Text style={{ flex: 1, fontSize: 15, color: TEXT }}>{label}</Text>
      {value && <Text style={{ fontSize: 15, color: MUTED }}>{value}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
    </AnimatedPressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: DIVIDER, marginLeft: 16 }} />;
}

function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12, minHeight: 48, gap: 12,
    }}>
      <Text style={{ flex: 1, fontSize: 15, color: TEXT }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#E5E7EB", true: CORAL }}
        thumbColor="#fff"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function reminderLabel(days: number): string {
  return days === 1 ? "1 day before" : `${days} days before`;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets   = useSafeAreaInsets();
  const profile  = useProfile();
  const settings = useSettings();
  const isPro    = useIsPro();

  const reminderSheet = useSheet();
  const currencySheet = useSheet();

  const meta = currencyMeta(settings.displayCurrency);

  function handleSignOut() {
    Alert.alert(
      "Sign out?",
      "You will be returned to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            // TODO: Supabase auth.signOut() seam
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 100,
            gap: 6,
          }}
        >
          {/* Top bar */}
          <View style={{ paddingVertical: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>
              Profile
            </Text>
          </View>

          {/* Account header */}
          <Card>
            <View style={{
              flexDirection: "row", alignItems: "center",
              padding: 16, gap: 14,
            }}>
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: "#E5E7EB",
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT }}>
                  {initials(profile.name)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>{profile.name}</Text>
                <Text style={{ fontSize: 13, color: MUTED }}>{profile.email}</Text>
              </View>
              <AnimatedPressable
                scaleDown={0.9}
                onPress={() => router.push("/edit-profile")}
                style={{ paddingHorizontal: 4, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 14, color: MUTED }}>Edit</Text>
              </AnimatedPressable>
            </View>
          </Card>

          {/* Plan */}
          <SectionLabel label="Plan" />
          <Card>
            <Row label="Current plan" value={isPro ? "SubPulse Pro" : "SubPulse Free"} />
            <Divider />
            {isPro ? (
              <View style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, minHeight: 48, gap: 8,
              }}>
                <Ionicons name="checkmark-circle" size={16} color={CORAL} />
                <Text style={{ fontSize: 14, color: MUTED }}>You have Pro. All features unlocked.</Text>
              </View>
            ) : (
              <AnimatedPressable
                scaleDown={0.98}
                onPress={() => router.push("/paywall")}
                style={{
                  flexDirection: "row", alignItems: "center",
                  paddingHorizontal: 16, minHeight: 52, gap: 12,
                  backgroundColor: CORAL_TINT,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: CORAL }}>Upgrade to Pro</Text>
                  <Text style={{ fontSize: 12, color: MUTED }}>AI scan, unlimited fees, advanced insights</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={CORAL} />
              </AnimatedPressable>
            )}
          </Card>

          {/* Notifications */}
          <SectionLabel label="Notifications" />
          <Card>
            <ToggleRow
              label="Renewal reminders"
              value={settings.reminderEnabled}
              onChange={(v) => updateSettings({ reminderEnabled: v })}
            />
            <Divider />
            <Row
              label="Reminder timing"
              value={reminderLabel(settings.reminderTiming)}
              chevron
              disabled={!settings.reminderEnabled}
              onPress={reminderSheet.open}
            />
            <Divider />
            <ToggleRow
              label="Renewal-day alert"
              value={settings.renewalDayAlert}
              onChange={(v) => updateSettings({ renewalDayAlert: v })}
            />
          </Card>

          {/* Preferences */}
          <SectionLabel label="Preferences" />
          <Card>
            <Row
              label="Currency"
              value={`${meta.code} (${meta.symbol})`}
              chevron
              onPress={currencySheet.open}
            />
            <Divider />
            <Row label="Language" value="English" />
          </Card>

          {/* About */}
          <SectionLabel label="About" />
          <Card>
            <Row
              label="Help"
              chevron
              onPress={() => router.push("/help")}
            />
            <Divider />
            <Row
              label="Privacy policy"
              chevron
              onPress={() => Linking.openURL("https://subpulse.app/privacy")}
            />
            <Divider />
            <Row
              label="Terms"
              chevron
              onPress={() => Linking.openURL("https://subpulse.app/terms")}
            />
          </Card>

          {/* Sign out */}
          <AnimatedPressable
            scaleDown={0.97}
            onPress={handleSignOut}
            style={{
              backgroundColor: CARD,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: BORDER,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 4,
              ...SHADOW,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: MUTED }}>Sign out</Text>
          </AnimatedPressable>

          {/* Footer */}
          <Text style={{ fontSize: 12, color: "#C0C4CC", textAlign: "center", marginTop: 4 }}>
            SubPulse v1.0
          </Text>
        </ScrollView>
      </View>

      <ReminderTimingSheet
        currentTiming={settings.reminderTiming}
        onSave={(days) => updateSettings({ reminderTiming: days })}
        sheet={reminderSheet}
      />
      <CurrencySheet
        current={settings.displayCurrency}
        onSave={(code) => updateSettings({ displayCurrency: code })}
        sheet={currencySheet}
      />
    </>
  );
}
