import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Platform, View, StyleSheet, Text } from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import navigationStrings from "../constant/navigationStrings";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setSelectedIndex } from "../services/redux/slices/tabsSlice";
import { setStatusPopup } from "../services/redux/slices/statusPopupSlice";
import * as NavigationService from "../navigation/NavigationService";
import useGeoLocation from "react-ipgeolocation";
import { authSelector } from "../services/redux/slices/authSlice";

import {
  DashboardScreen,
  PaymentScreen,
  DocumentScreen,
  OverdueLoanRequest,
} from "../screens";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const renderTabIcon = (icon, focused, iconName) => {
  return (
    <View>
      <Image source={icon} style={styles.tabIcon(focused)} />
    </View>
  );
};

const BottomTabNavigator = ({ route }) => {
  const dispatch = useDispatch();
  const dashboardDataSet = useSelector(
    (state) => state.dashboardData.sanctionedDisbursedData
  );
  const selectedLoanNumber = useSelector(
    (state) => state.dashboardData.selectedLoanNumber
  );
  
  // Extract params to pass to Dashboard screen
  const applyNowRegisterFlow = route?.params?.applyNowRegisterFlow ?? false;

  const otpUserData = useSelector((state) => state.auth.otpUserData);
  const isBottomNavVisible = useSelector(
    (state) => state.tabs.isBottomNavVisible
  );

  return (
    <View style={{ flex: 1 }}>

      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: Platform.OS === "ios" ? 100 : 70,
            overflow: "hidden", // Add here
            position: "absolute", // Prevents the background from spilling over
            display: isBottomNavVisible ? "flex" : "none",
          },
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === "Dashboard") {
              iconName = focused ? imagePath.dashboard : imagePath.dashboard;
            } else if (route.name === "Payment") {
              iconName = focused
                ? imagePath.paymentIcon
                : imagePath.paymentIcon;
            } else if (route.name === "Document") {
              iconName = focused ? imagePath.document : imagePath.document;
            }
            return renderTabIcon(iconName, focused, iconName);
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.appThemeColor : colors.colorTitleText,
                fontSize: 12,
                opacity: focused ? 1 : 0.6,
                lineHeight: 19,
                fontWeight: "bold",
                marginBottom: 5,
              }}
            >
              {route.name}
            </Text>
          ),
          tabBarBackground: () => (
            <View
              style={{
                backgroundColor: "white",
                flex: 1,
              }}
            />
          ),
        })}
      >
        <Tab.Screen
          name={"Dashboard"}
          component={DashboardStack}
          initialParams={{ applyNowRegisterFlow }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {},
          })} />
        <Tab.Screen
          name={"Payment"}
          component={PaymentStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault(); // Prevent navigation
              // if (isAndroid || isIndia) {
                const matchVal = dashboardDataSet?.find(
                  (data: any) => data?.lanNumber === selectedLoanNumber
                );

                const allAccess = otpUserData?.altAccessFlag === true;

                if (!allAccess && (matchVal?.status || matchVal?.statusOfLoan) != "A") {
                  dispatch(setSelectedIndex(0));
                  dispatch(
                    setStatusPopup({
                      status: "No access",
                      message:
                        "Payment requests are currently unavailable for this loan",
                    })
                  );
                } else {
                  dispatch(setSelectedIndex(2));
                  NavigationService.navigate("Payment", {
                    screen: "PaymentScreen", // this is the internal screen in the Payments stack
                  });
                }
            },
          })} />
        <Tab.Screen
          name={"Document"}
          component={DocumentStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {},
          })} />
      </Tab.Navigator>

    </View>
  );
};

const DashboardStack = ({ route }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
      initialRouteName={navigationStrings.DASHBOARD_SCREEN}
    >
      <Stack.Screen
        name={navigationStrings.DASHBOARD_SCREEN}
        component={DashboardScreen}
        initialParams={route?.params}
      />
    </Stack.Navigator>
  );
};

const PaymentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
      initialRouteName={navigationStrings.PAYMENT_SCREEN}
    >
      <Stack.Screen
        name={navigationStrings.PAYMENT_SCREEN}
        component={PaymentScreen}
      />
      <Stack.Screen
        name={navigationStrings.OVERDUE_LOAN_REQUEST}
        component={OverdueLoanRequest}
      />
    </Stack.Navigator>
  );
};

const DocumentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
      initialRouteName={navigationStrings.DOCUMANT_SCREEN}
    >
      <Stack.Screen
        name={navigationStrings.DOCUMANT_SCREEN}
        component={DocumentScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: (focused) => ({
    resizeMode: "contain",
    opacity: focused ? 1 : 0.6,
    tintColor: focused ? colors.appThemeColor : "grey",
  }),
});

export default BottomTabNavigator;
