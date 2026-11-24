import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import strings from "../../../res/strings";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomButton from "../../../components/CustomButton";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import { useDispatch, useSelector } from "react-redux";
import { decrypt, encrypt } from "../../../utils/crypto";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import service from "../../../services/api/service";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import {
  setOtpUserData,
  authSelector,
  setMpinData,
} from "../../../services/redux/slices/authSlice";
import colors from "../../../res/colors";
import AppConstants from "../../../constant/AppConstants";
import LoaderView from "../../../components/common/LoaderView";
import imagePath from "../../../constant/imagePath";
import analytics from "@react-native-firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { clearAsyncStoreAndReduxStore } from "../../../utils/storageUtils";
import {
  addKey,
  addLanNumber,
  addMobileNumber,
  removeKey,
  setLoginType,
} from "../../../services/redux/slices/keyRegistrarSlice";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createModuleLogger } from "../../../utils/logger";
import firebaseRemoteConfigService from "../../../services/firebaseRemoteConfigService";
import ShadowCardComponent from "../../../components/ShadowCardComponent";
import AuthCard from "../../../components/AuthCard";
import { isMpinEnabled } from "../mpinBiometric/BiometricUtils";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import AppStyleButton from "../../../components/common/AppStyleButton";
import fonts from "../../../res/fonts";
import { hp, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../utils/dimensions";

const { width, height } = Dimensions.get("window");
// const { width: screenWidth, height: screenHeight } = useWindowDimensions();
// const isSmallWidth = screenWidth < 400;
const isSmallHeight = height < 840;

const Login = () => {
  const logger = createModuleLogger("Login");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Login"); // default selected
  const [formData, setFormData] = useState({
    loanAccountNumber: "",
    contact: "",
  });

  const registerKey = useSelector((state: any) => state.keyRegistrar.keys);
  const dispatch = useDispatch();

  const { otpUserData, mpinData: mpinDataFromStore } = useSelector(authSelector);
  // Cache mpinData in a ref so it survives Redux being cleared
    // (e.g. when LOGIN screen calls clearAsyncStoreAndReduxStore on mount)
    const mpinDataRef = React.useRef<any>(mpinDataFromStore);
    useEffect(() => {
      if (mpinDataFromStore != null) {
        mpinDataRef.current = mpinDataFromStore;
      }
    }, [mpinDataFromStore]);

    const mpinData = mpinDataRef.current;

  const features = [
    { icon: imagePath.checkCircle, text: "100% Financing" },
    { icon: imagePath.checkCircle, text: "Flexible Repayments" },
    { icon: imagePath.checkCircle, text: "Eligibility check in 3 min" },
    { icon: imagePath.checkCircle, text: "Provisional letter in 12 min" },
    
  ];
  
  useFocusEffect(
    useCallback(() => {
      setFormData({ loanAccountNumber: "", contact: "" });

      // Clear searchText if returning from OTP screen (when otpUserData is cleared)
      if (!otpUserData) {
        setSearchText("");
      }

      // Optionally: return cleanup if needed
    }, [otpUserData])
  );

  // Separate useFocusEffect for initializing remote config
  useFocusEffect(
    useCallback(() => {
      // Initialize and fetch remote config every time screen comes into focus
      //initializeRemoteConfig();
    }, [])
  );

  const initializeRemoteConfig = async () => {
    await analytics().setUserId(null);
    await analytics().resetAnalyticsData();
    try {
      logger.info("Initializing Firebase Remote Config");
      // Fetch and activate remote config
      const fetchSuccess = await firebaseRemoteConfigService.fetchAndActivate();
      if (fetchSuccess) {
        logger.info("Remote config fetched successfully");
      } else {
        logger.info("Using cached remote config values");
      }

      // Log the remote_cif value
      const remoteCif = firebaseRemoteConfigService.getString("remote_cif");

      logger.info("Remote Config Values:", remoteCif);
    } catch (error) {
      logger.error("Failed to initialize remote config:", error);
      // Don't block the app, continue with default values
    }
  };

  const handleChange = (key, value) => {
    if (selectedTab === "Register") {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    } else {
      setSearchText(value);
    }
  };

  const handleLoginbtn = async () => {
    dispatch(removeKey());
    Keyboard.dismiss();

    if (
      (await isMpinEnabled()) &&
      mpinData != null &&
      mpinData?.cifNumber !== null &&
      mpinData?.cifNumber !== undefined &&
      mpinData?.cifNumber !== "" &&
      decrypt(mpinData?.cifNumber) === searchText.trim()
    ) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "An active MPIN already exists for this CIF. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
          showLeftCross: false,
          positiveButtonText: "OK",
          onPositivePress: () => {
            NavigationService.goBack();
          },
        }),
      );

      return;
    }

    if (
      (await isMpinEnabled()) &&
      mpinData != null &&
      (mpinData?.cifNumber === null ||
      mpinData?.cifNumber === undefined ||
      mpinData?.cifNumber === "") &&
      (decrypt(mpinData?.phoneNumber) === searchText.trim())
    ) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "An active MPIN already exists for this Mobile No. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
          showLeftCross: false,
          positiveButtonText: "OK",
          onPositivePress: () => {
            NavigationService.goBack();
          },
        }),
      );

      return;
    }

    if (
      (await isMpinEnabled()) &&
      mpinData != null &&
      (mpinData?.cifNumber === null ||
      mpinData?.cifNumber === undefined ||
      mpinData?.cifNumber === "") &&
      decrypt(mpinData?.email) === searchText.trim()
    ) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "An active MPIN already exists for this Email. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
          showLeftCross: false,
          positiveButtonText: "OK",
          onPositivePress: () => {
            NavigationService.goBack();
          },
        }),
      );

      return;
    }

    await analytics().logEvent("Enter_CIF_Continue", {
      login_input: searchText,
      screen_name: "Login",
    });

    if (searchText.trim().length > 0) {
      setIsLoading(true);
      const payload = { key: encrypt(searchText) };

      try {
        const res = await service?.auth?.secureSendUserOtp(payload);
        dispatch(setOtpUserData(res?.data?.data));
        NavigationService.navigate(navigationStrings.OTP);
      } catch (error: any) {
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error,
            })
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegisterbtn = async () => {
    Keyboard.dismiss();
    // await analytics().logEvent("Enter_CIF_Continue", {
    //   login_input: searchText,
    //   screen_name: "Login",
    // });
    dispatch(addKey("register"));
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);
    if (isEmail) {
      dispatch(setLoginType("email"));
    } else {
      dispatch(setLoginType("mobile"));
      // Handle mobile login
    }
    dispatch(addMobileNumber(formData?.contact));
    dispatch(addLanNumber(formData?.loanAccountNumber));

    if (
      formData.loanAccountNumber.trim().length > 0 &&
      formData.contact.trim().length > 0
    ) {
      setIsLoading(true);
      const payload = {
        lan: encrypt(formData.loanAccountNumber),
        key: encrypt(formData.contact),
      };
      try {
        const res = await service?.auth?.secureSendRegisterOtp(payload);
        NavigationService.navigate(navigationStrings.OTP);
      } catch (error) {
        // const errorMessage = error?.response?.data?.message || "An error occurred";
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error,
            })
          );
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: `Please enter the value`,
        })
      );
    }
  };

  const renderContent = () => (
    <View style={styles.scrollContentContainer}>
      <View style={{ marginTop: 0 }}>
        {/* Background band sitting behind the logo and the auth card */}
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
        <AuthCard style={{ paddingVertical: isSmallHeight ? 12 : 20 }}>
          <View>
            <AuthTitleTextComponent text={strings.loginTitle} />
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "Login"
                    ? styles.activeTab
                    : styles.inactiveTab,
                ]}
                onPress={() => setSelectedTab("Login")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "Login"
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "Register"
                    ? styles.activeTab
                    : styles.inactiveTab,
                ]}
                onPress={() => setSelectedTab("Register")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "Register"
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  Register
                  {/* Register */}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: isSmallHeight ? 8 : 10 }}>
              <AuthSubTitleTextComponent
                text={
                  selectedTab === "Login"
                    ? strings.loginSubtitle
                    : "Please enter your loan related details to register your account."
                }
              />
            </View>
            {selectedTab === "Login" && (
              <CustomTextInput
                topMargin={isSmallHeight ? 20 : 30}
                heading={strings.loginInputHeader}
                mandatory={true}
                placeholder={strings.loginInputPlaceholder}
                keyboardType="default"
                onChangeText={(text) => handleChange("phone", text)}
                value={searchText}
              />
            )}
            {selectedTab === "Register" && (
              <>
                <CustomTextInput
                  topMargin={isSmallHeight ? 20 : 30}
                  heading="Loan Account Number"
                  mandatory={true}
                  placeholder="Enter Loan Account Number"
                  keyboardType="default"
                  onChangeText={(text) =>
                    handleChange("loanAccountNumber", text)
                  }
                  value={formData.loanAccountNumber}
                />
                <CustomTextInput
                  topMargin={isSmallHeight ? 10 : 30}
                  heading="Mobile Number or Email ID"
                  mandatory={true}
                  placeholder="Enter Mobile Number or Email ID"
                  keyboardType="default"
                  onChangeText={(text) => handleChange("contact", text)}
                  value={formData.contact}
                />
              </>
            )}
            {selectedTab === "Login" && (
              <Text style={styles.text}>
                {strings.byClicking}
                <Text
                  style={styles.link}
                  onPress={() => {
                    NavigationService.navigate(
                      navigationStrings.WEB_VIEW_SCREEN,
                      {
                        URL: AppConstants.termsCondition,
                      },
                    );
                  }}
                >
                  {strings.terms}
                </Text>{" "}
                {strings.and}{" "}
                <Text
                  style={styles.link}
                  onPress={() => {
                    NavigationService.navigate(
                      navigationStrings.WEB_VIEW_SCREEN,
                      {
                        URL: AppConstants.privacyPolicy,
                      },
                    );
                  }}
                >
                  {strings.privacyPolicy}
                </Text>
                .
              </Text>
            )}
            <View
              style={{
                marginTop: isSmallHeight ? 12 : 16,
                marginBottom: isSmallHeight ? 8 : 10,
              }}
            >
              <CustomButton
                title={strings.continue}
                onPress={() =>
                  selectedTab === "Login"
                    ? handleLoginbtn()
                    : handleRegisterbtn()
                }
                isDisabled={
                  isLoading ||
                  (selectedTab === "Login"
                    ? searchText?.length <= 0
                    : formData.loanAccountNumber.length <= 0 ||
                      formData.contact.length <= 0)
                }
                marginTop={8}
              />
            </View>
            <View style={{ height: isSmallHeight ? 10 : 15 }} />
          </View>
        </AuthCard>
      </View>

      <AuthCard style={styles.applyNowAuthCard}>
        <View style={styles.applyNowHeaderContainer}>
          <View style={styles.applyNowHeaderRowContainer}>
            <Image
              style={{ width: 32, height: 32, alignSelf: "center" }}
              source={imagePath.mortarboard}
            />
            <View style={{ marginStart: 10 }}>
              <Text style={styles.studentLoanBoldHeading}>
                Student Loan International
              </Text>
              <Text style={styles.studentLoanNormalHeading}>
                {"Fund your education abroad"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.text} style={styles.featureItem}>
              <Image source={feature.icon} style={styles.iconStyle} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingBottom: 0, marginHorizontal: 20 }}>
          <AppStyleButton
            title={strings.apply_now}
            fontFamily={fonts.bold}
            onPress={() => {
              NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
                // URL: "https://customerportaldiyfe-preprod.avanse.com/apply-now",
                URL: "https://customerportal.avanse.com/apply-now?leadoriginsource=mobileapp&source=mobileapp&subsubsource=appjourney&utm_source=app&name=customerdiyjourney&code=MUM%2F101918",
              });
            }}
            btnHeight={44}
            marginTop={15}
            textColor={colors.colorDarkSolidBlack}
            btnStyle={{ backgroundColor: "rgb(254,195,69)", borderRadius: 10 }}
            imageNeeded={false}
            isDisabled={false}
          />
        </View>
      </AuthCard>
      
      {isSmallHeight || (Platform.OS==="ios" && SCREEN_HEIGHT < 880) && (
        <View style={{ height: 50, backgroundColor: "transparent" }} />
      )}

      {/* <Image source={imagePath.avansePreLogin} style={styles.authImageStyle} /> */}
      {/* <View style={[styles.authImageStyle, { marginBottom: 30 }]}>
        
      </View> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={colors.welcomeBgColor} barStyle="dark-content" />

      {Platform.OS === "ios" ? (
        <KeyboardAwareScrollView
          style={{ backgroundColor: colors.white }}
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
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default Login;


// import React, {
//   useCallback,
//   useEffect,
//   useLayoutEffect,
//   useState,
// } from "react";
// import {
//   Alert,
//   Image,
//   Keyboard,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import styles from "./styles";
// import strings from "../../../res/strings";
// import CustomTextInput from "../../../components/CustomTextInput";
// import CustomButton from "../../../components/CustomButton";
// import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
// import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
// import { useDispatch, useSelector } from "react-redux";
// import { decrypt, encrypt } from "../../../utils/crypto";
// import * as NavigationService from "../../../navigation/NavigationService";
// import navigationStrings from "../../../constant/navigationStrings";
// import service from "../../../services/api/service";
// import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
// import {
//   setOtpUserData,
//   authSelector,
//   setMpinData,
//   setMobile,
// } from "../../../services/redux/slices/authSlice";
// import colors from "../../../res/colors";
// import AppConstants from "../../../constant/AppConstants";
// import LoaderView from "../../../components/common/LoaderView";
// import imagePath from "../../../constant/imagePath";
// import analytics from "@react-native-firebase/analytics";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
// import { clearAsyncStoreAndReduxStore } from "../../../utils/storageUtils";
// import {
//   addKey,
//   addLanNumber,
//   addMobileNumber,
//   removeKey,
//   setLoginType,
//   setNewUserData,
// } from "../../../services/redux/slices/keyRegistrarSlice";
// import { useFocusEffect } from "@react-navigation/native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { createModuleLogger } from "../../../utils/logger";
// import firebaseRemoteConfigService from "../../../services/firebaseRemoteConfigService";
// import ShadowCardComponent from "../../../components/ShadowCardComponent";
// import AuthCard from "../../../components/AuthCard";
// import { isMpinEnabled } from "../mpinBiometric/BiometricUtils";
// import CustomBackButton from "../../../components/common/CustomBackButton";
// import OtpInputForm from "../../../components/common/OtpInputForrm";
// import eligibilityCheckServices from "../../../services/api/service/eligibilityCheckService";
// import { emailRegex } from "../../../utils/helpers";
// import ProductCarousel from "../../../components/common/ProductCarousel";
// import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

// const Login = () => {
//   const logger = createModuleLogger("Login");
//   const [searchText, setSearchText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedTab, setSelectedTab] = useState("Login"); // default selected
//   const [selected, setSelected] = useState(null);
//   const [backEnabled, setBackEnabled] = useState(false);
//   const [openEmailOtpModal, setOpenEmailOtpModal] = useState(false);
//   const [openMobileOtpModal, setOpenMobileOtpModal] = useState(false);
//   const [otpEmailKey, setOtpEmailKey] = useState("");
//   const [otpMobileKey, setOtpMobileKey] = useState("");
//   const [otpEmailTime, setOtpEmailTime] = useState("");
//   const [otpMobileTime, setOtpMobileTime] = useState("");
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [isMobileVerified, setIsMobileVerified] = useState(false);
//   const [verifiedEmail, setVerifiedEmail] = useState("");
//   const [verifiedMobile, setVerifiedMobile] = useState("");
//   const [formData, setFormData] = useState({
//     loanAccountNumber: "",
//     contact: "",
//     email: "",
//     firstname: "",
//     lastname: "",
//     mobile: "",
//   });

//   const registerKey = useSelector((state: any) => state.keyRegistrar.keys);
//   const dispatch = useDispatch();

//   const { otpUserData, mpinData: mpinDataFromStore } = useSelector(authSelector);
//   // Cache mpinData in a ref so it survives Redux being cleared
//     // (e.g. when LOGIN screen calls clearAsyncStoreAndReduxStore on mount)
//     const mpinDataRef = React.useRef<any>(mpinDataFromStore);
//     useEffect(() => {
//       if (mpinDataFromStore != null) {
//         mpinDataRef.current = mpinDataFromStore;
//       }
//     }, [mpinDataFromStore]);

//     const mpinData = mpinDataRef.current;
  
//   useFocusEffect(
//     useCallback(() => {
//       setFormData({
//         loanAccountNumber: "",
//         contact: "",
//         email: "",
//         firstname: "",
//         lastname: "",
//         mobile: "",
//       });

//       // Clear searchText if returning from OTP screen (when otpUserData is cleared)
//       if (!otpUserData) {
//         setSearchText("");
//       }

//       // Optionally: return cleanup if needed
//     }, [otpUserData])
//   );

//   // Separate useFocusEffect for initializing remote config
//   useFocusEffect(
//     useCallback(() => {
//       // Initialize and fetch remote config every time screen comes into focus
//       //initializeRemoteConfig();
//     }, [])
//   );

//   const initializeRemoteConfig = async () => {
//     await analytics().setUserId(null);
//     await analytics().resetAnalyticsData();
//     try {
//       logger.info("Initializing Firebase Remote Config");
//       // Fetch and activate remote config
//       const fetchSuccess = await firebaseRemoteConfigService.fetchAndActivate();
//       if (fetchSuccess) {
//         logger.info("Remote config fetched successfully");
//       } else {
//         logger.info("Using cached remote config values");
//       }

//       // Log the remote_cif value
//       const remoteCif = firebaseRemoteConfigService.getString("remote_cif");

//       logger.info("Remote Config Values:", remoteCif);
//     } catch (error) {
//       logger.error("Failed to initialize remote config:", error);
//       // Don't block the app, continue with default values
//     }
//   };

//   const handleChange = (key, value) => {
//     if (selectedTab === "Register") {
//       if (isEmailVerified && key === "email" && verifiedEmail !== value) {
//         setIsEmailVerified(false);
//         setVerifiedEmail("");
//       } else if (
//         isMobileVerified &&
//         key === "mobile" &&
//         verifiedMobile !== value
//       ) {
//         setIsMobileVerified(false);
//         setVerifiedMobile("");
//       }
//       setFormData((prev) => ({
//         ...prev,
//         [key]: value,
//       }));
//     } else {
//       setSearchText(value);
//     }
//   };

//   const handleLoginbtn = async () => {
//     dispatch(removeKey());
//     Keyboard.dismiss();
//     logger.debug(`kjcdsbkjdckjcdkcdk kcd : ${await isMpinEnabled()}`)

//     if (
//       (await isMpinEnabled()) &&
//       mpinData != null &&
//       mpinData?.cifNumber !== null &&
//       mpinData?.cifNumber !== undefined &&
//       mpinData?.cifNumber !== "" &&
//       decrypt(mpinData?.cifNumber) === searchText.trim()
//     ) {
//       dispatch(
//         setStatusPopup({
//           status: "Error",
//           message: "An active MPIN already exists for this CIF. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
//           showLeftCross: false,
//           positiveButtonText: "OK",
//           onPositivePress: () => {
//             NavigationService.goBack();
//           },
//         }),
//       );

//       return;
//     }

//     if (
//       (await isMpinEnabled()) &&
//       mpinData != null &&
//       (mpinData?.cifNumber === null ||
//       mpinData?.cifNumber === undefined ||
//       mpinData?.cifNumber === "") &&
//       (decrypt(mpinData?.phoneNumber) === searchText.trim())
//     ) {
//       dispatch(
//         setStatusPopup({
//           status: "Error",
//           message: "An active MPIN already exists for this Mobile No. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
//           showLeftCross: false,
//           positiveButtonText: "OK",
//           onPositivePress: () => {
//             NavigationService.goBack();
//           },
//         }),
//       );

//       return;
//     }

//     if (
//       (await isMpinEnabled()) &&
//       mpinData != null &&
//       (mpinData?.cifNumber === null ||
//       mpinData?.cifNumber === undefined ||
//       mpinData?.cifNumber === "") &&
//       decrypt(mpinData?.email) === searchText.trim()
//     ) {
//       dispatch(
//         setStatusPopup({
//           status: "Error",
//           message: "An active MPIN already exists for this Email. Please login using your MPIN or use 'Forgot MPIN' to reset it.",
//           showLeftCross: false,
//           positiveButtonText: "OK",
//           onPositivePress: () => {
//             NavigationService.goBack();
//           },
//         }),
//       );

//       return;
//     }

//     await analytics().logEvent("Enter_CIF_Continue", {
//       login_input: searchText,
//       screen_name: "Login",
//     });

//     if (searchText.trim().length > 0) {
//       setIsLoading(true);
//       const payload = { key: encrypt(searchText) };

//       try {
//         const res = await service?.auth?.secureSendUserOtp(payload);
//         dispatch(setMobile(searchText));
//         dispatch(setOtpUserData(res?.data?.data));
//         NavigationService.navigate(navigationStrings.OTP);
//       } catch (error: any) {
//         const isConnected = await checkConnectivity();
//         if (isConnected) {
//           // Alert.alert(
//           //   "Error",
//           //   error?.response?.data?.message || error?.message || "An error occurred. Please try again.",
//           //   [
//           //     {
//           //       text: "OK",
//           //       onPress: () => console.log("Alert dismissed"),
//           //     },
//           //   ],
//           //   { cancelable: false }
//           // );

//           dispatch(
//             setStatusPopup({
//               status: "Error",
//               message: error,
//             })
//           );
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   // const handleRegisterbtn = async () => {
//   //   Keyboard.dismiss();
//   //   // await analytics().logEvent("Enter_CIF_Continue", {
//   //   //   login_input: searchText,
//   //   //   screen_name: "Login",
//   //   // });
//   //   dispatch(addKey("register"));
//   //   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);
//   //   if (isEmail) {
//   //     dispatch(setLoginType("email"));
//   //   } else {
//   //     dispatch(setLoginType("mobile"));
//   //     // Handle mobile login
//   //   }
//   //   dispatch(addMobileNumber(formData?.contact));
//   //   dispatch(addLanNumber(formData?.loanAccountNumber));

//   //   if (
//   //     formData.loanAccountNumber.trim().length > 0 &&
//   //     formData.contact.trim().length > 0
//   //   ) {
//   //     setIsLoading(true);
//   //     const payload = {
//   //       lan: encrypt(formData.loanAccountNumber),
//   //       key: encrypt(formData.contact),
//   //     };
//   //     try {
//   //       const res = await service?.auth?.secureSendRegisterOtp(payload);
//   //       NavigationService.navigate(navigationStrings.OTP);
//   //     } catch (error) {
//   //       // const errorMessage = error?.response?.data?.message || "An error occurred";
//   //       const isConnected = await checkConnectivity();
//   //       if (isConnected) {
//   //         dispatch(
//   //           setStatusPopup({
//   //             status: "Error",
//   //             message: error,
//   //           })
//   //         );
//   //       }
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   } else {
//   //     dispatch(
//   //       setStatusPopup({
//   //         status: "Error",
//   //         message: `Please enter the value`,
//   //       })
//   //     );
//   //   }
//   // };

//   // OTP Handling Functions

//   const handleRegisterbtn = async () => {
//     if (selectedTab === "Register" && selected === "yes" && backEnabled) {
//       // Handle existing loan registration
//       dispatch(addKey("register"));
//       setIsLoading(true);
//       dispatch(addLanNumber(formData.loanAccountNumber));

//       if (emailRegex.test(formData.email)) {
//         dispatch(setLoginType("email"));
//       } else {
//         dispatch(setLoginType("mobile"));
//       }

//       dispatch(addMobileNumber(formData.email));
//       dispatch(setOtpUserData(formData.email));

//       const payload = {
//         lan: encrypt(formData.loanAccountNumber),
//         key: encrypt(formData.email),
//       };

//       service?.auth
//         ?.sendRegisterOtp(payload)
//         .then((res) => {
//           NavigationService.navigate(navigationStrings.OTP);
//         })
//         .catch((error) => {
//           const errorMessage =
//             error.response?.data?.message || "An error occurred";
//           dispatch(
//             setStatusPopup({
//               status: "error",
//               message: errorMessage,
//             })
//           );
//           setIsLoading(false);
//         });
//     } else if (selectedTab === "Register" && selected === "no" && backEnabled) {
//       const payload = {
//         fullName: formData.firstname + " " + formData.lastname,
//         email: formData.email,
//         mobile: formData.mobile,
//       };

//       dispatch(addKey("register"));
//       setIsLoading(true);

//       service?.auth
//         ?.registerNewUser(payload)
//         .then((res) => {
//           if (res?.status === 201) {
//             dispatch(setNewUserData(payload));
//             NavigationService.navigate(navigationStrings.FORGOTPASSWORD);
//           }
//           setIsLoading(false);
//         })
//         .catch((error) => {
//           const errorMessage =
//             error.response?.data?.message || "An error occurred";
//           dispatch(
//             setStatusPopup({
//               status: "error",
//               message: errorMessage,
//             })
//           );
//           setIsLoading(false);
//         });
//     }
//   };

//   const handleSendEmailOtp = async (email: string) => {
//     try {
//       setIsLoading(true);
//       const response = await eligibilityCheckServices.sendOtp({
//         name: formData.firstname + " " + formData.lastname,
//         email: email,
//         isResend: false,
//       });
//       if (response?.data?.status === "success") {
//         setOtpEmailKey(response.data.data.value);
//         setOtpEmailTime(response.data.data.otpTime);
//         setOpenEmailOtpModal(true);
//         setVerifiedEmail(email);
//         // dispatch(
//         //   setStatusPopup({
//         //     status: "success",
//         //     message: "OTP sent to your email successfully!",
//         //   })
//         // );
//       } else {
//         dispatch(
//           setStatusPopup({
//             status: "error",
//             message: response?.data?.message || "Failed to send OTP",
//           })
//         );
//       }
//     } catch (error: any) {
//       dispatch(
//         setStatusPopup({
//           status: "error",
//           message: error || "Failed to send OTP",
//           // message: error?.response?.data?.message || "Failed to send OTP",
//         })
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSendMobileOtp = async (mobile: string) => {
//     try {
//       setIsLoading(true);
//       // Call your OTP service here
//       const response = await eligibilityCheckServices.sendOtp({
//         name: formData.firstname + " " + formData.lastname,
//         mobileNumber: mobile,
//         isResend: false,
//       });

//       if (response?.data?.status === "success") {
//         setOtpMobileKey(response.data.data.value);
//         setOtpMobileTime(response.data.data.otpTime);
//         setOpenMobileOtpModal(true);
//         setVerifiedMobile(mobile);
//         // dispatch(
//         //   setStatusPopup({
//         //     status: "success",
//         //     message: "OTP sent to your mobile successfully!",
//         //   })
//         // );
//       } else {
//         dispatch(
//           setStatusPopup({
//             status: "error",
//             message: response?.data?.message || "Failed to send OTP",
//           })
//         );
//       }
//     } catch (error: any) {
//       dispatch(
//         setStatusPopup({
//           status: "error",
//           message: error || "Failed to send OTP",
//           // message: error?.response?.data?.message || "Failed to send OTP",
//         })
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEmailOtpSubmit = async (otp: string) => {
//     try {
//       setIsLoading(true);
//       // Call your OTP verification service here
//       const response = await eligibilityCheckServices.verifyOtp({
//         type: "email",
//         email: formData.email,
//         key: otpEmailKey,
//         emailOtp: otp,
//         emailOtpCrtdAt: otpEmailTime,
//       });
//       if (response?.data?.status === "success") {
//         setIsEmailVerified(true);
//         setOpenEmailOtpModal(false);
//         dispatch(
//           setStatusPopup({
//             status: "success",
//             message: "Email verified successfully!",
//           })
//         );
//       } else {
//         dispatch(
//           setStatusPopup({
//             status: "error",
//             message: response?.data?.message || "Invalid OTP",
//           })
//         );
//       }
//     } catch (error: any) {
//       dispatch(
//         setStatusPopup({
//           status: "error",
//           message: error?.response?.data?.message || "Failed to verify OTP",
//         })
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleMobileOtpSubmit = async (otp: string) => {
//     try {
//       setIsLoading(true);
//       // Call your OTP verification service here
//       const response = await eligibilityCheckServices.verifyOtp({
//         type: "mobile",
//         mobileNumber: formData.mobile,
//         key: otpMobileKey,
//         mobileOtp: otp,
//         mobileOtpCrtdAt: otpMobileTime,
//       });

//       if (response?.data?.status === "success") {
//         dispatch(setMobile(formData.mobile));
//         setIsMobileVerified(true);
//         setOpenMobileOtpModal(false);
//         dispatch(
//           setStatusPopup({
//             status: "success",
//             message: "Mobile number verified successfully!",
//           })
//         );
//       } else {
//         dispatch(
//           setStatusPopup({
//             status: "error",
//             message: response?.data?.message || "Invalid OTP",
//           })
//         );
//       }
//     } catch (error: any) {
//       dispatch(
//         setStatusPopup({
//           status: "error",
//           message: error?.response?.data?.message || "Failed to verify OTP",
//         })
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLoanAccount = () => {
//     setFormData({
//       loanAccountNumber: "",
//       contact: "",
//       email: "",
//       fullname: "",
//       mobile: "",
//     });
//     setBackEnabled(true);
//   };
//   const onBackPress = () => {
//     setBackEnabled(false);
//     setSelected(null);
//   };

//   const renderContent = () => (
//     <View
//       style={[
//         styles.scrollContentContainer,
//         { paddingTop: !backEnabled ? 0 : 0 },
//       ]}
//     >
//       <View style={{ marginTop: 15 }}>
//         <Image
//           source={imagePath?.avanseLogo}
//           resizeMode="contain"
//           style={{
//             alignSelf: "center",
//             marginBottom: 10,
//             width: "50%",
//             height: 45,
//           }}
//         />
//         <AuthCard>
//       <View>
//         {backEnabled && <CustomBackButton onPress={onBackPress} />}
//         <AuthTitleTextComponent text={strings.loginTitle} />
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[
//               styles.tab,
//               selectedTab === "Login" ? styles.activeTab : styles.inactiveTab,
//             ]}
//             onPress={() => {
//               setBackEnabled(false);
//               setSelectedTab("Login");
//             }}
//           >
//             <Text
//               style={[
//                 styles.tabText,
//                 selectedTab === "Login"
//                   ? styles.activeText
//                   : styles.inactiveText,
//               ]}
//             >
//               Login
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tab,
//               selectedTab === "Register"
//                 ? styles.activeTab
//                 : styles.inactiveTab,
//             ]}
//             onPress={() => {
//               setSelectedTab("Register");
//               setBackEnabled(false);
//               setSelected(null);
//             }}
//           >
//             <Text
//               style={[
//                 styles.tabText,
//                 selectedTab === "Register"
//                   ? styles.activeText
//                   : styles.inactiveText,
//               ]}
//             >
//               Activate Account
//               {/* Register */}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         <View style={{ marginTop: 10 }}>
//           {selectedTab === "Login" && (
//             <AuthSubTitleTextComponent
//               text={
//                 selectedTab === "Login"
//                   ? strings.loginSubtitle
//                   : // : "Please enter your loan related details to activate your account."
//                     null
//               }
//             />
//           )}
//         </View>
//         {selectedTab === "Login" && (
//           <CustomTextInput
//             topMargin={30}
//             heading={strings.loginInputHeader}
//             mandatory={true}
//             placeholder={strings.loginInputPlaceholder}
//             keyboardType="default"
//             onChangeText={(text) => handleChange("phone", text)}
//             value={searchText}
//           />
//         )}
//         {selectedTab === "Register" && !backEnabled && (
//           <View>
//             {/* <Text style={styles.question}>
//               Do you have any loan with Avanse?
//             </Text> */}
//             <View style={{ paddingBottom: 20, paddingTop: 10 }}>
//               <AuthSubTitleTextComponent
//                 text={"Do you have any loan with Avanse?"}
//               />
//             </View>
//             <View style={styles.row}>
//               {/* YES */}
//               <TouchableOpacity
//                 style={[
//                   styles.option,
//                   selected === "yes" && styles.activeOption,
//                 ]}
//                 onPress={() => setSelected("yes")}
//               >
//                 <View style={styles.radioOuter}>
//                   {selected === "yes" && <View style={styles.radioInner} />}
//                 </View>
//                 <Text style={styles.optionText}>Yes</Text>
//               </TouchableOpacity>

