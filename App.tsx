/**
 * Avanse Customer Mobile App
 * Main Application Entry Point
 *
 * @format
 */
import "react-native-get-random-values";
import "react-native-reanimated";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SplashScreen from "react-native-splash-screen";
import analytics from "@react-native-firebase/analytics";

// Services and Navigation
import Routes from "./app/navigation/Routes";
import { persistor, store } from "./app/services/redux/store";
import { requestUserPermission } from "./app/services/firebaseServices/NotificationServices";
import NotificationSetup from "./app/services/firebaseServices/NotificationSetup";

// Components
import SessionTimeoutHandler from "./app/components/common/SessionTimeoutHandler";

// Security
import { freeRaspManager } from "./app/security/FreeRaspManager";
import { useAppStateMonitoring } from "./app/utils/appState/useAppState";
import { disableMpinAuth, enableBiometricAuth, isBiometricEnabled, isMpinEnabled } from "./app/screens/auth/mpinBiometric/BiometricUtils";
import { clearAsyncStoreAndReduxStore } from "./app/utils/storageUtils";
import { checkConnectivity } from "./app/services/api/apiClient/apiClient";
import { hideNoInternetModal, showNoInternetModal } from "./app/services/redux/slices/networkSlice";
import { AppState, AppStateStatus, InteractionManager, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import postsServices from "./app/services/api/service/postsService";
import { getDeviceUniqueId } from "./app/utils/helpers";
import { decrypt, encrypt } from "./app/utils/crypto";
import service from "./app/services/api/service";
import { setMpinData, setOtpVerifyUsersData, setUserProfileData } from "./app/services/redux/slices/authSlice";
import navigationStrings from "./app/constant/navigationStrings";
import {
  clearStatusPopup,
  setStatusPopup,
} from "./app/services/redux/slices/statusPopupSlice";
import * as NavigationService from "./app/navigation/NavigationService";

const AppContent = () => {
  //  Initialize global app state monitoring
  useAppStateMonitoring();
  const dispatch = useDispatch();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  // Tracks whether the user has reached Welcome/BiometricMpinLogin or any inner screen.
  // Once true, version check should NOT be triggered on foreground transitions.
  const hasReachedAppScreens = useRef(false);
  // The Android notification permission dialog pauses/resumes the activity
  // (AppState background -> active), which would re-trigger the version check
  // while the launch check is still in flight.
  const isVersionCheckInProgress = useRef(false);

  const resetUIState = () => {
    store.dispatch(hideNoInternetModal());
    dispatch(clearStatusPopup());
  };

  useLayoutEffect(() => {
    resetUIState();
  }, [dispatch]);

  useEffect(() => {
    // Initialize app with security considerations
    const initializeApp = async () => {
      await analytics().setUserId(null);
      await analytics().resetAnalyticsData();


      try {
        // 🔒 Initialize FreeRASP security monitoring FIRST (highest priority)
        await freeRaspManager.initialize();

        // Case 1: cold start → active
        checkForVersionUpdate();

        // Hide splash screen after 3 seconds to allow security checks to complete
        //setTimeout(() => {
          //SplashScreen.hide();
        //}, 3000); // Increased to 3 seconds for better security detection

        // Request notification permission
        requestUserPermission();
      } catch (error) {
        //console.error('Failed to initialize app security:', error);
        // Still hide splash screen even if security fails

        setTimeout(() => {
          SplashScreen.hide();
        }, 3000);
      }
    };

    initializeApp();
  }, []);

  // Case 2 & 3: background/inactive → active (recent apps or returning from phone call/other app)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          (appStateRef.current === 'background' || appStateRef.current === 'inactive') &&
          nextAppState === 'active' &&
          !hasReachedAppScreens.current
        ) {
          checkForVersionUpdate();
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, []);


  const checkForVersionUpdate = async () => {
    if (isVersionCheckInProgress.current) {
      return;
    }
    isVersionCheckInProgress.current = true;

    //clear any existing version update check modals or status popups to avoid stacking issues
    resetUIState();

    try {
      // clear Redux store and AsyncStorage on app launch to ensure a clean state (especially important for security and session management)
      await clearAsyncStoreAndReduxStore();

      const isConnected = await checkConnectivity();
      if (!isConnected) {
        if (Platform.OS === "ios") {
          SplashScreen.hide();
        } 
        store.dispatch(showNoInternetModal());
        return;
      }

      const payload = {
        env: "prod", // uat preprod prod
        platform: Platform.OS === "ios" ? "IOS" : "Android", //UAT: Ios || Pre-prod: IOS || Prod: IOS
        app_version: DeviceInfo.getVersion(),
      };

      const response = await postsServices.secureAddPost(
        "api/v1/version/check",
        payload
      );
      const forceUpdate = response?.data?.data?.force_update;

      if (forceUpdate) {
        // Pass appStoreUrl string to Redux
        if (Platform.OS === "ios") {
          SplashScreen.hide();
          dispatch(
            showNoInternetModal({
              showUpdate: true,
              appStoreUrl: response?.data?.data?.url || null,
            }),
          );
        } else {
          dispatch(
            showNoInternetModal({
              showUpdate: true,
              appStoreUrl: response?.data?.data?.url || null,
            }),
          );
        }
      } else {
        await fetchMpinData();
      }
    } catch (error) {
      if (Platform.OS === "ios") {
        SplashScreen.hide();
      }
      dispatch(setStatusPopup({ status: "Error", message: error }));
      //setIsLoading(false);
    } finally {
      isVersionCheckInProgress.current = false;
    }
  };

  const fetchMpinData = async () => {
    const deviceId = await getDeviceUniqueId();
    const payload = {
      deviceId: encrypt(deviceId),
    };

    try {
      const res = await service?.auth?.secureGetMpinDetail(payload);
      const mpinData = res?.data?.data;

      if (
        decrypt(mpinData?.deviceId) == deviceId &&
        ((mpinData?.cifNumber != null && mpinData?.cifNumber !== "") ||
          (mpinData?.phoneNumber != null && mpinData?.phoneNumber !== ""))
      ) {
        if (mpinData?.biometricEnabled) {
          await enableBiometricAuth();
        }

        dispatch(setMpinData(mpinData));

        const otpVerifyUsersData = [
          {
            cifEntity: "",
            cifNumber: mpinData?.cifNumber,
            email: mpinData?.email || "",
            fullName: mpinData?.fullName || "",
            id: mpinData?.userId || "",
            isOtpVerified: mpinData?.isOtpVerified,
            isVerified: mpinData?.isVerified,
            name: mpinData?.name || "",
            phoneNumber: mpinData?.phoneNumber || "",
            profileImage: mpinData?.profileImage || "",
          },
        ];

        dispatch(setOtpVerifyUsersData(otpVerifyUsersData));
        dispatch(setUserProfileData(otpVerifyUsersData[0]));
      }

      const mpinEnabled = await isMpinEnabled();
      if (mpinEnabled && mpinData != null) {
        NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
      } else {
        await disableMpinAuth();
        // On Android the navigator boots directly on WelcomeScreen (the Splash
        // route is iOS-only), so resetting to it again visibly remounts the
        // screen the user is already on.
        const currentRouteName =
          NavigationService.navigationRef.getCurrentRoute()?.name;
        if (currentRouteName !== navigationStrings.WELCOME_SCREEN) {
          NavigationService.resetTo(navigationStrings.WELCOME_SCREEN);
        }
      }
      hasReachedAppScreens.current = true;
      InteractionManager.runAfterInteractions(() => {
        SplashScreen.hide();
      });
    } catch (error) {
      const errorMessage =
        typeof error === "string" ? error : "An error occurred";
      let isConnected = await checkConnectivity();
      if (isConnected) {
        if (Platform.OS === "ios") {
          SplashScreen.hide();
        }
        dispatch(
          setStatusPopup({
            status: "error",
            message: errorMessage,
            showLeftCross: false,
            onPositivePress: () => {
              dispatch(clearStatusPopup());
            },
          }),
        );
      }
    } finally {
      //setIsLoading(false);
    }
  };

  return (
    <PersistGate loading={null} persistor={persistor}>
      <>
        <NotificationSetup />
        <Routes />
        <SessionTimeoutHandler />
      </>
    </PersistGate>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
