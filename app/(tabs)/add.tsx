import { ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";

export default function AddScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Add Subscription" }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 17, color: "#6b7280" }}>
            Invoice upload + manual entry coming soon
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
