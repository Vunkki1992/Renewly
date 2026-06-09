import { useState } from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const CLIENT_ID  = "REPLACE_WITH_CLIENT_ID";
const CORAL      = "#FF6B5C";
const CORAL_DARK = "#B8180F";
const BORDER     = "#ECEEF1";

interface Props {
  domain?: string;
  name: string;
  size?: number;
  muted?: boolean;
}

export function BrandLogo({ domain, name, size = 40, muted = false }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!domain && !failed;
  const radius = size * 0.3;

  if (showImage) {
    const uri = `https://cdn.brandfetch.io/${domain}/w/${size * 2}/h/${size * 2}/fallback/404/icon?c=${CLIENT_ID}`;
    return (
      <View style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: "#FFFFFF",
        borderWidth: 1, borderColor: BORDER,
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <Image
          source={{ uri }}
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
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: "#F3F4F6",
        borderWidth: 1, borderColor: BORDER,
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ fontSize: size * 0.38, fontWeight: "700", color: "#9CA3AF" }}>
          {name.charAt(0).toUpperCase()}
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
        width: size, height: size, borderRadius: size / 2,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.38, fontWeight: "700", color: "#fff" }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}
