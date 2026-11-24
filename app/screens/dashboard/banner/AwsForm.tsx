import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import imagePath from "../../../constant/imagePath";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
import CustomButton from "../../../components/CustomButton";
import CheckBoxComponent from "../../../components/common/CheckBoxComponent";
import strings from "../../../res/strings";
import CustomSearchDropdown from "../../../components/CustomSearchDropdown";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../services/redux/store";
import postsServices from "../../../services/api/service/postsService";
import logger from "../../../utils/logger";
import { emailRegex } from "../../../utils/helpers";
import service from "../../../services/api/service";
import {
  clearStatusPopup,
  setStatusPopup,
} from "../../../services/redux/slices/statusPopupSlice";
import BottomSheetAlert from "../../../components/common/BottomSheetAlert";
import LoaderView from "../../../components/common/LoaderView";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import CustomInputField from "../../../components/common/CustomInputField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const MIN_MOBILE_DIGITS = 7;
const MAX_MOBILE_DIGITS = 15;

const normalizeMobileValue = (value: string) => value.replace(/\D/g, "");

interface AwsFormData {
  countryCode: string | number;
  mobileNumber: string;
  emailId: string;
  checked: boolean;
}

interface Errors {
  countryCode?: string;
  mobileNumber?: string;
  emailId?: string;
  checked?: string;
}

