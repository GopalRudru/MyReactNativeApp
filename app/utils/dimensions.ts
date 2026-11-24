import { Dimensions, ScaledSize, useWindowDimensions } from "react-native";

/**
 * App-wide screen dimensions.
 *
 * SCREEN_WIDTH / SCREEN_HEIGHT are read at app start and refreshed whenever the
 * window changes, so they can be used anywhere - module scope, StyleSheet.create,
 * inside components. Values already baked into a StyleSheet at import time will
 * not change on rotation; for that use the useScreenDimensions hook, which
 * re-renders the component when the window size changes.
 */
const initial = Dimensions.get("window");

export let SCREEN_WIDTH = initial.width;
export let SCREEN_HEIGHT = initial.height;

Dimensions.addEventListener("change", ({ window }: { window: ScaledSize }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

/** Percentage of the screen width, e.g. wp(50) => half the screen width. */
export const wp = (percentage: number) => (SCREEN_WIDTH * percentage) / 100;

/** Percentage of the screen height, e.g. hp(20) => 20% of the screen height. */
export const hp = (percentage: number) => (SCREEN_HEIGHT * percentage) / 100;

/** Reactive variant - re-renders the component when the window size changes. */
export const useScreenDimensions = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  return {
    screenWidth,
    screenHeight,
    wp: (percentage: number) => (screenWidth * percentage) / 100,
    hp: (percentage: number) => (screenHeight * percentage) / 100,
  };
};
