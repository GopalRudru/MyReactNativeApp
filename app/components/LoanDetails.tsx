import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";
import strings from "../res/strings";
import { PaymentTermLoanContext } from "../hooks/context";
import { formatIndianRupees } from "../utils/formatting";
import { formatNormalDate } from "../utils/dateFormatUtils";
import imagePath from "../constant/imagePath";
import { Popable, usePopable } from "react-native-popable";

const LoanDetails = () => {
  const {
    dashboardData,
    formTypeValue,
    formValue,
    handleFormValue,
    partPaymentData,
    setFormStep,
    applicableCharges,
    amountValue,
    setAmountValue,
    isXsOrSm,
  }: any = useContext(PaymentTermLoanContext);

  const details = (label, value) => {
    const [statusRef, { show: showStatusPopable, hide: hideStatusPopable }] =
      usePopable();
    return (
      <View style={styles.row}>
        <View style={{ flexDirection: "row", width: "50%" }}>
          <Text style={styles.label}>{label}</Text>
          {/* <Image source={imagePath.info} style={{ width: 15, height: 15 }} /> */}
          {label === strings.outstanding_principle && (
            <Popable
              style={{
                opacity: 0.85,
                // flex: 1,
                width: "requestStatusTooltipData(detailsData)".length * 5,
                // maxWidth: 550,
              }}
              wrapperStyle={
                {
                  // flex: 1,
                  // display: "flex",
                  // flexDirection: "row",
                  // alignItems: "center",
                  // justifyContent: "center",
                }
              }
              position="top"
              ref={statusRef}
              onAction={(visible) => {
                if (visible) {
                  setTimeout(() => hideStatusPopable(), 3000);
                }
              }}
              content={
                <View
                  style={{
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(80,80,80,0.85)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.regular,
                      color: "#fff",
                    }}
                  >
                    {
                      "Principal Outstanding Amount After Moratorium End (If Applicable)"
                    }
                  </Text>
                </View>
              }
            >
              {/* <View style={{ alignSelf: "flex-start" }}> */}

              <Image
                source={imagePath.info}
                style={{
                  marginLeft: 6,
                  height: 15,
                  width: 15,
                  // resizeMode: "contain",
                }}
              />
              {/* </View> */}
            </Popable>
          )}
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        {strings.loan_details.toUpperCase()}
      </Text>

      {details(strings.loan_account_number, dashboardData?.lanNumber)}
      {details(
        strings.Sanctioned_Amount,
        formatIndianRupees(dashboardData?.repayAmount)
      )}
      {details(
        formTypeValue == "1"
          ? strings.outstanding_principle
          : strings.emi_payment,
        formTypeValue == "1"
          ? formatIndianRupees(dashboardData?.paymentOutstandingPrincipal)
          : formatIndianRupees(partPaymentData?.[0]?.emiAmount)
      )}
      {details(
        formTypeValue == "1"
          ? strings.rate_of_interest
          : strings.next_emi_payment_date,
        formTypeValue == "1"
          ? dashboardData?.outstandingPrincipal
          : formatNormalDate(partPaymentData?.[0]?.nextEmiDate)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    // backgroundColor: "yellow",
    //marginHorizontal: 16,
    marginBottom: 20,
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
    fontFamily: fonts.semiBold,
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
    marginBottom: 5,
  },
  label: {
    // backgroundColor: "red",
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  value: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.valueTextColor,
    fontWeight: "600",
  },
});

export default LoanDetails;