//               {/* NO */}
//               <TouchableOpacity
//                 style={[
//                   styles.option,
//                   selected === "no" && styles.activeOption,
//                 ]}
//                 onPress={() => setSelected("no")}
//               >
//                 <View style={styles.radioOuter}>
//                   {selected === "no" && <View style={styles.radioInner} />}
//                 </View>
//                 <Text style={styles.optionText}>No</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//         {selectedTab === "Register" && backEnabled && selected === "yes" && (
//           <>
//             <CustomTextInput
//               topMargin={30}
//               heading="Loan Account Number"
//               mandatory={true}
//               placeholder="Enter Loan Account Number"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("loanAccountNumber", text)}
//               value={formData.loanAccountNumber}
//             />
//             <CustomTextInput
//               heading="Mobile Number or Email ID"
//               mandatory={true}
//               placeholder="Enter Mobile Number or Email ID"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("contact", text)}
//               value={formData.contact}
//             />
//           </>
//         )}
//         {selectedTab === "Register" && backEnabled && selected === "no" && (
//           <>
//             <CustomTextInput
//               topMargin={30}
//               heading="First Name"
//               mandatory={true}
//               placeholder="Enter First Name"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("firstname", text)}
//               value={formData.firstname}
//             />

//             <CustomTextInput
//               topMargin={15}
//               heading="Last Name"
//               mandatory={true}
//               placeholder="Enter Last Name"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("lastname", text)}
//               value={formData.lastname}
//             />
//             {/* <CustomTextInput
//               heading="Email ID"
//               mandatory={true}
//               placeholder="Enter Email ID"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("contact", text)}
//               value={formData.contact}
//             />
//             <CustomTextInput
//               heading="Mobile Number"
//               mandatory={true}
//               placeholder="Enter Mobile Number"
//               keyboardType="default"
//               onChangeText={(text) => handleChange("contact", text)}
//               value={formData.contact}
//             /> */}
//             <View style={styles.wrapper}>
//               <Text style={styles.label}>{"Email ID"}</Text>

