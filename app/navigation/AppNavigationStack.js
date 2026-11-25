import * as React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import navigationStrings from "../constant/navigationStrings";
import BottomTabNavigator from "./BottomTabNavigator";

import {
  Splash,
  WelcomeScreen,
  Login,
  Otp,
  Cif,
  LoginType,
  ForgotPassword,
  DashboardScreen,
  Password,
  PasswordCreated,
  DisbursementHistory,
  LoanListScreen,
  UserProfileScreen,
  RequestForDisbursement,
  AccountSummaryTerm,
  WebViewScreen,
  SessionTimeout,
  PdfScreen,
  PaymentScreen,
  PaymentDetailPage,
  OverdueLoanRequest,
  PartPaymentRequest,
  DisbursementFormTerm,
  NotificationScreen,
  CreateResetMpin,
  BiometricMpinLogin,
  MpinUpdatedSuccessScreen,
  NewApplicationScreen,
  ExistingApplication,
  AwsForm,
} from "../screens";
import DisbursementDetail from "../screens/disbursement/DisbursementDetail";
import DrawerWebViewScreen from "../screens/webview/DrawerWebViewScreen";
import NoLoansFound from "../screens/dashboard/NoLoansFound";
import ThankYouScreen from "../screens/auth/thankYou/ThankYouScreen";
import { Platform } from "react-native";
import Register from "../screens/auth/register/Register";
const Stack = createNativeStackNavigator();

export default function AppNavigationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {Platform.OS === "ios" && (
        <Stack.Screen name={navigationStrings.SPLASH} component={Splash} />
      )}
      {/* <Stack.Screen name={navigationStrings.SPLASH} component={Splash} /> */}
      {/* <Stack.Screen
        name={navigationStrings.WELCOME_SCREEN}
        component={WelcomeScreen}
      /> */}
      <Stack.Screen name={navigationStrings.LOGIN} component={Login} />
      <Stack.Screen name={navigationStrings.REGISTER} component={Register} />
      <Stack.Screen name={navigationStrings.OTP} component={Otp} />
      <Stack.Screen name={navigationStrings.PASSWORD} component={Password} />
      <Stack.Screen name={navigationStrings.CIF} component={Cif} />
      <Stack.Screen name={navigationStrings.LOGIN_TYPE} component={LoginType} />
      <Stack.Screen
        name={navigationStrings.FORGOTPASSWORD}
        component={ForgotPassword}
      />
      <Stack.Screen name={"ThankYouScreen"} component={ThankYouScreen} />
      <Stack.Screen
        name={"DisbursementHistory"}
        component={DisbursementHistory}
      />
      {/* DisbursementHistory */}
      <Stack.Screen
        name={navigationStrings.DASHBOARD_SCREEN}
        component={BottomTabNavigator}
      />
      <Stack.Screen
        name={navigationStrings.NEW_APPLICATION_SCREEN}
        component={NewApplicationScreen}
      />
      <Stack.Screen
        name={navigationStrings.PASSWORD_CREATED}
        component={PasswordCreated}
      />
      <Stack.Screen
        name={navigationStrings.LOAN_LIST_SCREEN}
        component={LoanListScreen}
      />
      <Stack.Screen
        name={navigationStrings.USER_PROFILE_SCREEN}
        component={UserProfileScreen}
      />
      <Stack.Screen
        name={navigationStrings.REQUEST_FOR_DISBURSEMENT}
        component={RequestForDisbursement}
      />
      <Stack.Screen
        name={navigationStrings.DISBURSEMENT_FORM_TERM}
        component={DisbursementFormTerm}
      />
      <Stack.Screen
        name={navigationStrings.DISBURSEMENT_DETAIL}
        component={DisbursementDetail}
      />
      <Stack.Screen
        name={navigationStrings.ACCOUNT_SUMMARY_TERM}
        component={AccountSummaryTerm}
      />
      <Stack.Screen
        name={navigationStrings.WEB_VIEW_SCREEN}
        component={WebViewScreen}
      />
      <Stack.Screen
        name={navigationStrings.SESSION_TIMEOUT}
        component={SessionTimeout}
      />

      <Stack.Screen name={navigationStrings.PDF_SCREEN} component={PdfScreen} />
      <Stack.Screen
        name={navigationStrings.PAYMENT_SCREEN}
        component={PaymentScreen}
      />
      <Stack.Screen
        name={navigationStrings.PAYMENT_STATUS}
        component={PaymentDetailPage}
      />

      <Stack.Screen
        name={navigationStrings.OVERDUE_LOAN_REQUEST}
        component={OverdueLoanRequest}
      />
      <Stack.Screen
        name={navigationStrings.PART_PAYMENT_REQUEST}
        component={PartPaymentRequest}
      />
      <Stack.Screen
        name={navigationStrings.NOTIFICATION_SCREEN}
        component={NotificationScreen}
      />

      <Stack.Screen
        name={navigationStrings.CREATE_RESET_MPIN_SCREEN}
        component={CreateResetMpin}
      />

      <Stack.Screen
        name={navigationStrings.BIOMETRIC_MPIN_LOGIN}
        component={BiometricMpinLogin}
      />
      <Stack.Screen
        name={navigationStrings.MPIN_UPDATED_SUCCESS_SCREEN}
        component={MpinUpdatedSuccessScreen}
      />
      <Stack.Screen
        name={navigationStrings.EXISTING_APPLICATION_SCREEN}
        component={ExistingApplication}
      />
      <Stack.Screen
        name={navigationStrings.DRAWER_WEB_VIEW_SCREEN}
        component={DrawerWebViewScreen}
      />
      <Stack.Screen
        name={navigationStrings.NO_LOANS_SCREEN}
        component={NoLoansFound}
      />
      <Stack.Screen name={navigationStrings.AWS_FORM} component={AwsForm} />
    </Stack.Navigator>
  );
}
