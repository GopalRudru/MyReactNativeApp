// hooks/useHideTabBar.js

import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";

const TAB_BAR_VISIBLE_STYLE = {
  height: Platform.OS === "ios" ? 100 : 70,
  overflow: "hidden",
  position: "absolute",
  backgroundColor: "white",
};

export const useHideTabBar = (shouldHide = true, screenName='None') => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
   // if (!shouldHide) return;

    if (shouldHide) {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      navigation.getParent()?.setOptions({
        tabBarStyle: TAB_BAR_VISIBLE_STYLE,
      });
    }

    // return () => {
    //   navigation.getParent()?.setOptions({
    //     tabBarStyle: TAB_BAR_VISIBLE_STYLE,
    //   });
    // };
  }, [navigation, shouldHide]);
};
