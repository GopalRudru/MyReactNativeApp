import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  Image,
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "./styles";
import strings from "../../../res/strings";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomButton from "../../../components/CustomButton";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { useDispatch, useSelector } from "react-redux";
import { encrypt } from "../../../utils/crypto";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import {
  setOtpUserData,
  authSelector,
  setMobile,
} from "../../../services/redux/slices/authSlice";
import colors from "../../../res/colors";
import AppConstants from "../../../constant/AppConstants";
import LoaderView from "../../../components/common/LoaderView";
import imagePath from "../../../constant/imagePath";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { clearAsyncStoreAndReduxStore, IS_SESSION_TIME_OUT, setItem } from "../../../utils/storageUtils";
import {
  addKey,
  addLanNumber,
  addMobileNumber,
  removeKey,
  setLoginType,
  setNewUserData,
} from "../../../services/redux/slices/keyRegistrarSlice";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createModuleLogger } from "../../../utils/logger";
import firebaseRemoteConfigService from "../../../services/firebaseRemoteConfigService";
import OtpInputForm from "../../../components/common/OtpInputForrm";
import { emailRegex } from "../../../utils/helpers";
import eligibilityCheckServices from "../../../services/api/service/eligibilityCheckService";
import CustomBackButton from "../../../components/common/CustomBackButton";

