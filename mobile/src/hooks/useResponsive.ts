import { useWindowDimensions } from "react-native";

/**
 * Central place for responsive breakpoints so every screen reacts to rotation
 * and tablet vs. phone the same way. `useWindowDimensions` re-renders on
 * orientation change, which is what keeps this live across rotation.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 700;
  const isWide = width >= 900;
  const columns = isWide ? 3 : isTablet ? 2 : 1;

  return { width, height, isTablet, isWide, columns };
}
