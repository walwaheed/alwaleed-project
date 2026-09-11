import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#F7F5F0",
          borderTopColor: "#E1DDD4",
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="hub"
        options={{
          title: "الخدمات",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: "دعوات",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="mail.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "المساعد",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "لوحة المالك",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "السلة",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: "المعاملة",
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="receipt.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
