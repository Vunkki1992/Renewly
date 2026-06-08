import { Redirect } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { use } from "react";
import { SessionContext } from "@/lib/session-context";

export default function TabsLayout() {
  const session = use(SessionContext);
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="chart.pie.fill" />
        <Label>Overview</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="subscriptions">
        <Icon sf="list.bullet.rectangle.portrait" />
        <Label>Subscriptions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
        <Icon sf="plus.circle.fill" />
        <Label>Add</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape.fill" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
