import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  clearOtpUserData,
  setUserAuth,
  authSelector,
  clearPasswordType,
  setUserPermission,
  setUserBusinessType,
  setUserLoanCategory,
  setPassword,
  clearPassword,
} from "../../../services/redux/slices/authSlice";

import styles from "./styles";
import strings from "../../../res/strings";
import * as NavigationService from "../../../navigation/NavigationService";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomButton from "../../../components/CustomButton";
import imagePath from "../../../constant/imagePath";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { moderateVerticalScale } from "react-native-size-matters";
import { decrypt, encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { useDispatch, useSelector } from "react-redux";
import navigationStrings from "../../../constant/navigationStrings";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import colors from "../../../res/colors";
import { IS_LOGGED_IN, setItem } from "../../../utils/storageUtils";
import { Formik } from "formik";
import * as Yup from "yup";
import LoaderView from "../../../components/common/LoaderView";
import CustomBackButton from "../../../components/common/CustomBackButton";
import analytics from "@react-native-firebase/analytics";
import {
  getDeviceInfo,
  getDeviceName,
  getDeviceUniqueId,
  getFmcToken,
} from "../../../utils/helpers";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { createModuleLogger } from "../../../utils/logger";
import { isBiometricEnabled } from "../mpinBiometric/BiometricUtils";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

// Create password-specific logger
const logger = createModuleLogger("Password");

const Password = () => {
  const { userProfile } = useSelector(authSelector);
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { otpUserData } = useSelector(authSelector);

  // Component lifecycle logging
  useEffect(() => {
    return () => {};
  }, [userProfile?.cifNumber, userProfile?.id]);

  /**
   * Handles back navigation
   */
  const onBackPress = useCallback(() => {
    NavigationService.goBack();
  }, []);

  /**
   * Toggles password visibility
   * @param value - Current secure state
   */
  const handleEyePress = useCallback((value: boolean) => {
    setIsSecure(!value);
  }, []);

  /**
   * Handles customer login with password
   * @param password - User's password
   */
  const performeCustomerLogin = useCallback(
    async (password: string) => {
      Keyboard.dismiss();
      setIsLoading(true);

      try {
        logger.info(
          "Attempting customer login for CIF:",
          userProfile?.cifNumber,
        );

        let cifNumberValue = "";
        if (userProfile?.cifNumber) {
          cifNumberValue = decrypt(userProfile?.cifNumber);
        } else if (userProfile?.email && userProfile?.phoneNumber) {
          cifNumberValue = decrypt(userProfile?.phoneNumber);
        }

        const payload = {
          cifNumber: encrypt(cifNumberValue),
          password: encrypt(password),
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

        if (businessObj.length > 1) {
          dispatch(setUserBusinessType(businessObj));
          dispatch(setPassword(password));
          NavigationService.navigate(navigationStrings.LOGIN_TYPE);
          setIsLoading(false);
        } else {
          await userLoginSingleLoanType(businessObj[0], password);
        }
      } catch (error: any) {
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
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile?.cifNumber, dispatch]
  );

  /**
   * Handles single loan type login
   * @param businessType - Business type object
   * @param password - User's password
   */
  const userLoginSingleLoanType = useCallback(
    async (businessType: any, password: string) => {
      try {
        const deviceId = await getDeviceUniqueId();
        const deviceName = await getDeviceName();
        const deviceInfo = getDeviceInfo();
        const fmcToken = await getFmcToken();

        const payload = {
          businessId: encrypt(businessType?.id?.toString()),
          id: userProfile?.id?.toString(),
          password: encrypt(password?.toString()),
          token: fmcToken,
          deviceId: deviceId,
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

        setIsLoading(false);
        setItem(IS_LOGGED_IN, true);
        const biometricEnabled = await isBiometricEnabled();
        if (biometricEnabled) {
          NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
        } else {
          NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
        }
        //NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
      } catch (error: any) {
        setIsLoading(false);
        const errorMessage = error;
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage,
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile?.id, dispatch]
  );

  /**
   * Handles forgot password navigation
   */
  const onForgotPasswordClick = useCallback(async () => {
    await analytics().logEvent("Forgot_Password_Click", {
      screen_name: "Password",
    });
    let forgotPassword = true;
    NavigationService.navigate(navigationStrings.FORGOTPASSWORD, {
      forgotPassword: forgotPassword,
    });
  }, []);

  /**
   * Memoized password validation schema
   */
  const PasswordSchema = useMemo(
    () =>
      Yup.object().shape({
        password: Yup.string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters long")
          .max(15, "Password must be at most 15 characters long")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
            "Password must contain one capital letter and symbol @$!%*?& or numbers"
          ),
      }),
    []
  );

  /**
   * Memoized Formik initial values
   */
  const initialValues = useMemo(
    () => ({
      password: "",
    }),
    []
  );

  /**
   * Handles form submission
   */
  const handleFormSubmit = useCallback(
    async (values: { password: string }) => {
      await analytics().logEvent("Enter_Password_Continue", {
        screen_name: "Password",
      });

      await performeCustomerLogin(values.password);
    },
    [performeCustomerLogin]
  );
  /**
   * Memoized styles for better performance
   */
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      justifyContent: "space-between" as const,
      paddingHorizontal: 20,
    }),
    []
  );

  const scrollViewStyle = useMemo(
    () => ({
      flexGrow: 1,
    }),
    []
  );

  const subtitleStyle = useMemo(
    () => ({
      marginTop: moderateVerticalScale(5),
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollViewStyle}
        >
          <View style={containerStyle}>
            <View>
              <CustomBackButton onPress={onBackPress} />
              <AuthTitleTextComponent text={strings.passwordTitle} />
              <AuthSubTitleTextComponent
                text={strings.passwordSubtitle}
                textStyle={subtitleStyle}
              />
              <Formik
                initialValues={initialValues}
                validationSchema={PasswordSchema}
                onSubmit={handleFormSubmit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldTouched,
                  validateForm,
                }) => {
                  const handlePress = async () => {
                    const formErrors = await validateForm();
                    if (Object.keys(formErrors).length > 0) {
                      setFieldTouched("password", true);
                      return;
                    }
                    await analytics().logEvent("Enter_Password_Continue", {
                      screen_name: "Password",
                    });

                    performeCustomerLogin(values.password); // call your handleUpdatePassword
                  };
                  return (
                    <View style={styles.container}>
                      <CustomTextInput
                        heading={strings.enterPassword}
                        placeholder={strings.enterPassword}
                        keyboardType="default"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        isPassword
                        secureTextEntry={isSecure}
                        handleEyePress={handleEyePress}
                        errorText={
                          errors.password && touched.password
                            ? errors.password
                            : null
                        }
                      />
                      <CustomButton
                        title={strings.continue}
                        onPress={handlePress}
                        backgroundColor={colors.appThemeColor}
                        imageNeeded={false}
                        logoutImage={false}
                        isDisabled={isLoading}
                      />
                    </View>
                  );
                }}
              </Formik>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.changeCIF} onPress={onForgotPasswordClick}>
                  {strings.forgotTitle}
                </Text>
              </TouchableOpacity>
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

export default Password;
