import { View, ScrollView, Image, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import styles from "./styles";
import imagePath from "../../../constant/imagePath";
import * as NavigationService from "../../../navigation/NavigationService";
import strings from "../../../res/strings";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import { moderateVerticalScale } from "react-native-size-matters";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import ListComponent from "../../../components/ListComponent";
import CustomButton from "../../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import {
  authSelector,
  setUserProfileData,
} from "../../../services/redux/slices/authSlice";
import navigationStrings from "../../../constant/navigationStrings";
import CustomBackButton from "../../../components/common/CustomBackButton";
import analytics from "@react-native-firebase/analytics";
import { decrypt, encrypt, encryptObject } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import LoaderView from "../../../components/common/LoaderView";
import AuthCard from "../../../components/AuthCard";
import logger from "../../../utils/logger";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { isMpinEnabled } from "../mpinBiometric/BiometricUtils";
import { hp } from "../../../utils/dimensions";
import colors from "../../../res/colors";

const Cif = ({ route, navigation }: any) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const registerKey = useSelector((state: any) => state.keyRegistrar.keys);
  const rawSignupOnboardApi = useSelector(
    (state: any) => state.keyRegistrar.signupOnboardApi
  );

  const { mpinData } = useSelector(authSelector);

  const onBackPress = () => {
    if (registerKey === "register") {
      NavigationService.resetTo(navigationStrings.LOGIN);
    } else {
      NavigationService.goBack();
    }
  };

  const signupOnboardApi =
    typeof rawSignupOnboardApi === "string"
      ? JSON.parse(rawSignupOnboardApi?.replace(/([{,]\s*)(\w+):/g, '$1"$2":'))
      : rawSignupOnboardApi;

  const mobileNumbers = useSelector(
    (state: any) => state.keyRegistrar.mobileNumbers
  );
  const lanNumbers = useSelector((state: any) => state.keyRegistrar.lanNumbers);
  const { otpVerifyUsersData } = useSelector(authSelector);

  const onContinueClick = async () => {
    const matchObject = signupOnboardApi.filter(
      (item: any) => item.custcif === String(selectedTypeId)
    );

    const signupOnboardPayload = {
      lan: encrypt(lanNumbers),
      key: encrypt(mobileNumbers),
      type: 1,
      custData: encryptObject(matchObject),
    };

    if (registerKey == "register") {
      setIsLoading(true);
      service?.auth
        ?.secureSignupOnboard(signupOnboardPayload)
        .then((res) => {
          setIsLoading(false);
          const otpVerifyUsersData = res?.data?.data;
          if (otpVerifyUsersData?.length === 1) {
            dispatch(setUserProfileData(otpVerifyUsersData[0]));
          }
          // NavigationService.navigate("ThankYouScreen");
          NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
        })
        .catch((error: any) => {
          setIsLoading(false);
          dispatch(
            setStatusPopup({
              status: "error",
              message: error || "An error occurred", //error.response?.data?.message || "An error occurred",
            })
          );
        });
    } else {
      if (selectedTypeId) {
        await analytics().logEvent("Selected_CIF", {
          selected_cif_id: selectedTypeId,
        });

        const profile: any = otpVerifyUsersData?.find(
          (profile: any) => profile?.id === selectedTypeId,
        );

        if (
          (await isMpinEnabled()) &&
          mpinData != null &&
          (mpinData?.cifNumber != null ||
            mpinData?.cifNumber != undefined ||
            mpinData?.cifNumber != "") &&
          decrypt(mpinData?.cifNumber) === decrypt(profile?.cifNumber)
        ) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message:
                "An active MPIN already exists for this Email. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
              showLeftCross: false,
              positiveButtonText: "OK",
              onPositivePress: () => {
                NavigationService.resetTo(
                  navigationStrings.BIOMETRIC_MPIN_LOGIN,
                );
              },
            }),
          );

          return;
        }

        if (profile?.id) {
          dispatch(setUserProfileData(profile));
          NavigationService.navigate(
            navigationStrings.CREATE_RESET_MPIN_SCREEN,
          );
          // if (profile?.isVerified) {
          //   NavigationService.navigate(navigationStrings.PASSWORD);
          // } else {
          //   NavigationService.navigate(navigationStrings.FORGOTPASSWORD);
          // }
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.welcomeBgColor}
        barStyle="dark-content"
      />
      <ScrollView
        style={{ backgroundColor: colors.white }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 0,
            backgroundColor: colors.white,
          }}
        >
          <View>
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 60,
                  paddingHorizontal: 24,
                  marginTop: 20,
                }}
              >
                <CustomBackButton
                  onPress={onBackPress}
                  style={{
                    marginBottom: 0,
                    marginTop: Platform.OS === "ios" ? 0 : 16,
                  }}
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
                </View>
              </View>

              <AuthCard style={{ marginTop: 10,}}>
                <AuthTitleTextComponent
                  text={
                    registerKey === "register"
                      ? "Please select preferred CIF number"
                      : strings.select_cif_number
                  }
                />

                <AuthSubTitleTextComponent
                  text={
                    registerKey === "register"
                      ? "The following CIF number linked to your email/mobile number"
                      : strings.we_have_found_following_CIF_linked
                  }
                  textStyle={{
                    marginTop: moderateVerticalScale(6),
                    marginBottom: moderateVerticalScale(32),
                  }}
                />

                <ListComponent
                  data={
                    registerKey == "register"
                      ? signupOnboardApi
                      : otpVerifyUsersData
                  }
                  registerKey={registerKey}
                  selectedTypeId={selectedTypeId}
                  setSelectedTypeId={setSelectedTypeId}
                />

                <CustomButton
                  title={strings.continue}
                  onPress={onContinueClick}
                  backgroundColor={null}
                  imageNeeded={false}
                  logoutImage={null}
                  isDisabled={!selectedTypeId || isLoading}
                />
              </AuthCard>
            </View>
          </View>
          <Image
            source={imagePath.avansePreLogin}
            style={styles.authImageStyle}
          />
        </View>
      </ScrollView>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default Cif;
