import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import colors from "../res/colors";
import strings from "../res/strings";
import { messages } from "../constant/AppConstants";
import fonts from "../res/fonts";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { RootState } from "../services/redux/store";
import { useDispatch, useSelector } from "react-redux";
import postsServices from "../services/api/service/postsService";
import {
  authSelector,
  userLoanCatSelector,
} from "../services/redux/slices/authSlice";

import {
  setDashboardData,
  setMoratStatus,
  setSelectedLoanNumber,
} from "../services/redux/slices/dashboardDataSlice";

import {
  setStatusPopup,
  statusPopupSelector,
} from "../services/redux/slices/statusPopupSlice";

import { decrypt, encrypt } from "../utils/crypto";
import {
  setloanAccountNumberOptions,
  setSelectedloanAccountNumber,
} from "../services/redux/slices/optionSlice";
import { termLoanPermissionCheck } from "../utils/helpers";
import { cleardisbursementButtonSlice } from "../services/redux/slices/disbursementButtonSlice";
import {
  setProdcuctName,
  setSelectedIndex,
} from "../services/redux/slices/tabsSlice";
import * as NavigationService from "../navigation/NavigationService";
import navigationStrings from "../constant/navigationStrings";
import ShadowCardComponent from "./ShadowCardComponent";
import ListHeader from "./ListHeader";
import TermLoanDashboardData from "../screens/dashboard/TermLoanDashboardData";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../services/api/apiClient/apiClient";
import logger from "../utils/logger";
import { useNotifications } from "../hooks/useNotifications";
import { useFocusEffect } from "@react-navigation/native";

type CardProps = {
  mockData?: {
    disbursedAmt: number;
    sanctionAmt: number;
    loanAmt: number;
    roi: number;
    nextRepayAmt: number;
    nextRepayDate: string;
    loanTenure: number;
    loanStartDate: string;
    loanStatus: string;
    loanAccount: String;
    loanTypeSummary: String;
  };
  onRequestDisbursement?: () => void;
  screenName?: string;
  isLoggedOut?: boolean;
  setIsTermLoanLoading?: (flag: boolean) => void;
};

interface Payload {
  cif?: any;
  business?: any;
  loanCategory?: any;
  lan?: any;
}

