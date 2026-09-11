import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktopOrTablet = width >= 768;
  const bottomPadding = Platform.OS === "web" ? (isDesktopOrTablet ? 0 : 12) : Math.max(insets.bottom, 8);
  const tabBarHeight = isDesktopOrTablet ? 60 : 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: isDesktopOrTablet
          ? {
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: 560,
              marginHorizontal: "auto",
              height: 60,
              borderRadius: 30,
              backgroundColor: "#FFFFFFEE",
              borderTopWidth: 0,
              borderWidth: 1,
              borderColor: "#E6E1D8",
              paddingTop: 8,
              paddingBottom: 8,
              // Web box shadow
              ...(Platform.OS === "web"
                ? ({
                    boxShadow: "0 10px 30px rgba(23, 34, 43, 0.12)",
                  } as any)
                : {
                    elevation: 8,
                  }),
            }
          : {
              paddingTop: 8,
              paddingBottom: bottomPadding,
              height: tabBarHeight,
              backgroundColor: "#F7F5F0",
              borderTopColor: "#E1DDD4",
              borderTopWidth: 0.5,
            },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: "الخدمات",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: "دعوات",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="mail.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "السلة",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: "طلباتي",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="receipt.fill" color={color} />,
        }}
      />
      {/* Hide internal dashboard and secondary routes from customer tab bar */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
