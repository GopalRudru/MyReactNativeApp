import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableWithoutFeedback,
  Modal,
  BackHandler,
} from "react-native";
import TermLoanDashboardData from "../dashboard/TermLoanDashboardData";
import Header from "../../components/common/Header";
import * as NavigationService from "../../navigation/NavigationService";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import colors from "../../res/colors";
import imagePath from "../../constant/imagePath";
import navigationStrings from "../../constant/navigationStrings";
import styles from "./styles";
import ListHeader from "../../components/ListHeader";
import strings from "../../res/strings";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { authSelector } from "../../services/redux/slices/authSlice";
import { RootState } from "../../services/redux/store";
import { clearDocumentFormType } from "../../services/redux/slices/documentFormSlice";
import { formatDate } from "../../utils/dateFormatUtils";
import { setSelectedIndex } from "../../services/redux/slices/tabsSlice";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import dayjs from "dayjs";
import service from "../../services/api/service";
import {
  cleardisbursementButtonSlice,
  setActionRowData,
  setdisbursementButtonValue,
  setLastDisbursementStatus,
} from "../../services/redux/slices/disbursementButtonSlice";
import CardItemList from "../../components/CardItemList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatIndianRupees } from "../../utils/formatting";
import analytics from "@react-native-firebase/analytics";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createModuleLogger } from "../../utils/logger";
import { decrypt } from "../../utils/crypto";
import { Popable, usePopable } from "react-native-popable";
import fonts from "../../res/fonts";
import postsServices from "../../services/api/service/postsService";
import FeedbackModal from "../../components/common/FeedbackModal";
import { feedbackRatingCount, increaseFeedbackRatingCount } from "../../utils/storageUtils";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import AppConstants from "../../constant/AppConstants";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface LastDisbFormStatusData {
  description: string;
  firstName: string;
  lastDisbFormId: number;
  lastDisbStatus: string;
  lastDisbursementDate: string;
  lastName: string;
  loanUndisbursedAmount: number;
  nameOfTheUniversity: string;
  totalLoanDisbursed: number;
  totalSanctionedAmount: number;
  allowDisbursement: boolean;
}

export interface RowData {
  [key: string]: string | number | null;
}

interface DashboardItemType {
  description: string;
  firstName: string;
  lastName: string;
  nameOfTheUniversity: string;
  lastDisbursementDate: string;
  totalSanctionedAmount: number;
  loanUndisbursedAmount: number;
  totalLoanDisbursed: number;
}

