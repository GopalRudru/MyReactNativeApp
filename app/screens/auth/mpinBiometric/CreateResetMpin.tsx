import React, { useEffect, useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import analytics from "@react-native-firebase/analytics";
import colors from "../../../res/colors";
import { OtpInput } from "react-native-otp-entry";
import logger from "../../../utils/logger";
import fonts from "../../../res/fonts";
import strings from "../../../res/strings";
import CustomButton from "../../../components/CustomButton";
import imagePath from "../../../constant/imagePath";
import BioMetricBottomSheet from "../../../components/BioMetricBottomSheet";
import navigationStrings from "../../../constant/navigationStrings";
import * as NavigationService from "../../../navigation/NavigationService";
import {
  authenticateWithBiometrics,
  BiometricUnavailableReason,
  checkBiometricAvailability,
  disableBiometricAuth,
  enableBiometricAuth,
  enableMpinAuth,
  isBiometricEnabled,
} from "./BiometricUtils";
import {
  clearOtpUserData,
  setUserAuth,
  authSelector,
  clearPasswordType,
  clearAkSessionRef,
  setUserPermission,
  setUserBusinessType,
  setUserLoanCategory,
  setPassword,
  clearPassword,
  setMpin as setMpinToStore,
  setMpinData,
  setOtpVerifyUsersData,
  setUserProfileData,
} from "../../../services/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { decrypt, encrypt } from "../../../utils/crypto";
import { getDeviceInfo, getDeviceName, getDeviceUniqueId, getFmcToken, loginTypeData, SCREEN_NAME } from "../../../utils/helpers";
import service from "../../../services/api/service";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { clearStatusPopup, setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import { BiometryType, BiometryTypes } from "react-native-biometrics";
import LoaderView from "../../../components/common/LoaderView";
import { IS_LOGGED_IN, setItem } from "../../../utils/storageUtils";
import AuthCard from "../../../components/AuthCard";
import { set } from "react-hook-form";
import SuccessBottomSheet from "../../../components/common/SuccessBottomSheet";
import BiometricLockBottomSheet from "../../../components/BiometricLockBottomSheet";
import { setTabType } from "../../../services/redux/slices/tabsSlice";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { hp } from "../../../utils/dimensions";



const { width } = Dimensions.get("window");

type CreateResetMpinParams = {
  isCreateMpin?: boolean;
};

const CreateResetMpin = () => {
  const route =
    useRoute<RouteProp<Record<string, CreateResetMpinParams>, string>>();
  const isCreateMpin = route?.params?.isCreateMpin ?? true;
  const { width: screenWidth } = Dimensions.get("window");
  const MPIN_LENGTH = 6;
  const SPACING_BETWEEN_INPUTS = 16;
  const PADDING = 20;
  const totalSpacing = (MPIN_LENGTH - 1) * SPACING_BETWEEN_INPUTS;
  const availableWidth = screenWidth - PADDING * 2 - totalSpacing;
  const mpinInputWidth = availableWidth / MPIN_LENGTH;

  const [mpin, setMpin] = React.useState("");
  const [confirmMpin, setConfirmMpin] = React.useState("");
  const [showBioMetricSheet, setShowBioMetricSheet] = React.useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  // true = Fingerprint/TouchID, false = Face ID
  const [isFingerprintType, setIsFingerprintType] = React.useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const { otpUserData } = useSelector(authSelector);
  const { userProfile } = useSelector(authSelector);
  const dispatch = useDispatch();

  const [available, setAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null,
  );
  const [successBottomSheetVisible, setSuccessBottomSheetVisible] =
    useState(false);
  const [successBottomSheetMessage, setSuccessBottomSheetMessage] =
    useState("");
  const [showBiometricLockSheet, setShowBiometricLockSheet] = useState(false);

  //Remove
  // Detect the biometric type available on this device
  React.useEffect(() => {
    const detectBiometricType = async () => {
      const { available, biometryType, unavailableReason } =
        await checkBiometricAvailability();
      if (available) {
        // FaceID is face-based; everything else (TouchID / Biometrics) is fingerprint-based
        setIsFingerprintType(biometryType !== "FaceID");
      }
    };
    detectBiometricType();
  }, []);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    //set the biometric enabled state based on stored preference - this will determine whether biometric option is offered to user in the flow
    // const biometricEnabled = await isBiometricEnabled();
    // setBiometricEnabled(biometricEnabled);
    const { available, biometryType, unavailableReason } =
      await checkBiometricAvailability();
    setAvailable(available);
    setBiometryType(biometryType);

    if (!available || !biometryType) {
      setUnavailableReason(unavailableReason);
    }
  };

  const handleChangeText = (text: string) => {
    setErrorVisible(false);
    setErrorMessage("");
    setMpin(text);
  };

  const handleConfirmMpinChangeText = (text: string) => {
    setErrorVisible(false);
    setErrorMessage("");
    setConfirmMpin(text);
  };

  const mpinValidation = (pin: string): boolean => {
    if (mpin !== confirmMpin) {
      setErrorMessage(strings.mpin_not_match_error);
      return true;
    }

    setErrorMessage(strings.mpin_too_weak_error);
    // Repetitive: all same digits (e.g., 111111, 999999)
    if (/^(\d)\1{5}$/.test(pin)) return true;
    const digits = pin.split("").map(Number);
    // Sequential ascending (e.g., 123456, 234567)
    const isAscending = digits.every(
      (d, i) => i === 0 || d === digits[i - 1] + 1,
    );
    if (isAscending) return true;
    // Sequential descending (e.g., 654321, 987654)
    const isDescending = digits.every(
      (d, i) => i === 0 || d === digits[i - 1] - 1,
    );
    if (isDescending) return true;

    setErrorMessage("");
    setErrorVisible(false);

    return false;
  };

  const proceedForBiometric = async () => {
    Keyboard.dismiss();

    if (mpinValidation(mpin)) {
      setErrorVisible(true);
      return;
    }

    if (isCreateMpin) {
      if (!available && unavailableReason !== null) {
        if (unavailableReason === BiometricUnavailableReason.NO_HARDWARE) {
          //proceed to dashboard if biometric hardware is not available, as biometric option cannot be offered
          // call api
          onCreateMpinClick(false);
          // NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
        } else if (
          unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
        ) {
          // Show the biometric opt-in bottom sheet, but disable the enable button and show a message to the
          // user to enroll biometrics from settings
          setShowBioMetricSheet(true);
        } else {
          setShowBioMetricSheet(true);
        }
      } else {
        setShowBioMetricSheet(true);
      }
    } else {
      onCreateMpinClick(false);
    }
  };

  const onCreateMpinClick = async (biometricNotEnabled: boolean = true) => {
    Keyboard.dismiss();
    setIsLoading(true);
    if (mpin !== confirmMpin) {
      setErrorVisible(true);
      return;
    }

    const biometricEnabled = await isBiometricEnabled();
    const deviceId = await getDeviceUniqueId();

    await analytics().logEvent("Enter_OTP_Continue", {
      login_type: otpUserData?.loginType,
      otp_length: mpin.length,
      screen_name: isCreateMpin ? "CreateMpin" : "ResetMpin",
    });

    let cifNumberValue = "";
    if (userProfile?.cifNumber) {
      cifNumberValue = userProfile?.cifNumber;
    } else if (userProfile?.email && userProfile?.phoneNumber) {
      cifNumberValue = userProfile?.phoneNumber;
    }

    const payload = {
      userId: userProfile?.id?.toString(),
      cifNumber: cifNumberValue,
      deviceId: encrypt(deviceId),
      mpin: encrypt(mpin),
      confirmMpin: encrypt(confirmMpin),
      authType: "MPIN",
      ...(biometricEnabled && {
        subAuthType:
          biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",
      }),
      biometricEnabled: biometricEnabled,
    };

    try {
      const res = await service?.auth?.secureCreateMpin(payload);
      const createMpinData = res?.data?.data;
      dispatch(setMpinToStore(encrypt(mpin)));
      await enableMpinAuth();

      if (isCreateMpin) {
        if (biometricEnabled) {
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
          setIsLoading(false);
        } else {
          setSuccessBottomSheetVisible(false);
          setSuccessBottomSheetMessage("");
          performCustomerLogin();
        }
      } else {
        setSuccessBottomSheetVisible(true);
        setSuccessBottomSheetMessage("MPIN reset successfully!");
        setIsLoading(false);
        // NavigationService.navigate(navigationStrings.MPIN_UPDATED_SUCCESS_SCREEN, {
        //   PasswordCreated: true,
        // });
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
              //setMpin("");
              //setConfirmMpin("");
            },
          }),
        );
      }
    } finally {
      //setIsLoading(false);
    }
  };

  //fetch MPIN details
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
          }),
        );
      }
    } finally {
      //setIsLoading(false);
    }
  };

  const performCustomerLogin = async () => {
    if (!isLoading) setIsLoading(true);

    if (isCreateMpin) {
      await fetchMpinData();
    }

    try {
      logger.info("Attempting customer login for CIF:", userProfile?.cifNumber);

      //const biometricEnabled = await isBiometricEnabled();
      const deviceId = await getDeviceUniqueId();

      let cifNumberValue = "";
      if (userProfile?.cifNumber) {
        cifNumberValue = userProfile?.cifNumber;
      } else if (userProfile?.email && userProfile?.phoneNumber) {
        cifNumberValue = userProfile?.phoneNumber;
      }
      const payload = {
        cifNumber: cifNumberValue,
        deviceId: encrypt(deviceId),
        ...(mpin !== "" && { mpin: encrypt(mpin) }),
        userId: userProfile?.id?.toString(),
        authType: "MPIN",
        //...(biometricEnabled && { subAuthType: biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",}),
      };

      const response = await service?.auth?.secureUserLoginV2(payload);

      if (!response?.data?.data) {
        throw new Error("Invalid login response structure");
      }

      const businessObj = response?.data?.data?.business_type;

      if (!businessObj || !Array.isArray(businessObj)) {
        throw new Error("Invalid business type data received");
      }

      if (otpUserData?.altAccessFlag === true) {
        //for now do nothing
      } else {
        dispatch(clearOtpUserData());
      }
      dispatch(clearPasswordType());
      dispatch(clearAkSessionRef());

      if (businessObj.length > 1) {
        dispatch(setUserBusinessType(businessObj));
        //dispatch(setPassword(password));
        NavigationService.navigate(navigationStrings.LOGIN_TYPE);
        setIsLoading(false);
      } else {
        await userLoginSingleLoanType(businessObj[0], cifNumberValue);
      }
    } catch (error: any) {
      const errorMessage = error;
      const isConnected = await checkConnectivity();

      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage,
          }),
        );
      }
      setIsLoading(false);
    } finally {
      //setIsLoading(false);
    }
  };

  const userLoginSingleLoanType = async (
    businessType: string,
    cifNumberValue: string,
  ) => {
    try {
      const deviceId = await getDeviceUniqueId();
      const deviceName = await getDeviceName();
      const deviceInfo = getDeviceInfo();
      const fmcToken = await getFmcToken();

      // const payload = {
      //   businessId: encrypt(businessType?.id?.toString()),
      //   id: userProfile?.id?.toString(),
      //   password: encrypt(password?.toString()),
      //   token: fmcToken,
      //   deviceId: deviceId,
      //   deviceInfo: deviceInfo,
      //   deviceName: deviceName,
      // };

      const payload = {
        businessId: encrypt(businessType?.id?.toString()),
        id: userProfile?.id?.toString(),
        ...(mpin !== "" && { mpin: encrypt(mpin) }),
        cifNumber: cifNumberValue,
        deviceId: encrypt(deviceId),
        authType: mpin == "" ? "BIOMETRIC" : "MPIN",
        //...(mpin == "" && { subAuthType: biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT", }),
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
      dispatch(clearPassword());

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
      const biometricEnabled = await isBiometricEnabled();
      NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error;
      dispatch(
        setStatusPopup({
          status: "Error",
          message: errorMessage,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirstBiometricEnabledOrNotEnabled = async () => {
    //await enableBiometricAuth();
    // Prompt text varies by flow (login vs enable) and biometry type
    // Works for all types: FaceID (iOS), TouchID (iOS), Biometrics (Android)
    const promptMessage =
      biometryType === BiometryTypes.FaceID
        ? "Enable Face ID"
        : "Enable fingerprint";

    const result = await authenticateWithBiometrics(promptMessage);

    if (result.success) {
      await enableBiometricAuth();
      onCreateMpinClick(false);
      return;
    } else {
      await disableBiometricAuth(); // Ensure biometric preference is cleared if authentication fails
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
      setUnavailableReason(BiometricUnavailableReason.PERMISSION_DENIED);
      setShowBioMetricSheet(true);
      return;
    }

    // 🔹 Lockout → show dedicated lock bottom sheet
    if (isLockout) {
      setShowBiometricLockSheet(true);
      return;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        // iOS ignores StatusBar backgroundColor; the top safe-area inset paints it
        Platform.OS === "ios" && { backgroundColor: colors.welcomeBgColor },
      ]}
      edges={["top"]}
    >
      <StatusBar backgroundColor={colors.welcomeBgColor} barStyle="dark-content" />
      <BiometricLockBottomSheet
        visible={showBiometricLockSheet}
        onClose={() => {
          // setShowBiometricLockSheet(false);
          // onCreateMpinClick(true);
        }}
        enableBiometric={() => {
          setShowBiometricLockSheet(false);
          onCreateMpinClick(true);
        }}
        fingerprintEnabled={isFingerprintType}
        title={"Biometrics Locked"}
        subTitle={
          "Biometrics are temporarily locked due to too many failed attempts. You can still access your account."
        }
        btnText={strings.continue_in_app}
      />
      <BioMetricBottomSheet
        visible={showBioMetricSheet}
        onClose={async () => {
          setShowBioMetricSheet(false);
          await disableBiometricAuth(); // Ensure biometric preference is cleared if user closes the sheet without enabling
          onCreateMpinClick(true);
        }}
        enableBiometric={async () => {
          // Save the user's biometric preference, then proceed
          if (Platform.OS === "ios") {
            setShowBioMetricSheet(false);
            if (
              unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
            ) {
              await disableBiometricAuth();
              onCreateMpinClick(false);
            } else if (
              unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
            ) {
              await disableBiometricAuth();
              onCreateMpinClick(false);
            } else {
              checkFirstBiometricEnabledOrNotEnabled();
            }
          } else {
            if (unavailableReason !== BiometricUnavailableReason.NOT_ENROLLED) {
              await enableBiometricAuth();
            }
            setShowBioMetricSheet(false);
            onCreateMpinClick(false);
          }
        }}
        fingerprintEnabled={isFingerprintType}
        btnText={strings.continue_in_app}
      />

      <SuccessBottomSheet
        isVisible={successBottomSheetVisible}
        setOpenBottomSheet={() => {
          setSuccessBottomSheetVisible(false);
          if (isCreateMpin) {
            performCustomerLogin();
          }
        }}
        successMessage={successBottomSheetMessage}
        screenName={
          isCreateMpin ? SCREEN_NAME.CREATE_MPIN : SCREEN_NAME.RESET_MPIN
        }
      />

      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={[
              styles.scrollContentContainer,
              { backgroundColor: colors.white, paddingHorizontal: 0 },
            ]}
          >
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
            <View style={{ marginTop: 20 }}>
              
              <Image
                source={imagePath?.avanseLogo1}
                resizeMode="contain"
                style={{
                  alignSelf: "center",
                  marginBottom: 10,
                  width: "50%",
                  height: 50,
                }}
              />
              <AuthCard>
                <View>
                  <Text style={styles.titleTextStyle}>
                    {isCreateMpin
                      ? strings.create_your_mobile_mpin
                      : strings.reset_your_mpin}
                  </Text>
                  <Text style={styles.subTitleTextStyle}>
                    {isCreateMpin
                      ? strings.set_a_mpin_to_access_your_account_securely
                      : strings.reset_your_mpin_to_access_your_account_securely}
                  </Text>
                  <Text style={styles.enterMpinTextStyle}>
                    {strings.enter_mpin}
                  </Text>
                  <View style={styles.mpinContainer}>
                    <OtpInput
                      //ref={otpRef}
                      //key={otpKey}
                      numberOfDigits={MPIN_LENGTH}
                      focusColor={colors.appThemeColor}
                      autoFocus={false}
                      hideStick={true}
                      disabled={false}
                      type="numeric"
                      secureTextEntry={false}
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

                  <Text style={[styles.enterMpinTextStyle, { marginTop: 0 }]}>
                    {strings.confirm_mpin}
                  </Text>

                  <View style={styles.mpinContainer}>
                    <OtpInput
                      //ref={otpRef}
                      //key={otpKey}
                      numberOfDigits={MPIN_LENGTH}
                      focusColor={colors.appThemeColor}
                      autoFocus={false}
                      hideStick={true}
                      disabled={false}
                      type="numeric"
                      secureTextEntry={false}
                      focusStickBlinkingDuration={500}
                      onTextChange={(text) => handleConfirmMpinChangeText(text)}
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

                  {errorVisible && (
                    <Text style={[styles.errorTextStyle, { marginTop: 0 }]}>
                      {errorMessage}
                    </Text>
                  )}

                  <View style={{ marginTop: 16 }}>
                    <CustomButton
                      title={
                        isCreateMpin ? strings.create_mpin : strings.reset_mpin
                      }
                      onPress={() => {
                        proceedForBiometric();
                      }}
                      isDisabled={
                        mpin.length !== MPIN_LENGTH ||
                        confirmMpin.length !== MPIN_LENGTH
                      }
                      marginTop={8}
                    />
                    <View style={{ height: 20 }} />
                  </View>
                </View>
              </AuthCard>
            </View>

            <Image
              source={imagePath.avansePreLogin}
              style={styles.authImageStyle}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default CreateResetMpin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mpinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  scrollContentContainer: {
    justifyContent: "space-between",
    flex: 1,
    paddingTop: 0,
  },
  titleTextStyle: {
    fontSize: 20,
    fontFamily: fonts.medium,
    color: colors.authTitleColor,
  },
  subTitleTextStyle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.mpinSubTitleColor,
    marginTop: 1,
  },
  enterMpinTextStyle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.mpinTextColor,
    marginTop: 20,
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },
  errorTextStyle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.red,
    marginTop: 0,
  }
});
