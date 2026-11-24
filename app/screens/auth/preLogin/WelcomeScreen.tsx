// src/screens/WelcomeScreen.tsx
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  Platform,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import imagePath from "../../../constant/imagePath";
import colors from "../../../res/colors";
import strings from "../../../res/strings";
import fonts from "../../../res/fonts";
import { clearAsyncStoreAndReduxStore } from "../../../utils/storageUtils";
import DeviceInfo from "react-native-device-info";
import postsServices from "../../../services/api/service/postsService";
import { useDispatch } from "react-redux";
import {
  clearStatusPopup,
  setStatusPopup,
} from "../../../services/redux/slices/statusPopupSlice";
import { store } from "../../../services/redux/store";
import {
  hideNoInternetModal,
  showNoInternetModal,
} from "../../../services/redux/slices/networkSlice";
import LoaderView from "../../../components/common/LoaderView";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { createModuleLogger } from "../../../utils/logger";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import firebaseRemoteConfigService from "../../../services/firebaseRemoteConfigService";
import { enableBiometricAuth, isBiometricEnabled } from "../mpinBiometric/BiometricUtils";
import { getDeviceUniqueId } from "../../../utils/helpers";
import { decrypt, encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { setMpinData, setOtpVerifyUsersData, setUserProfileData } from "../../../services/redux/slices/authSlice";
import AppStyleButton from "../../../components/common/AppStyleButton";

const features = [
  { icon: imagePath.fillLoanApplication, text: "Fill Loan Application" },
  { icon: imagePath.trackApplicationStatus, text: "Track Application Status" },
  { icon: imagePath.viewLoanDetails, text: "View Loan Details" },
  { icon: imagePath.makePayment, text: "Make Payment" },
  { icon: imagePath.trancheDisbursement, text: "Tranche Disbursement" },
  { icon: imagePath.loanDocuments, text: "Loan Documents" },
];

const WelcomeScreen = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const logger = createModuleLogger("WelcomeScreen");
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isSmallScreen = screenWidth < 400;

  useLayoutEffect(() => {
    logger.info("WelcomeScreen mounted");
    store.dispatch(hideNoInternetModal());
    dispatch(clearStatusPopup());
    // Initialize and fetch remote config
    //initializeRemoteConfig();
  }, [dispatch]);

  const initializeRemoteConfig = async () => {
    
    try {
      logger.info("Initializing Firebase Remote Config");
      // Fetch and activate remote config
      const fetchSuccess = await firebaseRemoteConfigService.fetchAndActivate();
      if (fetchSuccess) {
        logger.info("Remote config fetched successfully");
      } else {
        logger.info("Using cached remote config values");
      }

      // Log the remote_cif value
      const remoteCif = firebaseRemoteConfigService.getString("remote_cif");

      logger.info("Remote Config Values:", remoteCif);
    } catch (error) {
      logger.error("Failed to initialize remote config:", error);
      // Don't block the app, continue with default values
    }
  };

  useEffect(() => {
    if (DeviceInfo.isTablet() && Platform.OS === "android") {
      showTabPopup(strings.tablet_not_supported);
    }
  }, []);

  const handleTabPopupPositivePress = async () => {
    dispatch(clearStatusPopup());
    setTimeout(() => {
      BackHandler.exitApp();
    }, 200);
  };

  const showTabPopup = (message: string) => {
    // Show a popup for tablet users
    setTimeout(() => {
      dispatch(
        setStatusPopup({
          status: "Error",
          title: strings.unsupported_device,
          message: message,
          showLeftCross: false,
          positiveButtonText: strings.exit,
          onPositivePress: handleTabPopupPositivePress,
        })
      );
    }, 500);
  };

  const handleProceed = async () => {

    NavigationService.navigate(navigationStrings.LOGIN);
    if (true) return;
    
    
    const biometricEnabled = await isBiometricEnabled();
    await clearAsyncStoreAndReduxStore();
    if (biometricEnabled) {
      await enableBiometricAuth();
    }

    setIsLoading(true);

    try {
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        store.dispatch(showNoInternetModal());
        return;
      }

      const payload = {
        env: "prod", // uat preprod prod
        platform: Platform.OS === "ios" ? "Ios" : "Android",
        app_version: DeviceInfo.getVersion(),
      };

      const response = await postsServices.secureAddPost(
        "api/v1/version/check",
        payload
      );
      const forceUpdate = response?.data?.data?.force_update;

      if (forceUpdate) {
        const biometricEnabled = await isBiometricEnabled();
        await clearAsyncStoreAndReduxStore();
        if (biometricEnabled) {
          await enableBiometricAuth();
        }
        // Pass appStoreUrl string to Redux
        dispatch(
          showNoInternetModal({
            showUpdate: true,
            appStoreUrl: response?.data?.data?.url || null,
          }),
        );
      } else {
        checkForBiometricLogin();
      }
    } catch (error) {
      dispatch(setStatusPopup({ status: "Error", message: error }));
      setIsLoading(false);
    } finally {
      //setIsLoading(false);
    }
  };

  const checkForBiometricLogin = async () => {
    //logger.debug('Cif Number >>>>> ', decrypt('U2FsdGVkX18ySIPNv++q510q3+qpT42X0cNZu56nV9Q='))
    //API Calling
    const deviceId = await getDeviceUniqueId();
    const payload = {
      deviceId: encrypt(deviceId),
    };

    try {
      const res = await service?.auth?.secureGetMpinDetail(payload);
      const mpinData = res?.data?.data;
      
      if (
        decrypt(mpinData?.deviceId) == deviceId &&
        (
          (mpinData?.cifNumber != null &&mpinData?.cifNumber !== "") || 
          (mpinData?.phoneNumber != null && mpinData?.phoneNumber !== "")
        )
      ) {
        if (mpinData?.biometricEnabled) {
          await enableBiometricAuth();
        }
        dispatch(setMpinData(mpinData));

        const otpVerifyUsersData = [{
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
        }]

        dispatch(setOtpVerifyUsersData(otpVerifyUsersData));
        dispatch(setUserProfileData(otpVerifyUsersData[0]));
        NavigationService.navigate(navigationStrings.BIOMETRIC_MPIN_LOGIN);
      } else {
        NavigationService.navigate(navigationStrings.LOGIN);
      }
    } catch (error) {
      const errorMessage =
        typeof error === "string" ? error : "An error occurred";
      let isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "error",
            message: errorMessage,
            showLeftCross: false,
            onPositivePress: () => {
              dispatch(clearStatusPopup());
            },
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.welcomeBgColor} barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Image
            source={imagePath.avanseLogo1}
            style={{  }}
          />
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <Text style={styles.heading}>
            {/* {strings.get_ready_to_revolutionize} */}
            {"One app for your entire loan journey"}
          </Text>

          <Text style={styles.subHeading}>
            {/* {strings.get_ready_to_revolutionize} */}
            From application to final payment — apply, track, disburse and repay.
          </Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View key={feature.text} style={styles.featureItem}>
                <Image source={feature.icon} style={styles.iconStyle} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.imageStyle}>
          <Image source={imagePath.avansePreLogin} style={styles.bannerImage} />
        </View>
      </View>
      <View style={{ paddingBottom: 24, marginHorizontal: 20 }}>
        <AppStyleButton
          title={strings.login_to_manage_loan}
          fontFamily={fonts.bold}
          onPress={handleProceed}
          textColor="#1F2233"
          btnHeight={54}
          btnStyle = {{backgroundColor: "rgb(254,195,69)"}}
          imageNeeded={false}
          isDisabled={false}
        />
      </View>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default WelcomeScreen;