const RequestForDisbursement = () => {
  const [isMultipleReqRes, setIsMultipleReqRes] = useState(false);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptionFilterValue, setSelectedOptionFilterValue] = useState<
    string | number
  >("");
  const [dashboardData, setDashboardData] = useState<DashboardItemType>();
  const { userProfile } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [disbursementuserDetails, setDisbursementUserDetails] = useState<any[]>(
    [],
  );
  const [visible, setVisible] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const closeModal = () => setVisible(false);
  const logger = createModuleLogger("requestForDisbursement");

  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber,
  );

  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
  );

  const otpUserData = useSelector((state: RootState) => state.auth.otpUserData);

  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }
  const navigation = useNavigation();
  const [statusRef, { show: showStatusPopable, hide: hideStatusPopable }] =
    usePopable();
  useEffect(() => {
    const matchedObject = dashboardDataSet.find(
      (data: any) => data.loanAccountNumber === selectedLoanNumber,
    );

    dispatch(clearDocumentFormType());
  }, [selectedLoanNumber]);

  useEffect(() => {
    const matchedObject = dashboardDataSet.find(
      (data: any) => data.loanAccountNumber === selectedLoanNumber,
    );
    setDashboardData(matchedObject);
  }, [dashboardData]);

  const [rows, setRows] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [lastDisbFormStatus, setLastDisbFormStatus] = useState("");
  const [lastDisbFormStatusData, setLastDisbFormStatusData] =
    useState<LastDisbFormStatusData | null>(null);
  let withdrawData = useSelector((state: RootState) => state.option.loanData);
  const selectedOption = useSelector(
    (state: RootState) => state.option.selectedOption,
  );
  const sanctionedDisbursedData = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
  );

  const route = useRoute();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feebackModelVisibleInSession, setFeebackModelVisibleInSession] = useState<any>(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkModal = async () => {
        const value = await AsyncStorage.getItem("reviewAsked");

        // if (!isActive) return;

        setFeedVisible(!value);
        // show only if NOT asked
        setCheckingReview(false);
      };

      // checkModal();
      if (route.params?.showFeedback) {
        
        feedbackRatingSessionHandling();
        setShowFeedback(true);
        
        // 🔑 Reset immediately after use
        // navigation.setParams({ showFeedback: false });
        NavigationService.setParams({ showFeedback: false });
      }
    }, [route.params?.showFeedback]),
  );

  const feedbackRatingSessionHandling = async () => {
    const currentCount = await feedbackRatingCount();
    await increaseFeedbackRatingCount(currentCount + 1);
    const count = await feedbackRatingCount();
    setFeebackModelVisibleInSession(count <= 1);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        NavigationService.resetBackTo(navigationStrings.DASHBOARD_SCREEN);
        return true; // ⛔ block default back
      };

      // RN 0.77 removed BackHandler.removeEventListener; addEventListener
      // returns a subscription that is released via .remove().
      const backSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      navigation.setOptions({ gestureEnabled: false });
      return () => backSubscription.remove();
    }, []),
  );

  useEffect(() => {
    const filteredDashboardData = sanctionedDisbursedData?.filter(
      (item: any) => {
        return item.loanAccountNumber === selectedOption;
      },
    );
    setOverdueAmount(
      filteredDashboardData.length > 0
        ? filteredDashboardData[0].overdueAmount
        : 0,
    );

    return () => {};
  }, [sanctionedDisbursedData, selectedOption]);

  const selectedloanAccountNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber,
  );

  useEffect(() => {
    const filteredDashboardData = sanctionedDisbursedData?.filter(
      (item: any) => {
        return item.loanAccountNumber === selectedloanAccountNumber;
      },
    );
    setOverdueAmount(
      filteredDashboardData.length > 0
        ? filteredDashboardData[0].overdueAmount
        : 0,
    );
  }, [selectedloanAccountNumber]);
  useEffect(() => {
    if (dashboardDataSet[0]?.isExistDisbursementAllowdLoan == false) {
      dispatch(setSelectedIndex(0));

      dispatch(
        setStatusPopup({
          status: "No access",
          message:
            "Disbursement requests are currently unavailable for this loan",
        }),
      );
    }
  }, [dashboardDataSet]);

  const fetchData = async () => {
    setIsLoading(true);
    const formattedFromDate = fromDate
      ? dayjs(fromDate).format("YYYY-MM-DD")
      : "";
    const formattedToDate = toDate ? dayjs(toDate).format("YYYY-MM-DD") : "";
    const statusQuery =
      selectedOptionFilterValue === "all"
        ? ""
        : `status=${selectedOptionFilterValue}&`;

    const pageSkip = page + 1;
    const pageSize = 5;
    const queryString = `?lan=${selectedLoanNumber}&${statusQuery}fromDate=${formattedFromDate}&toDate=${formattedToDate}&page=${pageSkip}&pageSize=${pageSize}`;
    const payload = {
      lan: selectedLoanNumber?.trim(),
      status:
        selectedOptionFilterValue === "all" ? "" : selectedOptionFilterValue,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
      page: pageSkip,
      pageSize: pageSize,
    };
    try {
      if (selectedLoanNumber != undefined) {
        setRows([]);
        const response = await service.posts.secureGetPosts(
          `api/v1/dashboard/disb-detail-request${queryString}`,
        );
        setDisbursementUserDetails(response?.data?.data);
        setLastDisbFormStatus(response?.data?.data[0]);
        setLastDisbFormStatusData(response?.data?.data[0]);
        try {
          const responseHistory = await service.posts.secureAddPost(
            "api/v1/dashboard/disb-req-history",
            payload,
          );

          const disbursementRequestHistory =
            responseHistory?.data?.disbursementRequestHistory?.map(
              (item: any) => ({
                ...item,
                crmTrackingId: item.crmTrackingId
                  ? item.crmTrackingId.toString()
                  : "-",
                disbursemntDate: item.disbursemntDate
                  ? item.disbursemntDate
                  : "-",
              }),
            ) ?? [];

          setRows(disbursementRequestHistory);
        } catch (error) {
          logger.error("Failed to fetch disbursement request history:", error);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLoanNumber) {
      fetchData();
    }
  }, [selectedLoanNumber, page]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedLoanNumber) {
        fetchData();
      }
      return () => {};
    }, [selectedLoanNumber]),
  );

  const disbursementHistoryBtn = () => {
    dispatch(cleardisbursementButtonSlice());
    dispatch(setdisbursementButtonValue("disbursementHistoryBtn"));
  };
  
  const fetchMultipleReqData = async (selectedloanAccountNumber: string) => {
    try {
      setIsMultipleReqRes(true)
      const payload = {
        loanAccountNumber: selectedloanAccountNumber
      }
      const response = await postsServices.secureAddPost("api/v1/disbursement-form/check-fund-request-allowance", payload);
      if(response && response?.status === 200) {
        return response?.data?.data?.isAllowed
      }
    } catch(err) {
      console.error("Error While getting filters data", err)
      return false;
    } finally {
        setIsMultipleReqRes(false)
    }
  }

  const matchedObject = dashboardDataSet.find(
    (data: any) => data.lanNumber === selectedLoanNumber,
  );
  const createNewRequestBtn = async () => {
    const isMultipleFundNotAllowed = await fetchMultipleReqData(selectedloanAccountNumber);
    
    await analytics().setUserId(user_id);
    analytics().logEvent("Dash_Disb_CreateNewRequest", { user_id: user_id });

    //localStorage.removeItem("aggApplicationNo");
    AsyncStorage.removeItem("disbursementFormId");
    dispatch(cleardisbursementButtonSlice());
    dispatch(setLastDisbursementStatus(lastDisbFormStatus));
    dispatch(setActionRowData(""));

    logger.debug(
      "lastDisbFormStatusData?.lastDisbStatus",
      lastDisbFormStatusData?.lastDisbStatus,
    );

    const allAccess = otpUserData?.altAccessFlag === true;

    // if (lastDisbFormStatusData?.lastDisbStatus === "indraft") {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       message: `You already have an ongoing request saved as a draft in the “Disbursement Request History”. Please make the necessary changes to the draft and submit the request for tranche disbursement`,
    //       buttonStatus: false,
    //     })
    //   );
    // } else if (
    //   lastDisbFormStatusData?.lastDisbStatus !== "approve" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "reject" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== undefined &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "cancelled"
    // ) {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       // message: `One request is already raised, and its status is ${lastDisbFormStatusData?.lastDisbStatus}. You cannot raise a new request until the current request is approved or rejected. To continue with the open request, please click the action button below.`,
    //       message: `Work in progress! You have already raised a disbursement request, and our team is diligently working on it. You cannot raise a new request unless we finish working on the previous one. Please check the status of the earlier request in the ‘View Disbursement Request’ section.`,
    //       buttonStatus: false,
    //     })
    //   );
    // } 

    if (!isMultipleFundNotAllowed) {
      dispatch(
        setStatusPopup({
          status: "error",
          status: "Error",
          message: `You already have an ongoing request saved as a draft in the “Disbursement Request History”. Please make the necessary changes to the draft and submit the request for tranche disbursement`,
          buttonStatus: false,
        }),
      );
    } 
    else if (
      (lastDisbFormStatusData?.loanUndisbursedAmount ?? 0) >=
      (lastDisbFormStatusData?.totalSanctionedAmount ?? 0)
    ) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: `The entire sanctioned amount has already been disbursed.`,
          buttonStatus: false,
        }),
      );
    }

    else if (
      matchedObject?.isExistDisbursementAllowdLoan === false ||
      matchedObject?.status != "A"
    ) {
      dispatch(
        setStatusPopup({
          status: "No access",
          // message: `Disbursement requests are not permitted for this loan.`,
          message:
            "Disbursement requests are currently unavailable for this loan",
        }),
      );
    }
    
    //hide
    // else if (lastDisbFormStatusData?.lastDisbStatus !== "indraft" &&
    //   ((lastDisbFormStatusData?.lastDisbStatus !== "approve" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "reject" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== undefined &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "cancelled" &&
    //   lastDisbFormStatusData?.lastDisbStatus !== "partiallyApproved")||
    //   lastDisbFormStatusData?.allowDisbursement === false)
    // ) {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       // message: `One request is already raised, and its status is ${lastDisbFormStatusData?.lastDisbStatus}. You cannot raise a new request until the current request is approved or rejected. To continue with the open request, please click the action button below.`,
    //       message: `Work in progress! You have already raised a disbursement request, and our team is diligently working on it. You cannot raise a new request unless we finish working on the previous one. Please check the status of the earlier request in the 'View Disbursement Request' section.`,
    //       buttonStatus: false,
    //     }),
    //   );
    // } 

    // hide
    // else if (lastDisbFormStatusData?.lastDisbStatus === "indraft") {
    //   dispatch(
    //     setStatusPopup({
    //       status: "info",
    //       // message: `One request is already raised, and its status is ${lastDisbFormStatusData?.lastDisbStatus}. You cannot raise a new request until the current request is approved or rejected. To continue with the open request, please click the action button below.`,
    //       message: "You already have an ongoing request saved as a draft in the “Disbursement Request History”. Please make the necessary changes to the draft and submit the request for tranche disbursement",
    //       buttonStatus: false,
    //     })
    //   );
    // }
    
    else if (allAccess) {
      dispatch(setdisbursementButtonValue("createNewRequestBtn"));
      NavigationService.navigate(navigationStrings.DISBURSEMENT_FORM_TERM);
    }

    // else if ((lastDisbFormStatusData?.loanUndisbursedAmount ?? 0) <= 0) {
    //   dispatch(
    //     setStatusPopup({
    //       status: "Error",
    //       message: `Your undisbursed amount is Rs. 0.00, so you cannot create a new disbursement request.`,
    //       buttonStatus: false,
    //     })
    //   );
    // }
     else {
       const newObj = JSON.parse(JSON.stringify(lastDisbFormStatus))
      newObj.lastDisbFormId = null;
      AsyncStorage.removeItem("disbursementFormId")
      //localStorage.removeItem("aggApplicationNo");
      dispatch(setLastDisbursementStatus(newObj));
      dispatch(setdisbursementButtonValue("createNewRequestBtn"));
      NavigationService.navigate(navigationStrings.DISBURSEMENT_FORM_TERM);
    }
  };

  const handleActionClick = (rowData: RowData) => {
    AsyncStorage.removeItem("activeFormStep");
    AsyncStorage.removeItem("disbursementFormId");
    dispatch(cleardisbursementButtonSlice());
    dispatch(setdisbursementButtonValue("createNewRequestBtn"));
    dispatch(setLastDisbursementStatus(lastDisbFormStatus));
    dispatch(setActionRowData(rowData));
    NavigationService.navigate(navigationStrings.DISBURSEMENT_FORM_TERM);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        logger.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleBackPress = () => {
    NavigationService.resetBackTo(navigationStrings.DASHBOARD_SCREEN);
  };

  const LoanAccordion = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
      if (!isLoading) {
        setExpanded(!expanded);
      }
    };

    // const LoanDetatailsView = ({ label, value }) => {
    //   return (
    //     <View key={value} style={styles.gridItem}>
    //       <View style={{ flexDirection: "row", alignItems: "center" }}>
    //         <Text style={styles.label}>{label}</Text>
    //         {label === "Total Principal Outstanding" && (
    //            <Popable
    //           style={{
    //             opacity: 0.85,
    //             maxWidth: 250,
    //           }}
    //           position="left"
    //           ref={statusRef}
    //           wrapperStyle={{
    //             flexDirection: "row",
    //             alignItems: "center",
    //             justifyContent: "center",
    //           }}
    //           onAction={(visible) => {
    //             if (visible) {
    //               setTimeout(() => hideStatusPopable(), 3000);
    //             }
    //           }}
    //           content={
    //             <View
    //               style={{
    //                 padding: 10,
    //                 alignItems: "center",
    //                 justifyContent: "center",
    //                 backgroundColor: "rgba(80,80,80,0.85)",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   fontSize: 13,
    //                   fontFamily: fonts.regular,
    //                   color: "#fff",
    //                 }}
    //               >
    //                 {item?.remark || "No reason provided"}
    //               </Text>
    //             </View>
    //           }
    //         >
    //             <TouchableOpacity
    //               onPress={() => {
    //                 console.log("inside press");
    //                 handleCloseModalNew(true);
    //               }}
    //             >
    //               <Image
    //             source={imagePath.info}
    //             style={{
    //               marginLeft: 6,
    //               height: 15,
    //               width: 15,
    //               resizeMode: "contain",
    //             }}
    //           />
    //             </TouchableOpacity>

    //         </Popable></Popable>

    //         )}
    //       </View>
    //       <Text style={styles.value}>{value}</Text>
    //     </View>
    //   );
    // };
    const LoanDetatailsView = ({ label, value }) => {
      return (
        <View key={value} style={styles.gridItem}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              // backgroundColor: "green",
            }}
          >
            <Text style={styles.label}>{label}</Text>

            {label === "Total Principal Outstanding" && (
              <Popable
                style={{
                  opacity: 0.85,
                  // flex: 1,
                  width: "requestStatusTooltipDataoo".length * 5,
                  // maxWidth: 550,
                }}
                // offset={8} // vertical gap between icon and popup
                // translateX={-10} // 👈 horizontal shift (positive = right, negative = left)
                wrapperStyle={{
                  flex: 1,
                  // display: "flex",
                  // flexDirection: "row",
                  // marginHorizontal: 20,
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
            )}
          </View>

          <Text style={styles.value}>{value}</Text>
        </View>
      );
    };

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          onPress={() => toggleExpand()}
          activeOpacity={AppConstants.buttonActiveOpacity}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>
            {expanded
              ? strings.Hide_Details
              : isLoading
              ? strings.View_Loading
              : strings.view_details}
          </Text>
          <Image
            source={imagePath.downArrow}
            style={[
              styles.expandIcon,
              { transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.accordionContent}>
            <View style={{ marginHorizontal: -16 }}>
              <View style={styles.divider} />
            </View>
            <Text style={styles.sectionTitle}>{strings.Loan_Details}</Text>
            <View style={styles.grid}>
              <LoanDetatailsView
                label={strings.total_interest_outstanding}
                value={formatIndianRupees(
                  item?.loanDetails?.totalPrincipalAmountPaid,
                )}
              />

              <LoanDetatailsView
                label={"Total Principal Outstanding"}
                value={formatIndianRupees(
                  item?.loanDetails?.totalPrincipalOutstanding,
                )}
              />

              <LoanDetatailsView
                label={strings.loan_start_date}
                value={formatDate(item?.loanDetails?.loanStartDate)}
              />

              <LoanDetatailsView
                label={strings.Next_Repay_Amount}
                value={formatIndianRupees(
                  item?.loanDetails?.nextRepaymentAmount,
                )}
              />

              <LoanDetatailsView
                label={strings.total_loan_outstanding}
                value={formatIndianRupees(
                  item?.loanDetails?.totalLoanOutstanding,
                )}
              />

              <LoanDetatailsView
                label={strings.Loan_End_Date}
                value={formatDate(item?.loanDetails?.loanEndDate)}
              />

              <LoanDetatailsView
                label={strings.remaining_tenure}
                value={item?.loanDetails?.remainingTenure}
              />

              <LoanDetatailsView
                label={strings.Next_Repay_Date}
                value={formatDate(item?.loanDetails?.nextRepaymentDate)}
              />
            </View>
          </View>
        )}
      </View>
    );
  };
  const BulletItem = (text: string) => {
    return (
      <View style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
  };

  const ShimmerCard = () => {
    return (
      <View>
        <View style={styles.row}>
          <ShimmerPlaceholder style={{ width: 170, height: 40 }} />
          <ShimmerPlaceholder style={{ width: 80, height: 40 }} />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceholder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
        </View>
        <View>
          <ShimmerPlaceholder
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
        <ShimmerPlaceholder
          style={styles.footer}
          LinearGradient={LinearGradient}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        backIconNeeded={true}
        showNotification={true}
        showProfile={true}
        onBackPress={handleBackPress}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            // backgroundColor: "green",
            marginVertical: 16,
            marginLeft: 16,
          }}
        >
          <Text style={styles.header}>{"Fund Request"}</Text>
          <TouchableOpacity activeOpacity={AppConstants.buttonActiveOpacity} onPress={() => setVisible(true)}>
            <Image
              source={imagePath.info}
              style={{
                marginLeft: 8,
                height: 16,
                width: 16,
                tintColor: "#168794",
              }}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={20}
            marginVertical={16}
            marginHorizontal={16}
          >
            <ShimmerCard />
            <LoanAccordion />
          </ShadowCardComponent>
        ) : (
          <>
            {disbursementuserDetails?.map((item: any, index: any) => (
              <TermLoanDashboardData
                item={item}
                onRequestDisbursement={() => {
                  createNewRequestBtn();
                }}
                screenName={navigationStrings.REQUEST_FOR_DISBURSEMENT}
                isMultipleReqRes={isMultipleReqRes}
              >
                <LoanAccordion item={disbursementuserDetails?.[0]} />
              </TermLoanDashboardData>
            ))}
          </>
        )}
        <View style={{ marginLeft: 8 }}>
          <ListHeader rightText={strings.Disbursement_Request_History} />
        </View>
        <CardItemList data={rows} onActionClick={handleActionClick} />
        <CopyrightComponent />
      </ScrollView>
      {/* <FeedbackModal screen={"Fund Request"} /> */}
      {(showFeedback && feebackModelVisibleInSession) && <FeedbackModal screen={"Fund Request"} />}
      <DialogStatusPopup />

      {/* Bottom sheet popup */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <View style={styles.headerIndicator} />
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.contentContainer}
                >
                  <Text style={styles.title}>
                    Information related to Fund Release Request
                  </Text>
                  <View style={styles.bulletList}>
                    {/* {BulletItem("gopalk")} */}
                    {BulletItem(
                      "Fund release requests that are successfully submitted will be processed within 48 hours.",
                    )}
                    {BulletItem(
                      "Once submitted, our team will conduct a thorough review of the request.",
                    )}
                    {BulletItem(
                      "If any discrepancies or missing details are identified, the request may be rejected, and you will be notified of the reason so you can take the necessary action.",
                    )}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  activeOpacity={AppConstants.buttonActiveOpacity}
                  onPress={closeModal}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default RequestForDisbursement;