//               <View style={styles.inputContainer}>
//                 <TextInput
//                   placeholder={"Enter Email ID"}
//                   placeholderTextColor="#B0B0B0"
//                   keyboardType="email-address"
//                   onChangeText={(text) => handleChange("email", text)}
//                   value={formData.email}
//                   style={styles.input}
//                 />

//                 <TouchableOpacity
//                   disabled={isEmailVerified}
//                   style={
//                     {
//                       // flex: 1,
//                       // // backgroundColor: "green",
//                       // marginRight: 10,
//                       // alignItems: "flex-end",
//                     }
//                   }
//                   onPress={() => {
//                     if (formData.email && emailRegex.test(formData.email)) {
//                       // setOpenEmailOtpModal(true);
//                       handleSendEmailOtp(formData.email);
//                     } else {
//                       dispatch(
//                         setStatusPopup({
//                           status: "error",
//                           message: "Please enter a valid email address",
//                         })
//                       );
//                     }
//                   }}
//                 >
//                   <Text
//                     style={[
//                       styles.verifyText,
//                       {
//                         color: isEmailVerified ? "#4caf50" : "#33c2c4",
//                       },
//                     ]}
//                   >
//                     {isEmailVerified ? "Verified" : "Verify"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <View style={styles.wrapper}>
//               <Text style={styles.label}>{"Mobile Number"}</Text>

