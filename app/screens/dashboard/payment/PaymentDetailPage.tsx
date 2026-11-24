import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
  KeyboardAvoidingView,
  Button,
} from "react-native";
import ShadowCardComponent from "../../../components/ShadowCardComponent";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import Header from "../../../components/common/Header";
import mainStyle from "../../../res/mainStyles";
import * as NavigationService from "../../../navigation/NavigationService";
import imagePath from "../../../constant/imagePath";
import CopyrightComponent from "../../../components/common/CopyrightComponent";
import strings from "../../../res/strings";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import NoRecordFound from "../../../components/common/NoRecordFound";
//import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { useDispatch, useSelector } from "react-redux";
import {
  setStatusPopup,
  statusPopupSelector,
} from "../../../services/redux/slices/statusPopupSlice";
import { authSelector } from "../../../services/redux/slices/authSlice";
import { PaymentTermLoanContext } from "../../../hooks/context";
import { decrypt, encrypt, encryptObject } from "../../../utils/crypto";
import postsServices from "../../../services/api/service/postsService";
import { clearPartPaymentType } from "../../../services/redux/slices/documentFormSlice";
import putsService from "../../../services/api/service/putsService";
import { formatNormalIndianRupees } from "../../../utils/formatting";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { createModuleLogger } from "../../../utils/logger";

// Create payment detail page specific logger
const logger = createModuleLogger("PaymentDetailPage");
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import PreviousButtonComponent from "../../../components/common/PreviousButtonComponent";
import SmallButtonComponent from "../../../components/common/SmallButtonComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppConstants, {
  overdueInstructions,
  paymentInstructions,
} from "../../../constant/AppConstants";
import LoaderView from "../../../components/common/LoaderView";
import { useHideTabBar } from "../../../hooks/useHideTabBar";
import navigationStrings from "../../../constant/navigationStrings";
import analytics from "@react-native-firebase/analytics";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { Popable, usePopable } from "react-native-popable";
import { feedbackRatingCount, increaseFeedbackRatingCount } from "../../../utils/storageUtils";

