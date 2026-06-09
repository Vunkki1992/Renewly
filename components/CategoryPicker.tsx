import { useEffect, useRef, useState } from "react";
import { Modal, View, ScrollView,
  Animated, Dimensions, TouchableWithoutFeedback } from "react-native";
import { Text } from "./Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";

const CARD = "#FFFFFF";
const BORDER = "#ECEEF1";
const DIVIDER = "#F3F4F6";
const TEXT = "#11151C";
const MUTED = "#6A7280";
const CORAL = "#FF6B5C";
const CORAL_TINT = "#FFECE7";
const SHADOW = { boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" } as const;

const SCREEN_H = Dimensions.get("window").height;

const MAIN_CATEGORIES = [
  "Entertainment",
  "Software",
  "Fitness & Health",
  "Utilities",
  "Insurance",
  "News & Media",
  "Shopping & Memberships",
  "Food & Drink",
  "Finance",
];
const OTHER = "Other";
export const ALL_CATEGORIES = [...MAIN_CATEGORIES, OTHER];

interface Props {
  value: string | null;
  onChange: (v: string) => void;
  suggested?: string | null;
}

export function CategoryPicker({ value, onChange, suggested }: Props) {
  const [open, setOpen] = useState(false);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(SCREEN_H)).current;

  function show() {
    setOpen(true);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(sheet, { toValue: 0, speed: 18, bounciness: 3, useNativeDriver: true }),
    ]).start();
  }

  function hide(next?: () => void) {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheet, { toValue: SCREEN_H, duration: 200, useNativeDriver: true }),
    ]).start(() => { setOpen(false); next?.(); });
  }

  function select(cat: string) {
    hide(() => onChange(cat));
  }

  const fieldStyle = {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  };

  return (
    <>
      {/* Field */}
      <AnimatedPressable scaleDown={0.98} onPress={show} style={fieldStyle}>
        <Text style={{ fontSize: 16, color: value ? TEXT : MUTED }}>
          {value ?? "Choose category"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={MUTED} />
      </AnimatedPressable>

      {/* Sheet */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => hide()}>
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={() => hide()}>
            <Animated.View style={{
              ...{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000" },
              opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
            }} />
          </TouchableWithoutFeedback>

          {/* Sheet panel */}
          <Animated.View style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            transform: [{ translateY: sheet }],
          }}>
            <SheetContent
              value={value}
              suggested={suggested}
              onSelect={select}
              onClose={() => hide()}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function SheetContent({ value, suggested, onSelect, onClose }: {
  value: string | null;
  suggested?: string | null;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      backgroundColor: CARD,
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      maxHeight: SCREEN_H * 0.72,
      ...SHADOW,
    }}>
      {/* Handle + header */}
      <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" }} />
      </View>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 12,
      }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>Category</Text>
        <AnimatedPressable scaleDown={0.88} onPress={onClose} style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: "#F3F4F6",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="close" size={16} color={MUTED} />
        </AnimatedPressable>
      </View>

      <View style={{ height: 1, backgroundColor: DIVIDER }} />

      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
      >
        {/* Main categories */}
        {MAIN_CATEGORIES.map((cat, i) => (
          <CategoryRow
            key={cat}
            label={cat}
            selected={value === cat}
            suggested={suggested === cat}
            onPress={() => onSelect(cat)}
            divider={i < MAIN_CATEGORIES.length - 1}
          />
        ))}

        {/* Other — separated */}
        <View style={{ height: 1, backgroundColor: BORDER, marginTop: 4 }} />
        <CategoryRow
          label={OTHER}
          selected={value === OTHER}
          suggested={suggested === OTHER}
          onPress={() => onSelect(OTHER)}
          divider={false}
        />
      </ScrollView>
    </View>
  );
}

function CategoryRow({ label, selected, suggested, onPress, divider }: {
  label: string;
  selected: boolean;
  suggested: boolean;
  onPress: () => void;
  divider: boolean;
}) {
  return (
    <>
      <AnimatedPressable
        scaleDown={0.98}
        onPress={onPress}
        style={{
          flexDirection: "row", alignItems: "center",
          paddingHorizontal: 20, minHeight: 48, gap: 10,
          backgroundColor: selected ? CORAL_TINT : CARD,
        }}
      >
        <Text style={{
          flex: 1, fontSize: 15,
          fontWeight: selected ? "600" : "400",
          color: selected ? CORAL : TEXT,
        }}>
          {label}
        </Text>
        {suggested && (
          <View style={{
            backgroundColor: CORAL_TINT, borderRadius: 20,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: CORAL }}>Suggested</Text>
          </View>
        )}
        {selected && <Ionicons name="checkmark" size={18} color={CORAL} />}
      </AnimatedPressable>
      {divider && <View style={{ height: 1, backgroundColor: DIVIDER, marginLeft: 20 }} />}
    </>
  );
}
