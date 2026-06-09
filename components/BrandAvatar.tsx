import { useState } from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { logoUrl } from "@/lib/brands";

const CORAL      = "#FF6B5C";
const CORAL_DARK = "#B8180F";

interface Props {
  name: string;
  initials: string;
  size?: number;
  radius?: number;
  muted?: boolean;
}

export function BrandAvatar({ name, initials, size = 40, radius = 12, muted = false }: Props) {
  const [failed, setFailed] = useState(false);
  const url = logoUrl(name, size * 2);

  if (url && !failed) {
    return (
      <View style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: "#F3F4F6",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size }}
          contentFit="contain"
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  if (muted) {
    return (
      <View style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: "#F3F4F6",
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ fontSize: size * 0.3, fontWeight: "700", color: "#9CA3AF" }}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[CORAL_DARK, CORAL]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size, height: size, borderRadius: radius,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.3, fontWeight: "700", color: "#fff" }}>
        {initials}
      </Text>
    </LinearGradient>
  );
}
