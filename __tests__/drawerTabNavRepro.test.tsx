/**
 * Regression test for: drawer "Payment"/"Documents" items landing on the
 * Dashboard tab. Mirrors the app's navigator shape: root stack ->
 * "DashboardScreen" (bottom tabs) -> "Dashboard" tab containing a nested stack
 * whose screen is ALSO named "DashboardScreen". Because of that duplicate
 * name, untargeted dispatches get captured by the inner stack when the
 * Dashboard tab is focused — which is exactly where users open the drawer.
 * NavigationService.resetToNestedScreen must therefore target the root stack
 * explicitly.
 */
import React from "react";
import { Text, View } from "react-native";
import { act, create } from "react-test-renderer";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as NavigationService from "../app/navigation/NavigationService";

const Stack = createNativeStackNavigator();
const InnerStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Screen = (label: string) => () =>
  (
    <View>
      <Text>{label}</Text>
    </View>
  );

const DashboardStack = () => (
  <InnerStack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="DashboardScreen"
  >
    <InnerStack.Screen name="DashboardScreen" component={Screen("DASH")} />
  </InnerStack.Navigator>
);

const PaymentStack = () => (
  <InnerStack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="PaymentScreen"
  >
    <InnerStack.Screen name="PaymentScreen" component={Screen("PAY")} />
  </InnerStack.Navigator>
);

const DocumentStack = () => (
  <InnerStack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="DocumentScreen"
  >
    <InnerStack.Screen name="DocumentScreen" component={Screen("DOC")} />
  </InnerStack.Navigator>
);

const BottomTabs = () => (
  <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Payment" component={PaymentStack} />
      <Tab.Screen name="Document" component={DocumentStack} />
    </Tab.Navigator>
  </View>
);

const App = () => (
  <NavigationContainer ref={NavigationService.navigationRef}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Screen("WELCOME")} />
      <Stack.Screen name="DashboardScreen" component={BottomTabs} />
      <Stack.Screen name="DrawerWebViewScreen" component={Screen("WEB")} />
    </Stack.Navigator>
  </NavigationContainer>
);

const focusedRoute = () =>
  NavigationService.navigationRef.getCurrentRoute()?.name;

const focusDashboardTabs = () => {
  act(() => {
    NavigationService.resetTo("DashboardScreen");
  });
  expect(focusedRoute()).toBe("DashboardScreen");
};

describe("NavigationService.resetToNestedScreen", () => {
  let tree: any;

  beforeEach(() => {
    act(() => {
      tree = create(<App />);
    });
  });

  afterEach(() => {
    act(() => tree.unmount());
  });

  it("opens the Payment tab when the Dashboard tab is focused (drawer case)", () => {
    focusDashboardTabs();
    act(() => {
      NavigationService.resetToNestedScreen("DashboardScreen", "Payment");
    });
    expect(focusedRoute()).toBe("PaymentScreen");
  });

  it("opens the Document tab when the Dashboard tab is focused (drawer case)", () => {
    focusDashboardTabs();
    act(() => {
      NavigationService.resetToNestedScreen("DashboardScreen", "Document");
    });
    expect(focusedRoute()).toBe("DocumentScreen");
  });

  it("opens the Payment tab when the tab navigator is not mounted yet", () => {
    expect(focusedRoute()).toBe("Welcome");
    act(() => {
      NavigationService.resetToNestedScreen("DashboardScreen", "Payment");
    });
    expect(focusedRoute()).toBe("PaymentScreen");
  });

  it("opens the Payment tab from a screen pushed above the tabs (webview case)", () => {
    focusDashboardTabs();
    act(() => {
      NavigationService.navigationRef.dispatch(
        CommonActions.navigate("DrawerWebViewScreen")
      );
    });
    expect(focusedRoute()).toBe("DrawerWebViewScreen");
    act(() => {
      NavigationService.resetToNestedScreen("DashboardScreen", "Payment");
    });
    expect(focusedRoute()).toBe("PaymentScreen");
  });
});
