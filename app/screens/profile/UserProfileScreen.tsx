import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./style";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import CustomTextInput from "../../components/CustomTextInput";
import CustomButton from "../../components/CustomButton";
import strings from "../../res/strings";
import * as NavigationService from "../../navigation/NavigationService";
import { scale } from "react-native-size-matters";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
//import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import colors from "../../res/colors";
import SectionHeader from "../../components/SectionHeader";
import Header from "../../components/common/Header";
import { useDispatch, useSelector } from "react-redux";
import CustomImagePickerModal from "../../components/CustomImagePickerModal";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import mainStyle from "../../res/mainStyles";
import { decrypt, encrypt } from "../../utils/crypto";
import * as Yup from "yup";
import {
  authSelector,
  userLoanCatSelector,
  setUserProfileData,
} from "../../services/redux/slices/authSlice";
import userProfileServices from "../../services/api/service/userProfileService";
import LoaderView from "../../components/common/LoaderView";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Formik } from "formik";
import AppConstants, { maxFileSize } from "../../constant/AppConstants";
import { encodeToBase64, getDeviceUniqueId, MPIN_LENGTH, mpinInputWidth } from "../../utils/helpers";
import authServices from "../../services/api/service/authService";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import DeleteAccountBtn from "../../components/common/DeleteAccountBtn";
import DeregisterBottomSheet from "../../components/common/DeregisterBottomSheet";
import logger from "../../utils/logger";
import { OtpInput } from "react-native-otp-entry";
import fonts from "../../res/fonts";
import { set } from "react-hook-form";

interface Payload {
  cif: any;
  businessId: any;
  loanCategoryId: any;
}

interface FormInputs {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfileScreen = () => {
  const { user } = useSelector(authSelector); // Access user data like name, email, etc.
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShimmerLoading, setIsShimmerLoading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);

