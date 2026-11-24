import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import mainStyle from "../../../res/mainStyles";
import Header from "../../../components/common/Header";
import * as NavigationService from "../../../navigation/NavigationService";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
import LoanSummaryCard from "../../../components/LoanSummaryCard";
import strings from "../../../res/strings";
import ShadowCardComponent from "../../../components/ShadowCardComponent";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import TermLoanDashboardData from "../TermLoanDashboardData";
import NoRecordFound from "../../../components/common/NoRecordFound";
import CopyrightComponent from "../../../components/common/CopyrightComponent";
import navigationStrings from "../../../constant/navigationStrings";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../services/redux/store";
import queryString from "query-string";
import service from "../../../services/api/service";
import { setaccountSummaryData } from "../../../services/redux/slices/accountSummarySlice";
import { formatIndianRupees } from "../../../utils/formatting";
import { formatDate } from "../../../utils/dateFormatUtils";
import Space from "../../../components/common/Space";
import { createModuleLogger } from "../../../utils/logger";
import { Popable, usePopable } from "react-native-popable";
import imagePath from "../../../constant/imagePath";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

interface QueryParams {
  lan: string | null;
  business: string | null;
  loanCategory: string | null;
}

interface CoBorrower {
  cif: string;
  shortName: string;
}

const AccountSummaryTerm = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [accountSummaryData, setAccountSummaryData] = useState<any[]>([]);
  const [accountNumber, setAccountNumber] = useState();
  const [moratStatus, setMoratStatus] = useState(false);

  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber
  );
  const dasboardDataSet = useSelector(
    (state: RootState) => state?.dashboardData
  );
  const businessTypeId = useSelector(
    (state: RootState) => state?.auth?.businessType?.id
  );
  const loanCategoryData: any = useSelector(
    (state: RootState) => state?.auth?.loanCategory
  );
  const logger = createModuleLogger("AccountSummaryTerm");

  const fetchData = async () => {
    setIsLoading(true);
    const queryParams: QueryParams = {
      lan: selectedLoanNumber,
      business: businessTypeId,
      loanCategory: loanCategoryData?.TermLoan[0]?.loanCategoryId,
    };
    const queryParamsString = queryString?.stringify(queryParams);
    try {
      const response = await service.posts.secureGetPosts(
        `api/v1/dashboard/term-account-summary?${queryParamsString}`
      );
      const data = response?.data?.data || [];
      setAccountNumber(data[0]?.lanNumber);
      logger.debug(data);
      setAccountSummaryData(data);
      dispatch(setaccountSummaryData(data));
      // Adding the filter logic here
      const status = dasboardDataSet.sanctionedDisbursedData
        .filter(
          (dataItem: { lanNumber: string }) =>
            dataItem.lanNumber === selectedLoanNumber
        )
        .map((dataItem: { morat: boolean }) => dataItem.morat)[0];
      setMoratStatus(!!status);
    } catch (error) {
      //console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLoanNumber]);

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  const ShimmerCard = () => {
    return (
      <View>
        <View style={styles.rowshimmerstyle}>
          <ShimmerPlaceHolder style={{ width: 170, height: 40 }} />
          <ShimmerPlaceHolder style={{ width: 80, height: 40 }} />
        </View>
        <View style={styles.rowshimmerstyle}>
          <ShimmerPlaceHolder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
        </View>
        <View>
          <ShimmerPlaceHolder
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
        </View>
        <View style={styles.rowshimmerstyle}>
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={styles.rowshimmerstyle}>
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      
      <Header
        backIconNeeded={true}
        onBackPress={handleBackPress}
        showProfile={false}
        showNotification={false}
      />
      <ScrollView style={{ padding: 0 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={styles.titleView}>{strings.loan_details}</Text>
        </View>
        {isLoading ? (
          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={20}
            marginVertical={1}
            marginHorizontal={16}
          >
            <ShimmerCard />
          </ShadowCardComponent>
        ) : (
          accountSummaryData?.map((item, index) => (
            <TermLoanDashboardData
              item={item}
              screenName={navigationStrings.ACCOUNT_SUMMARY_TERM}
            />
          ))
        )}

        {isLoading && <Space style={{ height: 16 }} />}

        <View style={{ paddingHorizontal: 16 }}>
          <LoanDetailsView
            title={strings.loan_details}
            item={accountSummaryData[0]}
          />

          <LastDisbursementDetailsView
            title={strings.last_disbursement_details}
            item={accountSummaryData[0]}
          />
        </View>

        <CopyrightComponent />
      </ScrollView>
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default AccountSummaryTerm;

const LoanDetailsView = ({ title, item }) => {
  const [statusRef, { show: showStatusPopable, hide: hideStatusPopable }] =
    usePopable();
  const [ref, { show: showPopable, hide: hidePopable }] = usePopable();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>
              {strings.total_interest_outstanding}
            </Text>
            <Text style={styles.value}>
              {formatIndianRupees(item?.totalPrincipalAmountPaid ?? "-")}
            </Text>
          </View>
          <View style={styles.column}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <Text style={styles.label}>
                {strings.total_principal_outstanding}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // marginLeft: 6,
                }}
              >
                <Popable
                  style={{
                    opacity: 0.85,
                    // flex: 1,
                    // marginRight: 120,
                    width: "requestStatusTooltipDataoofr".length * 5,
                    // maxWidth: 1550,
                  }}
                  wrapperStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    // alignItems: "center",
                    // justifyContent: "center",
                  }}
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
                  <Image
                    source={imagePath.info}
                    style={{
                      marginLeft: 6,
                      height: 15,
                      width: 15,
                      resizeMode: "contain",
                    }}
                  />
                </Popable>
              </View>
              {/* <View
                style={{
                  // overflow: "visible",
                  // zIndex: 10,
                  // alignItems: "center",
                  // justifyContent: "center",
                  //   marginBottom: 12,
                  marginLeft: 6,
                  marginBottom: 12,
                  backgroundColor: "red",
                }}
              >
                <Popable
                  style={{
                    opacity: 0.85,
                    // flex: 1,
                    width: "requestStatusTooltipData(detailsData)".length * 5,
                    // maxWidth: 550,
                  }}
                  position="left"
                  ref={ref}
                  wrapperStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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
                  <View
                    style={{
                      paddingStart: 5,
                      paddingEnd: 10,
                      paddingVertical: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={imagePath.info}
                      // style={[
                      //   {
                      //     alignSelf: "center",
                      //     width: 15,
                      //     height: 15,
                      //     marginBottom: 12,
                      //   },
                      // ]}
                      style={{
                        // alignSelf: "center",
                        width: 12,
                        height: 12,
                        // marginBottom: 150,
                      }}
                      // resizeMode="contain"
                    />
                  </View>
                </Popable>
              </View> */}
              {/* <Text style={styles.label}>
              {strings.total_principal_outstanding}
            </Text> */}
            </View>
            <Text style={styles.value}>
              {formatIndianRupees(item?.totalPrincipalOutstanding ?? "-")}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.loan_start_date}</Text>
            <Text style={styles.value}>
              {formatDate(item?.loanStartDate ?? "-")}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.Next_Repay_Amount}</Text>
            <Text style={styles.value}>
              {" "}
              {formatIndianRupees(item?.nextRepaymentAmount ?? "-")}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.total_loan_outstanding}</Text>
            <Text style={styles.value}>
              {formatIndianRupees(item?.totalLoanOutstanding ?? "-")}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.Loan_End_Date}</Text>
            <Text style={styles.value}>
              {formatDate(item?.loanEndDate ?? "-")}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.remaining_tenure}</Text>
            <Text style={styles.value}>{item?.remainingTenure ?? "-"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.Next_Repay_Date}</Text>
            <Text style={styles.value}>
              {formatDate(item?.nextRepaymentDate ?? "-")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const LastDisbursementDetailsView = ({ title, item }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.beneficiary_name}</Text>
            <Text style={styles.value}>{item?.beneficiaryName ?? "-"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.account_number}</Text>
            <Text style={styles.value}>{item?.accountNumber ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.bank_name}</Text>
            <Text style={styles.value}>{item?.bankName ?? "-"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.ifsc_code}</Text>
            <Text style={styles.value}> {item?.ifscCode ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.disbursement_amount}</Text>
            <Text style={styles.value}>
              {formatIndianRupees(item?.disbursementAmount ?? "-")}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>{strings.disbursement_date}</Text>
            <Text style={styles.value}>
              {formatDate(item?.disbursementDate ?? "-")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleView: {
    marginBottom: 16,
    fontSize: 14,
    color: colors.dashboardTitle,
    fontFamily: fonts.bold,
  },
  rowshimmerstyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxSmall: {
    //width: screenWidth * 0.28,
    width: "32%",
    height: 40,
    borderRadius: 8,
  },
  footer: {
    alignSelf: "flex-end",
    width: 160,
    height: 40,
    marginTop: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    fontSize: 13,
    //color: "#33C2C4",
    color: colors.appThemeColor,
    fontWeight: "bold",
    marginBottom: 20,
    textTransform: "uppercase",
  },
  content: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    marginBottom: 20,
  },
  column: {
    flex: 1,
    // backgroundColor: "green",
  },
  label: {
    fontSize: 10,
    // backgroundColor: "green",
    fontFamily: fonts.medium,
    color: colors.guidelinesTextColor,
    marginBottom: 12,
  },
  value: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.valueTextColor,
    fontWeight: "600",
  },
});
