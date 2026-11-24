import React from "react";
import { Text, View } from "react-native";
import { act, create } from "react-test-renderer";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationService from "../app/navigation/NavigationService";
import { findMenuItemForRouteChain } from "../app/navigation/drawer/drawerRouteMatcher";

const Stack = createNativeStackNavigator();
const Screen = (label: string) => () => (
  <View><Text>{label}</Text></View>
);

const sections: any = [
  {
    id: "application",
    title: "Application",
    icon: 0,
    visibility: "ALWAYS",
    items: [
      {
        id: "existingApplication",
        title: "Existing Application",
        icon: 0,
        navigation: { type: "WEBVIEW", screen: "ExistingApplication" },
        bottomNavVisible: false,
      },
      {
        id: "newApplication",
        title: "New Application",
        icon: 0,
        navigation: { type: "WEBVIEW", screen: "NewApplicationScreen" },
        bottomNavVisible: false,
      },
    ],
  },
];

const App = () => (
  <NavigationContainer ref={NavigationService.navigationRef}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardScreen" component={Screen("DASH")} />
      <Stack.Screen name="ExistingApplication" component={Screen("EXISTING")} />
      <Stack.Screen name="NewApplicationScreen" component={Screen("NEW")} />
    </Stack.Navigator>
  </NavigationContainer>
);

it("listener + matcher track back navigation between webview screens", () => {
  let tree: any;
  act(() => { tree = create(<App />); });

  let lastMatch: any = "never-fired";
  const unsub = NavigationService.addNavigationStateListener(() => {
    lastMatch = findMenuItemForRouteChain(
      sections,
      NavigationService.getFocusedRouteChain(),
      "DrawerWebViewScreen"
    );
  });

  act(() => { NavigationService.navigationRef.dispatch(CommonActions.navigate("ExistingApplication")); });
  expect(lastMatch?.itemId).toBe("existingApplication");

  act(() => { NavigationService.navigationRef.dispatch(CommonActions.navigate("NewApplicationScreen")); });
  expect(lastMatch?.itemId).toBe("newApplication");

  act(() => { NavigationService.navigationRef.dispatch(CommonActions.goBack()); });
  expect(lastMatch?.itemId).toBe("existingApplication");

  if (typeof unsub === "function") unsub();
  act(() => tree.unmount());
});
