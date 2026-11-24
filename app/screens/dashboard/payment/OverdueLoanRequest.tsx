import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from "react-native";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import strings from "../../../res/strings";
import CustomTextInput from "../../../components/CustomTextInput";
import CopyrightComponent from "../../../components/common/CopyrightComponent";
import Header from "../../../components/common/Header";
import mainStyle from "../../../res/mainStyles";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import { PaymentTermLoanContext } from "../../../hooks/context";
import { useDispatch } from "react-redux";
import { decrypt, encryptObject } from "../../../utils/crypto";
import postsServices from "../../../services/api/service/postsService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmallButtonComponent from "../../../components/common/SmallButtonComponent";
import LoanDetails from "../../../components/LoanDetails";
import { useNavigation } from "@react-navigation/native";
import { useHideTabBar } from "../../../hooks/useHideTabBar";
import analytics from "@react-native-firebase/analytics";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import logger from "../../../utils/logger";
import LoaderView from "../../../components/common/LoaderView";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

export interface RowData {
  [key: string]: string | number | null;
}
const OverdueLoanRequest = (props: { ref: any }) => {
  const {
    errorMessage,
    setFormStep,
    dashboardData,
    overDueValues,
    formValue,
    userProfile,
    selectedLoanNumber,
    applicableCharges,
    setIsLoading,
    setTermLoanRequestId,
    handleEmptyFormValue,
    partPaymentData,
    loanCategoryValue,
    isXsOrSm,
  }: any = useContext(PaymentTermLoanContext);

  useHideTabBar();
  const dispatch = useDispatch();
  const [amountValue, setAmountValue] = useState<number | null>(null);
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [fieldError, setFieldError] = useState<string | null>("");
  const [isOverDueLoading, setIsOverDueLoading] = useState<boolean>(false);
  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }
  // const scrollRef = useRef(null);

  /**
   * Validates the entered amount against the existing overdue amount.
   * If the entered amount is greater than 0 and less than the existing overdue amount,
   * it sets a field error indicating that the amount should be greater than the existing overdue amount.
   * Otherwise, it clears any field error.
   *
   * @param {any} event - The event object from the input field.
   */
  const handleAmountValidation = (text: string) => {
    // Strip anything that isn't a digit or dot
    let filtered = text.replace(/[^0-9.]/g, "");

    // Collapse multiple dots — keep only up to the first dot
    const dotIndex = filtered.indexOf(".");
    if (dotIndex !== -1) {
      filtered =
        filtered.slice(0, dotIndex + 1) +
        filtered.slice(dotIndex + 1).replace(/\./g, "");
    }

    // Limit decimal part to 2 digits
    const parts = filtered.split(".");
    if (parts.length === 2 && parts[1].length > 2) {
      filtered = parts[0] + "." + parts[1].slice(0, 2);
    }

    setDisplayAmount(filtered);

    // Empty or bare dot — clear state without error
    if (filtered === "" || filtered === ".") {
      setFieldError("");
      setAmountValue(null);
      return;
    }

    const amount = parseFloat(filtered);
    logger.debug("Validating overdue amount : ", amount);

    // Reject zero / NaN (covers 0, 0.0, 0.00, etc.)
    if (isNaN(amount) || amount <= 0) {
      setFieldError("Amount must be greater than 0");
      setAmountValue(null);
      return;
    }

    const existingOverDueAmount =
      overDueValues?.bounceCharge +
      overDueValues?.penalCharge +
      overDueValues?.emiWithoutCharge;

    if (amount > existingOverDueAmount) {
      setFieldError("Amount should not be greater than existing overdue amount");
    } else {
      setFieldError("");
    }
    setAmountValue(amount);
  };

  const handleSubmit = async () => {
    await analytics().setUserId(user_id);
    analytics().logEvent("Dash_Pay_Overdue_Paynow_Link", { user_id: user_id });
    setIsOverDueLoading(true);
    try {
      const copyFormValue = { ...formValue };
      copyFormValue["cif"] = decrypt(userProfile?.cifNumber);
      copyFormValue["cifEntity"] = decrypt(userProfile?.cifEntity);
      copyFormValue["lan"] = selectedLoanNumber;
      copyFormValue["initiatedBy"] = decrypt(userProfile?.id);
      copyFormValue["amount"] = amountValue;
      copyFormValue["paymentType"] = "OverDue";
      copyFormValue["loanCategory"] = loanCategoryValue?.loanCategoryId;
      copyFormValue["business"] = loanCategoryValue?.businessId;

      setIsLoading(true);
      const encryptedData = encryptObject(copyFormValue);
      await postsServices
        .secureAddPost("api/v1/payment/term-loan-data-processed", {
          data: encryptedData,
        })
        .then((response: any) => {
          setTermLoanRequestId(response?.data?.data?.termLoanRequestId);
          AsyncStorage.setItem(
            "termLoanRequestId",
            response?.data?.data?.termLoanRequestId
          );
          AsyncStorage.setItem("paymentUpdateDetails", JSON.stringify(null));
          setFormStep(3);
          setIsLoading(false);
          setAmountValue(null);
          setDisplayAmount("");
          handleEmptyFormValue();
          setIsOverDueLoading(false);
        })
        .catch((error: any) => {
          const errorMessage = error; //error?.response?.data?.message;
          setFieldError(errorMessage);
          setIsLoading(false);
          setIsOverDueLoading(false);
        });
    } catch (error: any) {
      logger.log(error);
    } finally {
      setIsLoading(false);
      setIsOverDueLoading(false);
    }
  };

  const [value, setValue] = useState("");
  const details = (label, value) => {
    return (
      <View style={styles.row}>
        <View style={{ width: "50%" }}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  const handleChange = (text, value) => {
    //console.log(text, value);
    setValue(value);
  };

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <LoanDetails />
      </View>

      {/* Overdue Payment Card */}
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>{strings.overdue_payment}</Text>
        <View pointerEvents="none">
          <CustomTextInput
            heading={strings.exixting_overdue}
            placeholder={strings.enter_your_phone}
            keyboardType={"default"}
            color={colors.darkGreyTextColor}
            value={`${
              overDueValues?.bounceCharge +
              overDueValues?.penalCharge +
              overDueValues?.emiWithoutCharge
            }`}
          />

          <CustomTextInput
            heading={strings.overdue_amount}
            placeholder={strings.enter_your_phone}
            keyboardType={"default"}
            color={colors.darkGreyTextColor}
            value={"" + overDueValues?.emiWithoutCharge}
          />

          <CustomTextInput
            heading={strings.penal_charges}
            placeholder={strings.enter_your_phone}
            keyboardType={"default"}
            color={colors.darkGreyTextColor}
            value={"" + overDueValues?.penalCharge}
          />

          <CustomTextInput
            heading={strings.bounce_charges}
            placeholder={strings.enter_your_phone}
            keyboardType={"default"}
            color={colors.darkGreyTextColor}
            value={"" + overDueValues?.bounceCharge}
          />
        </View>

        <CustomTextInput
          heading={strings.amount_to_pay}
          placeholder={strings.enter_amount_to_pay}
          keyboardType={"decimal-pad"}
          scrollRef={props.ref}
          value={displayAmount}
          onChangeText={(text) => {
            handleAmountValidation(text);
          }}
        />

        {fieldError && (
          <Text style={{ color: "#d32f2f", fontSize: 13 }}>{fieldError}</Text>
        )}
        <View style={{ alignItems: "flex-end" }}>
          <SmallButtonComponent
            title={strings.proceed}
            imageNotNeeded={false}
            disabled={
              isOverDueLoading ||
              !!fieldError ||
              !amountValue ||
              amountValue <= 0
            }
            onPress={() => {
              handleSubmit();
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 30 }} />
      {isOverDueLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9fb",
  },
  card: {
    marginHorizontal: 16,
    //marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    //marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.appThemeColor,
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.appThemeColor,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  value: {
    color: colors.valueTextColor,
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  highlight: {
    color: "#1d7f8d",
  },
  buttonDisabled: {
    marginTop: 20,
    width: "40%",
    justifyContent: "flex-end",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: (length) => ({
    color: length === 0 ? "#BBBBBB" : "white",
    fontFamily: fonts.regular,
  }),
});

export default OverdueLoanRequest;
