import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  AppState,
  AppStateStatus,
  Image,
  Keyboard,
  StatusBar,
} from "react-native";
import {
  setOtpVerifyUsersData,
  setUserProfileData,
  authSelector,
  clearOtpUserData,
  setSetPasswordKey,
  setUserId,
  setAkSessionRef,
} from "../../../services/redux/slices/authSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import stringConstant from "../../../res/strings";
import colors from "../../../res/colors";
import { moderateVerticalScale } from "react-native-size-matters";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import service from "../../../services/api/service";
import { decrypt, decryptObject, encrypt } from "../../../utils/crypto";
import { useDispatch, useSelector } from "react-redux";
import { loginTypeData, registerTypeData } from "../../../utils/helpers";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import CustomButton from "../../../components/CustomButton";
import strings from "../../../res/strings";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import UserOtpMessage from "../../../components/userOtpMessage";
import { OtpInput } from "react-native-otp-entry";
import fonts from "../../../res/fonts";
import LoaderView from "../../../components/common/LoaderView";
import imagePath from "../../../constant/imagePath";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { addSignupOnboardApi } from "../../../services/redux/slices/keyRegistrarSlice";
import { useFocusEffect } from "@react-navigation/native";
import { Platform } from "react-native";
const RNOtpVerify = Platform.OS === 'android' ? require('react-native-otp-verify').default : null;
import { createModuleLogger } from "../../../utils/logger";
import AuthCard from "../../../components/AuthCard";
import { SCREEN_WIDTH, hp } from "../../../utils/dimensions";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

const logger = createModuleLogger("OTP");