//               <View style={styles.inputContainer}>
//                 <TextInput
//                   placeholder={"Enter Mobile Number"}
//                   placeholderTextColor="#B0B0B0"
//                   keyboardType="numeric"
//                   onChangeText={(text) => handleChange("mobile", text)}
//                   value={formData.mobile}
//                   style={styles.input}
//                 />

//                 <TouchableOpacity
//                   disabled={isMobileVerified}
//                   onPress={() => {
//                     if (formData.mobile && formData.mobile.length >= 10) {
//                       // setOpenMobileOtpModal(true);
//                       handleSendMobileOtp(formData.mobile);
//                     } else {
//                       dispatch(
//                         setStatusPopup({
//                           status: "error",
//                           message: "Please enter a valid mobile number",
//                         })
//                       );
//                     }
//                   }}
//                 >
//                   <Text
//                     style={[
//                       styles.verifyText,
//                       { color: isMobileVerified ? "#4caf50" : "#33c2c4" },
//                     ]}
//                   >
//                     {isMobileVerified ? "Verified" : "Verify"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </>
//         )}
//         {selectedTab === "Login" && (
//           <Text style={styles.text}>
//             {strings.byClicking}
//             <Text
//               style={styles.link}
//               onPress={() => {
//                 NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
//                   URL: AppConstants.termsCondition,
//                 });
//               }}
//             >
//               {strings.terms}
//             </Text>{" "}
//             {strings.and}{" "}
//             <Text
//               style={styles.link}
//               onPress={() => {
//                 NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
//                   URL: AppConstants.privacyPolicy,
//                 });
//               }}
//             >
//               {strings.privacyPolicy}
//             </Text>
//             .
//           </Text>
//         )}
//         {/* {selectedTab === "Register" ||
//           (selectedTab === "Login" && ( */}
//         <View style={{ marginTop: 16 }}>
//           <CustomButton
//             title={strings.continue}
//             onPress={() =>
//               selectedTab === "Login"
//                 ? handleLoginbtn()
//                 : selectedTab === "Register" && backEnabled
//                 ? handleRegisterbtn()
//                 : handleLoanAccount()
//             }
//             isDisabled={
//               isLoading ||
//               (selectedTab === "Login"
//                 ? searchText?.length <= 0
//                 : selectedTab === "Register" &&
//                   backEnabled &&
//                   selected === "yes"
//                 ? formData.loanAccountNumber.length <= 0 ||
//                   formData.contact.length <= 0
//                 : selectedTab === "Register" && backEnabled && selected === "no"
//                 ? formData.email.length <= 0 ||
//                   formData.mobile.length <= 0 ||
//                   formData.firstname.length <= 0 ||
//                   formData.lastname.length <= 0 ||
//                   !isEmailVerified ||
//                   !isMobileVerified
//                 : !selected)
//             }
//             marginTop={8}
//           />
//         </View>
//         {/* ))} */}
//       </View>
//       </AuthCard>
//       </View>
      