const paymentData = [
  {
    requestId: "REQ001",
    transactionRef: "TXN123456",
    amount: "₹ 200.00",
    status: "Pending",
    paid: "₹ 400.00",
  },
];
const PaymentDetailPage = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const selector = useSelector(statusPopupSelector);
  const dispatch = useDispatch();
  const [visibleTooltip, setVisibleTooltip] = useState(false);
  const [requestStatusTooltip, setRequestStatusTooltip] = useState(false);

  //========= Start
  const { loanCategory } = useSelector(authSelector);
  const route = useRoute();

  const [isAllRequestClosed, setIsAllRequestClosed] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const {
    setFormStep,
    setShowCustomerRating,
    userProfile,
    termLoanRequestId,
    selectedLoanNumber,
    cif,
    LoanNo,
    paymentRequestId,
    formTypeValue,
    loanCategoryValue,
    isXsOrSm,
    partPaymentData,
    applicableCharges,
  }: any = useContext(PaymentTermLoanContext);

  const [tableDataLoading, setTableDataLoading] = useState<boolean>(false);
  const [isLinkLoading, setIsLinkLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(5);
  const [paymentDataList, setPaymentDataList] = useState<any>([]);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [detailsData, setDetailsData] = useState<any>({
    totalAmount: 0,
    amountPaid: 0,
    requestId: "",
    requestStatus: "",
    amortizationUpdate: "",
  });
  const [paymentReqId, setPaymentReqId] = useState<string>("");

  const columns: any = [
    { id: "amount", label: "Amount" },
    { id: "link", label: "Payment Link" },
    { id: "payment_request", label: "Payment Request Id" },
    { id: "trans_ref", label: "Transaction Ref. No." },
    {
      id: "status",
      label: "PAYMENT Status",
    },
  ];
  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }
  const [shouldHideTabBar, setShouldHideTabBar] = useState(true);

  useHideTabBar(shouldHideTabBar, "PaymentDetailPage");

  const [isUpdatePaymentStatus, setIsUpdatePaymentStatus] =
    useState<Boolean>(false);

  useEffect(() => {
    if (loanCategoryValue) {
      //handleUpdateStatus();
    }

    //if (!cif && !paymentRequestId && !LoanNo) {
    handleInvokePaymentListAPi();
    //setIsUpdatePaymentStatus(isUpdatePaymentStatus);
    //}
  }, [cif, LoanNo, paymentRequestId, loanCategoryValue]);

  // Track successful payments for analytics
  useEffect(() => {
    if (paymentDataList?.length > 0) {
      paymentDataList.forEach((elem: any) => {
        if (elem?.paymentStatus === "Success") {
          analytics().setUserId(user_id);
          analytics().logEvent("Dash_Pay_View", {
            paymentRequestId: elem?.paymentRequestId,
            transactionReferenceNo: elem?.transactionReferenceNo,
            amount: elem?.amount,
            loanNumber: selectedLoanNumber,
            user_id: user_id,
          });
        }
      });
    }
  }, [paymentDataList, selectedLoanNumber]);

  useFocusEffect(
    useCallback(() => {
      const fetchUpdateStatus = async () => {
        try {
          const value = await AsyncStorage.getItem("isUpdatePyamentStatus");
          const isUpdate = JSON.parse(value ?? "false");
          if (isUpdate) {
            setShouldHideTabBar(true);
            if (loanCategoryValue) {
              handleUpdateStatus();
            }

            handleInvokePaymentListAPi();
          }
          AsyncStorage.setItem("isUpdatePyamentStatus", JSON.stringify(false));
        } catch (error) {
          logger.error("Error reading AsyncStorage:", error);
        }
      };
      fetchUpdateStatus();
    }, []),
  );

  const handleUpdateStatus = async () => {
    const paymentUpdateStr = await AsyncStorage.getItem("paymentUpdateDetails");
    const paymentUpdateDetail = paymentUpdateStr
      ? JSON.parse(paymentUpdateStr)
      : {};

    const paymentRequestId = await AsyncStorage.getItem("termLoanRequestId");

    if ((cif && LoanNo) || paymentRequestId) {
      setTableDataLoading(true);
      let payload: any = null;
      if (paymentUpdateDetail != null) {
        payload = {
          cif: cif,
          paymentId: encrypt(paymentRequestId),
          lan: encrypt(LoanNo),
          loanCategory: loanCategoryValue?.loanCategoryId,
          business: loanCategoryValue?.businessId,
          paymentType:
            formTypeValue == "2" ? encrypt("OverDue") : encrypt("PartPayment"),
          nextTermSubID: paymentUpdateDetail?.nextTermSubID,
          nextPaymentAmount: paymentUpdateDetail?.nextPaymentAmount,
        };
      } else {
        payload = {
          cif: cif,
          paymentId: encrypt(paymentRequestId),
          lan: encrypt(LoanNo),
          loanCategory: loanCategoryValue?.loanCategoryId,
          business: loanCategoryValue?.businessId,
          paymentType:
            formTypeValue == "2" ? encrypt("OverDue") : encrypt("PartPayment"),
        };
      }

      logger.debug("Payload for update status:", payload);
      logger.info("Update status request initiated");
      await postsServices
        .secureAddPost(
          `api/v1/payment/update-term-loan-payment-status`,
          payload,
        )
        .then((response: any) => {
          logger.info("Update status request successful");
          setTableDataLoading(false);
          handleInvokePaymentListAPi();
          setPaymentStatus(response?.data?.data?.requestStatus);
          setPaymentReqId(response?.data?.data?.paymentRequestID);
          if (
            response?.data?.data?.redirection &&
            (response?.data?.data?.requestStatus == "Link Expired" ||
              response?.data?.data?.requestStatus == "Success")
          ) {
            setIsAllRequestClosed(response?.data?.data?.redirection);
            handleSetTimeInterval(
              response?.data?.data?.requestStatus == "Success",
            );
          }

          if (
            response?.data?.data?.redirection &&
            response?.data?.data?.retryCount == 3 &&
            response?.data?.data?.requestStatus == "Failed"
          ) {
            setIsAllRequestClosed(response?.data?.data?.redirection);
            handleSetTimeInterval();
          }

          if (response?.data?.data?.requestStatus == "Failed") {
            setRetryCount(response?.data?.data?.retryCount);
            logger.info("Retry Count:", response?.data?.data?.retryCount);
          }
        })
        .catch((error: any) => {
          logger.error("Update status request error");
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error, //error?.response?.data?.message,
            }),
          );
          setTableDataLoading(false);
        });
    } else {
      logger.debug("Update status - else condition reached");
    }
  };

  const handleLinkProcess = (data: any) => {
    if (
      !data ||
      !data.termSubLoanInfoData ||
      !Array.isArray(data.termSubLoanInfoData)
    ) {
      logger.error("Invalid data received for processing payment links.");
      return;
    }
    // Initially disable all links
    const updatedData = data.termSubLoanInfoData.map((item: any) => ({
      ...item,
      isDisabled: true,
    }));
    const firstPendingPayment = data.termSubLoanInfoData.find(
      (item: any) =>
        item.paymentStatus === "Pending" ||
        (item.paymentStatus === "Failed" && item?.retryCount < 3),
    );
    if (firstPendingPayment) {
      // Paid Amount + Upcoming Link value >= 3 times EMI + Applicable charges.
      const formulaValue =
        data.amountPaid + firstPendingPayment.amount >=
        3 * (partPaymentData?.[0]?.newEmiAmount / 100) + applicableCharges;

      // Enable links based on the condition
      let firstEnabled = false;
      updatedData.forEach((item: any) => {
        if (
          !firstEnabled &&
          (item.paymentStatus === "Pending" ||
            (item.paymentStatus === "Failed" && item?.retryCount < 3))
        ) {
          item.isDisabled = false;
          firstEnabled = true;
        }
      });
    } else {
      logger.warn("No pending or retryable payment found.");
    }
    // Persist the updated data in localStorage and update state immediately
    try {
      setPaymentDataList(updatedData);
      setTableDataLoading(false);
    } catch (error) {
      logger.error("Failed to persist payment data in localStorage:", error);
    }
  };

  /**
   * Handles the invocation of the payment list API.
   *
   * This function asynchronously calls the `getPosts` method from `postsServices`
   * to fetch the term loan listing data for a specific term loan request ID.
   * On a successful response, it updates the payment data list state with the
   * retrieved term sub-loan information data. If an error occurs during the API
   * call, it logs the error to the logger.
   *
   * @async
   * @function handleInvokePaymentListAPi
   * @returns {Promise<void>} A promise that resolves when the API call is complete.
   */
  const handleInvokePaymentListAPi = async (): Promise<void> => {
    setTableDataLoading(true);
    await postsServices
      .secureGetPosts(`api/v1/payment/term-loan-listing/${termLoanRequestId}`)
      .then((response: any) => {
        setDetailsData({
          totalAmount: response?.data?.data?.totalAmount,
          amountPaid: response?.data?.data?.amountPaid,
          requestId: response?.data?.data?.requestId,
          requestStatus: response?.data?.data?.requestStatus,
          amortizationUpdate: response?.data?.data?.amortizationUpdate,
        });

        if (formTypeValue == "1") {
          handleLinkProcess(response?.data?.data);
        } else if (formTypeValue == "2") {
          setPaymentDataList(response?.data?.data?.termSubLoanInfoData);
          setTableDataLoading(false);
        }
      })
      .catch(async (error: any) => {
        logger.info("handleInvokePaymentListAPI called");
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error, //error?.response?.data?.message,
            }),
          );
        }
        setTableDataLoading(false);
      });
  };

  /**
   * Handles the click event to initiate a payment.
   *
   * @param {number} id - The identifier for the payment.
   *
   * This function constructs a payload with necessary payment details,
   * encrypts the payload, and sends a POST request to the payment API.
   *
   * The payload includes:
   * - cif: Customer Identification File number (decrypted)
   * - amount: Total payment amount
   * - lan: Loan account number
   * - paymentType: Type of payment (e.g., PartPayment)
   * - initiatedBy: ID of the user initiating the payment (decrypted)
   * - loanType: Type of the loan
   * - termLoanSubId: Sub ID of the term loan
   *
   * The encrypted payload is sent to the endpoint `/api/v1/payment/term-loan-request`.
   *
   * On success, the response is logged to the logger.
   * On failure, the error is logged to the logger.
   */
  const handleClickToPay = async (id: number, amount: number) => {
    logger.info("Proceed to pay - Amount:", amount, "ID:", id);

    setIsLinkLoading(true);
    const payload: any = {
      cif: decrypt(userProfile?.cifNumber),
      amount: amount,
      lan: selectedLoanNumber,
      paymentType: formTypeValue == "2" ? "OverDue" : "PartPayment",
      initiatedBy: decrypt(userProfile?.id),
      loanType: loanCategoryValue?.loanTypeName,
      termLoanSubId: id,
    };
    AsyncStorage.setItem("subId", id.toString());
    logger.debug("Payment data list:", paymentDataList);
    const findIndexVal = paymentDataList.findIndex((elem: any) => {
      return elem?.termLoanSubId == Number(id);
    });
    logger.debug("Find index value:", findIndexVal);
    logger.debug("Payment data list (detailed):", paymentDataList);
    const valueObj = {
      nextPaymentAmount: paymentDataList?.[findIndexVal + 1]?.amount,
      nextTermSubID: paymentDataList?.[findIndexVal + 1]?.termLoanSubId,
    };

    logger.debug("Value object for payment:", valueObj);
    AsyncStorage.setItem("paymentUpdateDetails", JSON.stringify(valueObj));
    const encryptedData = encryptObject(payload);
    await postsServices
      .secureAddPost("api/v1/payment/term-loan-request", {
        data: encryptedData,
      })
      .then((response: any) => {
        setIsLinkLoading(false);
        logger.info("Term loan request completed successfully");
        const paymentUrl = response?.data?.data;
        if (paymentUrl) {
          logger.info("Opening payment gateway...");
          //Linking.openURL(paymentUrl);
          logger.debug("CIF and LoanNo available:", cif && LoanNo);
          logger.debug("Payment request ID:", paymentRequestId);
          logger.debug("Loan category value:", loanCategoryValue);
          logger.debug("CIF:", cif);
          logger.debug("Loan number:", LoanNo);
          logger.debug("Form type value:", formTypeValue);

          AsyncStorage.setItem("isUpdatePyamentStatus", JSON.stringify(false));
          NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
            URL: paymentUrl,
          });
        } else {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: "Payment URL is missing in response.",
            }),
          );
        }
      })
      .catch(async (error: any) => {
        logger.info("handleClickToPay called");
        setIsLinkLoading(false);
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error, //error?.response?.data?.message,
            }),
          );
        }
      });
  };

  /**
   * Handles navigation to the history page.
   *
   * This function sets a timeout of 5 seconds before navigating to the current path
   * and optionally removing the "termLoanRequestId" from local storage. It also
   * resets the form step to -1.
   *
   * @function
   * @name handleNavigateToHistory
   * @returns {void}
   */
  const handleNavigateToHistory = async (
    paymentSuccess: boolean = false,
  ): Promise<void> => {
    dispatch(clearPartPaymentType());
    const termLoanRequestId = await AsyncStorage.getItem("termLoanRequestId");
    if (termLoanRequestId) {
      AsyncStorage.removeItem("termLoanRequestId");
    }

    if (paymentSuccess) {
      const currentCount = await feedbackRatingCount();
      await increaseFeedbackRatingCount(currentCount + 1);
      logger.debug("&&&&#&#&&#&#&^&@^^@^@^@&!&@**@*&@&&@#^&@& Redirecting to history after countdown... ", paymentStatus);
    }

    setShowCustomerRating(paymentSuccess);

    

    setFormStep(-1);
  };

  /**
   * Sets a time interval that decrements the count state by 1 every second.
   * When the count reaches 0, the interval is cleared and the user is navigated to the history page.
   *
   * @returns {NodeJS.Timeout} The interval ID that can be used to clear the interval.
   */
  const handleSetTimeInterval = (
    paymentSuccess: boolean = false,
  ): NodeJS.Timeout => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 0) {
          clearInterval(interval);
          handleNavigateToHistory(paymentSuccess);
        }
        return prev - 1;
      });
    }, 1000);
    return interval;
  };

  const handleCancelRequestModal = async () => {
    const isConnected = await checkConnectivity();
    if (isConnected) {
      dispatch(
        setStatusPopup({
          status: "info",
          title: "Cancel Request?",
          message: "Are you sure you want to cancel this request?",
          isFunction: true,
          locationFunction: () => handleCancelRequest(),
        }),
      );
    }
  };

  const handleCancelRequest = async () => {
    setTableDataLoading(true);
    await putsService
      .securePut(`api/v1/payment/term-loan-cancel-listing/${termLoanRequestId}`)
      .then((response: any) => {
        setPaymentStatus("All_Cancelled");
        handleSetTimeInterval();
        handleInvokePaymentListAPi();
      })
      .catch((error: any) => {
        setTableDataLoading(false);
        logger.info("handleCancelRequest called");
        dispatch(
          setStatusPopup({
            status: "Error",
            message: error, //error?.response?.data?.message,
          }),
        );
      });
  };

  /**
   * Determines if the request is cancelled based on the payment data list and request status.
   *
   * @returns {boolean} - Returns `false` if any payment status is not "Pending" or if the request status is "Expired".
   *                      Otherwise, returns `true`.
   *
   * @param {Array} paymentDataList - List of payment data objects.
   * @param {Object} detailsData - Object containing details data.
   * @param {string} detailsData.requestStatus - The status of the request.
   */
  const isRequestCancelled = useMemo(() => {
    const stateValue = paymentDataList.some(
      (elem: any) => elem.paymentStatus !== "Pending",
    );
    if (detailsData.requestStatus == "Expired") {
      return false;
    }
    if (stateValue) {
      return false;
    }
    return true;
  }, [paymentDataList, detailsData.requestStatus]);

  const AMORT_LIST: any = ["In Progress", "No Payment Received"];

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  const termsAndConditionCard = () => {
    return (
      <ShadowCardComponent
        paddingHorizonatal={16}
        marginHorizontal={16}
        marginVertical={16}
        paddingVertical={16}
      >
        <Text style={styles.termsTitle}>{strings.Terms_Conditions}</Text>
        {formTypeValue == 2 ? (
          <>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletText}>{`\u2022`}</Text>
              <Text style={styles.termText}>
                The Request ID for overdue amount has been created. Please
                complete the payment within 12 hours.
              </Text>
            </View>

            {overdueInstructions.map((item, index) => (
              <View key={`overdue-${index}`} style={styles.bulletContainer}>
                <Text style={styles.bulletText}>{`\u2022`}</Text>
                <Text style={styles.termText}>{item}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletText}>{`\u2022`}</Text>
              <Text style={styles.termText}>
                The Request ID for part payment amount has been created. Please
                complete the payment within 12 hours.
              </Text>
            </View>

            {paymentInstructions.map((item, index) => (
              <View key={`payment-${index}`} style={styles.bulletContainer}>
                <Text style={styles.bulletText}>{`\u2022`}</Text>
                <Text style={styles.termText}>{item}</Text>
              </View>
            ))}
          </>
        )}
      </ShadowCardComponent>
    );
  };

  const cancelRequestSuccessCard = () => {
    return (
      <View style={{ marginBottom: 8 }}>
        <ShadowCardComponent
          paddingHorizonatal={16}
          marginHorizontal={16}
          marginVertical={1}
          paddingVertical={16}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={styles.checkImageContainer}>
              <Image
                source={
                  paymentStatus == "Success" || paymentStatus == "All_Cancelled"
                    ? imagePath.rightCheck
                    : imagePath.redCross
                }
                style={styles.checkImage}
                resizeMode="contain"
              />
            </View>
            <View style={{ paddingHorizontal: 16, gap: 8, flex: 1 }}>
              {paymentStatus == "Success" ||
              paymentStatus == "All_Cancelled" ? (
                <>
                  {paymentStatus == "All_Cancelled" && (
                    <Text style={styles.checkTextTitle}>
                      {strings.request_canceled_successfully}
                    </Text>
                  )}
                  {paymentStatus == "Success" && (
                    <Text style={styles.checkTextTitle}>
                      {strings.payment_successful}
                    </Text>
                  )}

                  {paymentStatus == "Success" && (
                    <Text style={[styles.checkSubText, { color: "#28C76F" }]}>
                      <Text>Payment successful for ID: {paymentReqId}</Text>
                    </Text>
                  )}
                  {paymentStatus == "All_Cancelled" && (
                    <Text
                      style={[
                        styles.checkSubText,
                        { color: "#28C76F", flex: 1 },
                      ]}
                    >
                      <Text>
                        You will be redirected to the payment page with request
                        history in {count} secs
                      </Text>
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {paymentStatus == "Failed" && (
                    <Text style={styles.checkTextTitle}>Payment Failed!</Text>
                  )}
                  {paymentStatus == "Expired" && (
                    <Text style={styles.checkTextTitle}>Payment Expired!</Text>
                  )}

                  {(paymentStatus == "Failed" ||
                    paymentStatus == "Expired") && (
                    <>
                      <Text
                        style={[
                          styles.checkSubText,
                          { color: "#FF4C51", marginEnd: 16 },
                        ]}
                      >
                        <Text>Payment </Text>
                        {paymentStatus == "Failed" && <Text>failed</Text>}
                        {paymentStatus == "Expired" && <Text>expired</Text>}
                        <Text> for ID: {paymentReqId}. </Text>
                        {paymentStatus == "Failed" && (
                          <Text>
                            {Number(3 - retryCount)} retry payment attempts
                            left.
                          </Text>
                        )}
                      </Text>
                    </>
                  )}
                </>
              )}
              {isAllRequestClosed && (
                <Text
                  style={[styles.checkSubText, { color: "#000000", flex: 1 }]}
                >
                  <Text>
                    All payments completed and request marked as closed. You
                    will be redirected to the payment page with request history
                    in {count} secs
                  </Text>
                </Text>
              )}
            </View>
          </View>
        </ShadowCardComponent>
      </View>
    );
  };

  const [ref, { show: showPopable, hide: hidePopable }] = usePopable();
  const [
    paymentStatusRef,
    { show: showPaymentStatus, hide: hidePaymentStatus },
  ] = usePopable();

  const paymentDetailCard = () => {
    const paymentStatusRow = () => {
      logger.debug("Payment data list first item:", paymentDataList[0]);
      return (
        <>
          {paymentDataList?.map((elem: any, index: number) => (
            <View key={`payment-detail-${index}`} style={{ marginBottom: 10 }}>
              {/* Payment Request Id */}
              <View style={styles.paymentRowHeader}>
                <View>
                  <Text style={styles.subLabel}>
                    {strings.Payment_Request_Id}
                  </Text>
                  <Text style={styles.valueBold}>{elem?.paymentRequestId}</Text>
                </View>
                <View>
                  <Text style={styles.subLabel}>
                    {strings.Transaction_Ref_No}
                  </Text>
                  <Text style={styles.valueBold}>
                    {elem?.transactionReferenceNo}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentRow}>
                {/* Amount */}
                <View>
                  <Text style={styles.label}>{strings.Amount}</Text>
                  <Text style={styles.valueBold}>
                    {formatNormalIndianRupees(elem?.amount)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>{strings.Status}</Text>
                  {elem?.paymentStatus === "Success" && (
                    <Text style={styles.successStatusText}>
                      {elem?.paymentStatus}
                    </Text>
                  )}

                  {(elem?.paymentStatus == "Failed" ||
                    elem?.paymentStatus == "Cancelled" ||
                    elem?.paymentStatus == "Link Expired" ||
                    elem?.paymentStatus == "Link Disabled") && (
                    <View style={styles.rowCenter}>
                      <Text
                        style={{
                          color: "#EA5455",
                          textTransform: "capitalize",
                          fontSize: 10,
                          fontFamily: fonts.medium,
                        }}
                      >
                        {elem.paymentStatus}
                      </Text>
                      {elem?.paymentStatus == "Link Disabled" && (
                        <View
                          style={{
                            overflow: "visible",
                            zIndex: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Popable
                            style={{
                              opacity: 0.85,
                              flex: 1,
                              width:
                                "Amount too low for part payment".length * 5,
                              maxWidth: 250,
                            }}
                            position="top"
                            ref={paymentStatusRef}
                            wrapperStyle={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onAction={(visible) => {
                              if (visible) {
                                setTimeout(() => hidePaymentStatus(), 3000);
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
                                  Amount too low for part payment
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
                                style={[
                                  styles.infoIconStyle,
                                  {
                                    alignSelf: "center",
                                    width: 15,
                                    height: 15,
                                  },
                                ]}
                                resizeMode="contain"
                              />
                            </View>
                          </Popable>
                        </View>
                      )}
                    </View>
                  )}

                  {elem?.paymentStatus === "Pending" && (
                    <Text style={[styles.pendingStatusText, { fontSize: 10 }]}>
                      {elem?.paymentStatus}
                    </Text>
                  )}
                </View>
                <>
                  {(elem?.retryCount === 3 &&
                    elem?.paymentStatus === "Failed") ||
                  elem?.paymentStatus === "Success" ||
                  elem?.paymentStatus === "Cancelled" ||
                  elem?.paymentStatus === "Link Expired" ||
                  detailsData.requestStatus === "Expired" ||
                  detailsData.requestStatus === "Closed" ||
                  elem?.isDisabled ? (
                    <View style={styles.disabledButton}>
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            fontFamily: fonts.bold,
                            fontSize: 12,
                            alignSelf: "flex-end",
                          },
                        ]}
                      >
                        {strings.Pay_Now}
                      </Text>
                      <Image
                        source={imagePath.rightArrow}
                        style={styles.infoIconStyle}
                        resizeMode="contain"
                        tintColor="#aaa"
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.activeButton}
                      activeOpacity={AppConstants.textActiveOpacity}
                      onPress={() =>
                        handleClickToPay(elem?.termLoanSubId, elem?.amount)
                      }
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.payNow}>
                          {getPayNowButtonText(elem)}
                        </Text>
                        <Image
                          source={imagePath.rightArrow}
                          style={{ width: 10, height: 10, marginLeft: 4 }}
                          resizeMode="contain"
                          tintColor={colors.appThemeColor}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              </View>
              <View style={styles.horizontalDivider} />
            </View>
          ))}
        </>
      );
    };

    const getPayNowButtonText = (elem: any) => {
      if (elem?.paymentStatus === "Pending" && elem?.retryCount === 0) {
        return "Pay Now";
      }

      if (elem?.paymentStatus === "Failed" && elem?.retryCount >= 1) {
        return "Pay Again";
      }

      return "Pay Again";
    };

    const footerBtnRow = () => {
      return (
        <View style={styles.footerButtons}>
          <PreviousButtonComponent
            title="Previous"
            disabled={false}
            onPress={async () => {
              dispatch(clearPartPaymentType());
              const termLoanRequestId = await AsyncStorage.getItem(
                "termLoanRequestId",
              );
              if (termLoanRequestId) {
                AsyncStorage.removeItem("termLoanRequestId");
              }
              setFormStep(-1);
            }}
          />

          {!tableDataLoading && (
            <>
              {isRequestCancelled && (
                <SmallButtonComponent
                  title={strings.Cancel_Request}
                  disabled={false}
                  imageNotNeeded={true}
                  onPress={() => {
                    handleCancelRequestModal();
                  }}
                />
              )}
            </>
          )}
        </View>
      );
    };

    const paymentDetail = () => {
      const item = paymentData[0];
      return (
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Request_ID}</Text>
            <Text style={styles.valueGrey}>{detailsData?.requestId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{strings.Total_Amount}</Text>
            <Text style={styles.valueGrey}>
              {formatNormalIndianRupees(detailsData?.totalAmount)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{strings.Amount_Paid}</Text>
            <Text style={styles.valueGrey}>
              {formatNormalIndianRupees(detailsData?.amountPaid)}
            </Text>
          </View>
        </View>
      );
    };
    return (
      <ShadowCardComponent
        paddingHorizonatal={16}
        marginHorizontal={16}
        marginVertical={8}
        paddingVertical={24}
      >
        <Text style={styles.sectionTitle}>{strings.Payment_Details}</Text>
        {paymentDetail()}
        <View style={styles.statusContainer}>
          <View style={{ flex: 0.4 }}>
            <Text style={styles.label}>{strings.Request_Status}</Text>
            <View style={styles.rowCenter}>
              <Text
                style={[
                  detailsData?.requestStatus === "Open"
                    ? styles.statusOpen
                    : styles.statusClose,
                  {},
                ]}
              >
                {detailsData?.requestStatus}
              </Text>
              {/* Tooltip */}
              {(detailsData?.requestStatus === "Closed" ||
                detailsData?.requestStatus === "Expired") &&
                formTypeValue == "1" && (
                  <View
                    style={{
                      overflow: "visible",
                      zIndex: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Popable
                      style={{
                        opacity: 0.85,
                        flex: 1,
                        width: requestStatusTooltipData(detailsData).length * 5,
                        maxWidth: 250,
                      }}
                      position="right"
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
                            {requestStatusTooltipData(detailsData)}
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
                          style={[
                            styles.infoIconStyle,
                            { alignSelf: "center", width: 15, height: 15 },
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                    </Popable>
                  </View>
                )}
            </View>
          </View>
          {formTypeValue == "1" && (
            <View style={{ flex: 0.6 }}>
              <Text style={styles.label}>{strings.Amortization_Updation}</Text>
              <Text
                style={[
                  AMORT_LIST.includes(detailsData?.amortizationUpdate)
                    ? styles.amortizationUpdateStatusClose
                    : styles.amortizationUpdateStatusOpen,
                ]}
              >
                {detailsData?.amortizationUpdate}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginHorizontal: -16 }}>
          <View style={[styles.horizontalDivider, { marginBottom: 24 }]} />
        </View>
        {paymentStatusRow()}
        {footerBtnRow()}
      </ShadowCardComponent>
    );
  };

  const handleTip = () => {
    setTimeout(() => setVisibleTooltip(false), 2000);
  };

  const requestStatusTooltipData = (detailsData: any): string => {
    const noPaymentReceived =
      (detailsData.requestStatus === "Closed" ||
        detailsData.requestStatus === "Expired") &&
      detailsData.amortizationUpdate === "No Payment Received";
    const amortizationInProgress =
      (detailsData.requestStatus === "Closed" ||
        detailsData.requestStatus === "Expired") &&
      detailsData.amortizationUpdate === "In Progress";
    const amortizationDone =
      (detailsData.requestStatus === "Closed" ||
        detailsData.requestStatus === "Expired") &&
      (detailsData.amortizationUpdate === "Done. EMI Reduced" ||
        detailsData.amortizationUpdate === "Done. Tenure Reduced");
    logger.debug("No payment received:", noPaymentReceived);
    logger.debug("Amortization in progress:", amortizationInProgress);
    logger.debug("Amortization done:", amortizationDone);

    logger.debug("Amortization update:", detailsData.amortizationUpdate);

    return noPaymentReceived
      ? "No payment received"
      : amortizationInProgress
      ? "Amortization updation initiated for payment received"
      : amortizationDone
      ? "Amortization updated"
      : "";
  };

  const PaymentDetailShimmerCard = () => {
    return (
      <ShadowCardComponent
        paddingHorizonatal={16}
        marginHorizontal={16}
        marginVertical={16}
        paddingVertical={24}
      >
        {/* Section Title */}
        <Text style={styles.sectionTitle}>{strings.Payment_Details}</Text>

        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Request_ID}</Text>
            <ShimmerPlaceholder
              style={{
                width: 80,
                height: 12,
                borderRadius: 6,
                marginTop: 4,
              }}
              LinearGradient={LinearGradient}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Total_Amount}</Text>
            <ShimmerPlaceholder
              style={{
                width: 80,
                height: 12,
                borderRadius: 6,
                marginTop: 4,
              }}
              LinearGradient={LinearGradient}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Amount_Paid}</Text>
            <ShimmerPlaceholder
              style={{
                width: 80,
                height: 12,
                borderRadius: 6,
                marginTop: 4,
              }}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>
        {/* Status Section */}
        <View style={styles.statusContainer}>
          <View>
            <Text style={styles.label}>{strings.Request_Status}</Text>
            <ShimmerPlaceholder
              style={{ width: 60, height: 12, borderRadius: 6, marginTop: 4 }}
              LinearGradient={LinearGradient}
            />
          </View>
          <View style={{ right: "35%" }}>
            <Text style={styles.label}>{strings.Amortization_Updation}</Text>
            <ShimmerPlaceholder
              style={{ width: 100, height: 12, borderRadius: 6, marginTop: 4 }}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>

        <View style={[styles.horizontalDivider, { marginBottom: 24 }]} />

        {/* Payment Status Rows */}
        {paymentData.map((_, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={styles.paymentRowHeader}>
              <View>
                <Text style={styles.subLabel}>
                  {strings.Payment_Request_Id}
                </Text>
                <ShimmerPlaceholder
                  style={{
                    width: 80,
                    height: 10,
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                  LinearGradient={LinearGradient}
                />
              </View>
              <View>
                <Text style={styles.subLabel}>
                  {strings.Transaction_Ref_No}
                </Text>
                <ShimmerPlaceholder
                  style={{
                    width: 100,
                    height: 10,
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                  LinearGradient={LinearGradient}
                />
              </View>
            </View>

            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.label}>{strings.Amount}</Text>
                <ShimmerPlaceholder
                  style={{
                    width: 60,
                    height: 10,
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                  LinearGradient={LinearGradient}
                />
              </View>
              <View>
                <Text style={styles.label}>{strings.Status}</Text>
                <ShimmerPlaceholder
                  style={{
                    width: 60,
                    height: 10,
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                  LinearGradient={LinearGradient}
                />
              </View>
              <ShimmerPlaceholder
                style={{
                  width: 70,
                  height: 14,
                  borderRadius: 7,
                  marginTop: 10,
                }}
                LinearGradient={LinearGradient}
              />
            </View>
            <View style={styles.horizontalDivider} />
          </View>
        ))}

        {/* Footer Buttons Shimmer */}
        <View style={styles.footerButtons}>
          <ShimmerPlaceholder
            style={{
              width: 120,
              height: 36,
              borderRadius: 6,
            }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={{
              width: 140,
              height: 36,
              borderRadius: 6,
            }}
            LinearGradient={LinearGradient}
          />
        </View>
      </ShadowCardComponent>
    );
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.Payment}</Text>
        {termsAndConditionCard()}
        {paymentStatus && cancelRequestSuccessCard()}
        {tableDataLoading ? PaymentDetailShimmerCard() : paymentDetailCard()}
        {isLinkLoading && <LoaderView />}
        <DialogStatusPopup />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentDetailPage;

const styles = StyleSheet.create({
  checkImageContainer: {
    width: 26,
    height: 26,
    justifyContent: "center",
    backgroundColor: "#28C76F14",
    padding: 16,
    borderRadius: 4,
  },
  tooltip: {
    flex: 1,
    position: "relative",
    bottom: 40,
    left: -15,
    backgroundColor: colors.toolTipBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  tooltipText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  checkImage: {
    width: 18,
    height: 18,
    alignSelf: "center",
  },
  checkTextTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: colors.subHeaderTextColor,
  },
  checkSubText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.5,
    color: "#28C76F",
  },
  footer: {
    padding: 16,
    backgroundColor: colors.appThemeColor,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "rgb(22, 135, 148)",
    marginLeft: 16,
    marginTop: 16,
  },
  termsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.appThemeColor,
    marginBottom: 10,
    letterSpacing: 1,
  },
  bullet: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    //flexDirection: 'row',
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: colors.guidelinesTextColor,
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  valueBold: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.blackopacity87,
  },
  valueGrey: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.textValueColor,
  },
  statusOpen: {
    color: "rgb(40, 199, 111)",
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  statusClose: {
    color: "#FF4C51",
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  amortizationUpdateStatusClose: {
    color: "#FF9F43",
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  amortizationUpdateStatusOpen: {
    color: "#28C76F",
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  statusPending: {
    fontFamily: fonts.bold,
    fontSize: 10,
    marginTop: 2,
  },
  payNow: {
    color: colors.appThemeColor,
    fontFamily: fonts.bold,
    fontSize: 12,
    alignSelf: "flex-end",
  },
  paymentRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "flex-end",
  },
  subLabel: {
    fontSize: 11,
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previousBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.appThemeColor,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  previousText: {
    marginLeft: 6,
    color: colors.appThemeColor,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  cancelBtn: {
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 24,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 14,
    marginRight: 6,
    color: "rgba(75, 70, 92, 0.8)",
  },
  termText: {
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(75, 70, 92, 0.8)",
    flex: 1,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconStyle: {
    width: 10,
    height: 10,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boxSmall: {
    width: "32%",
    height: 40,
    borderRadius: 8,
  },
  successStatusText: {
    color: "#28C76F",
    textTransform: "capitalize",
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  pendingStatusText: {
    color: "#EF7327",
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  disabledButton: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.5,
  },
  activeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    marginRight: 4,
    color: "#000",
  },
});
