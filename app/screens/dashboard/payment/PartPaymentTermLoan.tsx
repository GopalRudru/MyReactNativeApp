import { StyleSheet, Text, View } from "react-native";
import React, {
  useState,
  useContext,
  useMemo,
} from "react";
import { PaymentTermLoanContext } from "../../../hooks/context";
import strings from "../../../res/strings";
import CustomTextInput from "../../../components/CustomTextInput";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import SmallButtonComponent from "../../../components/common/SmallButtonComponent";
import { useHideTabBar } from "../../../hooks/useHideTabBar";

export interface RowData {
  [key: string]: string | number | null;
}

const PartPaymentTermLoan = () => {
  const {
    formValue,
    handleFormValue,
    partPaymentData,
    setFormStep,
    applicableCharges,
    amountValue,
    setAmountValue,
  }: any = useContext(PaymentTermLoanContext);

  const [fieldError, setFieldError] = useState<string | null>("");
  const [netFieldError, setNetFieldError] = useState<string | null>("");
  useHideTabBar();
  
  /**
   * Validates the amount entered by the user and updates the form value if valid.
   *
   * @param event - The event object containing the value entered by the user.
   *
   * The function performs the following checks:
   * - The amount should be less than or equal to three times the repayment amount plus 1770.
   * - The amount should be greater than or equal to half of the outstanding principal amount plus 1770.
   *
   * If the amount does not meet these criteria, an error message is set.
   * Otherwise, the form value is updated with the entered amount.
   */
  const handleAmountValidation = (event: any) => {
    const amount: number = event; //.target.value;
    setAmountValue(amount);

    const repayAmountValue: number = Math.floor(
      3 * (partPaymentData?.[0]?.newEmiAmount / 100) + applicableCharges
    );
    const outstandingPrincipalValue: number = Math.floor(
      0.5 * (partPaymentData?.[0]?.paymentOutstandingPrincipal / 100) +
        applicableCharges
    );

    if (amount > 0 && amount < repayAmountValue) {
      setFieldError(
        "Entered amount should be such that Net principal adjustment greater than or equal to 3 times the EMI value."
      );
    } else if (amount > 0 && amount > outstandingPrincipalValue) {
      setFieldError(
        "Entered amount should be such that net principal adjustment is less than or equal to 50 % of Principal Outstanding Amount"
      );
    } else {
      setNetFieldError("");
      setFieldError("");
      handleFormValue("amount", Number(amount));
    }

    !!fieldError || !!netFieldError || amountValue <= 0;
  };

  const handleValidateNetValue = () => {
    const netValue = Number(formValue?.amount) - applicableCharges;
    if (netValue < 3 * (partPaymentData?.[0]?.newEmiAmount / 100)) {
      setNetFieldError(
        "Net Principal Adjustment must be greater than or equal to the sum of 3 EMIs."
      );
    } else {
      setNetFieldError(null);
      setFieldError("");
      setFormStep(1);
    }
  };

  /**
   * Calculates the net principle adjustment based on the form value amount and applicable charges.
   *
   * @returns {number} The net principle adjustment. If the calculated value is less than 0, returns 0.
   *
   * Dependencies:
   * - `formValue?.amount`: The amount entered in the form.
   * - `applicableCharges`: The applicable charges to be deducted from the form value amount.
   */
  const handleShowNetPrincipleAdj = useMemo(() => {
    let value;
    if (amountValue == null) {
      value = Number(formValue?.amount) - applicableCharges;
    } else {
      value = Number(amountValue) - applicableCharges;
    }
    if (value < 0) {
      return 0;
    }
    return value;
  }, [formValue, applicableCharges, amountValue]);

  return (
    <View style={{ paddingBottom: 30 }}>
      <Text style={styles.sectionTitle}>
        {strings.payment_details.toUpperCase()}
      </Text>

      <CustomTextInput
        heading={strings.Total_Amount}
        placeholder={strings.enter_pre_payment_amount}
        keyboardType={"number-pad"}
        value={amountValue}
        editable={true}
        color={colors.valueTextColor}
        onChangeText={(text) => handleAmountValidation(text)}
      />

      <View pointerEvents="none">
        <CustomTextInput
          heading={strings.applicable_charges}
          placeholder={strings.enter_applicable_charges}
          keyboardType={"default"}
          editable={false}
          color={colors.darkGreyTextColor}
          value={`${applicableCharges}`}
        />

        <CustomTextInput
          heading={strings.net_principal_adjustment}
          placeholder={strings.enter_net_principal_adjustment}
          keyboardType={"default"}
          color={colors.darkGreyTextColor}
          value={`${handleShowNetPrincipleAdj}`}
        />

        {fieldError && (
          <Text style={{ color: "#d32f2f", fontSize: 13, paddingTop: 10 }}>
            {fieldError}
          </Text>
        )}
        {netFieldError && (
          <Text style={{ color: "#d32f2f", fontSize: 13, paddingTop: 10 }}>
            {netFieldError}
          </Text>
        )}
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <SmallButtonComponent
          title={strings.proceed}
          disabled={!!fieldError || !!netFieldError || amountValue <= 0}
          onPress={() => {
            handleValidateNetValue();
          }}
        />
      </View>
    </View>
  );
};

export default PartPaymentTermLoan;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
  },
});