//       <Modal
//         visible={openEmailOtpModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setOpenEmailOtpModal(false)}
//       >
//         <View style={styles.overlay}>
//           {/* <View style={styles.modalCard}> */}
//           <OtpInputForm
//             // emailMasked={maskEmail(watch("email"))}
//             emailMasked={
//               formData.email?.length > 3
//                 ? formData.email?.slice(0, 3) +
//                   formData.email?.slice(3).replace(/.(?=.{4})/g, "x")
//                 : formData.email?.replace(/.(?=.{4})/g, "x")
//             }
//             onOtpSubmit={(otp) => {
//               handleEmailOtpSubmit(otp);
//               setOpenEmailOtpModal(false);
//             }}
//             closeModal={() => setOpenEmailOtpModal(false)}
//             onResendOtp={async () => {
//               if (formData?.email) {
//                 await handleSendEmailOtp(formData?.email);
//               }
//             }}
//           />
//           {/* </View> */}
//         </View>
//       </Modal>

//       <Modal
//         visible={openMobileOtpModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setOpenMobileOtpModal(false)}
//       >
//         <View style={styles.overlay}>
//           {/* <View style={styles.modalCard}> */}
//           <OtpInputForm
//             // mobileMasked={maskMobile(watch("mobile"))}
//             mobileMasked={formData?.mobile.replace(/.(?=.{4})/g, "x")}
//             closeModal={() => setOpenMobileOtpModal(false)}
//             onOtpSubmit={(otp) => {
//               handleMobileOtpSubmit(otp);
//               setOpenMobileOtpModal(false);
//             }}
//             onResendOtp={async () => {
//               if (formData?.mobile) {
//                 await handleSendMobileOtp(formData?.mobile);
//               }
//             }}
//           />
//           {/* </View> */}
//         </View>
//       </Modal>
//       {selectedTab === "Login" && (
//         <Image
//           source={imagePath.avansePreLogin}
//           style={styles.authImageStyle}
//         />
//       )}
//       {selectedTab === "Register" && (
//         <Image
//           source={imagePath.avansePreLogin}
//           style={styles.authImageStyle}
//         />
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar backgroundColor={colors.white} barStyle="dark-content" />

//       {Platform.OS === "ios" ? (
//         <KeyboardAwareScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           enableOnAndroid={false}
//           extraScrollHeight={0}
//           enableAutomaticScroll={true}
//           enableResetScrollToCoords={false}
//           contentContainerStyle={{ flexGrow: 1 }}
//         >
//           {renderContent()}
//         </KeyboardAwareScrollView>
//       ) : (
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ flexGrow: 1 }}
//         >
//           {renderContent()}
//         </ScrollView>
//       )}
      
      
//       {isLoading && <LoaderView />}
//       <DialogStatusPopup />
//     </SafeAreaView>
//   );
// };

// export default Login;
