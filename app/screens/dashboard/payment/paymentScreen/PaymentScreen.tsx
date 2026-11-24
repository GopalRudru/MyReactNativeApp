import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  authSelector,
  userPermissionSelector,
  userLoanCatSelector,
} from "../../../../services/redux/slices/authSlice";
import {
  clearPartPaymentType,
  setPartPaymentType,
} from "../../../../services/redux/slices/documentFormSlice";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import mainStyle from "../../../../res/mainStyles";
import Header from "../../../../components/common/Header";
import * as NavigationService from "../../../../navigation/NavigationService";
import colors from "../../../../res/colors";
import fonts from "../../../../res/fonts";
import strings from "../../../../res/strings";
import CopyrightComponent from "../../../../components/common/CopyrightComponent";
import ShadowCardComponent from "../../../../components/ShadowCardComponent";
import NoRecordFound from "../../../../components/common/NoRecordFound";
import imagePath from "../../../../constant/imagePath";
import { Dropdown } from "react-native-element-dropdown";
import CustomButton from "../../../../components/CustomButton";
import RadioButtonGroup from "../../../../components/RadioButtonGroup";
import navigationStrings from "../../../../constant/navigationStrings";
import { encrypt } from "../../../../utils/crypto";
import { isSessionActive } from "../../../../utils/helpers";
import postsServices from "../../../../services/api/service/postsService";
import { RootState } from "../../../../services/redux/store";
import { useDispatch, useSelector } from "react-redux";
import AppConstants, { messages } from "../../../../constant/AppConstants";
import {
  setStatusPopup,
  statusPopupSelector,
} from "../../../../services/redux/slices/statusPopupSlice";
import { formatIndianRupees } from "../../../../utils/formatting";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { formatDate } from "../../../../utils/dateFormatUtils";
import styles from "./styles";
import { PaymentTermLoanContext } from "../../../../hooks/context";
import Space from "../../../../components/common/Space";
import PaymentRequestTermLoan from "./PaymentRequestTermLoan";
import service from "../../../../services/api/service";
import dayjs from "dayjs";
import CardItemPayment from "../CardItemPayment";
import OverdueLoanRequest from "../OverdueLoanRequest";
import { useFormik } from "formik";
import LoanDetails from "../../../../components/LoanDetails";
import PartPaymentTermLoan from "../PartPaymentTermLoan";
import AdditionalDetailsLoan from "../AdditionalDetailsLoan";
import ProceedToPayLoan from "../ProceedToPayLoan";
import PaymentDetailPage from "../PaymentDetailPage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHideTabBar } from "../../../../hooks/useHideTabBar";
import DialogStatusPopup from "../../../../components/common/DialogStatusPopup";
//import DialogStatusPopup from "../../../../components/common/DialogStatusPopup";
import { checkConnectivity } from "../../../../services/api/apiClient/apiClient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createModuleLogger } from "../../../../utils/logger";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import FeedbackModal from "../../../../components/common/FeedbackModal";
import { feedbackRatingCount, increaseFeedbackRatingCount } from "../../../../utils/storageUtils";

