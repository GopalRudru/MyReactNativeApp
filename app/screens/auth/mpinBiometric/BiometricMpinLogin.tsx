import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import colors from "../../../res/colors";
import strings from "../../../res/strings";
import fonts from "../../../res/fonts";
import { moderateScale, scale } from "react-native-size-matters";
import imagePath from "../../../constant/imagePath";
import {
  getDeviceInfo,
  getDeviceName,
  getDeviceUniqueId,
  getFmcToken,
  maskCifNumber,
  maskEmailOrMobile,
  SCREEN_NAME,
} from "../../../utils/helpers";
import { OtpInput } from "react-native-otp-entry";
import logger from "../../../utils/logger";
import AppConstants from "../../../constant/AppConstants";
import navigationStrings from "../../../constant/navigationStrings";
import * as NavigationService from "../../../navigation/NavigationService";
import {
  authenticateWithBiometrics,
  BiometricUnavailableReason,
  checkBiometricAvailability,
  disableBiometricAuth,
  disableBiometricLock,
  enableBiometricAuth,
  enableBiometricLock,
  isBiometricLockEnabled,
} from "./BiometricUtils";
import {
  authSelector,
  clearMpin,
  clearPassword,
  setMpin,
  setMpinData,
  setOtpVerifyUsersData,
  setUserAuth,
  setUserBusinessType,
  setUserLoanCategory,
  setUserPermission,
  setUserProfileData,
} from "../../../services/redux/slices/authSlice";
import { useSelector } from "react-redux";
import { BiometryTypes } from "react-native-biometrics";
import { decrypt, encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { useDispatch } from "react-redux";
import { setStatusPopup, clearStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import LoaderView from "../../../components/common/LoaderView";
import { IS_LOGGED_IN, setItem } from "../../../utils/storageUtils";
import BioMetricBottomSheet from "../../../components/BioMetricBottomSheet";
import {
  setOtpUserData,
} from "../../../services/redux/slices/authSlice";
import SuccessBottomSheet from "../../../components/common/SuccessBottomSheet";
import BiometricLockBottomSheet from "../../../components/BiometricLockBottomSheet";
import { setTabType } from "../../../services/redux/slices/tabsSlice";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";


const { width: screenWidth } = Dimensions.get("window");
const MPIN_LENGTH = 6;
const SPACING_BETWEEN_INPUTS = 16;
const PADDING = 20;
const totalSpacing = (MPIN_LENGTH - 1) * SPACING_BETWEEN_INPUTS;
const availableWidth = screenWidth - PADDING * 2 - totalSpacing;
const mpinInputWidth = availableWidth / MPIN_LENGTH;
const { width, height } = Dimensions.get("window");

const BiometricMpinLogin = () => {
  const { mpinData: mpinDataFromStore } = useSelector(authSelector);

  // Cache mpinData in a ref so it survives Redux being cleared
  // (e.g. when LOGIN screen calls clearAsyncStoreAndReduxStore on mount)
  const mpinDataRef = React.useRef<any>(mpinDataFromStore);
  useEffect(() => {
    if (mpinDataFromStore != null) {
      mpinDataRef.current = mpinDataFromStore;
    }
  }, [mpinDataFromStore]);
  
  const mpinData = mpinDataRef.current;

  const [biometricSupported, setBiometricSupported] = useState(true);
  const [biometricEnrolled, setBiometricEnrolled] = useState(true);
  const [biometricLocked, setBiometricLocked] = useState(false);

  const [available, setAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricBtnText, setBiometricBtnText] = useState("");
  const [showBioMetricSheet, setShowBioMetricSheet] = React.useState(false);
  const mpinRef = useRef<any>(null);
  const [successBottomSheetVisible, setSuccessBottomSheetVisible] = useState(false);
  const [successBottomSheetMessage, setSuccessBottomSheetMessage] = useState("");
  let retryCountRef = useRef(0);
  const MAX_RETRY = 1;
  const [showBiometricLockSheet, setShowBiometricLockSheet] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  // Re-check biometric availability whenever the app returns to the foreground.
  // This handles the case where the user unlocked their device with a passcode
  // (clearing the biometric lockout) while the app was in the background.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkBiometric();
      }
    });
    return () => subscription.remove();
  }, []);

  const checkBiometric = async () => {
    const { available, biometryType, unavailableReason } =
      await checkBiometricAvailability();
    setAvailable(available);
    setBiometryType(biometryType);
    setUnavailableReason(unavailableReason);

    biometricButtonText(
      available,
      biometryType,
      mpinDataRef.current?.biometricEnabled ?? false,
      unavailableReason,
    );

    if (!available && unavailableReason !== null) {
      if (unavailableReason === BiometricUnavailableReason.NO_HARDWARE) {
        setBiometricSupported(false);
      } else if (
        unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
      ) {
        setBiometricEnrolled(false);
      } else if (
        unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
      ) {
        setBiometricSupported(true);
      } else if (
        unavailableReason === BiometricUnavailableReason.BIOMETRIC_LOCKED
      ) {
        setBiometricLocked(true);
      } else {
        //setShowBioMetricSheet(true);
      }
    }
  };

  // Proceed to login with MPIN
  const handleChangeText = (mpin: string) => {
    if (mpin.length === MPIN_LENGTH) {
      Keyboard.dismiss();
      proceedToMpinLogin(mpin)
    }
  };

  const proceedToMpinLogin = async (mpin: string = "") => {
    setIsLoading(true);
    const deviceId = await getDeviceUniqueId();

    let cifNumberValue = "";
    if ( mpinData?.cifNumber) {
      cifNumberValue =  mpinData?.cifNumber;
    } else if (mpinData?.email && mpinData?.phoneNumber) {
      cifNumberValue = mpinData?.phoneNumber;
    }

    const payload = {
      cifNumber: cifNumberValue,
      deviceId: encrypt(deviceId),
      ...(mpin !== "" && { mpin: encrypt(mpin) }),
      userId: mpinData?.userId,
      authType: mpin !== "" ? "MPIN" : "BIOMETRIC",
      ...(mpin == "" && {
              subAuthType: biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",
            })
    };

    try {
      const response = await service?.auth?.secureUserLoginV2(payload);

      if (!response?.data?.data) {
        throw new Error("Invalid login response structure");
      }

      const businessObj = response?.data?.data?.business_type;

      if (!businessObj || !Array.isArray(businessObj)) {
        throw new Error("Invalid business type data received");
      }

      if (businessObj.length > 1) {
        dispatch(setUserBusinessType(businessObj));
        //dispatch(setPassword(password));
        dispatch(clearPassword())
        dispatch(setMpin(encrypt(mpin)));
        NavigationService.navigate(navigationStrings.LOGIN_TYPE);
        await disableBiometricLock();
      } else {
        await userLoginSingleLoanType(businessObj[0], mpin);
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
              mpinRef.current?.clear();
            },
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userLoginSingleLoanType = async (businessType: any, mpin: string) => {
    try {
      const deviceId = await getDeviceUniqueId();
      const deviceName = await getDeviceName();
      const deviceInfo = getDeviceInfo();
      const fmcToken = await getFmcToken();

      const payload = {
        businessId: encrypt(businessType?.id?.toString()),
        id: mpinData?.userId,
        ...(mpin !== "" && { mpin: encrypt(mpin) }),
        cifNumber: mpinData?.cifNumber,
        deviceId: encrypt(deviceId),
        authType: mpin !== "" ? "MPIN" : "BIOMETRIC",
        ...(mpin == "" && {
              subAuthType: biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",
            }),

        token: fmcToken,
        deviceInfo: deviceInfo,
        deviceName: deviceName,
      };

      const response = await service?.auth?.secureSetLoginV2(payload);

      const token = response?.data?.data?.token;
      const permissionObj = response?.data?.data?.permission;
      const loanCategoryObj = response?.data?.data?.result;

      dispatch(setUserAuth(encrypt(token)));
      dispatch(setUserPermission(permissionObj));
      dispatch(setUserBusinessType(businessType));
      dispatch(setUserLoanCategory(loanCategoryObj));
      dispatch(clearMpin());

      if (
        loanCategoryObj?.Flexi?.length > 0 &&
        loanCategoryObj?.TermLoan?.length > 0
      ) {
        dispatch(setTabType("Term Loan"));
      } else {
        if (
          businessType?.name === "entity" &&
          loanCategoryObj?.Flexi?.length <= 0
        ) {
          dispatch(setTabType("Term Loan"));
        } else if (businessType?.name === "entity") {
          dispatch(setTabType("Flexi Term Loan"));
        } else if (businessType?.name === "retail") {
          dispatch(setTabType("Term Loan"));
        } else {
          dispatch(setTabType("Term Loan"));
        }
      }

      setIsLoading(false);
      setItem(IS_LOGGED_IN, true);
      NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
      await disableBiometricLock();
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error;
      dispatch(
        setStatusPopup({
          status: "Error",
          message: errorMessage,
          showLeftCross: false,
          onPositivePress: () => {
            dispatch(clearStatusPopup());
            mpinRef.current?.clear();
          },
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirstBiometricEnabledOrNotEnabled = async () => {
    const isAlreadyEnabled =
      mpinData?.biometricEnabled &&
      (biometryType === BiometryTypes.FaceID
        ? mpinData?.isFaceIdActive
        : mpinData?.isFingerPrintActive);

    //await enableBiometricAuth();
    // Prompt text varies by flow (login vs enable) and biometry type
    // Works for all types: FaceID (iOS), TouchID (iOS), Biometrics (Android)
    const promptMessage =
      biometryType === BiometryTypes.FaceID
        ? isAlreadyEnabled
          ? "Login with Face ID"
          : "Enable Face ID"
        : isAlreadyEnabled
        ? "Login with fingerprint"
        : "Enable fingerprint";

    const result = await authenticateWithBiometrics(promptMessage);

    if (!isAlreadyEnabled) {
      if (unavailableReason !== BiometricUnavailableReason.NOT_ENROLLED) {
        if (result.success) {
          retryCountRef.current = 0;
          registerBiometric();
          return;
        }
      }
    } else {
      if (result.success) {
          retryCountRef.current = 0;
          proceedToMpinLogin();
          return;
        }
    }

    // 🔹 Normalize message
    const message = (result.error || "").toLowerCase();

    const isCancel =
      message.includes("cancel") || message.includes("user canceled") || message.includes("User cancellation");

    const isLockout =
      result.isTooManyAttempts ||
      message.includes("too many attempts") ||
      message.includes("lockout") ||
      message.includes("locked");

    const isDenied =
      message.includes("denied") || message.includes("user has denied");

    logger.debug("Biometric authentication failed.", {
      error: result.error,
      isLockout,
      isDenied,
    });

    // 🔹 Ignore cancel
    if (isCancel) {
      return;
    }

    // 🔹 Permission denied → direct user to Settings
    if (isDenied) {
      await checkBiometric();
      setShowBioMetricSheet(true)
      setBiometricBtnText(strings.enable_biometric);
      return;
    }

    retryCountRef.current += 1;

    // 🔹 Lockout → immediate fallback
    if (isLockout) {
      //retryCountRef.current = 0;
      // dispatch(
      //   setStatusPopup({
      //     status: "Error",
      //     message: "Too many failed attempts. Please use your MPIN to log in.",
      //     showLeftCross: false,
      //     onPositivePress: () => {
      //       dispatch(clearStatusPopup());
      //     },
      //   }),
      // );
      setShowBiometricLockSheet(true);
      await enableBiometricLock();
      return;
    }
  };


  const proceedWithBiometric = async () => {
    // Biometry locked out at OS level (too many failed attempts on sensor check)
    // if (biometricLocked || unavailableReason === BiometricUnavailableReason.BIOMETRIC_LOCKED) {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       message: "Biometrics is locked due to too many failed attempts. Please use your MPIN to log in.",
    //       showLeftCross: false,
    //       onPositivePress: () => {
    //         dispatch(clearStatusPopup());
    //       },
    //     }),
    //   );
    //   return;
    // }
    Keyboard.dismiss();

    if (Platform.OS === "ios") {
      checkFirstBiometricEnabledOrNotEnabled();
    } else {
      if (!available) {
        // dispatch(
        //   setStatusPopup({
        //     status: "Error",
        //     message:
        //       "We couldn't verify your biometrics. Please use your MPIN to log in.",
        //     showLeftCross: false,
        //     onPositivePress: () => {
        //       dispatch(clearStatusPopup());
        //     },
        //   }),
        // );
        return;
      }

      const isAlreadyEnabled =
        mpinData?.biometricEnabled &&
        (biometryType === BiometryTypes.FaceID
          ? mpinData?.isFaceIdActive
          : mpinData?.isFingerPrintActive);

      if (!isAlreadyEnabled) {
        if (unavailableReason !== BiometricUnavailableReason.NOT_ENROLLED) {
          //await enableBiometricAuth();
          registerBiometric();
          return;
        }
      }

      if (
        retryCountRef.current >= MAX_RETRY ||
        (await isBiometricLockEnabled())
      ) {
        //retryCountRef.current = 0;

        dispatch(
          setStatusPopup({
            status: "Error",
            message:
              "We couldn't verify your biometrics. Please use your MPIN to log in.",
            showLeftCross: false,
            onPositivePress: () => {
              dispatch(clearStatusPopup());
            },
          }),
        );

        return;
      }

      // Prompt text varies by flow (login vs enable) and biometry type
      // Works for all types: FaceID (iOS), TouchID (iOS), Biometrics (Android)
      const promptMessage =
        biometryType === BiometryTypes.FaceID
          ? isAlreadyEnabled
            ? "Login with Face ID"
            : "Enable Face ID"
          : isAlreadyEnabled
          ? "Login with fingerprint"
          : "Enable fingerprint";

      const result = await authenticateWithBiometrics(promptMessage);

      if (result.success) {
        retryCountRef.current = 0;
        if (isAlreadyEnabled) {
          proceedToMpinLogin();
        }
        return;
      }

      // 🔹 Normalize message
      const message = (result.error || "").toLowerCase();

      const isCancel =
        message.includes("cancel") || message.includes("user canceled");

      const isLockout =
        result.isTooManyAttempts ||
        message.includes("too many attempts") ||
        message.includes("lockout") ||
        message.includes("locked");

      logger.debug("Biometric authentication failed.", {
        error: result.error,
        isLockout,
      });

      // 🔹 Ignore cancel
      if (isCancel) {
        return;
      }

      retryCountRef.current += 1;

      // 🔹 Lockout → immediate fallback
      if (isLockout) {
        //retryCountRef.current = 0;

        dispatch(
          setStatusPopup({
            status: "Error",
            message:
              "Too many failed attempts. Please use your MPIN to log in.",
            showLeftCross: false,
            onPositivePress: () => {
              dispatch(clearStatusPopup());
            },
          }),
        );
        await enableBiometricLock();
        return;
      }
    }
  };

  const registerBiometric = async () => {
    Keyboard.dismiss();
    setIsLoading(true);

    let cifNumberValue = mpinData?.cifNumber || mpinData?.phoneNumber || "";
    const deviceId = await getDeviceUniqueId();
    // for now passing true because we are allowing biometric registration from login screen 
    // even if biometric is not enrolled. In that case user will be prompted to enroll biometrics 
    // and then proceed with registration. This is being done to provide a 
    // smoother experience to users whose devices support biometrics but do not have it set up yet. 
    // We can remove this flexibility in future if needed and only allow registration when biometrics are enrolled.
    const biometricEnabled = true;//await isBiometricEnabled();

    const payload = {
      userId: mpinData?.userId,
      cifNumber: cifNumberValue,
      deviceId: encrypt(deviceId),
      authType: "BIOMETRIC",
      ...(biometricEnabled && {
        subAuthType:
          biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",
      }),
      biometricEnabled: biometricEnabled,
    };

    try {
      const res = await service?.auth?.secureCreateMpin(payload);
      const createMpinData = res?.data?.data;
      //await enableBiometricAuth();
      fetchBiometricDetails();
    } catch (error) {
      setIsLoading(false);
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
          }),
        );
      }
      disableBiometricAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBiometricDetails = async () => {
    if (!isLoading) {
      setIsLoading(true);
    }
   
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
        ((mpinData?.cifNumber != null && mpinData?.cifNumber !== "") || (mpinData?.phoneNumber != null && mpinData?.phoneNumber !== ""))
      ) {
        if (mpinData?.biometricEnabled) {
          await enableBiometricAuth();
        }
        dispatch(setMpinData(mpinData));
        mpinDataRef.current = mpinData;

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

        biometricButtonText(available, biometryType, mpinData?.biometricEnabled ?? false, unavailableReason);

        let successMessage = "";
        if (biometryType === BiometryTypes.FaceID) {
          successMessage = "Face ID Enabled Successfully!";
        } else if (
          biometryType === BiometryTypes.TouchID ||
          biometryType === BiometryTypes.Biometrics
        ) {
          successMessage = "Fingerprint Enabled Successfully!";
        }
        setSuccessBottomSheetVisible(true);
        setSuccessBottomSheetMessage(successMessage);
        //setIsLoading(false);

        //proceedToMpinLogin();
      } 
    } catch (error) {
      setIsLoading(false);
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

  const forgotMpin = () => {
    sendOtp();
    // NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN, {
    //   isCreateMpin: false,
    // });
  };

  const sendOtp = async () => {
    Keyboard.dismiss();

    // await analytics().logEvent("Enter_CIF_Continue", {
    //   login_input: searchText,
    //   screen_name: "Login",
    // });

    let keyValue = "";
    const cifNumber = decrypt(mpinData?.cifNumber);
    const phoneNumber = decrypt(mpinData?.phoneNumber);
    if (
      mpinData != null &&
      cifNumber !== null &&
      cifNumber !== undefined &&
      cifNumber !== "" &&
      cifNumber?.length > 0
    ) {
      keyValue = mpinData?.cifNumber;
    } else if (
      mpinData != null &&
      phoneNumber !== null &&
      phoneNumber !== undefined &&
      phoneNumber !== "" &&
      phoneNumber?.length > 0
    ) {
      keyValue = mpinData?.phoneNumber;
    }

    setIsLoading(true);
    const payload = { key: keyValue };

    try {
      const res = await service?.auth?.secureSendUserOtp(payload);
      dispatch(setOtpUserData(res?.data?.data));
      NavigationService.navigate(navigationStrings.OTP, {
        isCreateMpin: false,
      });
    } catch (error: any) {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: error,
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const proceedAnotherCif = () => {
    Keyboard.dismiss();
    NavigationService.navigate(navigationStrings.LOGIN);
  }

  const biometricButtonIcon = () => {
    if (!available) {
      if (unavailableReason === BiometricUnavailableReason.BIOMETRIC_LOCKED) {
        if (biometryType === BiometryTypes.FaceID) {
            return imagePath.loginMpinFaceId;
          } else if (
            biometryType === BiometryTypes.Biometrics ||
            biometryType === BiometryTypes.TouchID
          ) {
            return imagePath.loginMpinFingerprint;
          } else {
            return imagePath.biometricLock;
          }
      } else if (unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED) {
        return  imagePath.biometricLock//Platform.OS === "ios" ? imagePath.loginMpinFaceId : imagePath.loginMpinFingerprint;
      } else {
        return imagePath.biometricLock;
      }
      return null;
    }

    if (biometryType === BiometryTypes.FaceID) {
      return imagePath.loginMpinFaceId;
    } else if (
      biometryType === BiometryTypes.Biometrics ||
      biometryType === BiometryTypes.TouchID
    ) {
      return imagePath.loginMpinFingerprint;
    }
  };

  const biometricButtonText = (
    isAvailable: boolean,
    type: string | null,
    biometricEnabled: boolean,
    reason: string | null,
  ) => {
    if (!isAvailable) {
      if (reason === BiometricUnavailableReason.BIOMETRIC_LOCKED) {
        if (type === BiometryTypes.FaceID) {
          setBiometricBtnText(strings.login_with_face_id);
        } else if (
          type === BiometryTypes.Biometrics ||
          type === BiometryTypes.TouchID
        ) {
          setBiometricBtnText(strings.login_with_fingerprint);
        } else {
          setBiometricBtnText("Login with Biometrics");
        }
      } else if (reason === BiometricUnavailableReason.PERMISSION_DENIED) {
        setBiometricBtnText(strings.enable_biometric);
      } else {
        setBiometricBtnText("Login with Biometrics");
      }
      return;
    }

    if (biometricEnabled) {
      if (type === BiometryTypes.FaceID) {
        setBiometricBtnText(strings.login_with_face_id);
      } else if (
        type === BiometryTypes.Biometrics ||
        type === BiometryTypes.TouchID
      ) {
        setBiometricBtnText(strings.login_with_fingerprint);
      }
    } else {
      if (type === BiometryTypes.FaceID) {
        setBiometricBtnText(strings.enable_face_id);
      } else if (
        type === BiometryTypes.Biometrics ||
        type === BiometryTypes.TouchID
      ) {
        setBiometricBtnText(strings.enable_fingerprint);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <BiometricLockBottomSheet
        visible={showBiometricLockSheet}
        onClose={() => {
          // setShowBiometricLockSheet(false);
          // onCreateMpinClick(true);
        }}
        enableBiometric={() => {
          setShowBiometricLockSheet(false);
          //onCreateMpinClick(true);
        }}
        fingerprintEnabled={false}
        title={"Biometrics Locked"}
        subTitle={
          "Biometrics are temporarily locked due to too many failed attempts. Please enter your 6-digit MPIN to log in."
        }
        image={imagePath.biometricLock}
        btnText={"Close"}
      />
      <BioMetricBottomSheet
        visible={showBioMetricSheet}
        onClose={() => {
          setShowBioMetricSheet(false);
        }}
        enableBiometric={async () => {
          setShowBioMetricSheet(false);
        }}
        fingerprintEnabled={biometryType !== BiometryTypes.FaceID}
        btnText="Close"
      />

      <SuccessBottomSheet
        isVisible={successBottomSheetVisible}
        setOpenBottomSheet={() => {
          setSuccessBottomSheetVisible(false);
          //fetchBiometricDetails();
        }}
        successMessage={successBottomSheetMessage}
        screenName={SCREEN_NAME.MPIN_LOGIN}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.scrollContentContainer}>
          <View style={{ backgroundColor: "transparent" }}>
            <Image
              source={imagePath?.avanseLogo}
              style={{
                alignSelf: "center",
                height: 40,
                marginBottom: 10,
              }}
            />

            <View style={styles.container}>
              <Text style={styles.titleTextStyle}>
                {strings.welcome_back + " " + mpinData?.name + " 👋"}
              </Text>
              <Text style={styles.subtitleTextStyle}>
                {strings.monitor_all_your_loan_accounts}
              </Text>

              {/* CIF User Container */}
              <View style={styles.cifContainerStyle}>
                <View style={[styles.iconContainer]}>
                  <Image
                    source={imagePath.cifUser}
                    style={[styles.optionContainerIcon]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cifTextStyle}>
                    {mpinData?.cifNumber !== null && mpinData?.cifNumber !== ""
                      ? "CIF " + maskCifNumber(decrypt(mpinData?.cifNumber))
                      : "MOBILE NO. " +
                        maskEmailOrMobile(decrypt(mpinData?.phoneNumber))}
                    {/* {"CIF " + decrypt(mpinData?.cifNumber)} */}
                  </Text>
                  <Text style={styles.emailTextStyle}>
                    {maskEmailOrMobile(decrypt(mpinData?.email))}
                  </Text>
                </View>
              </View>

              {/* Use different CIF */}
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={{ alignSelf: "flex-start" }}
                onPress={proceedAnotherCif}
              >
                <View style={styles.useDifferentCifContainer}>
                  <Text style={styles.useDifferentCifTextStyle}>
                    {strings.use_different_cif}
                  </Text>
                  <Image
                    source={imagePath.selectCifArrow}
                    style={styles.useDifferentCifArrow}
                  />
                </View>
              </TouchableOpacity>

              <Text style={styles.enterMpinTextStyle}>
                {strings.please_enter_your_6_digit_mpin}
              </Text>
              <View style={styles.mpinContainer}>
                <OtpInput
                  ref={mpinRef}
                  numberOfDigits={MPIN_LENGTH}
                  focusColor={colors.appThemeColor}
                  autoFocus={false}
                  hideStick={true}
                  disabled={false}
                  onFocus={() => {
                    //Keyboard.dismiss();
                    if (showBioMetricSheet) setShowBioMetricSheet(false);
                    if (showBiometricLockSheet)
                      setShowBiometricLockSheet(false);
                  }}
                  type="numeric"
                  secureTextEntry={true}
                  focusStickBlinkingDuration={500}
                  onTextChange={(text) => handleChangeText(text)}
                  onFilled={(text) => {
                    //logger.debug("MPIN input completed", { otp: text });
                  }}
                  textInputProps={{
                    accessibilityLabel: "One-Time Password",
                    textContentType: "oneTimeCode",
                    keyboardType: "number-pad",
                    caretHidden: true,
                  }}
                  theme={{
                    containerStyle: {
                      flexDirection: "row",
                      alignItems: "center",
                    },
                    pinCodeContainerStyle: {
                      width: mpinInputWidth,
                      height: mpinInputWidth,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#C4C4C4",
                      backgroundColor: colors.white,
                    },
                    pinCodeTextStyle: {
                      fontSize: 25,
                      fontFamily: fonts.regular,
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: colors.appThemeColor,
                    },
                  }}
                />
              </View>

              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.forgotMpinButtonStyle}
                onPress={forgotMpin}
              >
                <Text style={styles.forgotMpinTextStyle}>
                  {strings.forgot_mpin}
                </Text>
              </TouchableOpacity>

              {biometricSupported && !biometricEnrolled && (
                <>
                  <View style={styles.orViewStyle}>
                    <View style={styles.lineStyle} />
                    <Text
                      style={[
                        styles.useDifferentCifTextStyle,
                        { paddingHorizontal: 10 },
                      ]}
                    >
                      {strings.or}
                    </Text>
                    <View style={styles.lineStyle} />
                  </View>

                  <TouchableOpacity
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowBioMetricSheet(true);
                    }}
                    style={{ marginBottom: 10 }}
                  >
                    <View style={styles.biometricButtonContainer}>
                      <Image
                        source={imagePath.biometricLock}
                        style={styles.biometricButtonIcon}
                      />
                      <Text style={styles.biometricButtonText}>
                        Enable Biometrics
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {biometricSupported && biometricEnrolled && (
                <>
                  <View style={styles.orViewStyle}>
                    <View style={styles.lineStyle} />
                    <Text
                      style={[
                        styles.useDifferentCifTextStyle,
                        { paddingHorizontal: 10 },
                      ]}
                    >
                      {strings.or}
                    </Text>
                    <View style={styles.lineStyle} />
                  </View>

                  <TouchableOpacity
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={proceedWithBiometric}
                    style={{ marginBottom: 10 }}
                  >
                    <View style={styles.biometricButtonContainer}>
                      {true && (
                        <Image
                          source={biometricButtonIcon()}
                          style={styles.biometricButtonIcon}
                        />
                      )}

                      <Text style={styles.biometricButtonText}>
                        {biometricBtnText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <Image
            source={imagePath.avansePreLogin}
            style={styles.authImageStyle}
          />
        </View>
      </TouchableWithoutFeedback>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default BiometricMpinLogin;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cifContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.appThemeColor,
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  container: {
    backgroundColor: colors.colorMpinLoginBg,
    borderRadius: 16,
    padding: 20,
  },
  titleTextStyle: {
    fontSize: 18,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  subtitleTextStyle: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  iconContainer: {
    width: scale(33),
    height: scale(33),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
    marginLeft: moderateScale(0),
  },
  optionContainerIcon: {
    width: scale(33),
    height: scale(33),
  },
  cifTextStyle: {
    fontSize: 13,
    color: colors.cifTextColor,
    fontFamily: fonts.bold,
  },
  emailTextStyle: {
    fontSize: 13,
    color: colors.cifEmailTextColor,
    fontWeight: "400",
    fontFamily: fonts.regular,
  },
  useDifferentCifContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  useDifferentCifTextStyle: {
    fontSize: 12,
    color: colors.useDiffCifTextColor,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
  },
  useDifferentCifArrow: {
    alignSelf: "center",
    marginLeft: 4,
  },
  enterMpinTextStyle: {
    fontSize: 16,
    color: colors.mpinTextColor,
    fontFamily: fonts.regular,
    marginTop: 20,
  },
  mpinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  orViewStyle: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  biometricButtonContainer: {
    marginTop: 16,
    backgroundColor: colors.appThemeColor,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  biometricButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: colors.white,
  },
  biometricButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  forgotMpinButtonStyle: {
    alignSelf: "flex-start",
    marginTop: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  forgotMpinTextStyle: {
    color: colors.appThemeColor,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },
  lineStyle: {
    flex: 1,
    height: 1,
    backgroundColor: colors.appThemeColor,
  },
});
