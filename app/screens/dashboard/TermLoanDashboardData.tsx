import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import colors from "../../res/colors";
import strings from "../../res/strings";
import imagePath from "../../constant/imagePath";
import AppConstants, {
  messages,
  screenName,
} from "../../constant/AppConstants";
import fonts from "../../res/fonts";

import {
  checkPercentage,
  formatIndianRupees,
  handlePercentAmount,
} from "../../utils/formatting";
import {
  formatDate,
  formatNumberToTwoDecimals,
} from "../../utils/dateFormatUtils";
import * as NavigationService from "../../navigation/NavigationService";
import AccountSelectorDropDown from "../../screens/dashboard/AccountSelectorDropDown";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import navigationStrings from "../../constant/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import { cleardisbursementButtonSlice } from "../../services/redux/slices/disbursementButtonSlice";
import { termLoanPermissionCheck } from "../../utils/helpers";
import { setloanAccountNumberOptions } from "../../services/redux/slices/optionSlice";
import {
  setDashboardData,
  setExistDisbursementStatus,
  setSelectedLoanNumber,
} from "../../services/redux/slices/dashboardDataSlice";
import {
  setProdcuctName,
  setSelectedIndex,
} from "../../services/redux/slices/tabsSlice";
import {
  setStatusPopup,
  statusPopupSelector,
} from "../../services/redux/slices/statusPopupSlice";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import { Popable, usePopable } from "react-native-popable";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "react-native-linear-gradient";

type CardProps = {
  item: any;
  onRequestDisbursement?: () => void;
  children?: React.ReactNode;
  screenName?: string;
  isMultipleReqRes?: boolean;
};

interface Payload {
  cif?: any;
  business?: any;
  loanCategory?: any;
  lan?: any;
}

interface DashboardData {
  lanNumber: string;
  statusOfLoan: string;
  loanAmount: number;
  outstandingPrincipal: number;
  emiAmount: number;
  nextEmiDate: string;
  overdueAmount: number;
  description: string;
  firstDisbDate: string;
  maturityDate: string;
  loanTypeId: number;
  isExistDisbursementAllowdLoan: boolean;
  status: string;
}

