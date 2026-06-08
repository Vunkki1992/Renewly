import { ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";

export default function SubscriptionsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Subscriptions", headerLargeTitle: true }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 17, color: "#6b7280" }}>
            No subscriptions yet
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
