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
} from "../../../services/redux/slices/authSlice";
import { encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { isBiometricEnabled } from "./BiometricUtils";
const { width, height } = Dimensions.get("window");

const MpinUpdatedSuccessScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const { userProfile, passwordType, password } = useSelector(authSelector);

  const userLoginSingleLoanType = (businessType: any, password: string) => {
    const payload = {
      businessId: encrypt(businessType?.id?.toString()),
      id: userProfile?.id?.toString(),
      password: encrypt(password?.toString()),
    };

    service?.auth
      ?.secureSetLogin(payload)
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

  const handleSubmit = () => {
    if (passwordType?.includes("forgot") && passwordType !== null) {
      // navigate(ROUTES.Login.index, { replace: true });
      NavigationService.resetTo(navigationStrings.LOGIN);
      // setNextStep('')
    } else if (passwordType?.includes("set") && passwordType !== null) {
      const payload = {
        cifNumber: userProfile?.cifNumber,
      };

      service?.auth
        ?.secureGetLogin(payload)
        .then((res: any) => {
          const businessObj = res?.data?.data?.business_type;
          // dispatch(setUserAuth(token));
          // dispatch(setUserPermission(permissionObj));
          if (businessObj.length > 1) {
            dispatch(setUserBusinessType(businessObj));
            // navigate(ROUTES.Login.loginType.locationPath, { replace: true });
            NavigationService.navigate(navigationStrings.LOGIN_TYPE_SCREEN);
            // setNextStep(ROUTES?.Login?.loginType?.path);
          } else {
            userLoginSingleLoanType(businessObj[0], password);
          }
          // navigate(ROUTES.Dashboard.index, { replace: true });
        })
        .catch(async (error: any) => {
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
    }
    dispatch(clearPasswordType());
  };

  const handleContinue = () => {
    //NavigationService.navigate(navigationStrings.LOGIN);
    NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <View style={styles.scrollContentContainer}>
        <View style={{ alignItems: "center" }}>
          <Image source={imagePath.success} style={{ alignSelf: "center" }} />

           <AuthTitleTextComponent
                text={strings.mpin_successfully_created}
                textStyle={{ marginTop: moderateVerticalScale(20) }}
              />
              <AuthSubTitleTextComponent
                text={strings.now_you_can_securely_access_your_accout}
                textStyle={{
                  marginTop: moderateVerticalScale(10),
                  marginBottom: moderateVerticalScale(25),
                }}
              />
           
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>{"Continue"}</Text>
            </TouchableOpacity>
        </View>

        <Image
          source={imagePath.avansePreLogin}
          style={styles.authImageStyle}
        />
      </View>
    </SafeAreaView>
  );
};

export default MpinUpdatedSuccessScreen;

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
