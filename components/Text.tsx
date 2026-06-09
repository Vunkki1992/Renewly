import { Text as RNText, StyleSheet, TextProps } from "react-native";

const WEIGHT_MAP: Record<string, string> = {
  "400": "NunitoSans_400Regular",
  normal: "NunitoSans_400Regular",
  "500": "NunitoSans_500Medium",
  "600": "NunitoSans_600SemiBold",
  "700": "NunitoSans_700Bold",
  bold: "NunitoSans_700Bold",
  "800": "NunitoSans_800ExtraBold",
};

export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = String(flat.fontWeight ?? "400");
  const fontFamily = WEIGHT_MAP[weight] ?? "NunitoSans_400Regular";
  return <RNText style={[{ fontFamily }, style]} {...props} />;
}
