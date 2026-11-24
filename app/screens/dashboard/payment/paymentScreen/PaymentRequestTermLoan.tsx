import { Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaymentTermLoanContext } from "../../../../hooks/context";
import { authSelector } from "../../../../services/redux/slices/authSlice";
import styles from "./styles";
import strings from "../../../../res/strings";
import {
  formatIndianRupees,
  formatNormalIndianRupees,
} from "../../../../utils/formatting";
import { formatDate } from "../../../../utils/dateFormatUtils";
import { setStatusPopup } from "../../../../services/redux/slices/statusPopupSlice";
import ShadowCardComponent from "../../../../components/ShadowCardComponent";
import CustomButton from "../../../../components/CustomButton";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import AccountSelectorDropDown from "../../AccountSelectorDropDown";
import RadioButton from "../../../../components/common/RadioButton";
import AppConstants from "../../../../constant/AppConstants";
import { setPartPaymentType } from "../../../../services/redux/slices/documentFormSlice";
import { RootState } from "../../../../services/redux/store";

const PaymentRequestTermLoan = () => {
  const {
    setFormStep,
    partPaymentData,
    overDueValues,
    handleSelectPaymentType,
    selectedLoanNumber,
    LoanTypeValue,
    isLoading,
    rows,
    paymentType,
    formTypeValue,
    isOverDuePending,
    setAmountValue,
    setFeedbackJourneyType,
  }: any = useContext(PaymentTermLoanContext);

  const { userProfile } = useSelector(authSelector);

  const dispatch = useDispatch();
  const ALLOW_PARTPAYMENTS_TO_LOAN = ["ELFORN"];

  const dashboardDataSet = useSelector(
      (state: RootState) => state.dashboardData.sanctionedDisbursedData
    );

  const matchedObject = dashboardDataSet?.find(
    (data: any) => data.loanNumber === selectedLoanNumber
  );

  const handleShowMessage = (value: any) => {
    return `You already have an open ${value} request. Please complete all pending payments in it and ensure the request is either closed or expired before raising a new one. Note: Open requests auto expire within 12 hours if not closed.`;
  };

  const isPartPaymentExists: boolean = rows
    ? rows.some(
        (elem: any) => elem?.purpose == "PartPayment" && elem?.status == "Open"
      )
    : false;
  const isOverDueExists: boolean = rows
    ? rows.some(
        (elem: any) => elem?.purpose == "OverDue" && elem?.status == "Open"
      )
    : false;

  const isLanClose: boolean = ["M", "C", "W", "E", "S"].includes(
    partPaymentData?.[0]?.status
  );

  const [partPaymentSelected, setPartPaymentSelected] = useState(false);
  const [overdueSelected, setOverdueSelected] = useState(false);

  const otpUserData  = useSelector(
    (state: RootState) => state.auth.otpUserData
  );

  useEffect(() => {
    setPartPaymentSelected(false);
    setOverdueSelected(false);
  }, [selectedLoanNumber]);

  const lanDropdown = (
    <AccountSelectorDropDown
      labelText="Loan account number"
      buttonText=" N/A"
      isActive={""}
      backgroundColor="transparent"
      borderWidth="0px"
      marginTop="0px"
    />
  );

  const partPaymentClicked = () => {
    if (isOverDuePending) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message:
            "We're experiencing technical issues, so your data is temporarily unavailable. We're working to fix this as quickly as possible. Thank you for your patience",
        })
      );
    } else if (overDueValues?.totalAmount > 0) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message:
            "Please clear the overdue before proceeding for part payment",
        })
      );
    } else if (isPartPaymentExists) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: handleShowMessage("part payment"),
        })
      );
    }
    // else if (partPaymentData?.[0]?.elegibleForPartpayment) {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       message:
    //         "Partpayment is not allowed within six months of the last disbursement.",
    //     })
    //   );
    // } 
    else if (rows?.[0]?.statusInfoForPartPayment) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message:
            "You have a part payment request with its Amortization updation in progress. Please wait till it is updated before raising a new request. Note: You can track the status of your previous requests using “View Status” from previous payment details table",
        })
      );
    } else {
      handleSelectPaymentType("1");
      setPartPaymentSelected(true);
      setOverdueSelected(false);
      setFeedbackJourneyType("PartPayment");
    }
  };

  const overdueClicked = () => {
    // const allAccess = otpUserData?.altAccessFlag === true;
    // if (allAccess && matchedObject?.status !== 'A') {
    //   handleSelectPaymentType("2");
    //   setPartPaymentSelected(false);
    //   setOverdueSelected(true);
    // } else 
      
    if (overDueValues?.totalAmount <= 0 || overDueValues == null) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "There is no overdue for the selected loan account",
        })
      );
    } else if (isOverDueExists) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: handleShowMessage("overdue"),
        })
      );
    } else {
      handleSelectPaymentType("2");
      setPartPaymentSelected(false);
      setOverdueSelected(true);
      setFeedbackJourneyType("OverDue");
    }
  };
  
  return (
    <View>
      {isLoading || isOverDuePending ? (
        <ShimmerCard />
      ) : (
        <ShadowCardComponent
          paddingHorizonatal={16}
          paddingVertical={16}
          marginVertical={16}
          marginHorizontal={16}
        >
          <View style={styles.containerDropdown}>{lanDropdown}</View>
          <View style={styles.horizontalDivider} />

          <DetailContainer
            item={partPaymentData[0]}
            overDueValues={overDueValues}
          />

          <View style={{ flexDirection: "row" }}>
            {ALLOW_PARTPAYMENTS_TO_LOAN.includes(LoanTypeValue) && (
              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={AppConstants.buttonActiveOpacity}
                  onPress={() => {
                    partPaymentClicked();
                  }}
                  style={styles.option}
                >
                  <View style={styles.row}>
                    <RadioButton
                      selected={partPaymentSelected}
                      onPress={() => partPaymentClicked()}
                    />

                    <Text style={styles.label}>Part payment</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.row, { marginStart: ALLOW_PARTPAYMENTS_TO_LOAN.includes(LoanTypeValue) ? 30 : 0 }]}>
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                onPress={() => {
                  overdueClicked();
                }}
                style={styles.option}
              >
                <View style={styles.row}>
                  <RadioButton
                    selected={overdueSelected}
                    onPress={() => overdueClicked()}
                  />
                  <Text style={styles.label}>Overdue</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <CustomButton
            title={"Pay Now"}
            isDisabled={!paymentType}
            onPress={() => {
              const isAllAccess = otpUserData?.altAccessFlag === true;
              if (!isAllAccess && isLanClose) {
                dispatch(
                  setStatusPopup({
                    status: "No access",
                    message:
                      "Payment requests are currently unavailable for this loan",
                  })
                );
              } else {
                setAmountValue(null); // Reset amount value to zero/empty
                setFormStep(0);
                dispatch(setPartPaymentType(paymentType));
              }
            }}
          />
        </ShadowCardComponent>
      )}
    </View>
  );
};

