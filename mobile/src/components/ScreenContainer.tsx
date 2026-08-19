import React from "react";
import { View, ViewProps } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useResponsive } from "../hooks/useResponsive";

interface ScreenContainerProps extends ViewProps {
  edges?: readonly Edge[];
}

/**
 * Consistent screen padding across phone/tablet and both orientations.
 * Horizontal padding grows slightly on wider screens so content doesn't
 * hug the edges on tablets/landscape.
 */
export function ScreenContainer({ children, edges = ["top", "left", "right"], style, ...rest }: ScreenContainerProps) {
  const { isTablet } = useResponsive();

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface" style={style} {...rest}>
      <View className={`flex-1 ${isTablet ? "px-8" : "px-4"}`}>{children}</View>
    </SafeAreaView>
  );
}
