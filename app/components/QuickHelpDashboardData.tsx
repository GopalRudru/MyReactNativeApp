import { FlatList, Platform, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as NavigationService from "../navigation/NavigationService";
import AppConstants, { messages } from "../constant/AppConstants";
import fonts from "../res/fonts";
import navigationStrings from "../constant/navigationStrings";
import { dateParser } from "../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../services/redux/store";
import { cleardisbursementButtonSlice } from "../services/redux/slices/disbursementButtonSlice";
import { setProdcuctName } from "../services/redux/slices/tabsSlice";
import { setQuickHelpInfoRoute } from "../services/redux/slices/tabsSlice";
import { setSelectedIndex } from "../services/redux/slices/tabsSlice";
import {
  setStatusPopup,
  statusPopupSelector,
} from "../services/redux/slices/statusPopupSlice";
import { authSelector } from "../services/redux/slices/authSlice";
import postsServices from "../services/api/service/postsService";
import ListHeader from "./ListHeader";
import ShadowCardComponent from "./ShadowCardComponent";
import NoRecordFound from "./common/NoRecordFound";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { decrypt } from "../utils/crypto";
import dayjs from "dayjs";
import analytics from "@react-native-firebase/analytics";
import { checkConnectivity } from "../services/api/apiClient/apiClient";
import QuickHelpItem from "./QuickHelpItem";
import { createModuleLogger } from "../utils/logger";
import useGeoLocation from "react-ipgeolocation";
import strings from "../res/strings";
import firebaseRemoteConfigService from "../services/firebaseRemoteConfigService";
import { trackEvent } from "../config/analyticLogger";
import DialogStatusPopup from "./common/DialogStatusPopup";

const QuickHelpDashboardData = ({ updateStatus }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [quickHelpData, setQuickHelpData] = useState<any[]>([]);
  const { refreshValue } = useSelector(statusPopupSelector);
  const { userProfile } = useSelector(authSelector);
  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData
  );
  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [viewPdfModal, setViewPdfModal] = useState<{
    isOpen: boolean;
    title: string;
  }>({ isOpen: false, title: "" });
  const [certificateInput, setCertificateInput] = useState<{
    certificate: string;
    years: string;
  }>({ certificate: "provsonintstcert", years: "" });
  const [lanNumber, setLanNumber] = useState("");

  const logger = createModuleLogger("Dashboard QuickHelp");
  let user_id = "";
  const { otpUserData } = useSelector(authSelector);
  const [loanTypeName, setLoanTypeName] = useState("")

  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const location = useGeoLocation();

  useEffect(() => {
    setLanNumber(selectedLoanNumber);
    const matchedObject = dashboardDataSet?.find(
      (data: any) => data.lanNumber === selectedLoanNumber
    );
    const firstDisbDate = new Date(matchedObject?.loanStartDate);
    const maturityDate =
      matchedObject?.statusOfLoan == "M"
        ? new Date(matchedObject?.maturityDate)
        : new Date();
    if (firstDisbDate) {
      let val = new Date(firstDisbDate);
      setFromDate(val);
    }

    if (maturityDate) {
      setToDate(maturityDate);
    }

    setLoanTypeName(matchedObject?.loanTypeName)

  }, [selectedLoanNumber, dashboardDataSet]);

  useEffect(() => {
    const fetchQuickHelp = () => {
      if (!userProfile?.cifNumber) return;
      setIsLoading(true);
      postsServices
        .secureAddPost("api/v1/dashboard/quick-help")
        .then((response) => {
          const data = response?.data?.data || [];
          //Todo : For now it is hardcoded - REMOVE THIS 
          //const updatedData = data.map((item: any) => item.fieldName === "Amortization Schedule" ? { ...item, fieldName: "Repayment Schedule" } : item);
          setQuickHelpData(data);
          setIsLoading(false);
        })
        .catch((error: any) => {
          setIsLoading(false);
          const errorMessage = error;
          //error.response?.data?.message || messages.withdrErrorMessages.commonError;
        });
    };

    fetchQuickHelp();
  }, [refreshValue, userProfile?.cifNumber]);

  const handleCard = async (titleVal: String) => {
    if (titleVal === "Loan Account Info") {
      dispatch(cleardisbursementButtonSlice());
      dispatch(setProdcuctName("TermLoan"));
      dispatch(setQuickHelpInfoRoute("dashboard"));
      await analytics().setUserId(user_id);
      analytics().logEvent("Quickhelp_Accountsummary", {
        screen_name: "Dashboard",
        user_id: user_id,
      });
      NavigationService.navigate(navigationStrings.ACCOUNT_SUMMARY_TERM);
    } else if (titleVal.trim() === "Account Statements") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Quickhelp_Statementofaccount", {
        screen_name: "Dashboard",
        user_id: user_id,
      });
      await trackEvent("Quickhelp_Statementofaccount", user_id, {
        screen_name: "Dashboard",
      });
      handleStatementAction("view", "soa");
    } else if (titleVal.trim() === "Repayment Schedule") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Quickhelp_Repaymentschedule", {
        screen_name: "Dashboard",
        user_id: user_id,
      });
      handleStatementAction("view", "schd");
    } else if (titleVal.trim() === "Disbursement Request") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Quickhelp_Request_Disbursement", {
        screen_name: "Dashboard",
        user_id: user_id,
      });
      const matchVal = dashboardDataSet?.find(
        (data: any) => data?.lanNumber === selectedLoanNumber
      );

      // Check if user has all access privileges or loan is eligible for disbursement
      const hasAllAccess = otpUserData?.altAccessFlag === true;
      const isLoanEligible =
        matchVal?.isExistDisbursementAllowdLoan === true &&
        (matchVal?.status || matchVal?.statusOfLoan) === "A";

      if (hasAllAccess || isLoanEligible) {
        dispatch(setProdcuctName("TermLoanDisbursement"));
        NavigationService.navigate(navigationStrings.REQUEST_FOR_DISBURSEMENT);
      } else {
        dispatch(setSelectedIndex(0));
        dispatch(
          setStatusPopup({
            status: "No access",
            message:
              "Disbursement requests are currently unavailable for this loan",
          })
        );
      }
    } else if (titleVal === "Payment") {
      // Check if platform is Android or location is India
      // const isAndroid = Platform.OS === "android";
      // const isIndia = location?.country_name === "IN" || location?.country === "IN";
      //const remoteCif = firebaseRemoteConfigService.getString('remote_cif');
      //logger.info("Remote Config remote_cif:", remoteCif);
      //logger.info("Remote Config remote_cif111:", decrypt(userProfile?.cifNumber));

      // if (!isAndroid && remoteCif == decrypt(userProfile?.cifNumber)) {
      //   dispatch(
      //     setStatusPopup({
      //       status: "No access",
      //       message:
      //         strings.this_functionality_is_currently_unavailable_in_your_region,
      //     })
      //   );

      //   return;
      // }
      
      //if (isAndroid || isIndia) {
        await analytics().setUserId(user_id);
        analytics().logEvent("Quickhelp_Request_Payment", {
          screen_name: "Dashboard",
          user_id: user_id,
        });

        const matchVal = dashboardDataSet?.find(
          (data: any) => data?.lanNumber === selectedLoanNumber
        );

        // Check if user has all access privileges or loan status is active
        const hasAllAccess = otpUserData?.altAccessFlag === true;
        const isLoanInactive =
          (matchVal?.status || matchVal?.statusOfLoan) != "A";

        if (hasAllAccess || !isLoanInactive) {
          dispatch(setSelectedIndex(2));
          NavigationService.navigate("Payment", {
            screen: "PaymentScreen",
          });
        } else {
          dispatch(setSelectedIndex(0));
          dispatch(
            setStatusPopup({
              status: "No access",
              message:
                "Payment requests are currently unavailable for this loan",
            })
          );
        }
      // } else {
      //   dispatch(
      //     setStatusPopup({
      //       status: "No access",
      //       message:
      //         strings.this_functionality_is_currently_unavailable_in_your_region,
      //     })
      //   );
      // }
    } else if (titleVal === "FAQ") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Quickhelp_FAQ", {
        screen_name: "Dashboard",
        user_id: user_id,
      });

      if (loanTypeName?.toLowerCase() === "elforn") {
        NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
          URL: AppConstants.elfornFaqUrl,
        });
      } else {
        NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
          URL: AppConstants.faqUrl,
        });
      }
      
    }
  };

  const handleStatementAction = (action: string, type: string) => {
    if (!type.includes(`wc`)) {
      if (type.includes(`noc`)) {
        const matchedObject = dashboardDataSet?.find(
          (data: any) => data?.lanNumber === selectedLoanNumber
        );
        const maturityYear = +dateParser(matchedObject?.maturityDate, "YY");
        const currentYear = +dateParser("", "YY");
        if (maturityYear > currentYear) {
        } else {
          accountStatement(action, type);
        }
      } else {
        accountStatement(action, type);
      }
    }
  };

  const accountStatement = async (actionType: string, type: string) => {
    updateStatus(true);
    if (type === "soa") {
      setViewPdfModal({ isOpen: true, title: "Statement of Account" });
    } else if (type === "schd") {
      setViewPdfModal({ isOpen: true, title: "Repayment Schedule" });
    }
    try {
      const formattedFromDate = fromDate
        ? dayjs(fromDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).format("YYYY-MM-DD")
        : null;

      const payload: any = {
        finReference: selectedLoanNumber,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        type: type,
        cif: decrypt(userProfile?.cifNumber),
        action: actionType,
        loanCat: "term",
      };

      if (type === "cert") {
        payload.fromDate = `${certificateInput.years}-04-01`;
        payload.toDate = `${+certificateInput.years + 1}-03-01`;
        payload.type =
          dayjs().format("YYYY") == certificateInput?.years
            ? "provsonintstcert"
            : "instcert";
        payload.finActiveStatus = "A";
      }

      if (type === "noc") {
        payload.finActiveStatus = "";
      }

      const res = await postsServices.secureAddPost(
        "api/v1/report/accountstatement",
        payload
      );

      if (res?.status === 200 && res?.data?.data) {
        if (type === "soa") {
          setViewPdfModal({ isOpen: true, title: "Statement of Account" });
        } else if (type === "schd") {
          setViewPdfModal({ isOpen: true, title: "Repayment Schedule" });
        }
        const pdfUrl = res?.data?.data?.url;

        if (type === "soa") {
          if (actionType === "view") {
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "Statement of Account" });
          } else if (actionType === "download") {
            updateStatus(false);
          } else if (actionType === "email") {
            updateStatus(false);
          }
        } else if (type === "schd") {
          if (actionType === "view") {
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "Repayment Schedule" });
          } else if (actionType === "download") {
            updateStatus(false);
          } else if (actionType === "email") {
            updateStatus(false);
          }
        } else if (type === "noc") {
          if (actionType === "view") {
            viewPdf(pdfUrl);
            setViewPdfModal({
              isOpen: true,
              title: "No Objection Certificate",
            });
          } else if (actionType === "download") {
            updateStatus(false);
          } else if (actionType === "email") {
            updateStatus(false);
          }
        } else {
          if (actionType === "view") {
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "Interest Certificate" });
          } else if (actionType === "download") {
            updateStatus(false);
          } else if (actionType === "email") {
            updateStatus(false);
          }
        }
      }
    } catch (error: any) {
      if (type === "soa") {
        setViewPdfModal({ isOpen: false, title: "Statement of Account" });
      } else if (type === "schd") {
        setViewPdfModal({ isOpen: false, title: "Repayment Schedule" });
      }
      const errorMessage = error; //error.response?.data?.message || "An error occurred";
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage,
          })
        );
      }
      updateStatus(false);
    }
  };

  const viewPdf = async (pdfUrl: string) => {
    try {
      const response = await fetch(pdfUrl);
      NavigationService.navigate(navigationStrings.PDF_SCREEN, {
        URL: response?.url,
      });
    } catch (error) {
      logger.error("Error sending email:", error);
    } finally {
      updateStatus(false);
    }
  };

  const ShimmerCard = () => {
    const shimmerItem = (key: string) => (
      <View key={key} style={styles.shimmerContainer}>
        <ShimmerPlaceholder
          style={styles.shimmerImage}
          LinearGradient={LinearGradient}
        />
        <ShimmerPlaceholder
          style={styles.shimmerText}
          LinearGradient={LinearGradient}
        />
      </View>
    );

    const shimmerRows = Array.from({ length: 2 }).map((_, rowIndex) => (
      <View key={`shimmer-row-${rowIndex}`} style={styles.row}>
        {Array.from({ length: 3 }).map((_, itemIndex) =>
          shimmerItem(`shimmer-${rowIndex}-${itemIndex}`)
        )}
      </View>
    ));

    return <>{shimmerRows}</>;
  };

  return (
    <View style={{ marginTop: 15 }}>
      <View style={{ marginLeft: 8 }}>
        <ListHeader rightText={"Quick Help"} />
      </View>
      <ShadowCardComponent
        paddingHorizonatal={16}
        paddingVertical={20}
        marginVertical={1}
        marginHorizontal={16}
      >
        {isLoading ? (
          <ShimmerCard />
        ) : quickHelpData?.length === 0 ? (
          <NoRecordFound textmainStyle={{ marginTop: 5 }} />
        ) : (
          <FlatList
            data={quickHelpData}
            numColumns={3}
            horizontal={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <QuickHelpItem item={item} handleCard={handleCard} />
            )}
            keyExtractor={(item) => item?.fieldName?.toString()}
            removeClippedSubviews={false}
            windowSize={5}
            initialNumToRender={quickHelpData?.length || 0}
            columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
          />
        )}
      </ShadowCardComponent>
      <DialogStatusPopup />
    </View>
  );
};

export default QuickHelpDashboardData;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  shimmerImage: {
    height: 56,
    width: 56,
    borderRadius: 6,
    marginBottom: 8,
  },
  shimmerContainer: {
    margin: 8,
    alignItems: "center",
  },
  shimmerText: {
    width: 60,
    height: 12,
    borderRadius: 6,
  },
});
