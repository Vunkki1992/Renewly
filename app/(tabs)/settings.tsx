import { ScrollView, View, Text, Pressable, Alert } from "react-native";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SettingsScreen() {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error", error.message);
  }

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: true }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 16, gap: 16 }}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => ({
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: pressed ? "#fee2e2" : "#fef2f2",
              alignItems: "center",
            })}
          >
            <Text style={{ color: "#dc2626", fontSize: 15, fontWeight: "600" }}>
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