  //>>
  const dispatch = useDispatch();
  const { userProfile, businessType } = useSelector(authSelector);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const userLoanCategory = useSelector(userLoanCatSelector);

  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    pinCode: "",
  });

  

  useEffect(() => {
    const fetchData = async () => {
      setIsShimmerLoading(true);

      try {
        let cifNumberValue = "";
      if (userProfile?.cifNumber) {
        cifNumberValue = userProfile?.cifNumber;
      } else if (userProfile?.email && userProfile?.phoneNumber) {
        cifNumberValue = userProfile?.phoneNumber;
      }
      
        const payload: Payload = {
          cif: cifNumberValue,
          businessId: encrypt(businessType?.id),
          loanCategoryId: encrypt(
            userLoanCategory?.TermLoan[0]?.loanCategoryId
          ),
        };
        const response = await userProfileServices.secureGetProfileDetails(
          payload
        );
        const updatedProfile = {
          name: response?.data?.data?.name || "",
          email: response?.data?.data?.email || "",
          phoneNumber: response?.data?.data?.phoneNumber?.toString() || "",
          address: response?.data?.data?.address || "",
          state: response?.data?.data?.state || "",
          city: response?.data?.data?.city || "",
          pinCode: response?.data?.data?.pinCode || "",
        };
        setProfileDetails(updatedProfile);
      } catch (error) {
        //console.error("Error fetching profile details:", error);
      } finally {
        setIsShimmerLoading(false);
      }
    };

    fetchData();
  }, []);

  //<<

  //After image selection
  const handleSelectedImages = async (images: any[]) => {
    setShowModal(false); // Close the modal

    // Check if images array exists and has at least one item
    if (!images || !Array.isArray(images) || images.length === 0) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "No image selected.",
        })
      );
      return;
    }

    const selectedImage = images[0];

    // Additional check for selectedImage existence
    if (!selectedImage) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "No image selected.",
        })
      );
      return;
    }

    // Check if fileSize exists and is valid
    if (selectedImage.fileSize && selectedImage.fileSize > maxFileSize) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Your image size exceeds the maximum limit of 5 MB",
        })
      );
      return;
    }

    // Check if URI exists
    if (!selectedImage.uri) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Invalid image selected.",
        })
      );
      return;
    }

    //console.log("selectedImage.uri: ", selectedImage.uri);

    try {
      const base64String = await encodeToBase64(selectedImage.uri);
      uploadUserProfilePicture(base64String);
    } catch (error) {
      //console.error("Error encoding image to base64:", error);
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: "Failed to process the selected image.",
          })
        );
      }
    }
  };

  const uploadUserProfilePicture = (base64: any) => {
    const plainBase64Data = base64.replace(/^data:(.*?);base64,/, "");
    const payload = {
      profileImage: plainBase64Data,
    };
    setIsLoading(true);
    authServices
      ?.secureUploadImage(payload)
      .then((res) => {
        if (res?.status === 200) {
          const userProfileCopy = JSON.parse(JSON.stringify(userProfile));
          userProfileCopy.profileImage = res?.data?.data;
          dispatch(setUserProfileData(userProfileCopy));
          //setUploadSuccess(true);
          setIsLoading(false);
          dispatch(
            setStatusPopup({
              status: "success",
              message: "Your picture uploaded successfully",
            })
          );
        }
      })
      .catch(async (error) => {
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
        // dispatch(
        //   setStatusPopup({
        //     status: "Error",
        //     message:
        //       error.response?.data?.message ||
        //       "An error occurred while uploading",
        //   })
        // );
      });
  };

  const handleEyePress = (value) => {
    setIsSecure(!value);
  };

  const handleChangePassword = async (data: any, values: any) => {
    try {
      setIsLoading(true);
      const res = await userProfileServices.secureChangeUserPassword(
        userProfile?.id,
        data
      );

      if (res.status == 200) {
        values.oldPassword = "";
        values.newPassword = "";
        values.confirmNewPassword = "";
        dispatch(
          setStatusPopup({
            status: "success",
            message: "Profile Password Updated successfully",
          })
        );
      }
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
  };

  const handleChangeMpin = async () => {
    try {
      if (mpinValidation(newMpin)) {
        setErrorVisible(true);
        return;
      }

      setIsLoading(true);
      const deviceId = await getDeviceUniqueId();
      const payload = {
        deviceId: encrypt(deviceId),
        cifNumber: userProfile?.cifNumber,
        userId: userProfile?.id?.toString(),
        currentMpin: encrypt(oldMpin),
        newMpin: encrypt(newMpin),
        confirmNewMpin: encrypt(confirmNewMpin),
      };
      const res = await userProfileServices.secureChangeUserMpin(payload);

      if (res.status == 200) {
        dispatch(
          setStatusPopup({
            status: "success",
            message: "Profile MPIN Updated successfully",
            showLeftCross: false,
            onPositivePress: () => {
              setOldMpin("");
              setNewMpin("");
              setConfirmNewMpin("");
              oldMpinRef.current?.clear();
              newMpinRef.current?.clear();
              confirmNewMpinRef.current?.clear();
            },
          })
        );
      }
    } catch (error: any) {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: error,
            onPositivePress: () => {
              setOldMpin("");
              setNewMpin("");
              setConfirmNewMpin("");
              oldMpinRef.current?.clear();
              newMpinRef.current?.clear();
              confirmNewMpinRef.current?.clear();
            },
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [form, setForm] = useState<FormInputs>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmNewMpin, setConfirmNewMpin] = useState("");
  const oldMpinRef = useRef<any>(null);
  const newMpinRef = useRef<any>(null);
  const confirmNewMpinRef = useRef<any>(null);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const mpinValidation = (pin: string): boolean => {
    if (oldMpin === confirmNewMpin) {
      setErrorVisible(true);
      setErrorMsg(strings.old_new_mpin_error);
      return true;
    }
    if (newMpin !== confirmNewMpin) {
      setErrorVisible(true);
      setErrorMsg(strings.new_confirm_mpin_error);
      return true;
    }

    setErrorMsg(strings.mpin_too_weak_error);
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

    setErrorMsg("");
    setErrorVisible(false);

    return false;
  };

  const reset = () => {
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const FormShimmer = () => {
    return (
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Profile Picture */}
        <View style={{ flexDirection: "row" }}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerImage}
          />
          <View>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerTitle}
            />
            <View>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmersubTitle}
              />
            </View>
          </View>
        </View>
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
      </ScrollView>
    );
  };

  const shimmerInputField = () => {
    return (
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.shimmerInput}
      />
    );
  };

  const ChangePasswordShimmer = () => {
    return (
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Heading */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerHeading}
        />
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
        {shimmerInputField()}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerRule}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerPasswordRule}
        />
      </ScrollView>
    );
  };

  const handleChooseImage = () => {
    setShowModal(true);
  };

  const bulletWithText = (text, marginTop) => {
    return (
      <View
        style={[
          styles.bulletItem,
          (marginTop = marginTop !== 0 ? { marginTop } : null),
        ]}
      >
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
  };

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  const profileHeader = () => {
    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {!userProfile?.profileImage ? (
          <View style={styles.fallbackImage}>
            <Text style={styles.fallbackText}>
              {userProfile?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: userProfile?.profileImage }}
            style={styles.iconStyle}
          />
        )}
        <View style={{ marginHorizontal: 16, flex: 1 }}>
          <TouchableOpacity
            activeOpacity={AppConstants.textActiveOpacity}
            onPress={handleChooseImage}
          >
            <Text style={styles.uploadNewPhotoTextStyle}>
              {strings.uploadNewPhoto}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadGuidlinesTxtStyle}>
            {strings.imageUploadGuidelines}
          </Text>
        </View>
      </View>
    );
  };
  const profileInputSection = () => {
    return (
      <>
        {/* <FormShimmer /> */}
        {profileHeader()}
        <View style={{ marginHorizontal: -16 }}>
          <View style={styles.horizontalDivider} />
        </View>
        <View pointerEvents="none">
          <CustomTextInput
            heading={strings.name}
            placeholder={strings.enter_your_name}
            keyboardType={"default"}
            value={userProfile?.fullName}
          />

          <CustomTextInput
            heading={strings.email}
            placeholder={strings.enter_your_email}
            keyboardType={"default"}
            value={profileDetails?.email}
          />

          <CustomTextInput
            heading={strings.phoneNumber}
            placeholder={strings.enter_your_phone}
            keyboardType={"number-pad"}
            value={profileDetails?.phoneNumber}
          />

          <CustomTextInput
            heading={strings.address}
            placeholder={strings.enter_your_address}
            keyboardType={"default"}
            value={profileDetails?.address}
          />

          <CustomTextInput
            heading={strings.state}
            placeholder={strings.enter_your_state}
            keyboardType={"default"}
            value={profileDetails?.state}
          />

          <CustomTextInput
            heading={strings.city}
            placeholder={strings.enter_your_city}
            keyboardType={"default"}
            value={profileDetails?.city}
          />
        </View>
      </>
    );
  };

  const PasswordSchema = Yup.object().shape({
    oldPassword: Yup.string()
      .required("Old Password is required")
      .min(8, "Old Password must be at least 8 characters long")
      .max(15, "Old Password must be at most 15 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        "Old Password must contain one capital letter and symbol @$!%*?& or numbers"
      ),

    newPassword: Yup.string()
      .required("New Password is required")
      .min(8, "New Password must be at least 8 characters long")
      .max(15, "New Password must be at most 15 characters long")

      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        "Password must contain one capital letter and symbol @$!%*?& or numbers"
      )
      .test(
        "not-same-as-old",
        "New password cannot be the same as old password",
        function (value) {
          const { oldPassword } = this.parent;
          return value !== oldPassword;
        }
      ),

    confirmNewPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("newPassword"), null], "Passwords do not match."),
  });

  const changePasswordSection = () => {
    return (
      <>
        <Text style={styles.changePasswordTxtStyle}>
          {strings.changePasswordTitle}
        </Text>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }}
          validationSchema={PasswordSchema}
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
                setFieldTouched("oldPassword", true);
                setFieldTouched("newPassword", true);
                setFieldTouched("confirmNewPassword", true);
                return;
              }

              const encryptedData = {
                oldPassword: encrypt(values.oldPassword),
                newPassword: encrypt(values.newPassword),
                confirmPassword: encrypt(values.confirmNewPassword),
                id: userProfile?.id,
              };
              handleChangePassword(encryptedData, values); // call your handleUpdatePassword
            };
            return (
              <View style={styles.container}>
                <CustomTextInput
                  heading={strings.Enter_Old_Password}
                  keyboardType="default"
                  value={values.oldPassword}
                  onChangeText={handleChange("oldPassword")}
                  onBlur={handleBlur("oldPassword")}
                  isPassword
                  secureTextEntry={isSecure}
                  handleEyePress={handleEyePress}
                  errorText={
                    errors.oldPassword && touched.oldPassword
                      ? errors.oldPassword
                      : null
                  }
                />

                <CustomTextInput
                  heading={strings.newPassword}
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

                <CustomButton
                  title={strings.updatePassword}
                  onPress={handlePress}
                />
              </View>
            );
          }}
        </Formik>

        {bulletWithText(strings.forgotFooter, 0)}
        {bulletWithText(strings.forgotPasswordRule, 3)}
      </>
    );
  };

  const mpinSection = () => {
    const oldMpinTextChange = (text: string) => {
      setErrorVisible(false);
      setErrorMsg("");
      if (text.length == MPIN_LENGTH) {
        setOldMpin(text);
      } else {
        setOldMpin("");
      }
    };
    const newMpinTextChange = (text: string) => {
      setErrorVisible(false);
      setErrorMsg("");
      if (text.length == MPIN_LENGTH) {
        setNewMpin(text);
      } else {
        setNewMpin("");
      }
    };
    const confirmNewMpinTextChange = (text: string) => {
      setErrorVisible(false);
      setErrorMsg("");
      if (text.length == MPIN_LENGTH) {
        setConfirmNewMpin(text);
      } else {
        setConfirmNewMpin("");
      }
    };

    return (
      <>
        <Text style={styles.changePasswordTxtStyle}>{strings.change_mpin}</Text>
        <View>
          {/* Old MPIN */}
          <Text
            style={[
              mainStyle.enterMpinTextStyle,
              { marginTop: 12, fontSize: 13 },
            ]}
          >
            {strings.enter_old_mpin}
          </Text>
          <View style={mainStyle.mpinContainer}>
            <OtpInput
              ref={oldMpinRef}
              //key={otpKey}
              numberOfDigits={MPIN_LENGTH}
              focusColor={colors.appThemeColor}
              autoFocus={false}
              hideStick={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onTextChange={(text) => oldMpinTextChange(text)}
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
                  backgroundColor: colors.white,
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

          {/* New MPIN */}
          <Text style={[mainStyle.enterMpinTextStyle, { fontSize: 13, marginTop: 10 }]}>
            {strings.new_mpin}
          </Text>
          <View style={mainStyle.mpinContainer}>
            <OtpInput
              ref={newMpinRef}
              //key={otpKey}
              numberOfDigits={MPIN_LENGTH}
              focusColor={colors.appThemeColor}
              autoFocus={false}
              hideStick={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onTextChange={(text) => newMpinTextChange(text)}
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
                  backgroundColor: colors.white,
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

          {/* Confirm New MPIN */}
          <Text style={[mainStyle.enterMpinTextStyle, { fontSize: 13, marginTop: 10 }]}>
            {strings.confirm_new_mpin}
          </Text>
          <View style={mainStyle.mpinContainer}>
            <OtpInput
              ref={confirmNewMpinRef}
              //key={otpKey}
              numberOfDigits={MPIN_LENGTH}
              focusColor={colors.appThemeColor}
              autoFocus={false}
              hideStick={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onTextChange={(text) => confirmNewMpinTextChange(text)}
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
                  backgroundColor: colors.white,
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
            <Text style={[mainStyle.errorTextStyle, { marginTop: 0 }]}>
              {errorMsg}
            </Text>
          )}

          <View style={{ marginTop: 16 }}>
            <CustomButton
              title={strings.update_mpin}
              onPress={() => {
                handleChangeMpin();
              }}
              isDisabled={
                oldMpin.length !== MPIN_LENGTH ||
                newMpin.length !== MPIN_LENGTH ||
                confirmNewMpin.length !== MPIN_LENGTH
              }
              marginTop={8}
            />
          </View>
        </View>

        {/* {bulletWithText(strings.forgotFooter, 0)}
        {bulletWithText(strings.forgotPasswordRule, 3)} */}
      </>
    );
  };

  const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    setOpenBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setOpenBottomSheet(false);
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={mainStyle.containerView}
      >
        <Header backIconNeeded={true} onBackPress={handleBackPress} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginLeft: 6 }}>
            <SectionHeader title={strings.updateProfile} />
          </View>
          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={24}
            marginVertical={16}
            marginHorizontal={24}
          >
            {isShimmerLoading ? <FormShimmer /> : profileInputSection()}
          </ShadowCardComponent>

          {/* <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={24}
            marginVertical={4}
            marginHorizontal={24}
          >
            {isShimmerLoading ? (
              <ChangePasswordShimmer />
            ) : (
              changePasswordSection()
            )}
          </ShadowCardComponent> */}

          {/* MPIN section */}
          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={24}
            marginVertical={4}
            marginHorizontal={24}
          >
            {isShimmerLoading ? (
              <ChangePasswordShimmer />
            ) : (
              mpinSection()
            )}
          </ShadowCardComponent>

          <>
            <DeleteAccountBtn onPress={handleDeleteAccount} />
          </>

          <CustomImagePickerModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onSelectImages={handleSelectedImages}
          />
          <DeregisterBottomSheet 
            isVisible={openBottomSheet} 
            openBottomSheet={openBottomSheet}
            setOpenBottomSheet={handleCloseBottomSheet}
          />
          <CopyrightComponent />
        </ScrollView>
        {isLoading && <LoaderView />}
        <DialogStatusPopup />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