const TermLoanDashboardData: React.FC<CardProps> = ({
  item,
  screenName,
  onRequestDisbursement,
  children,
  isMultipleReqRes,
}) => {
  return (
    <View>
      <View
        style={[
          { marginBottom: 20 },
          borderColorVisible(screenName)
            ? styles.borderWraper
            : styles.borderWraperWithoutBorderColor,
        ]}
      >
        <ShadowCardComponent
          paddingHorizonatal={16}
          paddingVertical={20}
          marginVertical={0.1}
          marginHorizontal={getMarginHorizontal(screenName) ? 0.1 : 16}
        >
          <View>
            {/* Account number and account status view */}
            <LanStatusSection item={item} screenName={screenName} />

            <View style={styles.horizontalDivider(screenName)} />

            {/* shows the borrower info */}
            {canShowBorrowInfo(screenName) && <BorrowerView item={item} />}

            {/* Disbursement and Sanctioned Amount view */}
            <DisbursementAndSanctionedAmountView item={item} />

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${parseInt(checkPercentage(item))}%`,
                  },
                ]}
              />
            </View>

            {/* Loan details view */}
            <DetailContainer item={item} screenName={screenName} />

            {/* Request Disbursement, View Details, Create New Request button */}
            {createNewDisRequestBtnVisible(screenName) && (
              <ButtonContainer
                item={item}
                screenName={screenName}
                onRequestDisbursement={onRequestDisbursement}
                isMultipleReqRes={isMultipleReqRes}
              />
            )}
          </View>
          {screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT &&
            children}
        </ShadowCardComponent>
      </View>
      {/* <DialogStatusPopup /> */}
    </View>
  );
};

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

const LoanAccountHeading = ({ item }) => {
  return (
    <View style={styles.headinContainer}>
      <Text style={styles.mainHeading}>Loan A/C {item.lanNumber}</Text>
      <Text style={styles.subHeading}>{item.description}</Text>
    </View>
  );
};

const LanStatusSection = ({ item, screenName }) => {
  return (
    <View style={styles.container}>
      {accontDropdownVisible(screenName) ? (
        lanDropdown
      ) : (
        <LoanAccountHeading item={item} />
      )}

      {accontStatusVisible(screenName) && (
        <Text
          style={[
            styles.activeStatus,
            item?.status === "A" || item.statusOfLoan === "A"
              ? {
                  color: "#28C76F",
                  backgroundColor: "rgba(40, 199, 111, 0.16)",
                }
              : {
                  color: "rgb(234, 84, 85)",
                  backgroundColor: "rgba(234, 84, 85, 0.16)",
                },
          ]}
        >
          {item?.status === "A" || item.statusOfLoan === "A"
            ? "Active"
            : "Closed"}
        </Text>
      )}
    </View>
  );
};

const BorrowerView = ({ item }) => {
  return (
    <View style={styles.namesView}>
      <View>
        <Text style={styles.labelText}>{strings.borrower_name}</Text>
        <Text style={{ fontSize: 10 }}>{item.borrowerName}</Text>
      </View>
      <View>
        <Text style={styles.labelText}>{strings.co_borrower}</Text>
        <Text style={{ fontSize: 10 }}>
          {item?.coBorrowerName
            ?.map((cb: CoBorrower) => cb.shortName)
            .join(", ")}
        </Text>
      </View>
    </View>
  );
};

const DisbursementAndSanctionedAmountView = ({ item }) => {
  return (
    <View style={styles.usageContainer}>
      <View style={styles.usageBox}>
        <View style={styles.labelContainer}>
          <Image
            source={imagePath.disburse}
            style={[styles.labelIcon, { marginRight: 6 }]}
          />
          <Text style={styles.usageTitle}>{strings.Disbursed_Amount}</Text>
        </View>
        <Text style={styles.usageAmount}>
          {formatIndianRupees(item?.loanAmount)}
        </Text>
        <Text style={styles.usageSubtext}>
          {handlePercentAmount(item?.loanAmount, item?.repayAmount, "disburse")}
          {strings.percent_used}
        </Text>
      </View>
      <View style={styles.verticalDivider} />
      <View style={[styles.usageBox, { alignItems: "flex-end" }]}>
        <View style={styles.labelContainer}>
          <Text style={styles.usageTitle}>{strings.Sanctioned_Amount}</Text>
          <Image
            source={imagePath.sanctioned}
            style={[styles.labelIcon, { marginLeft: 6 }]}
          />
        </View>

        <Text style={styles.usageAmount}>
          {formatIndianRupees(item?.repayAmount)}
        </Text>
        <Text style={styles.usageSubtext}>
          {handlePercentAmount(item?.loanAmount, item?.repayAmount, "sanction")}
          {strings.percent_left}
        </Text>
      </View>
    </View>
  );
};

const DetailContainer = ({ item, screenName }) => {
  if (screenName === navigationStrings.ACCOUNT_SUMMARY_TERM) {
    return <LoanInfoDetailsSummery item={item} />;
  } else if (screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT) {
    return <LoanDisbursmentInfoSummery item={item} />;
  } else {
    return <LoanDetailsSummery item={item} />;
  }
};

const LoanInfoDetailsSummery = ({ item }) => {
  return (
    <View style={styles.detailsContainer}>
      <DetailItem
        label={strings.Loan_Amount}
        value={formatIndianRupees(item?.loanAmount)}
      />

      <DetailItem label={strings.Loan_Tenure_Months} value={item?.loanTenure} />

      <DetailItem
        label={strings.interest_rate_type}
        value={item?.interestRateType ?? "-"}
      />

      <DetailItem label={strings.grace_period} value={item?.gracePeriod} />

      <DetailItem
        label={strings.paid_principal_amount}
        value={formatIndianRupees(item?.totalDisbursementAmount)}
      />

      <DetailItem
        label={strings.sanction_amount}
        value={formatIndianRupees(item?.sanctionedAmount)}
      />
    </View>
  );
};

const LoanDetailsSummery = ({ item }) => {
  return (
    <View style={styles.detailsContainer}>
      <DetailItem
        label={strings.Loan_Amount}
        value={formatIndianRupees(item?.loanAmount)}
      />
      <DetailItem
        label={strings.ROI}
        value={formatNumberToTwoDecimals(item?.outstandingPrincipal) + "%"}
      />
      <DetailItem
        label={strings.Next_Repay_Amount}
        value={formatIndianRupees(item?.emiAmount)}
      />
      <DetailItem
        label={strings.Next_Repay_Date}
        value={formatDate(item?.nextEmiDate)}
      />
      <DetailItem label={strings.Loan_Tenure_Months} value={item?.loanTenure} />
      <DetailItem
        label={strings.Load_Start_Date}
        value={formatDate(
          item?.loanStartDate?.trim() ? item.loanStartDate : item?.firstDisbDate
        )}
      />
    </View>
  );
};

const LoanDisbursmentInfoSummery = ({ item }) => {
  const [ref, { show: showPopable, hide: hidePopable }] = usePopable();

  return (
    <View style={styles.detailsContainer}>
      {/* <DetailItem
        label={strings.name_of_the_university}
        value={item?.nameOfTheUniversity}
      /> */}

      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{strings.name_of_the_university}</Text>
        {item?.nameOfTheUniversity ? (
          item.nameOfTheUniversity.length > 13 ? (
            <Popable
              style={{
                opacity: 0.85,
                flex: 1,
                width: item?.nameOfTheUniversity?.length * 8,
                maxWidth: 250,
              }}
              caret={true}
              position="right"
              ref={ref}
              wrapperStyle={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
              }}
              backgroundColor="rgba(255, 255, 255, 0.9)"
              onAction={(visible) => {
                if (visible) {
                  setTimeout(() => hidePopable(), 3000);
                }
              }}
              content={
                <View
                  style={{
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.regular,
                      color: "#000",
                    }}
                  >
                    {item?.nameOfTheUniversity}
                  </Text>
                </View>
              }
            >
              <Text style={styles.detailValue}>
                {item.nameOfTheUniversity.slice(0, 13) + " ..."}
              </Text>
            </Popable>
          ) : (
            <Text style={styles.detailValue}>{item.nameOfTheUniversity}</Text>
          )
        ) : (
          <Text style={styles.detailValue}>{""}</Text>
        )}
      </View>

      <DetailItem
        label={strings.Last_Disbursement_Date}
        value={formatDate(item?.lastDisbursementDate)}
      />

      <DetailItem
        label={strings.Total_Sanctioned_Amount}
        value={formatIndianRupees(item?.totalSanctionedAmount)}
      />

      <DetailItem
        label={strings.total_undisbursed_amount}
        value={formatIndianRupees(item?.loanUndisbursedAmount)}
      />

      <DetailItem
        label={strings.Loan_Amount}
        value={formatIndianRupees(item?.loanAmount)}
      />

      <DetailItem label=" " value=" " />
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

const ButtonContainer = ({ item, screenName, onRequestDisbursement, isMultipleReqRes }) => {
  const dispatch = useDispatch();

  const viewDetailsOverduePress = (item, screenName) => {
    if (screenName === navigationStrings.LOAN_LIST_SCREEN) {
      let filterLoanAccountNumber = item;
      dispatch(cleardisbursementButtonSlice());
      dispatch(setloanAccountNumberOptions(filterLoanAccountNumber));
      dispatch(setSelectedLoanNumber(item?.lanNumber));
      NavigationService.navigate(navigationStrings.ACCOUNT_SUMMARY_TERM);
      dispatch(setSelectedIndex(0));
      dispatch(setProdcuctName("TermLoan"));
    } else {
      dispatch(
        setStatusPopup({
          status: "No access",
          message: `${messages.noPermission.module} "Account Summary"`,
        })
      );
    }
  };

  return (
    <View
      style={[
        styles.buttonWrapper,
        { alignItems: isBtnLeftAlign(screenName) ? "flex-end" : "stretch" },
      ]}
    >
      <TouchableOpacity
        activeOpacity={AppConstants.buttonActiveOpacity}
        disabled={isMultipleReqRes}
        style={[styles.button, /*isMultipleReqRes && { opacity: 0.5 }*/]}
        onPress={() => {
          onRequestDisbursement(item);
        }}
      >
        {screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT &&
        isMultipleReqRes ? (
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{
              width: "100%",
              height: 13,
              borderRadius: 4,
              marginVertical: 6,
            }}
          />
        ) : (
          <View style={styles.buttonContent}>
            {!isBtnLeftAlign(screenName) && (
              <Image source={imagePath.plus} style={styles.plusIcon} />
            )}
            <Text style={styles.buttonText}>{buttonText(screenName)}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const isBtnLeftAlign = (screenName: string) => {
  if (
    screenName === navigationStrings.DASHBOARD_SCREEN ||
    screenName === navigationStrings.LOAN_LIST_SCREEN
  )
    return true;
  else return false;
};

const borderColorVisible = (screenName: string) => {
  if (
    screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT ||
    screenName === navigationStrings.ACCOUNT_SUMMARY_TERM
  )
    return true;
  else return false;
};

const createNewDisRequestBtnVisible = (screenName: string) => {
  if (
    screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT ||
    screenName === navigationStrings.DASHBOARD_SCREEN ||
    screenName === navigationStrings.LOAN_LIST_SCREEN
  )
    return true;
  else return false;
};

const buttonText = (screenName: string) => {
  if (screenName === navigationStrings.DASHBOARD_SCREEN)
    return strings.Request_Fund_Release;
  else if (screenName === navigationStrings.LOAN_LIST_SCREEN)
    return strings.view_details;
  else if (screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT)
    return strings.create_new_request;
  else return "";
};

const accontStatusVisible = (screenName: string) => {
  if (
    screenName === navigationStrings.DASHBOARD_SCREEN ||
    screenName === navigationStrings.ACCOUNT_SUMMARY_TERM ||
    screenName === navigationStrings.LOAN_LIST_SCREEN
  )
    return true;
  else return false;
};

const accontDropdownVisible = (screenName: string) => {
  if (
    screenName === navigationStrings.DASHBOARD_SCREEN ||
    screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT ||
    screenName === navigationStrings.ACCOUNT_SUMMARY_TERM
  )
    return true;
  else return false;
};

const getMarginHorizontal = (screenName: string) => {
  if (
    screenName === navigationStrings.REQUEST_FOR_DISBURSEMENT ||
    screenName === navigationStrings.ACCOUNT_SUMMARY_TERM
  )
    return true;
  else return false;
};

const canShowBorrowInfo = (screenName: string) => {
  if (screenName === navigationStrings.ACCOUNT_SUMMARY_TERM) return true;
  else return false;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
  },
  headinContainer: {
    flex: 1,
    paddingRight: 16,
  },
  mainHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#168794",
    marginBottom: 4,
    fontFamily: fonts.bold,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "400",
    color: "#414042",
    fontFamily: fonts.regular,
  },
  activeStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
    minWidth: 60,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 12,
  },
  usageContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  usageBox: {
    flex: 1,
  },
  usageTitle: {
    color: "#6f6b7d",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.regular,
    lineHeight: 22,
    flexShrink: 1,
  },
  usageAmount: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.regular,
    lineHeight: 14,
    color: "#4b465c",
    marginTop: 5,
  },
  usageSubtext: {
    color: "#a5a3ae",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  progressBarBackground: {
    height: 8,
    // backgroundColor: "#F6C15C",
    backgroundColor: "#22968A",
    borderRadius: 4,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#F6C15C",
    // backgroundColor: "#22968A",
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  detailItem: {
    width: "32%",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: "#a5a3ae",
    fontWeight: "400",
    fontFamily: fonts.regular,
    lineHeight: 14,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.regular,
    lineHeight: 14,
    paddingTop: 5,
    color: "#222",
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.appThemeColor,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 21,
    justifyContent: "flex-end",
    backgroundColor: colors.lightGreyBackgroundColor,
  },
  buttonText: {
    color: colors.appThemeColor, //"#22968A",
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  buttonWrapper: {
    marginTop: 8,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  horizontalDivider: (screenName) => ({
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
    marginBottom:
      screenName === navigationStrings.ACCOUNT_SUMMARY_TERM ? 8 : 24,
  }),
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  dropdownContainer: {
    zIndex: 1000,
    width: 200,
    borderRadius: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingBottom: 6,
  },
  labelIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  labelContainer: {
    flexDirection: "row",
  },
  borderWraper: {
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  borderWraperWithoutBorderColor: {
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: "contain",
  },
  namesView: {
    backgroundColor: "#F1F9F9",
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 10,
    marginVertical: 6,
    color: colors.guidelinesTextColor,
  },
});

export default TermLoanDashboardData;