const OTP_LENGTH = 6;
const COUNTDOWN_TIME = 180;
const SPACING_BETWEEN_INPUTS = 16;
const PADDING = 20;
const totalSpacing = (OTP_LENGTH - 1) * SPACING_BETWEEN_INPUTS;
const availableWidth = SCREEN_WIDTH - PADDING * 2 - totalSpacing;
const otpInputWidth = availableWidth / OTP_LENGTH;
const Otp = ({ route, navigation }: any) => {
  const { type, selectedTab, contact } = route.params || {};
  const isCreateMpin = route?.params?.isCreateMpin ?? true;
  const [otp, setOtp] = useState("");
  const [otpKey, setOtpKey] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(COUNTDOWN_TIME);
  const [timerStartTime, setTimerStartTime] = useState<number>(Date.now());
  const [isResendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [severity, setSeverity] = useState<
    "error" | "warning" | "info" | "success"
  >("success");

  const registerKey = useSelector((state: any) => state.keyRegistrar.keys);

  const mobileNumbers = useSelector(
    (state: any) => state.keyRegistrar.mobileNumbers
  );
  const lanNumbers = useSelector((state: any) => state.keyRegistrar.lanNumbers);
  const loginType = useSelector((state: any) => state.keyRegistrar.loginType);
  const { otpUserData } = useSelector(authSelector);
  const dispatch = useDispatch();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpRef = useRef<any>(null);
  const isOtpListenerSetup = useRef<boolean>(false);

  // Memoize the data object to prevent unnecessary re-renders
  const userData = useMemo(() => {
    if (registerKey === "register") {
      return {
        email: type === "Email" ? contact : "",
        mobile: type === "Mobile" ? contact : "",
      };
    } else {
      return otpUserData;
    }
  }, [registerKey, type, contact, otpUserData]);

  // Memoize OTP message props to prevent unnecessary re-renders
  const otpMessageProps = useMemo(() => {
    if (registerKey === "register") {
      return {
        userData: mobileNumbers,
        loginType: loginType,
        registerKey: registerKey,
      };
    } else {
      return {
        userData: userData,
        loginType: "",
        registerKey: registerKey || "",
      };
    }
  }, [registerKey, mobileNumbers, loginType, userData]);

  const getRemainingTime = (startTime: number) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = COUNTDOWN_TIME - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  // Helper to set up OTP listener
  const setupOtpListener = useCallback(() => {
    // Prevent duplicate listener setup
    if (isOtpListenerSetup.current) {
      return;
    }

    if (Platform.OS !== 'android' || !RNOtpVerify) return;

    RNOtpVerify.getHash()
      .then((hash) => {
        // Only log in development mode to avoid performance issues
        logger.info("App hash retrieved", { hash });
        // Add this hash to your SMS template
      })
      .catch((error) => {
        logger.error("Failed to get app hash", error);
      });

    RNOtpVerify.getOtp()
      .then(() => {
        isOtpListenerSetup.current = true;
        RNOtpVerify.addListener((message) => {
          const match = message.match(/\d{4,6}/);
          const code = match ? match[0] : null;
          if (code) {
            setOtp(code);
            otpRef.current?.setValue(code);
            // handleContinue(code);
            registerKey === "register"
              ? handleRegister(code)
              : handleContinue(code);
            RNOtpVerify.removeListener();
            isOtpListenerSetup.current = false;
          }
        });
      })
      .catch((error) => {
        logger.error("Failed to setup OTP listener", error);
      });
  }, [registerKey]);

  // Use only useFocusEffect to handle OTP listener setup
  useFocusEffect(
    useCallback(() => {
      // Called when OTP screen comes into focus
      if (Platform.OS === 'android' && RNOtpVerify) {
        RNOtpVerify.removeListener(); // Clean up any existing listeners first
      }
      isOtpListenerSetup.current = false; // Reset the flag
      setupOtpListener();

      return () => {
        // Clean up when screen loses focus
        if (Platform.OS === 'android' && RNOtpVerify) {
          RNOtpVerify.removeListener();
        }
        isOtpListenerSetup.current = false;
      };
    }, [setupOtpListener])
  );

  useEffect(() => {
    setTimer(COUNTDOWN_TIME);
    setTimerStartTime(Date.now());

    const updateTimer = () => {
      const remaining = getRemainingTime(timerStartTime);
      setTimer(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        setResendDisabled(false);
      }
    };

    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current!);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const remaining = getRemainingTime(timerStartTime);
        setTimer(remaining);
        if (remaining === 0) {
          setResendDisabled(false);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [timerStartTime]);

  const handleChangeText = (text: string) => {
    setOtp(text);
  };

  /**
   * Handles the resend OTP functionality for both registration and login flows
   *
   * This method:
   * 1. Validates if resend is allowed (based on timer state)
   * 2. Calls appropriate secure API endpoints based on the user flow
   * 3. Resets OTP input and restarts countdown timer on success
   * 4. Handles errors with connectivity checks and user feedback
   *
   * Flow differentiation:
   * - Registration flow: Uses secureReSendRegisterOtp with LAN and mobile number
   * - Login flow: Uses secureSendUserOtp with encrypted user data
   */
  const handleResendOtp = async () => {
    // Early return if resend is currently disabled (timer still running)
    if (isResendDisabled) {
      return;
    }

    // Set loading state to show spinner and disable UI interactions
    setIsLoading(true);

    try {
      let res;

      // Determine which API to call based on the registration state
      if (registerKey === "register") {
        // Registration flow: Resend OTP for new user registration
        const reSendOtpPayload = {
          lan: encrypt(lanNumbers), // Encrypted LAN number
          key: encrypt(mobileNumbers), // Encrypted mobile number
        };
        res = await service?.auth?.secureReSendRegisterOtp(reSendOtpPayload);
      } else {
        // Login flow: Resend OTP for existing user authentication
        const payload = { key: encrypt(loginTypeData(otpUserData)) };
        res = await service?.auth?.secureSendUserOtp(payload);
      }

      // Check if the API call was successful
      if (res?.status === 200) {
        // Reset OTP input field and restart the countdown timer
        resetOtpAndTimer();
      }
    } catch (error: any) {
      // Handle any errors that occurred during the API call
      await handleResendError(error);
    } finally {
      // Always hide loading spinner regardless of success or failure
      setIsLoading(false);
    }
  };

  // Helper function to reset OTP and restart timer
  const resetOtpAndTimer = () => {
    setOtp("");
    setOtpKey((prev) => prev + 1);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const newStartTime = Date.now();
    setTimerStartTime(newStartTime);
    setTimer(COUNTDOWN_TIME);
    setResendDisabled(true);

    timerRef.current = setInterval(() => {
      const remaining = getRemainingTime(newStartTime);
      setTimer(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        setResendDisabled(false);
      }
    }, 1000);
  };

  // Helper function to handle resend errors
  const handleResendError = async (error: any) => {
    const errorMessage = error;
    const isConnected = await checkConnectivity();

    if (isConnected) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: errorMessage,
        })
      );
    }
  };

  const isOtpComplete = otp.length === OTP_LENGTH;

  const handleContinue = async (otpValue: string) => {
    Keyboard.dismiss();
    const otpCode = otpValue?.trim() ? otpValue : otp;
    setIsLoading(true);

    await analytics().logEvent("Enter_OTP_Continue", {
      login_type: otpUserData?.loginType,
      otp_length: otpCode.length,
      screen_name: "Otp",
    });

    const payload = {
      id: encrypt(loginTypeData(otpUserData)),
      otp: encrypt(otpCode),
    };

    try {
      const res = await service?.auth?.secureVerifyUserOtp(payload);
      setSeverity("success");

      const otpVerifyUsersData = res?.data?.data;
      const akSessionRef = res?.data?.akSessionRef
      logger.debug("OTP verification successful", { otpVerifyUsersData });
      
      dispatch(setAkSessionRef(akSessionRef ? encrypt(akSessionRef) : null));

      const cifNumber = otpVerifyUsersData?.[0]?.cifNumber;


      // if (cifNumber === null || cifNumber === undefined || cifNumber === "") {
      //   dispatch(
      //     setStatusPopup({
      //       status: "Error",
      //       message:
      //         "You have not registered yet. Please register now to continue with the process.",
      //       showLeftCross: false,
      //       positiveButtonText: "Close",
      //       onPositivePress: () => {
      //         NavigationService.goBack();
      //       },
      //     }),
      //   );

      //   return;
      // }


      const id = res?.data?.data?.[0]?.id;
      if (id) {
        dispatch(setSetPasswordKey(id));
        dispatch(setUserId(id));
      }
      dispatch(setOtpVerifyUsersData(otpVerifyUsersData));
      if (otpVerifyUsersData?.length === 1) {
        dispatch(setUserProfileData(otpVerifyUsersData[0]));
        //NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
         NavigationService.navigate(
           navigationStrings.CREATE_RESET_MPIN_SCREEN,
           {
             isCreateMpin: isCreateMpin,
           },
         );
        // if (otpVerifyUsersData[0]?.isVerified) {
        //   NavigationService.navigate(navigationStrings.PASSWORD);
        // } else {
        //   NavigationService.navigate(navigationStrings.FORGOTPASSWORD);
        // }
      } else {
        NavigationService.navigate(navigationStrings.CIF);
      }
    } catch (error) {
      const errorMessage =
        typeof error === "string" ? error : "An error occurred";
      setIsLoading(false);
      let isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "error",
            message: errorMessage,
            showLeftCross: false,
            onPositivePress: () => {
              setOtp("");
              otpRef.current?.setValue("");
            },
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    NavigationService.goBack();
  };

  const handleClose = () => {
    setOtp("");
    setOtpKey((prev) => prev + 1);
  };

  /**
   * Handles user registration OTP verification and onboarding process
   *
   * This method:
   * 1. Verifies the OTP using secure API
   * 2. Initiates signup onboarding process
   * 3. Handles different response scenarios (multiple accounts, no accounts, success)
   * 4. Provides appropriate navigation and error handling
   */
  const handleRegister = async (otpValue: string) => {
    Keyboard.dismiss();
    const otpCode = otpValue?.trim() ? otpValue : otp;
    setIsLoading(true);
    try {
      // Step 1: Verify OTP using secure endpoint
      const registerPayload = {
        id: encrypt(mobileNumbers),
        otp: encrypt(otpCode),
      };

      const otpVerificationRes = await service?.auth?.secureVerifyRegisterOtp(
        registerPayload
      );
      // if (!otpVerificationRes?.data) {
      //   throw new Error("Invalid OTP verification response");
      // }

      const otpVerifyUsersData1 = otpVerificationRes?.data?.data;
      setSeverity("success");
      dispatch(setOtpVerifyUsersData(otpVerifyUsersData1));

      // Step 2: Proceed with signup onboarding using secure endpoint
      const signupOnboardPayload = {
        lan: encrypt(lanNumbers),
        key: encrypt(mobileNumbers),
      };

      const onboardingRes = await service?.auth?.secureSignupOnboard(
        signupOnboardPayload
      );

      // if (!onboardingRes?.data) {
      //   throw new Error("Invalid onboarding response");
      // }

      // Step 3: Process onboarding response
      const resData = onboardingRes?.data?.data;
      const decryptedData = decrypt(resData);

      dispatch(addSignupOnboardApi(decryptedData));
      
      //SAVE OTP data
      const id = onboardingRes?.data?.userDetails?.id;
      if (id) {
        dispatch(setSetPasswordKey(encrypt(id)));
      }
      
      const userDetails = decryptObject(onboardingRes?.data?.userDetails);
      //logger.debug("Decrypted user details......... ", userDetails);
      const otpVerifyUsersData = [
        {
          cifEntity: userDetails?.cifEntity ? encrypt(userDetails.cifEntity) : "",
          cifNumber: userDetails?.cifNumber ? encrypt(userDetails.cifNumber) : "",
          email: userDetails?.email ? encrypt(userDetails.email) : "",
          fullName: userDetails?.fullName || "",
          id: userDetails?.id ? encrypt(userDetails.id) : "",
          isOtpVerified: userDetails?.isOtpVerified || false,
          isVerified: userDetails?.isVerified || false,
          name: userDetails?.name || "",
          phoneNumber: userDetails?.phoneNumber ? encrypt(userDetails.phoneNumber) : "",
          profileImage: "",
        },
      ];

      //logger.debug("otpVerifyUsersData............ ", { otpVerifyUsersData });
      
      dispatch(setOtpVerifyUsersData(otpVerifyUsersData));
      if (otpVerifyUsersData?.length === 1) {
        dispatch(setUserProfileData(otpVerifyUsersData[0]));
      }


      // Step 4: Handle different scenarios based on response data
      await handleOnboardingResult(resData, onboardingRes);
    } catch (error: any) {
      logger.error("Registration process failed", error);
      await handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles different onboarding result scenarios
   */
  const handleOnboardingResult = async (resData: any, onboardingRes: any) => {
    if (resData?.length > 1) {
      // Multiple accounts found - navigate to CIF selection
      NavigationService.navigate(navigationStrings.CIF);
    } else if (resData?.length == 0) {
      // No accounts found - show error and navigate to login
      const successMessage =
        onboardingRes?.data?.message || "No accounts found";

      dispatch(
        setStatusPopup({
          status: "error",
          message: successMessage,
        })
      );
      NavigationService.replace(navigationStrings.LOGIN);
    } else {
      // Single account - navigate to thank you screen
      //NavigationService.navigate("ThankYouScreen");
      NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
    }
  };

  /**
   * Handles registration-related errors
   */
  const handleRegistrationError = async (error: any) => {
    setSeverity("error");
    let isConnected = await checkConnectivity();
    if (isConnected) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        error ||
        "Registration failed";

      // Check if this is an OTP verification error or onboarding error
      const isOtpError =
        errorMessage.includes("OTP") ||
        error.response?.config?.url?.includes("verifyRegisterOtp");

      dispatch(
        setStatusPopup({
          status: "error",
          message: errorMessage,
          isFunction: true,
          locationFunction: isOtpError ? handleClose : handleBack,
        })
      );
    }
  };

  const textLabel = () => {
    if (registerKey === "register") {
      return `Change ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`;
    } else {
      return `Change ${
        otpUserData?.loginType === "cif" ? "CIF" : otpUserData?.loginType
      }`;
    }
  };

  const backPress = () => {
    NavigationService.goBack();
    if (registerKey !== "register") {
      // Clear OTP user data when going back from login flow
      dispatch(clearOtpUserData());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={colors.welcomeBgColor} barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={[styles.scrollContentContainer, { paddingHorizontal: 0 }]}
          >
            <View style={{ marginTop: 0 }}>
              <View
                style={{
                  position: "absolute",
                  // extends above the content so the iOS bounce area stays teal, not white
                  top: -1000,
                  left: 0,
                  right: 0,
                  height: hp(25) + 1000,
                  backgroundColor: colors.welcomeBgColor,
                }}
              />
              <Image
                source={imagePath?.avanseLogo1}
                resizeMode="contain"
                style={{
                  alignSelf: "center",
                  marginTop: 20,
                  marginBottom: 10,
                  width: "50%",
                  height: 50,
                }}
              />

              <AuthCard>
                <View>
                  <AuthTitleTextComponent text={stringConstant.Enter_OTP} />

                  <View style={{ marginBottom: moderateVerticalScale(20) }}>
                    <UserOtpMessage
                      userData={otpMessageProps.userData}
                      loginType={otpMessageProps.loginType}
                      registerKey={otpMessageProps.registerKey}
                    />
                  </View>
                  <Text style={styles.label}>
                    {stringConstant.Type_your_6_digit_security_code}
                  </Text>

                  <View style={styles.otpContainer}>
                    <OtpInput
                      ref={otpRef}
                      key={otpKey}
                      numberOfDigits={OTP_LENGTH}
                      focusColor={colors.appThemeColor}
                      autoFocus={false}
                      hideStick={true}
                      disabled={false}
                      type="numeric"
                      secureTextEntry={false}
                      focusStickBlinkingDuration={500}
                      onTextChange={(text) => handleChangeText(text)}
                      onFilled={(text) => {
                        //logger.debug("OTP input completed", { otp: text });
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
                          width: otpInputWidth,
                          height: otpInputWidth,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#C4C4C4",
                          backgroundColor: "transparent",
                        },
                        pinCodeTextStyle: {
                          fontSize: 16,
                          fontFamily: fonts.regular,
                        },
                        focusedPinCodeContainerStyle: {
                          borderColor: colors.appThemeColor,
                        },
                      }}
                    />
                  </View>

                  <View style={styles.timerRow}>
                    <Text style={styles.timerText}>
                      {`${Math.floor(timer / 60)
                        .toString()
                        .padStart(2, "0")}:${(timer % 60)
                        .toString()
                        .padStart(2, "0")}`}
                    </Text>
                    <TouchableOpacity
                      disabled={isResendDisabled}
                      onPress={handleResendOtp}
                    >
                      <Text
                        style={[
                          styles.resendText,
                          isResendDisabled && styles.disabledText,
                        ]}
                      >
                        {stringConstant.Resend_OTP}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <CustomButton
                    title={strings.Continue}
                    isDisabled={!isOtpComplete || isLoading}
                    onPress={() =>
                      registerKey === "register"
                        ? handleRegister(otp)
                        : handleContinue(otp)
                    }
                    backgroundColor={
                      !isOtpComplete && colors.disabledBackGroundColor
                    }
                    imageNeeded={false}
                    logoutImage={false}
                  />
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={[styles.changeCIF]} onPress={backPress}>
                      {textLabel()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </AuthCard>
            </View>

            <Image
              source={imagePath.avansePreLogin}
              style={styles.authImageStyle}
            />
          </View>
        </ScrollView>
        {isLoading && <LoaderView />}
        <DialogStatusPopup />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Otp;
