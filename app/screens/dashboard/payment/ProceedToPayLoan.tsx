import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import { string } from "yup";
import strings from "../../../res/strings";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import { useDispatch } from "react-redux";
import { PaymentTermLoanContext } from "../../../hooks/context";
import { decrypt, encryptObject } from "../../../utils/crypto";
import postsServices from "../../../services/api/service/postsService";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import CustomTextInput from "../../../components/CustomTextInput";
import PreviousButtonComponent from "../../../components/common/PreviousButtonComponent";
import SmallButtonComponent from "../../../components/common/SmallButtonComponent";
import LoaderView from "../../../components/common/LoaderView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHideTabBar } from "../../../hooks/useHideTabBar";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import logger from "../../../utils/logger";

export interface RowData {
  [key: string]: string | number | null;
}

const ProceedToPayLoan = () => {
  const {
    isXsOrSm,
    setFormStep,
    setFormValue,
    formValue,
    userProfile,
    applicableCharges,
    setTermLoanRequestId,
    selectedLoanNumber,
    setAmountValue,
    handleEmptyFormValue,
    loanCategoryValue,
    amountValue,
  }: any = useContext(PaymentTermLoanContext);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useHideTabBar();
  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const handleSubmit = async () => {
    await analytics().setUserId(user_id);
    analytics().logEvent("Dash_Pay_PartPay_Paynow_Link", { user_id: user_id });
    try {
      const copyFormValue = { ...formValue };

      copyFormValue["cif"] = decrypt(userProfile?.cifNumber);
      copyFormValue["cifEntity"] = decrypt(userProfile?.cifEntity);
      copyFormValue["lan"] = selectedLoanNumber;
      copyFormValue["initiatedBy"] = decrypt(userProfile?.id);
      copyFormValue["paymentType"] = "PartPayment";
      copyFormValue["netPrincipalAdjustment"] =
        Number(formValue?.amount) - applicableCharges;
      // loanCategory,business
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
          handleEmptyFormValue();
        })
        .catch(async (error: any) => {
          const errorMessage = error; //error?.response?.data?.message;
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
    } catch (error: any) {
      setIsLoading(false);
      logger.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View>
      <Text style={styles.sectionTitle}>
        {strings.review_details.toUpperCase()}
      </Text>

      <View pointerEvents="none">
        <CustomTextInput
          heading={strings.Total_Amount}
          placeholder={strings.enter_pre_payment_amount}
          keyboardType={"default"}
          value={amountValue}
          color={colors.darkGreyTextColor}
          editable={false}
        />

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
          value={`${Number(formValue?.amount) - applicableCharges}`}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <PreviousButtonComponent
          onPress={() => {
            setFormStep(1);
          }}
        />
        <SmallButtonComponent
          title={strings.proceed_to_pay}
          onPress={() => {
            handleSubmit();
          }}
        />
      </View>
      {isLoading && <LoaderView />}
    </View>
  );
};

export default ProceedToPayLoan;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
  },
});
