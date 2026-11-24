import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import { SafeAreaView } from "react-native-safe-area-context";
import imagePath from "../../../constant/imagePath";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { moderateVerticalScale } from "react-native-size-matters";
import strings from "../../../res/strings";
import { useDispatch, useSelector } from "react-redux";
import {
  authSelector,
  clearPassword,
  clearPasswordType,
  setUserAuth,
  setUserBusinessType,
  setUserLoanCategory,
  setUserPermission,
  setUserProfileData,
} from "../../../services/redux/slices/authSlice";
import { decrypt, encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import axiosInstance, {
  checkConnectivity,
  secureFetch,
} from "../../../services/api/apiClient/apiClient";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import logger from "../../../utils/logger";
import { isBiometricEnabled } from "../mpinBiometric/BiometricUtils";
const { width, height } = Dimensions.get("window");


const ThankYouScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const { userProfile, passwordType, password, mobile } = useSelector(authSelector);
  const PasswordCreated = route?.params?.PasswordCreated ?? false;
  const applyNowRegisterFlow = route?.params?.applyNowRegisterFlow ?? false;
  const userLoginSingleLoanType = (businessType: any, password: string) => {
    const payload = {
      businessId: encrypt(businessType?.id?.toString()),
      id: userProfile?.id?.toString(),
      password: encrypt(password?.toString()),
    };
    service?.auth
      ?.secureSetLoginV2(payload)
      .then(async (response) => {
        const token = response?.data?.data?.token;
        const permissionObj = response?.data?.data?.permission;
        const loanCategoryObj = response?.data?.data?.result;
        dispatch(setUserAuth(encrypt(token)));
        dispatch(setUserPermission(permissionObj));
        dispatch(setUserBusinessType(businessType));
        dispatch(setUserLoanCategory(loanCategoryObj));
        dispatch(clearPassword());
        const biometricEnabled = await isBiometricEnabled();
        if (biometricEnabled) {
          NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
        } else {
          NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
        }
        //NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
      })
      .catch(async (error) => {
        const errorMessage =
          error.response?.data?.message || error || "An error occurred";
        let isConnetced = await checkConnectivity();
        if (isConnetced) {
          dispatch(
            setStatusPopup({
              status: "error",
              message: errorMessage,
            })
          );
        }
      });
  };

  const handleSubmit = async () => {
    if (passwordType?.includes("forgot") && passwordType !== null) {
      // navigate(ROUTES.Login.index, { replace: true });
      NavigationService.resetTo(navigationStrings.LOGIN);
      // setNextStep('')
    } else if (passwordType?.includes("set") && passwordType !== null) {
      //   const payload = {
      //     cifNumber: userProfile?.cifNumber,
      //   };

      //   service?.auth
      //     ?.secureGetLogin(payload)
      //     .then((res: any) => {
      //       const businessObj = res?.data?.data?.business_type;
      //       // dispatch(setUserAuth(token));
      //       // dispatch(setUserPermission(permissionObj));
      //       if (businessObj.length > 1) {
      //         dispatch(setUserBusinessType(businessObj));
      //         // navigate(ROUTES.Login.loginType.locationPath, { replace: true });
      //         NavigationService.navigate(navigationStrings.LOGIN_TYPE);
      //         // setNextStep(ROUTES?.Login?.loginType?.path);
      //       } else {
      //         userLoginSingleLoanType(businessObj[0], password);
      //       }
      //       // navigate(ROUTES.Dashboard.index, { replace: true });
      //     })
      //     .catch(async (error: any) => {
      //       const errorMessage =
      //         error.response?.data?.message || error || "An error occurred";
      //       let isConnetced = await checkConnectivity();
      //       if (isConnetced) {
      //         dispatch(
      //           setStatusPopup({
      //             status: "error",
      //             message: errorMessage,
      //           })
      //         );
      //       }
      //     });
      // }

      try {
        const encryptedKey = encrypt(mobile);
        // const resp: any = await axiosInstance.post(
        //   "api/v1/user-lead/bypass-login",
        // {
        //   key: encryptedKey,
        // }
        // );
        const resp = await secureFetch({
          url: "api/v1/user-lead/bypass-login",
          method: "POST",
          body: {
            key: encryptedKey,
          },
        });
        if (resp?.data?.status === "success") {
          const data: any = JSON.parse(decrypt(resp?.data?.data));
          logger.debug("Bypass login data:........", data);
          dispatch(setUserProfileData(data?.user));
          dispatch(setUserPermission(data?.permission));
          dispatch(
            setUserBusinessType(
              data?.businessType.length > 0 ? data?.businessType?.[0] : {}
            )
          );
          dispatch(setUserLoanCategory(data?.result));
          dispatch(setUserAuth(data?.token));
          dispatch(clearPasswordType());
          NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN, {applyNowRegisterFlow: applyNowRegisterFlow});
        } else {
          // Handle error (show snackbar, etc.)
          console.error(resp?.data?.message || "Bypass login failed");
        }
      } catch (error: any) {
        // Handle error (show snackbar, etc.)
        console.error(error?.response?.data?.message || "Bypass login failed");
      }

      // dispatch(clearPasswordType());
    }
  };

  const handleContinue = () => {
    //NavigationService.navigate(navigationStrings.LOGIN);
    NavigationService.resetTo(navigationStrings.LOGIN);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <View style={styles.scrollContentContainer}>
        <View style={{ alignItems: "center" }}>
          {PasswordCreated && (
            <Image source={imagePath.success} style={{ alignSelf: "center" }} />
          )}

          {PasswordCreated && (
            <>
              <AuthTitleTextComponent
                text={strings.password_successfully_created}
                textStyle={{ marginTop: moderateVerticalScale(20) }}
              />
              <AuthSubTitleTextComponent
                text={strings.now_you_can_securely_access_your_accout}
                textStyle={{
                  marginTop: moderateVerticalScale(10),
                  marginBottom: moderateVerticalScale(25),
                }}
              />
            </>
          )}
          {!PasswordCreated && (
            <>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.title}>Thank You!</Text>
              </View>
              <Text style={styles.message}>
                Your CIF number has been successfully registered. You can now
                log in to the customer portal using your CIF/Email/Mobile
                number.
              </Text>
            </>
          )}
          {PasswordCreated && (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {passwordType?.includes("forgot") && passwordType !== null
                  ? "Login"
                  : "Continue"}
              </Text>
            </TouchableOpacity>
          )}
          {!PasswordCreated && (
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>{"Continue"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image
          source={imagePath.avansePreLogin}
          style={styles.authImageStyle}
        />
      </View>
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default ThankYouScreen;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    marginBottom: 16,
    color: "#333",
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 32,
    fontFamily: fonts.regular,
    backgroundColor: colors.appThemeColor,
    fontSize: 15,
    borderRadius: 6,
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },
});