const LoanSummaryCard: React.FC<CardProps> = ({ screenName, isLoggedOut, setIsTermLoanLoading }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(true);
  const [LoanSummaryCard, setLoanSummaryCard] = useState<any[]>([]);
  const { userProfile, businessType } = useSelector(authSelector);
  const { refreshValue } = useSelector(statusPopupSelector);
  const userLoanCategory = useSelector(userLoanCatSelector);
  const [loanAccountNumberList, setLoanAccountNumberList] = useState([]);
  const dispatch = useDispatch();
  const { getNotificationsList } = useNotifications();
  const [isHideMainCard, setIsHideMainCard] = useState(false);
  const loanAccountNumberOptions = useSelector(
    (state: RootState) => state?.option?.loanAccountNumberOptions
  );
  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber ?? ""
  );
  const businessTypeId = useSelector(
    (state: RootState) => state?.auth?.businessType?.id
  );
  const loanCategoryData: any = useSelector(
    (state: RootState) => state?.auth?.loanCategory
  );
  const { otpUserData } = useSelector(authSelector);

  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  useEffect(() => {
    if (isLoggedOut) setLoggedOut(isLoggedOut);
  }, [isLoggedOut]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000); // simulate loading
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    logger.info("Header mounted, fetching notifications");
    getNotificationsList();
  }, []);

  useEffect(() => {
    if (loanAccountNumberOptions?.length < 1 || !loanAccountNumberOptions) {
      setIsLoading(true);
      if (businessType?.id != undefined) {
        const payload: Payload = {
          cif: userProfile?.cifNumber,
          business: encrypt(businessType?.id),
          loanCategory: encrypt(userLoanCategory?.TermLoan[0]?.loanCategoryId),
        };
        postsServices
          .secureAddPost("api/v1/dashboard/term-loans", payload)
          .then((response) => {
            let filterLoanAccountNumber = response?.data?.data?.map(
              (acc: any) => acc.lanNumber
            );

            let filterLoanAccountNumberListData = response?.data?.data?.map(
              (acc: any, index: number) => ({
                label: acc.lanNumber,
                value: `${index}`,
              })
            );
            dispatch(setloanAccountNumberOptions(filterLoanAccountNumber));
            setLoanAccountNumberList(filterLoanAccountNumberListData);
            if (!selectedLoanNumber) {
              dispatch(
                setSelectedloanAccountNumber(
                  response?.data?.data && response?.data?.data[0]?.lanNumber
                )
              );
              dispatch(
                setSelectedLoanNumber(
                  response?.data?.data && response?.data?.data[0]?.lanNumber
                )
              );
            }
            setIsLoading(false);
          })
          .catch(async (error: any) => {
            setIsLoading(false);
            const errorMessage = error;
            //error.response?.data?.message || messages.withdrErrorMessages.commonError;
            const isConnected = await checkConnectivity();
            if (isConnected) {
              dispatch(
                setStatusPopup({
                  status: "Error",
                  message: errorMessage,
                })
              );
            }
          });
      }
    }
  }, [userProfile?.cifNumber]);

  // Function to fetch loan data - extracted for reuse
  const fetchLoanData = React.useCallback(() => {
    if (selectedLoanNumber && selectedLoanNumber !== "") {
      setIsLoadingView(true);
      setIsTermLoanLoading?.(true);
      const payload: any = {
        lan: encrypt(selectedLoanNumber.toString()),
        business: encrypt(businessTypeId),
        loanCategory: encrypt(loanCategoryData?.TermLoan[0]?.loanCategoryId),
      };
      postsServices
        .secureAddPost("api/v1/dashboard/term-loan-view", payload)
        .then((response) => {
          setIsLoadingView(false);
          setIsTermLoanLoading?.(false);
          setLoanSummaryCard(response?.data?.data);
          dispatch(setDashboardData(response?.data?.data));
          dispatch(setMoratStatus(response?.data?.data));

          setIsHideMainCard(
            !Array.isArray(response?.data?.data) ||
              response?.data?.data.length === 0
          );
        })
        .catch(async (error) => {
          setIsLoadingView(false);
          setIsTermLoanLoading?.(false);
          setIsHideMainCard(LoanSummaryCard.length === 0);
          const errorMessage = error;
          //error.response?.data?.message || messages.withdrErrorMessages.commonError;
          const isConnected = await checkConnectivity();
          if (isConnected) {
            dispatch(
              setStatusPopup({
                status: "Error",
                message: errorMessage,
              })
            );
          }
        });
    }
  }, [selectedLoanNumber]);

  // Trigger API call when selectedLoanNumber changes
  useEffect(() => {
    fetchLoanData();
  }, [selectedLoanNumber]);

  // Trigger API call when coming back to Dashboard screen
  useFocusEffect(
    React.useCallback(() => {
      if (screenName === navigationStrings.DASHBOARD_SCREEN) {
        fetchLoanData();
      }
    }, [screenName, fetchLoanData])
  );

  const ShimmerCard = () => {
    return (
      <View>
        <View style={styles.row}>
          <ShimmerPlaceHolder style={{ width: 170, height: 40 }} />
          <ShimmerPlaceHolder style={{ width: 80, height: 40 }} />
        </View>
        <View style={styles.row}>
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
        <View style={styles.row}>
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
        <View style={styles.row}>
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
        <ShimmerPlaceHolder
          style={styles.footer}
          LinearGradient={LinearGradient}
        />
      </View>
    );
  };

  const requestForDisbursement = async (
    loanAccountNumber: any,
    isExistDisbursementAllowdLoan: any,
    status: any
  ) => {
    // await analytics().setUserId(user_id);
    await analytics().setUserId(user_id);
    analytics().logEvent("DashboardOverview_Request_Disbursement", {
      screen_name: "Dashboard",
      user_id: user_id,
    });

    if (
      otpUserData?.altAccessFlag === true || //check for all access user
      (isExistDisbursementAllowdLoan === true && status === "A")
    ) {
      if (termLoanPermissionCheck()) {
        dispatch(cleardisbursementButtonSlice());
        dispatch(setSelectedloanAccountNumber(loanAccountNumber));
        dispatch(setDashboardData(LoanSummaryCard));
        dispatch(setSelectedLoanNumber(loanAccountNumber));
        NavigationService.navigate(navigationStrings.REQUEST_FOR_DISBURSEMENT);
        dispatch(setSelectedIndex(0)); // Set index for "My Account" tab
        dispatch(setProdcuctName("TermLoanDisbursement"));
      } else {
        dispatch(
          setStatusPopup({
            status: "No access",
            message: `${messages.noPermission.module} "Account Summary"`,
          })
        );
      }
    } else {
      dispatch(
        setStatusPopup({
          status: "No access",
          message:
            "Disbursement requests are currently unavailable for this loan",
        })
      );
    }
  };

  const handleLeftTextPress = async () => {
    await analytics().setUserId(user_id);
    analytics().logEvent("ViewAll_Loans", {
      screen_name: "Dashboard",
      user_id: user_id,
    });
    NavigationService.navigate(navigationStrings.LOAN_LIST_SCREEN);
  };

  return (
    <View>
      {!isHideMainCard && screenName === navigationStrings.DASHBOARD_SCREEN && (
        <View style={{ marginTop: 10, marginHorizontal: 8 }}>
          <ListHeader
            rightText={strings.Overview}
            leftText={strings.View_all_loans}
            onLeftTextPress={handleLeftTextPress}
          />
        </View>
      )}
      {!isHideMainCard && (
        <View>
          {loggedOut || isLoadingView ? (
            <ShadowCardComponent
              paddingHorizonatal={16}
              paddingVertical={20}
              marginVertical={16}
              marginHorizontal={16}
            >
              <ShimmerCard />
            </ShadowCardComponent>
          ) : (
            LoanSummaryCard?.map((item: any, index: number) => {
              return (
                <TermLoanDashboardData
                  key={item.lanNumber || index}
                  item={item}
                  screenName={screenName}
                  onRequestDisbursement={() => {
                    requestForDisbursement(
                      item?.lanNumber,
                      item?.isExistDisbursementAllowdLoan,
                      item?.status,
                    );
                  }}
                />
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
  },
  lanButton: {
    paddingVertical: 10,
  },
  lanText: {
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginRight: 6,
  },
  lanContent: {
    flexDirection: "row",
    width: 170,
  },
  headinContainer: {
    flex: 1,
    paddingRight: 16,
  },
  mainHeading: {
    fontSize: 14,
    color: "#168794",
    marginBottom: 4,
    fontFamily: fonts.medium,
  },
  subHeading: {
    fontSize: 14,
    color: "#414042",
    fontFamily: fonts.regular,
  },
  activeStatus: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 13,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.medium,
    lineHeight: 22,
  },
  usageAmount: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    lineHeight: 14,
    color: "#4b465c",
    marginTop: 5,
  },
  usageSubtext: {
    color: "#a5a3ae",
    fontSize: 12,
    fontFamily: fonts.medium,
    lineHeight: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#F6C15C",
    borderRadius: 4,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#22968A",
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
    fontFamily: fonts.regular,
    lineHeight: 14,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: fonts.bold,
    lineHeight: 14,
    paddingTop: 5,
    color: "#222",
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    borderRadius: 6,
    alignItems: "center",
    paddingHorizontal: 21,
    justifyContent: "flex-end",
  },
  buttonText: {
    color: colors.appThemeColor,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  buttonWrapper: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
    marginBottom: 24,
  },
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxSmall: {
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
});

export default LoanSummaryCard;
