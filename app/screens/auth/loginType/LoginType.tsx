import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageStyle,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import imagePath from "../../../constant/imagePath";
import colors from "../../../res/colors";
import strings from "../../../res/strings";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { moderateVerticalScale } from "react-native-size-matters";
import CustomButton from "../../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import {
  authSelector,
  clearMpin,
  clearPassword,
  setUserAuth,
  setUserBusinessType,
  setUserLoanCategory,
  setUserPermission,
} from "../../../services/redux/slices/authSlice";
import {
  businessTypeLabel,
  getDeviceInfo,
  getDeviceName,
  getDeviceUniqueId,
  getFmcToken,
  loginTypeIcon,
} from "../../../utils/helpers";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import { decrypt, encrypt } from "../../../utils/crypto";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import { IS_LOGGED_IN, setItem } from "../../../utils/storageUtils";
import LoaderView from "../../../components/common/LoaderView";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { createModuleLogger } from "../../../utils/logger";
import { isBiometricEnabled, checkBiometricAvailability, disableBiometricLock } from "../mpinBiometric/BiometricUtils";
import { BiometryTypes } from "react-native-biometrics";
import AuthCard from "../../../components/AuthCard";
import { setTabType } from "../../../services/redux/slices/tabsSlice";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { hp } from "../../../utils/dimensions";

const LoginType = () => {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { userProfile, businessType, password, mpin: encryptedMpin, mpinData } = useSelector(authSelector);
  const [localBusinessType] = useState(() => Array.isArray(businessType) ? businessType : []);
  const [isLoading, setIsLoading] = useState(false);
  const logger = createModuleLogger("LoginType");

  const handleContinue = async () => {
    const mpin = decrypt(encryptedMpin);
    if (selectedTypeId) {
      logger.info("Selected Login Type:", selectedTypeId);
      await analytics().logEvent("Login_Type_Continue", {
        selected_type_id: selectedTypeId,
      });
      setIsLoading(true);
      const selectedBusinessType = Array.isArray(businessType)
        ? businessType.find((loan: any) => loan?.id === selectedTypeId)
        : undefined;

      const deviceId = await getDeviceUniqueId();
      const deviceName = await getDeviceName();
      const deviceInfo = getDeviceInfo();
      const fmcToken = await getFmcToken();

      let payload;

      if (password) {
        payload = {
          businessId: encrypt(selectedTypeId?.toString()),
          id: userProfile?.id?.toString(),
          password: encrypt(password?.toString()),
          token: fmcToken,
          deviceId: encrypt(deviceId),
          deviceInfo: deviceInfo,
          deviceName: deviceName,
        };
      } else {
        const { biometryType } = await checkBiometricAvailability();
        payload = {
          businessId: encrypt(selectedTypeId?.toString()),
          id: userProfile?.id?.toString(),
          ...(mpin !== "" && { mpin: encrypt(mpin) }),
          cifNumber: userProfile?.cifNumber,
          authType: mpin === "" ? "BIOMETRIC" : "MPIN",
          ...(mpin === "" && {
            subAuthType:
              biometryType === BiometryTypes.FaceID ? "FACE_ID" : "FINGERPRINT",
          }),
          token: fmcToken,
          deviceId: encrypt(deviceId),
          deviceInfo: deviceInfo,
          deviceName: deviceName,
        };
      }

      service?.auth
        ?.secureSetLoginV2(payload)
        .then(async (response) => {
          const token = response?.data?.data?.token;
          const permissionObj = response?.data?.data?.permission;
          const loanCategoryObj = response?.data?.data?.result;
          dispatch(setUserAuth(encrypt(token)));
          dispatch(setUserPermission(permissionObj));
          dispatch(setUserBusinessType(selectedBusinessType));

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

          dispatch(setUserLoanCategory(loanCategoryObj));
          dispatch(clearPassword());
          setIsLoading(false);
          setItem(IS_LOGGED_IN, true);
          const biometricEnabled = await isBiometricEnabled();

          if (password != null && password !== "") {
            NavigationService.navigate(
              navigationStrings.CREATE_RESET_MPIN_SCREEN,
            );
          } else {
            dispatch(clearMpin());
            NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
            await disableBiometricLock();
          }

          // if (biometricEnabled) {
          //   NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
          // } else {
          //   NavigationService.navigate(navigationStrings.CREATE_RESET_MPIN_SCREEN);
          // }
          //NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
        })
        .catch(async (error) => {
          const errorMessage = error
            //error.response?.data?.message || "An error occurred";
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
        });
    }
  };

  const renderOption = ({ item }: { item: any }) => {
    const isSelected = selectedTypeId === item.id;
    const handleSelectType = (id: string) => {
      setSelectedTypeId(id);
    };
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.optionContainer, isSelected && styles.selectedContainer]}
        onPress={() => handleSelectType(item.id)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? colors.appThemeColor
                : colors.iconContainerUnselectedColor,
            },
          ]}
        >
          <Image
            source={loginTypeIcon(item.name)}
            style={[
              styles.optionContainerIcon as ImageStyle,
              { tintColor: isSelected ? colors.white : colors.appThemeColor },
            ]}
          />
        </View>

        <Text style={styles.optionText}>{businessTypeLabel(item.name)}</Text>

        <View style={styles.radioCircle}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => {
    return (
      <View>
        <AuthTitleTextComponent
          text={strings.Select_Login_As}
          textStyle={{ marginBottom: moderateVerticalScale(6) }}
        />

        <AuthSubTitleTextComponent
          text={strings.We_identified_the_following_login_Type}
          textStyle={{ marginBottom: moderateVerticalScale(32) }}
        />
      </View>
    );
  };

  const ListFooter = () => {
    return (
      <View>
        <CustomButton
          title={strings.continue}
          backgroundColor={
            selectedTypeId
              ? colors.appThemeColor
              : colors.disabledBackGroundColor
          }
          onPress={handleContinue}
          isDisabled={!selectedTypeId || isLoading}
          imageNeeded={false}
          logoutImage={null}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.containerView} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.welcomeBgColor}
        barStyle="dark-content"
      />
      <ScrollView
        style={{ backgroundColor: colors.white }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
            <ListHeader />
            {localBusinessType.map((item: any) => (
              <React.Fragment key={item.id}>
                {renderOption({ item })}
              </React.Fragment>
            ))}
            <ListFooter />
          </AuthCard>
        </View>
      </ScrollView>
      <Image source={imagePath.avansePreLogin} style={styles.authImageStyle} />
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default LoginType;