// Create payment-specific logger
const logger = createModuleLogger("PaymentScreen");
const isFocused = useIsFocused();
const PaymentScreen = () => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const userLoanCategory = useSelector(userLoanCatSelector);
  const { userProfile } = useSelector(authSelector);
  const [amountValue, setAmountValue] = useState<number | null>(null);
  const [formStep, setFormStep] = useState<any>(-1);
  const [partPaymentData, setPartPaymentData] = useState<any>([]);
  const [showCustomerRating, setShowCustomerRating] = useState<any>(false);
  const [feedbackJourneyType, setFeedbackJourneyType] = useState<any>("");
  const [feebackModelVisibleInSession, setFeebackModelVisibleInSession] = useState<any>(false);
  const [formValue, setFormValue] = useState<any>({
    cif: "",
    cifEntity: "",
    lan: "",
    amount: "",
    paymentType: "PartPayment",
    initiatedBy: "",
    sourceFundsUuid: "",
    desiredImpactUuid: "",
    netPrincipalAdjustment: "",
    reasonForPartPayment: "",
    payTowardsOverdue: 0,
  });

  const [termLoanRequestId, setTermLoanRequestId] = useState<any>("");
  const [applicableCharges, setApplicableCharges] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [selectedOptionValue, setSelectedOptionValue] = useState<
    string | number
  >("");
  const { rolePermissions } = useSelector(userPermissionSelector) ?? {};
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardItemType>();
  const [selectedOptionFilterValue, setSelectedOptionFilterValue] = useState<
    string | number
  >("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<
    "error" | "warning" | "info" | "success"
  >("success");
  const [inputValue, setInputValue] = useState("");
  const [nagitiveValueCheck, setNagitiveValueCheck] = useState("");
  const [disabledButton, setdisabledButton] = useState(false);
  const [lanNumber, setLanNumber] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [paymentTypeValue, setPaymentTypeValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTableCard, setIsLoadingTableCard] = useState(true);

  const [pending, setPending] = useState(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [rows, setRows] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [overDueValues, setOverDueValues] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusUpdate, setstatusUpdate] = useState("");
  const [paymentType, setpaymentType] = useState("");
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const [isOverDuePending, setIsOverDuePending] = useState(true);

  const formTypeValue = useSelector(
    (state: RootState) => state.documentFormSlice.partPaymentType,
  );

  // Add selector for status popup to listen for callbacks
  const statusPopupState = useSelector(statusPopupSelector);

  const handleSelectPaymentType = (value: string) => {
    setpaymentType(value);
  };

  const handleEmptyFormValue = () => {
    setFormValue({
      cif: "",
      cifEntity: "",
      lan: "",
      amount: "",
      paymentType: "PartPayment",
      initiatedBy: "",
      sourceFundsUuid: "",
      desiredImpactUuid: "",
      netPrincipalAdjustment: "",
      reasonForPartPayment: "",
      payTowardsOverdue: 0,
    });
  };

  const parseCustomQueryString = (queryString: any) => {
    const cleanedQueryString = queryString.startsWith("?")
      ? queryString.substring(1)
      : queryString;

    const correctedQueryString = cleanedQueryString.replace(/\?/g, "&");
    const paramPairs = correctedQueryString.split("&");
    const params: any = {};

    paramPairs.forEach((pair: any) => {
      const [key, value] = pair.split("=");

      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    return params;
  };
  const [visible, setVisible] = useState(false);

  const closeModal = () => setVisible(false);

  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber,
  );
  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
  );
  const dashboardDataSetTest = useSelector(
    (state: RootState) => state.dashboardData,
  );

  const businessTypeId = useSelector(
    (state: RootState) => state?.auth?.businessType?.id,
  );
  const loanCategoryData: any = useSelector(
    (state: RootState) => state?.auth?.loanCategory,
  );

  let cif = userProfile?.cifNumber;
  let LoanNo = selectedLoanNumber;
  //const paymentRequestId = parsedParams["paymentRequestId"];

  useEffect(() => {
    const matchedObject = dashboardDataSet.find(
      (data: any) => data.lanNumber === selectedLoanNumber,
    );

    setDashboardData(matchedObject);
    setErrorMessage("");
    //setField("amount", "");
  }, [selectedLoanNumber, dashboardDataSet]);

  /**
   * Updates the form value state with the specified key-value pair.
   *
   * @param {string} key - The key of the form value to update.
   * @param {any} value - The new value to set for the specified key.
   */
  const handleFormValue = (key: string, value: any) => {
    const copyFormValue: any = { ...formValue };
    copyFormValue[key] = value;
    setFormValue(copyFormValue);
  };

  const LoanTypeValue: any = userLoanCategory?.TermLoan.find(
    (elem: any) => elem?.id == dashboardDataSet?.[0]?.loanTypeId,
  )?.loanTypeName;
  const loanCategoryValue: any = userLoanCategory?.TermLoan.find(
    (elem: any) => elem?.id == dashboardDataSet?.[0]?.loanTypeId,
  );

  let breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Payments" }, // Current page, no `path` needed
  ];

  useEffect(() => {
    setIsOverDuePending(true);
  }, [selectedLoanNumber]);

  useEffect(() => {
    if (!formTypeValue) {
      setFormStep(-1);
    }

    if (!formTypeValue) {
      setpaymentType("");
    }
  }, [formTypeValue, formStep]);

  const handleShowFormSection = useMemo(() => {
    switch (formStep) {
      case 0:
        return <PartPaymentTermLoan />;
      case 1:
        return <AdditionalDetailsLoan ref={scrollRef} />;
      case 2:
        return <ProceedToPayLoan />;
      default: {
        return <PaymentDetailPage />;
      }
    }
  }, [formStep, formTypeValue]);

  const handleShowOverdueForm = useMemo(() => {
    switch (formStep) {
      case 0:
        return <OverdueLoanRequest ref={scrollRef} />;
      default: {
        return <PaymentDetailPage />;
      }
    }
  }, [formStep, formTypeValue]);

  const steps: any = [
    "Part Payment Amount",
    "Additional details",
    "Proceed to pay",
  ];

  const mobileSteps: any = [
    "Request\nForm",
    "Additional\ndetails",
    "Proceed\nto pay",
  ];

  const handleShowHeader = useMemo(() => {
    return (
      <View style={{ paddingVertical: 16, paddingHorizontal: 0 }}>
        <View style={styles.stepsWrapper}>
          {mobileSteps.map((elem, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  formStep === index
                    ? styles.stepActive
                    : formStep > index
                    ? styles.stepCompleted
                    : styles.stepInactive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    formStep === index
                      ? styles.textWhite
                      : formStep > index
                      ? styles.textActive
                      : styles.textInactive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.stepLabel}>{formStep == index && elem}</Text>

              {index < steps.length - 1 && (
                <Image source={imagePath.rightArrow} style={styles.arrowIcon} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }, [steps, mobileSteps, formStep]);

  /**
   * Fetches finance data from the specified API endpoint.
   *
   * This function makes an HTTP GET request to the finance API to retrieve finance data
   * for a specific entity. The request includes necessary headers such as authorization,
   * language, entity ID, service name, service version, message ID, and request time.
   *
   * @async
   * @function fetchGetFinanceRestData
   *
   * @returns {Promise<void>} A promise that resolves when the data is successfully fetched
   * and logged to the console, or rejects with an error if the request fails.
   */
  const fetchGetFinanceRestData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const payload: any = {
        lan: encrypt(selectedLoanNumber.toString()),
        business: encrypt(businessTypeId),
        loanCategory: encrypt(loanCategoryData?.TermLoan[0]?.loanCategoryId),
      };
      postsServices
        .secureAddPost("api/v1/dashboard/term-loan-view", payload)
        .then((response) => {
          setPartPaymentData(response?.data?.data);
          setIsLoading(false);
        })
        .catch(async (error) => {
          setIsLoading(false);
          const errorMessage =
            error || messages.withdrErrorMessages.commonError; //error.response?.data?.message || messages.withdrErrorMessages.commonError;
          const isConnected = await checkConnectivity();
          if (isConnected) {
            dispatch(
              setStatusPopup({ status: "Error", message: errorMessage }),
            );
          }
        });
    } catch (error: any) {
      setIsLoading(false);
      if (error?.response?.status === 408) {
        const errorMessage = error?.response?.data?.details?.error;
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage,
            buttonStatus: true,
          }),
        );
      } else if (error?.response?.data) {
        const errorMessage = error?.response?.data?.message;
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage,
          }),
        );
      }
    }
  };

  useEffect(() => {
    fetchGetFinanceRestData();
  }, [selectedLoanNumber]);

  /**
   * Fetches additional charges data from the server.
   *
   * This function makes an asynchronous call to the endpoint `/api/v1/payment/get-additional-charges`
   * to retrieve additional charges data. The response data is processed and stored in state.
   * If an error occurs during the request, it is caught and logged using the logger utility.
   *
   * @async
   * @function getAdditionalChargesData
   * @returns {Promise<void>} A promise that resolves when the data has been fetched and logged.
   */
  const getAdditionalChargesData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const payload = {
        type: encrypt("PartPayment"),
        lan: encrypt(selectedLoanNumber),
        cif: userProfile?.cifNumber,
      };

      await postsServices
        .secureAddPost("api/v1/payment/get-additional-charges", payload)
        .then((response: any) => {
          setApplicableCharges(response?.data?.data);
          setpaymentType("");
          setIsLoading(false);
        })
        .catch((error: any) => {
          logger.error("Failed to get additional charges data", error);
          setIsLoading(false);
        });
    } catch (error: any) {
      logger.error("Error in getAdditionalChargesData", error);
    }
  };

  /**
   * Fetches overdue data for the selected loan number.
   *
   * This function sets the loading state to true, constructs a payload with the encrypted
   * loan number, and makes a POST request to the `api/v1/payment/overdue-details` endpoint.
   * If the request is successful, it updates the overdue values state with the response data.
   * Regardless of the outcome, it sets the loading state to false once the request is complete.
   *
   * @async
   * @function fetchOverDueData
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   */
  const fetchOverDueData = async (): Promise<void> => {
    const payload: any = {
      lan: String(encrypt(selectedLoanNumber)),
      cif: userProfile?.cifNumber,
    };
    try {
      const response = await service.posts.secureAddPost(
        `api/v1/payment/overdue-details`,
        payload,
      );

      const keyValues = Object.keys(response?.data?.data);
      if (keyValues.length > 0) {
        setOverDueValues(response?.data?.data);
      } else {
        setOverDueValues({
          bounceCharge: 0,
          penalCharge: 0,
          emiWithoutCharge: 0,
          totalAmount: 0,
        });
      }
      setIsOverDuePending(false);
    } catch (error: any) {
      setIsOverDuePending(false);
      setOverDueValues(null);
    }
  };

  useEffect(() => {
    if (selectedLoanNumber && formStep == -1) {
      getAdditionalChargesData();
      fetchOverDueData();
    }
  }, [selectedLoanNumber, userProfile, formStep]);

  const fetchData = async () => {
    // Only fetch while the session is genuinely active — guards against the
    // navigation refocus that fires this during a 409/401 teardown.
    if (!(await isSessionActive())) return;

    setIsLoadingTableCard(true);
    const formattedFromDate = fromDate
      ? dayjs(fromDate).format("YYYY-MM-DD")
      : "";
    const formattedToDate = toDate ? dayjs(toDate).format("YYYY-MM-DD") : "";
    const statusQuery =
      selectedOptionFilterValue === "all" ? "" : selectedOptionFilterValue;
    const payload: any = {
      lan: String(encrypt(selectedLoanNumber)),
      cif: String(userProfile?.cifNumber),
      status: statusQuery,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };
    const pageSkip = page + 1; // API might be 1-based indexing
    const pageSize = rowsPerPage;
    try {
      const response = await service.posts.secureAddPost(
        `api/v1/payment/term-payment-dashboard-listing?page=${pageSkip}&pageSize=${pageSize}`,
        payload,
      );
      setRows(response.data.data);
      setTotalRecords(response?.data?.totalCount);
    } catch (error) {
    } finally {
      setIsLoadingTableCard(false);
    }
  };

  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);
  useHideTabBar(shouldHideTabBar, "PaymentScreen");
  useEffect(() => {
    if (formStep == -1) {
      setShouldHideTabBar(false);
    } else if (formStep == 3) {
      setShouldHideTabBar(true);
    }
  });

  useEffect(() => {
    // if (isFocused) {
    if (formStep == -1) {
      fetchData();
    }
    // }
  }, [
    selectedLoanNumber,
    page,
    rowsPerPage,
    statusUpdate,
    formStep /*, formStep*/,
  ]);

  // Listen for status popup changes from child components
  useEffect(() => {
    if (
      statusPopupState?.open &&
      statusPopupState?.status &&
      statusPopupState?.message
    ) {
      handleStatusPopupCallback(statusPopupState);
    }
  }, [statusPopupState]);

  /**
   * Handles callback when status popup is triggered from child components like AccountSelectorDropDown
   * @param {object} popupState - The status popup state containing status, message, etc.
   */
  const handleStatusPopupCallback = (popupState: any) => {
    logger.debug("Status popup triggered from child component:", {
      status: popupState.status,
      message: popupState.message,
      source: "AccountSelectorDropDown",
    });

    // Add your custom callback logic here
    if (
      popupState.message ===
      strings.payment_requests_are_currently_unavailable_for_this_loan
    ) {
      // Handle no access case
      logger.debug("Payment access denied for current loan");
      NavigationService.goBack();
    } else if (popupState.status === "Error") {
      // Handle error case
      logger.debug("Error popup from child component:", popupState.message);
    }
  };

  const handleBackPress = () => {
    setFormStep(-1);
    dispatch(clearPartPaymentType());
    handleSelectPaymentType("");
  };

  const sanctionedDisbursedData = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
  );

  // Effect to update dashboard data and overdue amount based on selectedloanAccountNumber
  const selectedloanAccountNumber = useSelector(
    (state: RootState) => state.option.selectedloanAccountNumber,
  );
  useEffect(() => {
    const filteredDashboardData = sanctionedDisbursedData?.filter(
      (item: any) => {
        return item.loanAccountNumber === selectedloanAccountNumber;
      },
    );
    //setDashboardData(filteredDashboardData[0]);
    setOverdueAmount(
      filteredDashboardData.length > 0
        ? filteredDashboardData[0].overdueAmount
        : 0,
    );
  }, [selectedloanAccountNumber]);

  useEffect(() => {
    if (showCustomerRating) {
      const enableRating = async () => {
        const count = await feedbackRatingCount();
        setFeebackModelVisibleInSession(count <= 1);
      };
      enableRating();
    }
  }, [showCustomerRating]);

  // useEffect(() => {
  //   const value: string = AsyncStorage.getItem("termLoanRequestId") || "";
  //   if (value) {
  //     setTermLoanRequestId(value);
  //     setFormStep(3);
  //   }
  // }, [paymentRequestId, cif, LoanNo]);

  /**
   * Handles the action click event for a row in the term loan table.
   * Sets the term loan request ID based on the selected row.
   *
   * @param {any} row - The selected row data from the term loan table.
   */
  const handleActionClick = (row: any) => {
    const rowFilter: any = rows.find(
      (item) => item.requestId === row?.requestId,
    );
    dispatch(
      setPartPaymentType(rowFilter?.purpose == "PartPayment" ? "1" : "2"),
    );
    setTermLoanRequestId(rowFilter?.requestId);
    AsyncStorage.setItem("termLoanRequestId", rowFilter?.requestId);
    AsyncStorage.setItem("paymentUpdateDetails", JSON.stringify(null));
    setFormStep(3);
  };
  const BulletItem = (text: string) => {
    return (
      <View style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
  };

  return (
    <PaymentTermLoanContext.Provider
      value={{
        // isXsOrSm,
        LoanTypeValue,
        loanCategoryValue,
        formTypeValue,
        userProfile,
        isModalOpen,
        overdueAmount,
        selectedOptionValue,
        status,
        fromDate,
        toDate,
        dashboardData,
        selectedOptionFilterValue,
        message,
        severity,
        inputValue,
        nagitiveValueCheck,
        disabledButton,
        lanNumber,
        toastOpen,
        paymentTypeValue,
        errorMessage,
        isLoading,
        pending,
        totalRecords,
        rows,
        page,
        rowsPerPage,
        statusUpdate,
        //rolePermissions,
        partPaymentData,
        formValue,
        applicableCharges,
        userLoanCategory,
        selectedLoanNumber,

        cif,
        LoanNo,
        //paymentRequestId,
        termLoanRequestId,
        overDueValues,
        amountValue,
        dashboardDataSet,
        paymentType,
        isOverDuePending,
        isLoadingTableCard,

        setAmountValue,
        setTermLoanRequestId,
        setOverdueAmount,
        handleSelectPaymentType,
        setSelectedOptionValue,
        setFromDate,
        setToDate,
        setDashboardData,
        setSelectedOptionFilterValue,
        setMessage,
        setSeverity,
        setInputValue,
        setNagitiveValueCheck,
        setdisabledButton,
        setLanNumber,
        setToastOpen,
        setPaymentTypeValue,
        setErrorMessage,
        setIsLoading,
        setPending,
        setTotalRecords,
        setRows,
        setPage,
        setRowsPerPage,
        setstatusUpdate,
        setFormStep,
        setShowCustomerRating,
        setFeedbackJourneyType,
        handleFormValue,

        // handleListItemClick,
        // handleInputChange,
        // handleFromDateChange,
        // handleToDateChange,
        fetchData,
        // handleChangePage,
        // handleChangeRowsPerPage,
        // handleToastClose,
        // handleFilterButtonClick,
        // handleCloseModal,
        handleEmptyFormValue,
        handleStatusPopupCallback,
      }}
    >
      <SafeAreaView style={mainStyle.safeArea}>
        {/* <DialogStatusPopup /> */}
        {formStep == -1 ? (
          <Header
          // onAvatarPress={() => setAvatarMenuVisible(true)}
          // onMenuPress={handleMenuPress}
          // onNotiIconPress={handleNotificationIconPress}
          />
        ) : (
          <Header
            backIconNeeded={true}
            onBackPress={handleBackPress}
            showNotification={formStep == -1 ? true : false}
            showProfile={formStep == -1 ? true : false}
          />
        )}

        {/* <KeyboardAvoidingView> */}
        <KeyboardAwareScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
        >
          {formStep == -1 ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  // backgroundColor: "green",
                  marginTop: 16,
                  marginLeft: 16,
                }}
              >
                <Text style={styles.header}>{strings.Payment}</Text>
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
              <PaymentRequestTermLoan />
            </>
          ) : (
            <>
              {/*
                Step 3 (View Status / payment detail) renders the same section
                for both form types, so it must NOT be gated on formTypeValue:
                clearPartPaymentType() resets it to "" while formStep is still
                3, and with both gates false nothing rendered at all (blank
                screen). Gating only the pre-step-3 forms keeps that behaviour
                identical while making step 3 always render.
              */}
              {formStep == 3 ? (
                <>{handleShowFormSection}</>
              ) : (
                <>
                  {formTypeValue == "1" && (
                    <>
                      <View
                        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
                      >
                        <LoanDetails />
                      </View>
                      <ShadowCardComponent
                        paddingHorizonatal={16}
                        paddingVertical={1}
                        marginVertical={1}
                        marginHorizontal={16}
                      >
                        {handleShowHeader}
                        <View style={styles.horizontalDivider} />
                        {handleShowFormSection}
                      </ShadowCardComponent>
                    </>
                  )}
                  {formTypeValue == "2" && <>{handleShowOverdueForm}</>}
                </>
              )}
            </>
          )}

          {formStep == -1 && (
            <View style={{ paddingHorizontal: 16 }}>
              <CardItemPayment
                rows={rows}
                isLoading={isLoadingTableCard}
                handleActionClick={handleActionClick}
              />
            </View>
          )}

          <CopyrightComponent />
        </KeyboardAwareScrollView>
        {/* </KeyboardAvoidingView> */}
        <DialogStatusPopup />

        {/* Bottom sheet popup */}
        {(showCustomerRating && feebackModelVisibleInSession) && (
          <FeedbackModal
            setShowCustomerRating={setShowCustomerRating}
            //screen={formTypeValue == "2" ? "OverDue" : "PartPayment"}
            screen={feedbackJourneyType}
          />
        )}
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
                      Information related to Payment
                    </Text>
                    <View style={styles.bulletList}>
                      {/* {BulletItem("gopalk")} */}
                      {BulletItem(
                        "You can make Part Payment & Overdue payments using the Payment section.",
                      )}
                      {BulletItem(
                        "Part payment is not allowed if there is an existing overdue against the LAN account.",
                      )}
                      {BulletItem(
                        "In each part payment request, the minimum principal amount allowed to be cleared is 3 times the EMI and its maximum value is 50% of the principal outstanding.",
                      )}
                      {BulletItem(
                        "Applicable charges will be levied for Part payment & Overdue payments as per the policy.",
                      )}
                      {BulletItem(
                        "For part payment requests, the Repayment Schedule is updated for the paid amount within 72 working hours after the request is submitted.",
                      )}
                      {/* <Text style={styles.bullet}>
                        • You can make Part Payment & Overdue payments using the
                        Payment section.
                      </Text>
                      <Text style={styles.bullet}>
                        • Part payment is not allowed if there is an existing
                        overdue against the LAN account.
                      </Text>
                      <Text style={styles.bullet}>
                        • In each part payment request, the minimum principal
                        amount allowed to be cleared is 3 times the EMI and its
                        maximum value is 50% of the principal outstanding.
                      </Text>
                      <Text style={styles.bullet}>
                        • Applicable charges will be levied for Part payment &
                        Overdue payments as per the policy.
                      </Text>
                      <Text style={styles.bullet}>
                        • For part payment requests, the Amortization chart is
                        updated for the paid amount within 24 hours after the
                        request is submitted.
                      </Text> */}
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
    </PaymentTermLoanContext.Provider>
  );
};

export default PaymentScreen;
