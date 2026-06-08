import { Redirect } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { use } from "react";
import { SessionContext } from "@/lib/session-context";

export default function TabsLayout() {
  const session = use(SessionContext);
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <NativeTabs
      tabBarActiveTintColor="#FF6B5C"
      tabBarInactiveTintColor="#9CA3AF"
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="subscriptions">
        <Icon sf="creditcard.fill" />
        <Label>Fees</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
        <Icon sf="chart.bar.fill" />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
