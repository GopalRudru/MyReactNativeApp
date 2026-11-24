import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AppNavigationStack from "./AppNavigationStack";
import { navigationRef } from "./NavigationService";
import { useSelector } from "react-redux";
import NoInternetModal from "../components/NoInternetModal";
import AppDrawerContent from "./drawer/AppDrawerContent";
import navigationStrings from "../constant/navigationStrings";

// Drawer edge-swipe is only allowed on the post-login screens whose Header
// shows the hamburger menu icon. On the auth flow and on screens with a back
// icon, swiping from the left edge must NOT open the drawer.
const DRAWER_SWIPE_ENABLED_ROUTES = [
  navigationStrings.DASHBOARD_SCREEN,
  navigationStrings.DOCUMANT_SCREEN,
  navigationStrings.OVERDUE_LOAN_REQUEST,
  navigationStrings.PAYMENT_STATUS,
  navigationStrings.NEW_APPLICATION_SCREEN,
  navigationStrings.EXISTING_APPLICATION_SCREEN,
  navigationStrings.NO_LOANS_SCREEN,
  navigationStrings.DRAWER_WEB_VIEW_SCREEN,
];

// Route names repeat across nesting levels (root stack -> bottom tabs -> tab
// stacks), so gate on the deepest focused screen. Returns undefined until the
// nested navigator state initializes, which keeps the swipe disabled while
// the app is still on the initial (auth) route.
const getDeepestFocusedRouteName = (route) => {
  let current = route?.state?.routes?.[route.state.index ?? 0];
  let name;
  while (current) {
    name = current.name;
    current = current.state?.routes?.[current.state.index ?? 0];
  }
  return name;
};

const Drawer = createDrawerNavigator();

// Defined at module scope: defining this inside Routes would create a new
// component type on every Routes render (e.g. whenever the no-internet modal
// toggles), remounting the navigator and losing all navigation state.
const DrawerNav = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: "left",
        drawerType: "slide",
        detachInactiveScreens: false,
      }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="AppNavigationStack"
        component={AppNavigationStack}
        options={({ route }) => ({
          swipeEnabled: DRAWER_SWIPE_ENABLED_ROUTES.includes(
            getDeepestFocusedRouteName(route)
          ),
        })}
      />
    </Drawer.Navigator>
  );
};

export default function Routes() {
  const showNoInternetModal = useSelector(
    (state) => state.networkSlice.showNoInternetModal
  );

  return (
    <NavigationContainer ref={navigationRef}>
      <DrawerNav />
      <NoInternetModal visible={showNoInternetModal} />
    </NavigationContainer>
  );
}
