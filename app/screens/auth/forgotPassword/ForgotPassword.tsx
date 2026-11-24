import React, { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomButton from "../../../components/CustomButton";
import strings from "../../../res/strings";
import * as NavigationService from "../../../navigation/NavigationService";
import imagePath from "../../../constant/imagePath";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { moderateVerticalScale } from "react-native-size-matters";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import { decrypt, encrypt } from "../../../utils/crypto";
import service from "../../../services/api/service";
import { useDispatch, useSelector } from "react-redux";
import {
  authSelector,
  setPassword,
  setPasswordType,
} from "../../../services/redux/slices/authSlice";
import navigationStrings from "../../../constant/navigationStrings";
import colors from "../../../res/colors";
import { Formik } from "formik";
import * as Yup from "yup";
import LoaderView from "../../../components/common/LoaderView";
import CustomBackButton from "../../../components/common/CustomBackButton";
import fonts from "../../../res/fonts";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AppConstants from "../../../constant/AppConstants";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import logger from "../../../utils/logger";

const ForgotPassword = ({ route, navigation }: any) => {
  const forgotPassword = route?.params?.forgotPassword ?? false;
  const applyNowRegisterFlow = route?.params?.applyNowRegisterFlow ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const newUserData: any = useSelector((state: any) => state.keyRegistrar);
  const dispatch = useDispatch();
  const { userProfile, setPasswordKey } = useSelector(authSelector);

  const onBackPress = () => {
    if (forgotPassword) {
      NavigationService.goBack();
    } else {
      NavigationService.navigate(navigationStrings.LOGIN);
    }
  };

  const handleEyePress = (value: boolean) => {
    setIsSecure(!value);
  };
  const handleLoginbtn = (payload: any) => {
    Keyboard.dismiss();
    setIsLoading(true);
    service?.auth
      ?.secureSetUserPassword(payload)
      .then((res: any) => {
        // handleSnackbarOpen("Your password is updated successfully","success");
        let passWord = decrypt(payload.newPassword);
        dispatch(setPassword(passWord));
        dispatch(setPasswordType(res?.data?.data?.passwordType));
        NavigationService.navigate("ThankYouScreen", { PasswordCreated: true, applyNowRegisterFlow: applyNowRegisterFlow });
        setIsLoading(false);
      })
      .catch(async (error: any) => {
        // handleSnackbarOpen(error.response.data.message,"error");
        setIsLoading(false);
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error,
            })
          );
        }
      });
  };

  const bulletWithText = (text: string, marginTop: number) => {
    return (
      <View style={[styles.bulletItem, marginTop !== 0 ? { marginTop } : null]}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
  };

  const PasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("New Password is required")
      .min(8, "New Password must be at least 8 characters long")
      .max(15, "New Password must be at most 15 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        "Password must contain one capital letter and symbol @$!%*?& or numbers"
      ),

    confirmNewPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("newPassword")], "Passwords do not match."),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      {/*<KeyboardAvoidingView
        style={styles.container}
      > */}
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={Platform.OS === "ios" ? 150 : 0}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <View>
            <CustomBackButton onPress={() => onBackPress()} />
            <AuthTitleTextComponent
              text={
                forgotPassword ? strings.forgotTitle : strings.setupYourPassword
              }
            />
            <AuthSubTitleTextComponent
              text={
                forgotPassword
                  ? strings.forgotSubtitle
                  : "Once your password is set, you can securely access your account."
              }
              textStyle={{
                marginTop: moderateVerticalScale(5),
                fontFamily: fonts.regular,
              }}
            />
            <Formik
              initialValues={{
                newPassword: "",
                confirmNewPassword: "",
              }}
              validationSchema={PasswordSchema}
              onSubmit={() => {}} // Add required onSubmit prop
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
                    setFieldTouched("newPassword", true);
                    setFieldTouched("confirmNewPassword", true);
                    return;
                  }
                  let cifNumberValue = "";
                  if (newUserData?.newUserData?.mobile) {
                    cifNumberValue = encrypt(newUserData?.newUserData?.mobile);
                  } else {
                    cifNumberValue = "";
                    if (userProfile?.cifNumber) {
                      cifNumberValue = userProfile?.cifNumber;
                    } else if (userProfile?.email && userProfile?.phoneNumber) {
                      cifNumberValue = userProfile?.phoneNumber;
                    }
                  }

                  const payload = {
                    cifNumber: userProfile?.cifNumber, //decrypt(userProfile?.cifNumber),
                    newPassword: encrypt(values.confirmNewPassword),
                    password: encrypt(values.newPassword),
                    passwordType: forgotPassword ? "forgot" : "set",
                    key: setPasswordKey,
                  };
                  analytics().logEvent("Enter_SetPassword_Continue", {
                    screen_name: "ForgotPassword",
                  });
                  handleLoginbtn(payload); // call your handleUpdatePassword
                };
                return (
                  <View style={styles.container}>
                    <CustomTextInput
                      heading={strings.newPassword}
                      placeholder={"New password"}
                      keyboardType="default"
                      value={values.newPassword}
                      onChangeText={handleChange("newPassword")}
                      onBlur={handleBlur("newPassword")}
                      isPassword
                      secureTextEntry={isSecure}
                      handleEyePress={handleEyePress}
                      errorText={
                        errors.newPassword && touched.newPassword
                          ? errors.newPassword
                          : null
                      }
                    />

                    <CustomTextInput
                      heading={strings.confirmNewPassword}
                      placeholder={"Confirm password"}
                      keyboardType="default"
                      value={values.confirmNewPassword}
                      onChangeText={handleChange("confirmNewPassword")}
                      onBlur={handleBlur("confirmNewPassword")}
                      isPassword
                      secureTextEntry={isSecure}
                      handleEyePress={handleEyePress}
                      errorText={
                        errors.confirmNewPassword && touched.confirmNewPassword
                          ? errors.confirmNewPassword
                          : null
                      }
                    />
                    {bulletWithText(strings.forgotFooter, 0)}
                    {bulletWithText(strings.forgotPasswordRule, 3)}
                    <CustomButton
                      title={
                        forgotPassword ? strings.Continue : "Set New Password"
                      }
                      onPress={handlePress}
                      backgroundColor={colors.appThemeColor}
                      imageNeeded={false}
                      logoutImage={null}
                      isDisabled={isLoading}
                    />
                    {/* {!forgotPassword && (
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleBacktoLoginPress()}
                        // disabled={isDisabled || false}
                        activeOpacity={AppConstants.buttonActiveOpacity}
                      >
                        <Image
                          style={{
                            marginRight: 5,
                            height: 20,
                            width: 20,
                            tintColor: colors.appThemeColor,
                          }}
                          resizeMode={"contain"}
                          source={imagePath.back}
                        />
                        <Text style={styles.text}>{"Back to login"}</Text>
                      </TouchableOpacity>
                    )} */}
                  </View>
                );
              }}
            </Formik>
          </View>
          <Image
            source={imagePath.avansePreLogin}
            style={styles.authImageStyle}
          />
        </View>
      </KeyboardAwareScrollView>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

export default ForgotPassword;
