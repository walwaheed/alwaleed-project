import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  maxWidth?: number;
}

export function ScreenContainer({
  children,
  style,
  contentContainerStyle,
  maxWidth = 1180,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const bottomPadding = isDesktop ? 40 : 20;

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingTop: insets.top },
        style,
      ]}
    >
      <View
        style={[
          styles.innerContainer,
          {
            maxWidth,
            paddingHorizontal: horizontalPadding,
            paddingBottom: bottomPadding,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F7F5F0",
    overflow: "hidden",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    marginHorizontal: "auto",
  },
});