const AwsForm = () => {
  const dispatch = useDispatch();
  const [phoneCodes, setPhoneCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetTitle, setBottomSheetTitle] = useState("");
  const [bottomSheetSubtitle, setBottomSheetSubtitle] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [awsFormData, setAwsFormData] = useState<AwsFormData>({
    countryCode: "",
    mobileNumber: "",
    emailId: "",
    checked: false,
  });

  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber ?? "",
  );

  const phoneCodeOptions = useMemo(() => {
    // Deduplicate using Set, but do not sort immediately
    const seen = new Set<string>();
    const unsorted: { value: any; label: string }[] = [];
    (phoneCodes || []).forEach((pc: any) => {
      const code = String(pc.countryCode);
      if (!seen.has(code)) {
        seen.add(code);
        unsorted.push({ value: pc.id, label: `+${code}` });
      }
    });
    // Lazy sorting: sort only when accessed
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      if (!sortedCache) {
        sortedCache = [...unsorted].sort(
          (a, b) =>
            Number(a.label.replace("+", "")) - Number(b.label.replace("+", "")),
        );
      }
      return sortedCache;
    };
  }, [phoneCodes]);

  useEffect(() => {
    fetchPhoneCodes();
  }, []);

  useLayoutEffect(() => {
    dispatch(clearStatusPopup());
  }, [dispatch]);

  const fetchPhoneCodes = async () => {
    try {
      const response = await postsServices.secureAddPost(
        "api/v1/disbursement-form/default",
        {
          loanAccountNumber: selectedLoanNumber,
        },
      );
      if (response && response?.status === 200) {
        setPhoneCodes(response?.data?.data?.getDefaultData?.PhoneCodes);
      }
    } catch (err) {
      console.log("Error while fetching phone codes:", err);
    }
  };

  // Back always lands on Dashboard (same as RequestForDisbursement), not on
  // whatever screen the drawer navigation left below this one in the stack.
  const handleBackPress = () => {
    NavigationService.resetBackTo(navigationStrings.DASHBOARD_SCREEN);
  };

  const validateField = (
    name: keyof AwsFormData,
    next: AwsFormData,
  ): string | undefined => {
    if (name === "countryCode") {
      const countryCodeValue = String(next.countryCode ?? "");
      if (!countryCodeValue.trim()) return "Country code is required";
    }

    if (name === "mobileNumber") {
      const normalizedMobile = normalizeMobileValue(next.mobileNumber);
      if (!normalizedMobile.trim()) return "Mobile number is required";
      if (!/^\d+$/.test(normalizedMobile)) return "Digits only";
      if (
        normalizedMobile.length < MIN_MOBILE_DIGITS ||
        normalizedMobile.length > MAX_MOBILE_DIGITS
      ) {
        return `Mobile number must be between ${MIN_MOBILE_DIGITS} and ${MAX_MOBILE_DIGITS} digits`;
      }
    }
    if (name === "emailId") {
      if (!next.emailId.trim()) return "Email is required";
      if (!emailRegex.test(next.emailId)) return "Enter a valid email";
    }

    if (name === "checked") {
      if (!next.checked) return "Consent is required to proceed";
    }
    return undefined;
  };

  const runValidation = (state: AwsFormData): Errors => {
    const e: Errors = {};
    (["countryCode", "mobileNumber", "emailId", "checked"] as const).forEach(
      (k) => {
        const msg = validateField(k, state);
        if (msg) e[k] = msg;
      },
    );
    return e;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const errors = runValidation(awsFormData);
    setErrors(errors);

    logger.debug("Validation errors:", errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setErrors({}); // Clear errors if validation passes

    const payload: any = {
      emailId: awsFormData?.emailId,
      phone: awsFormData?.mobileNumber,
      countryCodeId: Number(awsFormData?.countryCode),
      lanNumber: selectedLoanNumber,
    };

    setIsLoading(true);

    service.posts
      .secureAddPost(`api/v1/customer/referral`, payload)
      .then((response: any) => {
        setIsLoading(false);
        if (response && response?.status === 200) {
          logger.debug("Referral submission successful:", response?.data);
          setShowBottomSheet(true);
          setBottomSheetTitle("Success");
          setBottomSheetSubtitle(response?.data?.message);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log("error", error);
        dispatch(
          setStatusPopup({
            status: "error",
            message:
              "Oops! Something went wrong on our end. Please try again in a few minutes.",
          }),
        );
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={0}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Header
          backIconNeeded={true}
          showNotification={false}
          onBackPress={handleBackPress}
        />

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: colors.blackOpacity20,
          }}
        />

        <BottomSheetAlert
          visible={showBottomSheet}
          onClose={() => {
            setShowBottomSheet(false);
            handleBackPress();
          }}
          title={bottomSheetTitle}
          subTitle={bottomSheetSubtitle}
          image={imagePath.done}
          btnText="OK"
        />

        <ImageBackground
          source={imagePath.awsFormBg}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Text style={styles.textTitle}>{strings.please_fill_details}</Text>

            <View
              style={{
                flexDirection: "row",
                gap: 5,
                height: 44,
                marginTop: 20,
              }}
            >
              <View style={{ flex: 1.2 }}>
                <CustomSearchDropdown
                  options={phoneCodeOptions()}
                  value={awsFormData.countryCode || ""}
                  title="Select country code"
                  onChange={(selectedValue: any) => {
                    logger.debug("Selected country code:", selectedValue);

                    const updatedFormData = {
                      ...awsFormData,
                      countryCode: selectedValue,
                    };
                    setAwsFormData(updatedFormData);

                    if (!!errors.countryCode) {
                      const error = validateField(
                        "countryCode",
                        updatedFormData,
                      );
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        countryCode: error,
                      }));
                    } else {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        countryCode: undefined,
                      }));
                    }
                  }}
                  isMandatory={true}
                  error={!!errors.countryCode}
                  helperText={errors?.countryCode}
                  disabled={false}
                  placeholder="Search "
                  marginTop={0.1}
                />
              </View>

              <View style={{ flex: 2.8 }}>
                <CustomInputField
                  placeholder="Mobile Number*"
                  value={awsFormData.mobileNumber}
                  onChange={(val) => {
                    //updating form data for mobile number field
                    const updatedFormData = {
                      ...awsFormData,
                      mobileNumber: val,
                    };
                    setAwsFormData(updatedFormData);

                    if (!!errors.mobileNumber) {
                      const error = validateField(
                        "mobileNumber",
                        updatedFormData,
                      );
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        mobileNumber: error,
                      }));
                    } else {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        mobileNumber: undefined,
                      }));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  editable={true}
                  errorText={errors.mobileNumber}
                  error={!!errors.mobileNumber}
                  containerStyle={{ marginTop: 0.1 }}
                  maxLength={MAX_MOBILE_DIGITS}
                />
              </View>
            </View>

            <CustomInputField
              placeholder="E-Mail ID*"
              value={awsFormData.emailId}
              onChange={(val) => {
                const updatedFormData = {
                  ...awsFormData,
                  emailId: val,
                };
                setAwsFormData(updatedFormData);

                if (!!errors.emailId) {
                  const error = validateField("emailId", updatedFormData);
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    emailId: error,
                  }));
                } else {
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    emailId: undefined,
                  }));
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={true}
              errorText={errors.emailId}
              error={!!errors.emailId}
              containerStyle={{
                marginTop: !!errors.countryCode
                  ? 42
                  : !!errors.mobileNumber
                  ? 42
                  : 20,
              }}
            />

            <CustomInputField
              placeholder="LAN Number*"
              value={selectedLoanNumber}
              onChange={(val) => {}}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={false}
              errorText=""
              error={false}
              containerStyle={{ marginTop: 20 }}
            />

            <View style={styles.checkboxContainer}>
              <CheckBoxComponent
                label={strings.aws_checkbox_text}
                onValueChange={(value: boolean) => {
                  const updatedFormData = {
                    ...awsFormData,
                    checked: value,
                  };
                  setAwsFormData(updatedFormData);

                  if (!!errors.checked) {
                    const error = validateField("checked", updatedFormData);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      checked: error,
                    }));
                  } else {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      checked: undefined,
                    }));
                  }
                }}
                error={!!errors.checked}
                errorText={errors.checked}
              />
            </View>

            <CustomButton
              title="Submit"
              onPress={() => {
                handleSubmit();
              }}
            />
          </View>
        </ImageBackground>
      </KeyboardAwareScrollView>

      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default AwsForm;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  textTitle: {
    color: colors.colorDarkGreen,
    fontSize: 22,
    marginTop: 20,
    fontFamily: fonts.semiBold,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});