const DetailContainer = ({ item, overDueValues }) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.directionJustify}>
        <DetailItem
          label={strings.Loan_Amount}
          value={formatIndianRupees(item?.loanAmount)}
        />
        <DetailItem
          label={strings.overdue_amount}
          value={formatNormalIndianRupees(overDueValues?.totalAmount)}
        />
      </View>

      <View style={styles.directionJustify}>
        <DetailItem
          label={strings.Next_Repay_Date}
          value={formatDate(item?.nextEmiDate)}
        />
        <DetailItem
          label={strings.Next_Repay_Amount}
          value={formatIndianRupees(item?.emiAmount)}
        />
      </View>
    </View>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const ShimmerCard = () => {
  return (
    <ShadowCardComponent
      paddingHorizonatal={16}
      paddingVertical={16}
      marginVertical={16}
      marginHorizontal={16}
    >
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.dropdownShimmer}
      />
      <View style={styles.detailSection}>
        {[1, 2].map((row) => (
          <View key={`row-${row}`} style={styles.row}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.detailItemLabel}
            />
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.detailItemLabel}
            />
          </View>
        ))}
      </View>

      {/* Radio Buttons */}
      <View style={styles.radioGroup}>
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={`radio-${i}`} style={styles.radioItem}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.radioCircle}
            />
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.radioLabel}
            />
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.row}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.buttonShimmer}
        />
      </View>
    </ShadowCardComponent>
  );
};

export default PaymentRequestTermLoan;