const Register = ({route}: any) => {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openEmailOtpModal, setOpenEmailOtpModal] = useState(false);
  const [openMobileOtpModal, setOpenMobileOtpModal] = useState(false);
  const [otpEmailKey, setOtpEmailKey] = useState("");
  const [otpMobileKey, setOtpMobileKey] = useState("");
  const [otpEmailTime, setOtpEmailTime] = useState("");
  const [otpMobileTime, setOtpMobileTime] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [formData, setFormData] = useState({
    loanAccountNumber: "",
    contact: "",
    email: "",
    firstname: "",
    lastname: "",
    mobile: "",
  });
  const applyNowRegisterFlow = route?.params?.applyNowRegisterFlow ?? false;

  const logger = createModuleLogger("Register");

  //   const { otpUserData } = useSelector(authSelector);

  useFocusEffect(
    useCallback(() => {
      setFormData({
        loanAccountNumber: "",
        contact: "",
        email: "",
        firstname: "",
        lastname: "",
        mobile: "",
      });

      // Clear searchText if returning from OTP screen (when otpUserData is cleared)
      //   if (!otpUserData) {
      //     setSearchText("");
      //   }

      // Optionally: return cleanup if needed
    }, [])
  );

  //   // Separate useFocusEffect for initializing remote config
  //   useFocusEffect(
  //     useCallback(() => {
  //       // Initialize and fetch remote config every time screen comes into focus
  //       //initializeRemoteConfig();
  //     }, [])
  //   );
  //   const registerKey = useSelector((state: any) => state.keyRegistrar.keys);

  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    if (isEmailVerified && key === "email" && verifiedEmail !== value) {
      setIsEmailVerified(false);
      setVerifiedEmail("");
    } else if (
      isMobileVerified &&
      key === "mobile" &&
      verifiedMobile !== value
    ) {
      setIsMobileVerified(false);
      setVerifiedMobile("");
    }
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset the sessionExpired flag to prevent multiple navigations
  useEffect(() => {
    const resetSessionTimeout = async () => {
      await setItem(IS_SESSION_TIME_OUT, false);
      await clearAsyncStoreAndReduxStore();
    };
    resetSessionTimeout();
  }, []);

  const handleRegisterbtn = async () => {
    Keyboard.dismiss();
    // await analytics().logEvent("Enter_CIF_Continue", {
    //   login_input: searchText,
    //   screen_name: "Login",
    // });
    const payload = {
      fullName: formData.firstname + " " + formData.lastname,
      email: formData.email,
      mobile: formData.mobile,
    };

    setIsLoading(true);

    service?.auth
      ?.registerNewUser(payload)
      .then((res) => {
        if (res?.status === 201) {
          dispatch(setNewUserData(payload));
          NavigationService.navigate(navigationStrings.FORGOTPASSWORD, {applyNowRegisterFlow : applyNowRegisterFlow});
          setIsLoading(false);
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        dispatch(
          setStatusPopup({
            status: "error",
            message: errorMessage,
          })
        );
        setIsLoading(false);
      });
  };

  const handleSendEmailOtp = async (email: string) => {
    try {
      setIsLoading(true);
      // Call your OTP service here
      const response = await eligibilityCheckServices.sendOtp({
        name: formData.firstname + " " + formData.lastname,
        email: email,
        isResend: false,
      });
      if (response?.data?.status === "success") {
        setOtpEmailKey(response.data.data.value);
        setOtpEmailTime(response.data.data.otpTime);
        setOpenEmailOtpModal(true);
        setVerifiedEmail(email);
        // dispatch(
        //   setStatusPopup({
        //     status: "success",
        //     message: "OTP sent to your email successfully!",
        //   })
        // );
      } else {
        dispatch(
          setStatusPopup({
            status: "error",
            message: response?.data?.message || "Failed to send OTP",
          })
        );
      }
    } catch (error: any) {
      dispatch(
        setStatusPopup({
          status: "error",
          message: error || "Failed to send OTP",
          //   message: error?.response?.data?.message || "Failed to send OTP",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMobileOtp = async (mobile: string) => {
    try {
      setIsLoading(true);
      // Call your OTP service here
      const response = await eligibilityCheckServices.sendOtp({
        name: formData.firstname + " " + formData.lastname,
        mobileNumber: mobile,
        isResend: false,
      });

      if (response?.data?.status === "success") {
        setOtpMobileKey(response.data.data.value);
        setOtpMobileTime(response.data.data.otpTime);
        setOpenMobileOtpModal(true);
        setVerifiedMobile(mobile);
        // dispatch(
        //   setStatusPopup({
        //     status: "success",
        //     message: "OTP sent to your mobile successfully!",
        //   })
        // );
      } else {
        dispatch(
          setStatusPopup({
            status: "error",
            message: response?.data?.message || "Failed to send OTP",
          })
        );
      }
    } catch (error: any) {
      dispatch(
        setStatusPopup({
          status: "error",
          message: error || "Failed to send OTP",
          //   message: error?.response?.data?.message || "Failed to send OTP",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOtpSubmit = async (otp: string) => {
    try {
      setIsLoading(true);
      // Call your OTP verification service here
      const response = await eligibilityCheckServices.verifyOtp({
        type: "email",
        email: formData.email,
        key: otpEmailKey,
        emailOtp: otp,
        emailOtpCrtdAt: otpEmailTime,
      });
      if (response?.data?.status === "success") {
        setIsEmailVerified(true);
        setOpenEmailOtpModal(false);
        dispatch(
          setStatusPopup({
            status: "success",
            message: "Email verified successfully!",
          })
        );
      } else {
        dispatch(
          setStatusPopup({
            status: "error",
            message: response?.data?.message || "Invalid OTP",
          })
        );
      }
    } catch (error: any) {
      dispatch(
        setStatusPopup({
          status: "error",
          message: error?.response?.data?.message || "Failed to verify OTP",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileOtpSubmit = async (otp: string) => {
    try {
      setIsLoading(true);
      // Call your OTP verification service here
      const response = await eligibilityCheckServices.verifyOtp({
        type: "mobile",
        mobileNumber: formData.mobile,
        key: otpMobileKey,
        mobileOtp: otp,
        mobileOtpCrtdAt: otpMobileTime,
      });

      if (response?.data?.status === "success") {
        dispatch(setMobile(formData.mobile));
        setIsMobileVerified(true);
        setOpenMobileOtpModal(false);
        dispatch(
          setStatusPopup({
            status: "success",
            message: "Mobile number verified successfully!",
          })
        );
      } else {
        dispatch(
          setStatusPopup({
            status: "error",
            message: response?.data?.message || "Invalid OTP",
          })
        );
      }
    } catch (error: any) {
      dispatch(
        setStatusPopup({
          status: "error",
          message: error?.response?.data?.message || "Failed to verify OTP",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onBackPress = () => {
    NavigationService.resetTo(navigationStrings.LOGIN);
  };

  const renderContent = () => (
    <View style={[styles.scrollContentContainer, { paddingTop: 0 }]}>
      <CustomBackButton onPress={onBackPress} bottom={1} />
      <View>
        <AuthTitleTextComponent text={strings.loginTitle} />

        <View style={{ marginTop: 10 }}>
          <AuthSubTitleTextComponent
            text={
              "Please enter your loan related details to activate your account."
            }
          />
        </View>
        <>
          <CustomTextInput
            topMargin={30}
            heading="First Name"
            mandatory={true}
            placeholder="Enter First Name"
            keyboardType="default"
            onChangeText={(text) => handleChange("firstname", text)}
            value={formData.firstname}
          />

          <CustomTextInput
            topMargin={15}
            heading="Last Name"
            mandatory={true}
            placeholder="Enter Last Name"
            keyboardType="default"
            onChangeText={(text) => handleChange("lastname", text)}
            value={formData.lastname}
          />
          <View style={styles.wrapper}>
            <Text style={styles.label}>{"Email ID"}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder={"Enter Email ID"}
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                onChangeText={(text) => handleChange("email", text)}
                value={formData.email}
                style={styles.input}
              />

              <TouchableOpacity
                disabled={isEmailVerified}
                style={
                  {
                    // flex: 1,
                    // // backgroundColor: "green",
                    // marginRight: 10,
                    // alignItems: "flex-end",
                  }
                }
                onPress={() => {
                  if (formData.email && emailRegex.test(formData.email)) {
                    // setOpenEmailOtpModal(true);
                    handleSendEmailOtp(formData.email);
                  } else {
                    dispatch(
                      setStatusPopup({
                        status: "error",
                        message: "Please enter a valid email address",
                      })
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.verifyText,
                    {
                      color: isEmailVerified ? "#4caf50" : "#33c2c4",
                    },
                  ]}
                >
                  {isEmailVerified ? "Verified" : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.wrapper}>
            <Text style={styles.label}>{"Mobile Number"}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder={"Enter Mobile Number"}
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                onChangeText={(text) => handleChange("mobile", text)}
                value={formData.mobile}
                style={styles.input}
              />

              <TouchableOpacity
                disabled={isMobileVerified}
                onPress={() => {
                  if (formData.mobile && formData.mobile.length >= 10) {
                    // setOpenMobileOtpModal(true);
                    handleSendMobileOtp(formData.mobile);
                  } else {
                    dispatch(
                      setStatusPopup({
                        status: "error",
                        message: "Please enter a valid mobile number",
                      })
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.verifyText,
                    { color: isMobileVerified ? "#4caf50" : "#33c2c4" },
                  ]}
                >
                  {isMobileVerified ? "Verified" : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
        <View style={{ marginTop: 16 }}>
          <CustomButton
            title={strings.continue}
            onPress={() => handleRegisterbtn()}
            isDisabled={
              isLoading ||
              formData.email.length <= 0 ||
              formData.mobile.length <= 0 ||
              formData.firstname.length <= 0 ||
              formData.lastname.length <= 0 ||
              !isEmailVerified ||
              !isMobileVerified
            }
            marginTop={8}
          />
        </View>
      </View>
      <Modal
        visible={openEmailOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenEmailOtpModal(false)}
      >
        <View style={styles.overlay}>
          {/* <View style={styles.modalCard}> */}
          <OtpInputForm
            // emailMasked={maskEmail(watch("email"))}
            emailMasked={
              formData.email?.length > 3
                ? formData.email?.slice(0, 3) +
                  formData.email?.slice(3).replace(/.(?=.{4})/g, "x")
                : formData.email?.replace(/.(?=.{4})/g, "x")
            }
            onOtpSubmit={(otp) => {
              handleEmailOtpSubmit(otp);
              setOpenEmailOtpModal(false);
            }}
            closeModal={() => setOpenEmailOtpModal(false)}
            onResendOtp={async () => {
              // if ("email")) {
              await handleSendEmailOtp(formData?.email);
              // }
            }}
          />
          {/* </View> */}
        </View>
      </Modal>

      <Modal
        visible={openMobileOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenMobileOtpModal(false)}
      >
        <View style={styles.overlay}>
          {/* <View style={styles.modalCard}> */}
          <OtpInputForm
            // mobileMasked={maskMobile(watch("mobile"))}
            mobileMasked={formData?.mobile.replace(/.(?=.{4})/g, "x")}
            closeModal={() => setOpenMobileOtpModal(false)}
            onOtpSubmit={(otp) => {
              handleMobileOtpSubmit(otp);
              setOpenMobileOtpModal(false);
            }}
            onResendOtp={async () => {
              // if (watch("mobile")) {
              await handleSendMobileOtp(formData?.mobile);
              // }
            }}
          />
          {/* </View> */}
        </View>
      </Modal>
      <Image source={imagePath.avansePreLogin} style={styles.authImageStyle} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      {Platform.OS === "ios" ? (
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={false}
          extraScrollHeight={0}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {renderContent()}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {renderContent()}
        </ScrollView>
      )}
      {isLoading && <LoaderView />}
    </SafeAreaView>
  );
};

export default Register;
