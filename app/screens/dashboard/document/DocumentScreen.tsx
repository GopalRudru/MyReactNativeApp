import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Share,
  Alert,
  Linking,
  PermissionsAndroid,
} from "react-native";
import imagePath from "../../../constant/imagePath";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Header from "../../../components/common/Header";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
import CopyrightComponent from "../../../components/common/CopyrightComponent";
import strings from "../../../res/strings";
import Space from "../../../components/common/Space";
import AppConstants from "../../../constant/AppConstants";
import { useDispatch, useSelector } from "react-redux";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import {
  authSelector,
  userPermissionSelector,
} from "../../../services/redux/slices/authSlice";
import postsServices from "../../../services/api/service/postsService";
import { RootState } from "../../../services/redux/store";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import RNFetchBlob from "react-native-blob-util";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import { dateToFinYearOptions } from "../../../utils/helpers";
import LoaderView from "../../../components/common/LoaderView";
//import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import analytics from "@react-native-firebase/analytics";
import {
  documentsItOptions,
  messages,
  validStatuses,
} from "../../../constant/AppConstants";
import { decrypt } from "../../../utils/crypto";
import { useFocusEffect } from "@react-navigation/native";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";
import { checkConnectivity } from "../../../services/api/apiClient/apiClient";
import { moderateScale } from "react-native-size-matters";
import RNFS from "react-native-fs";
import { createModuleLogger } from "../../../utils/logger";
import AccountSelectorDropDown from "../AccountSelectorDropDown";
import ShadowCardComponent from "../../../components/ShadowCardComponent";

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

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

const DocumentScreen = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [pdfUrlAccountStatement, setPdfUrlAccountStatement] =
    useState<string>("");
  const logger = createModuleLogger("DocumentScreen");
  const [lanNumber, setLanNumber] = useState("");
  const { userProfile } = useSelector(authSelector);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [getYear, setGetYear] = useState<string | null>(null);
  const [certificateInput, setCertificateInput] = useState<{
    certificate: string;
    years: string;
  }>({ certificate: "provsonintstcert", years: "" });
  // const sDate=''
  // const eDate=''
  const [viewPdfModal, setViewPdfModal] = useState<{
    isOpen: boolean;
    title: string;
  }>({ isOpen: false, title: "" });

  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );

  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData
  );

  const isActive: any = dashboardDataSet?.find(
    (data: any) => data.lanNumber === selectedLoanNumber
  )?.status;

  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const isForeclosureAllowedValue = useMemo(() => {
    const matchedObject: any = dashboardDataSet?.find(
      (data: any) => data.lanNumber === selectedLoanNumber
    );
    return matchedObject?.isForeclosureAllowed;
  }, [selectedLoanNumber, dashboardDataSet]);

  const activeValue = useMemo(() => {
    if (isActive == "M") return true;
    if (isActive == "C") return true;
    if (isActive == "W") return true;
    if (isActive == "E") return true;
    if (isActive == "S") return true;

    return false;
  }, [isActive]);

  // Effect to trigger re-render when loan number changes
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [selectedLoanNumber]);

  useEffect(() => {
    setLanNumber(selectedLoanNumber);

    // Reset dates when loan number changes
    // setStartDate(null);
    // setEndDate(null);
    // setMinDate(null);
    // setMaxDate(null);

    const matchedObject: any = dashboardDataSet?.find(
      (data: any) => data?.lanNumber === selectedLoanNumber
    );

    logger.debug(
      "Matched object for loan number:............ ????? %%%%% : ",
      matchedObject
    );

    if (matchedObject) {
      const loanStartDate = matchedObject?.loanStartDate
        ? new Date(matchedObject.loanStartDate)
        : null;

      if (loanStartDate && !isNaN(loanStartDate.getTime())) {
        setStartDate(loanStartDate);
        setMinDate(loanStartDate);
      } else {
        logger.log("Invalid loanStartDate", loanStartDate);
      }

      const maturityDate = validStatuses.includes(matchedObject?.status)
        ? matchedObject?.maturityDate
          ? new Date(matchedObject?.maturityDate)
          : new Date()
        : new Date();

      if (!isNaN(maturityDate.getTime())) {
        setEndDate(maturityDate);
        setMaxDate(maturityDate);
      } else {
        logger.log("Invalid maturityDate", maturityDate);
      }
    }
  }, [selectedLoanNumber, dashboardDataSet]);

  const finYearsOptions = useMemo(() => {
    const matchedObject = dashboardDataSet?.find(
      (data: any) => data.lanNumber === selectedLoanNumber
    );
    if (!matchedObject || !matchedObject.loanStartDate) {
      return [];
    }
    let maturityDate;
    if (validStatuses.includes(matchedObject?.status)) {
      maturityDate = matchedObject?.maturityDate;
    } else {
      maturityDate = dayjs().format("YYYY-MM-DD");
    }

    const yearsOptions = dateToFinYearOptions(
      matchedObject?.loanStartDate,
      maturityDate
    );
    if (yearsOptions.length > 0) {
      setCertificateInput({
        ...certificateInput,
        years: yearsOptions[yearsOptions.length - 1]?.value,
      });
    }
    setSelectedYear(null);
    setGetYear(null);
    return yearsOptions;
  }, [selectedLoanNumber, dashboardDataSet]);

  useEffect(() => {
    if (getYear) {
      setCertificateInput((prev) => ({
        ...prev,
        years: getYear,
      }));
    }
  }, [getYear]);

  useEffect(() => {
    if (finYearsOptions?.length && !selectedYear) {
      // Assuming options are sorted oldest to newest
      const lastOption = finYearsOptions[finYearsOptions.length - 1];
      setSelectedYear(lastOption.label);
    }
  }, [finYearsOptions]);

  const accountStatement = async (actionType: string, type: string) => {
    setIsLoading(true);
    try {
      const convertedStartDate = moment(startDate, "DD/MM/YYYY").format(
        "YYYY/MM/DD"
      );
      const convertedEndDate = moment(endDate, "DD/MM/YYYY").format(
        "YYYY/MM/DD"
      );
      const formattedFromDate = convertedStartDate
        ? dayjs(convertedStartDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = convertedEndDate
        ? dayjs(convertedEndDate).format("YYYY-MM-DD")
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
      const matchedObject = dashboardDataSet?.find(
        (data: any) => data.lanNumber === selectedLoanNumber
      );
      if (type === "cert") {
        const isLeapYear = (year: any) => dayjs(`${year}-02-29`).isValid(); // Leap year check
        const formattedFromDatenew = formattedFromDate || "";
        const yearCustome = formattedFromDatenew.split("-")[0] || "1970";

        const startOfFinancialYear = `${certificateInput?.years}-04-01`; // Start of FY
        const endOfFinancialYear = `${+certificateInput?.years + 1}-03-31`; // End of FY

        // Strict validation for financial year
        if (
          dayjs(formattedFromDatenew).isValid() &&
          dayjs(formattedFromDatenew).isBetween(
            startOfFinancialYear,
            endOfFinancialYear,
            null,
            "[]"
          )
        ) {
          // Case 1: Date lies within financial year
          payload.fromDate = formattedFromDate;
        } else if (
          isLeapYear(Number(yearCustome)) &&
          formattedFromDatenew === `${yearCustome}-02-29` &&
          certificateInput?.years === String(Number(yearCustome) + 1) &&
          formattedFromDatenew >= `${yearCustome}-04-01` &&
          formattedFromDatenew <= `${yearCustome}-12-31`
        ) {
          // Case 2: Handle February 29 of the leap year correctly
          payload.fromDate = formattedFromDate;
        } else {
          // Case 3: Default fallback to April 1 of the given financial year
          payload.fromDate = `${certificateInput.years}-04-01`;
        }

        // Assign toDate as the end of the financial year
        payload.toDate = `${+certificateInput.years + 1}-03-31`;

        // payload.type =
        //   Number(dayjs().format("YYYY")) === Number(certificateInput?.years)
        //     ? "provsonintstcert"
        //     : "instcert";

        let year = getYear ? getYear : certificateInput.years;
        payload.type =
          dayjs().format("YYYY") == year ? "provsonintstcert" : "instcert";

        payload.finActiveStatus = matchedObject?.statusOfLoan;

        // payload.fromDate = `${
        //   getYear ? getYear : certificateInput.years
        // }-04-01`;
        // payload.toDate = `${
        //   (getYear ? +getYear : +certificateInput.years) + 1
        // }-03-31`;
        // let year = getYear ? getYear : certificateInput.years;
        // payload.type =
        //   dayjs().format("YYYY") == year ? "provsonintstcert" : "instcert";
        // payload.finActiveStatus = "A";
      }
      payload.finActiveStatus = matchedObject?.status;
      if (type === "noc") {
        payload.finActiveStatus = "";
      }
      logger.debug("payload", payload);
      // const res = await postsServices.addPost(
      //   "api/v1/report/accountstatement",
      //   payload
      // );
      const res = await postsServices.secureAddPost(
        "api/v1/report/accountstatement",
        payload
      );
      logger.debug("response>>>>>>>>>", res);
      setIsLoading(false);
      logger.info("after loadinfg");
      logger.debug("res>>>>>>>", res);
      if (res?.status === 200 && res?.data?.data) {
        const pdfUrl = res?.data?.data?.url;
        if (type === "soa") {
          // SOA
          if (actionType === "view") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_SOA_View", { user_id: user_id });
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "Account Statement" });
          } else if (actionType === "download") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_SOA_Download", { user_id: user_id });
            downloadPdf(pdfUrl, lanNumber, type);
            dispatch(
              setStatusPopup({
                status: "success",
                message: `Your Account Statement for LAN ${selectedLoanNumber} has been downloaded successfully. Please use your CIF as password to unlock it`,
              })
            );
          } else if (actionType === "email") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_SOA_Emai", { user_id: user_id });
            dispatch(
              setStatusPopup({
                status: "success",
                message: `Statement of Account has been sent successfully to your registered Email ID`,
              })
            );
          }
        } else if (type === "schd") {
          // schd
          if (actionType === "view") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_Repay_View", { user_id: user_id });
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "Repayment Schedule" });
          } else if (actionType === "download") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_Repay_Download", {
              user_id: user_id,
            });
            downloadPdf(pdfUrl, lanNumber, type);
            dispatch(
              setStatusPopup({
                status: "success",
                message: `Your Repayment Statement schedule for LAN ${selectedLoanNumber} has been downloaded successfully. Please use your CIF as password to unlock it`,
              })
            );
          } else if (actionType === "email") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_Repay_Email", { user_id: user_id });
            dispatch(
              setStatusPopup({
                status: "success",
                message: `Repayment Schedule has been sent successfully to your registered Email ID`,
              })
            );
          }
        } else if (type === "noc") {
          // noc
          if (actionType === "view") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_NOC_View", { user_id: user_id });
            viewPdf(pdfUrl);
            setViewPdfModal({
              isOpen: true,
              title: "No Objection Certificate",
            });
          } else if (actionType === "download") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_NOC_Download", { user_id: user_id });
            downloadPdf(pdfUrl, lanNumber, type);
            dispatch(
              setStatusPopup({
                status: "success",
                message: `No Objection Certificate has been downloaded successfully. Please use your CIF as password to unlock it`,
              })
            );
          } else if (actionType === "email") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_NOC_Email", { user_id: user_id });
            dispatch(
              setStatusPopup({
                status: "success",
                message: `No Objection Certificate has been sent successfully to your registered Email ID`,
              })
            );
          }
        } else {
          if (actionType === "view") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_ITC_View", { user_id: user_id });
            viewPdf(pdfUrl);
            setViewPdfModal({ isOpen: true, title: "IT Certificate" });
          } else if (actionType === "download") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_ITC_Download", { user_id: user_id });
            downloadPdf(pdfUrl, lanNumber, type);
            dispatch(
              setStatusPopup({
                status: "success",
                message: `IT Certificate has been downloaded successfully. Please use your CIF as password to unlock it`,
              })
            );
          } else if (actionType === "email") {
            await analytics().setUserId(user_id);
            analytics().logEvent("Dash_Doc_ITC_Email", { user_id: user_id });
            dispatch(
              setStatusPopup({
                status: "success",
                message: `IT Certificate has been sent successfully to your registered Email ID`,
              })
            );
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error || "An error occurred";
      // const errorMessage = error.response?.data?.message || "An error occurred";
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(setStatusPopup({ status: "Error", message: errorMessage }));
      }
      setIsLoading(false);
    }
  };

  const foreclosureLetter = async (actionType: string) => {
    setIsLoading(true);
    try {
      const matchedObject = dashboardDataSet?.find(
        (data: any) => data.lanNumber === selectedLoanNumber
      );

      const payload = {
        finReference: selectedLoanNumber,
        cif: decrypt(userProfile?.cifNumber),
        action: actionType,
        finActiveStatus: matchedObject?.status,
        finTypeId: matchedObject?.loanTypeId,
      };

      const res = await postsServices.secureAddPost(
        "api/v1/report/foreclosure-letter",
        payload
      );

      setIsLoading(false);

      if (res?.status === 200 && res?.data?.data) {
        const pdfUrl = res?.data?.data?.url;

        if (actionType === "view") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Foreclosure_View", {
            user_id: user_id,
          });
          viewPdf(pdfUrl);
          setViewPdfModal({ isOpen: true, title: "Foreclosure Letter" });
        } else if (actionType === "download") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Foreclosure_Download", {
            user_id: user_id,
          });
          downloadPdf(pdfUrl, lanNumber, "foreclosure");
          dispatch(
            setStatusPopup({
              status: "success",
              message:
                "Your foreclosure letter has been downloaded successfully. Please use your CIF as password to unlock it",
            })
          );
        } else if (actionType === "email") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Foreclosure_Email", {
            user_id: user_id,
          });
          dispatch(
            setStatusPopup({
              status: "success",
              message:
                "Foreclosure letter has been sent successfully to your registered Email ID",
            })
          );
        }
      }
    } catch (error: any) {
      logger.error("error", error);
      const errorMessage =
        error?.response?.data?.message || error || "An error occurred";
      dispatch(setStatusPopup({ status: "error", message: errorMessage }));
      setIsLoading(false);
    }
  };

  const welcomeLetter = async (actionType: string) => {
    setIsLoading(true);
    try {
      const payload = {
        lan: selectedLoanNumber,
        docCategory: "WELCOMELETTER",
        cif: userProfile?.cifNumber,
        action: actionType,
        loanCat: "term",
      };
      // const res = await postsServices.addPost(
      //   "api/v1/report/welcomeletter",
      //   payload
      // );
      const res = await postsServices.secureAddPost(
        "api/v1/report/welcomeletter",
        payload
      );
      setIsLoading(false);
      if (res?.status === 200 && res?.data?.data) {
        const pdfUrl = res?.data?.data?.url;
        if (actionType === "view") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Welcome_View", { user_id: user_id });
          viewPdf(pdfUrl);
          setViewPdfModal({ isOpen: true, title: "Welcome letter" });
        } else if (actionType === "download") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Welcome_Download", {
            user_id: user_id,
          });
          downloadPdf(pdfUrl, lanNumber, "wc");
          dispatch(
            setStatusPopup({
              status: "success",
              message: `Your welcome letter has been downloaded successfully. Please use your CIF as password to unlock it`,
            })
          );
        } else if (actionType === "email") {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dash_Doc_Welcome_Email", { user_id: user_id });
          dispatch(
            setStatusPopup({
              status: "success",
              message: `Welcome letter has been sent successfully to your registered Email ID`,
            })
          );
        }
      }
    } catch (error: any) {
      const errorMessage = error || "An error occurred";
      // const errorMessage = error.response?.data?.message || "An error occurred";
      dispatch(setStatusPopup({ status: "Error", message: errorMessage }));
      setIsLoading(false);
    }
  };

  const handleStatementAction = async (action: string, type: string) => {
    // Execute the appropriate action based on document type
    try {
      if (type == "foreclosure") {
        foreclosureLetter(action);
        return;
      } else if (!type.includes("wc")) {
        accountStatement(action, type);
      } else {
        welcomeLetter(action);
      }
    } catch (error) {
      logger.error("Failed to execute statement action:", error);
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Failed to process document request. Please try again.",
        })
      );
    }
  };

  const actionBasedOnSection = (title: string, actionType: string) => {
    logger.debug("inside action", title, actionType);
    switch (title) {
      case strings.statement_of_account:
        handleStatementAction(actionType, "soa");
        return;
      case strings.amortization_schedule:
        handleStatementAction(actionType, "schd");
        return;
      case strings.interest_certificate:
        handleStatementAction(actionType, "cert");
        return;
      case strings.prov_interest_certificate:
        handleStatementAction(actionType, "cert");
        return;
      case "Foreclosure Letter":
        handleStatementAction(actionType, "foreclosure");
        return;
      case strings.welcome_letter:
        handleStatementAction(actionType, "wc");
        return;
      case strings.no_obj_certificate:
        handleStatementAction(actionType, "noc");
        return;
      default:
        return;
    }
  };

  const viewPdf = async (pdfUrl: string) => {
    try {
      const httpsUrl = pdfUrl.replace(/^http:\/\//i, "https://");
      const response = await fetch(httpsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const blob = await response.blob();
      NavigationService.navigate(navigationStrings.PDF_SCREEN, {
        URL: response?.url,
      });
      // const url = window.URL.createObjectURL(blob);
      // setPdfUrlAccountStatement(url);
    } catch (error) {
      setIsLoading(false);
      logger.error("Error sending email:", error);
    }
  };

  const handleEmailPress = async () => {
    const email = "noreply@avanse.com";
    const subject = ""; // optional
    const body = ""; // optional

    // Build the mailto URL
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No mail app found on this device.");
      }
    } catch (err) {
      logger.error("Email open error:", err);
    }
  };

  const downloadPdf = async (pdfUrl: string, lan: string, type: string) => {
    const fileName = `${lan}_${type}.pdf`;
    const dirs = RNFetchBlob.fs.dirs;
    let filePath = "";
    try {
      if (Platform.OS === "android") {
        filePath = `${dirs.DownloadDir}/${fileName}`;
        await RNFetchBlob.config({
          fileCache: true,
          appendExt: "pdf",
          path: filePath,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: "Downloading PDF file",
            mime: "application/pdf",
            mediaScannable: true,
            path: filePath,
          },
        }).fetch("GET", pdfUrl);

        logger.debug("PDF downloaded to:", filePath);
      } else {
        // iOS: Save to app Documents then share to Files
        filePath = `${dirs.DocumentDir}/${fileName}`;
        const res = await RNFetchBlob.config({
          fileCache: true,
          appendExt: "pdf",
          path: filePath,
        }).fetch("GET", pdfUrl);

        await Share.share({
          url: "file://" + res.path(),
          title: fileName,
          message: "Download your PDF file",
        });

        logger.debug("PDF downloaded to:", filePath);
      }
    } catch (error) {
      logger.error("Error downloading PDF:", error);
      Alert.alert("Error", "Failed to download the PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const showPicker = (isStart: boolean) => {
    logger.debug("isstart", isStart);
    logger.info("sDate...........");
    setIsSelectingStart(isStart);
    setPickerVisible(true);
  };

  const handleConfirm = (date: Date) => {
    if (isSelectingStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setPickerVisible(false);
  };

  const getInterestCertLabel = () => {
    const selectedYearStripped = selectedYear?.slice(-5);
    const currentYear = moment().year();
    const currentFinYear = `${currentYear}-${(currentYear + 1)
      .toString()
      .slice(-2)}`;
    return selectedYearStripped === currentFinYear.slice(-5)
      ? "Provisional Int Certificate"
      : "Interest Certificate";
  };

  const renderDocumentSection = (title, hasDropdown = false, options) => (
    <View style={styles.card}>
      <Text
        style={[
          styles.cardTitle,
          { marginBottom: title === "Foreclosure Letter" ? 2 : 12 },
        ]}
      >
        {title}
      </Text>
      {options?.showDetails && (
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Text
            style={{
              color: colors.appThemeColor,
              fontFamily: fonts.semiBold,
              marginBottom: 12,
              marginHorizontal: 8,
              fontSize: 15,
              textDecorationLine: "underline",
              textDecorationColor: colors.appThemeColor,
              textDecorationStyle: "solid",
            }}
          >
            View Details
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.horizontalDivider} />
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            actionBasedOnSection(title, "view");
          }}
        >
          <Image source={imagePath.documentEye} style={styles.icon} />
          <Text style={styles.actionText}>{strings.view}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            actionBasedOnSection(title, "download");
          }}
        >
          <Image source={imagePath.downloadIcon} style={styles.icon} />
          <Text style={styles.actionText}>{strings.download}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            actionBasedOnSection(title, "email");
          }}
        >
          <Image source={imagePath.mailIcon} style={styles.icon} />
          <Text style={styles.actionText}>{strings.email}</Text>
        </TouchableOpacity>
      </View>
      {hasDropdown && (
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            activeOpacity={AppConstants.buttonActiveOpacity}
            style={styles.dropdown}
          >
            <Text style={{ color: colors.textValueColor }}>{selectedYear}</Text>
            <Image
              source={imagePath.downArrow}
              style={{ height: 16, width: 16, tintColor: "grey" }}
            />
          </TouchableOpacity>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setDropdownVisible(false)}
            >
              <View style={styles.modalContent}>
                {finYearsOptions?.map((option: any) => (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedYear(option.label);
                      setDropdownVisible(false);
                      setGetYear(option.value);
                    }}
                  >
                    <Text>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </View>
  );

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const fileName = `form_${Date.now()}.pdf`;
      let sourcePath = "";
      let destPath = "";
      if (Platform.OS === "ios") {
        sourcePath = `${RNFS.MainBundlePath}/form.pdf`;
        destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      } else {
        sourcePath = "form.pdf";
        destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      }

      if (Platform.OS === "android") {
        const fileData = await RNFS.readFileAssets(sourcePath, "base64");
        await RNFS.writeFile(destPath, fileData, "base64");
      } else {
        await RNFS.copyFile(sourcePath, destPath);
      }
      setIsLoading(false);
      if (Platform.OS === "ios") {
        setVisible(false);
      }
      dispatch(
        setStatusPopup({
          status: "success",
          message: ` Form downloaded successfully.`,
        })
      );
      if (Platform.OS === "ios") {
        await Share.share({
          url: "file://" + destPath,
          title: fileName,
          message: "Download your PDF file",
        });
      }
      // Alert.alert("Download Complete", `Form downloaded successfully.`);
    } catch (err) {
      setIsLoading(false);
      logger.error("Download error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{strings.documents}</Text>
        <View style={{ marginBottom: 16 }} key={`lan-dropdown-${refreshKey}`}>
          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={16}
            marginVertical={1}
            marginHorizontal={1}
          >
            {lanDropdown}
          </ShadowCardComponent>
        </View>

        <View style={styles.inputsView} key={`date-inputs-${refreshKey}`}>
          <View style={{ width: "49%" }}>
            <Text style={styles.label}>
              {strings.from_date} <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={{ width: "100%" }}>
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                onPress={() => showPicker(true)}
              >
                <TextInput
                  placeholder={strings.from_date}
                  value={moment(startDate).format("DD/MM/YYYY")}
                  editable={false}
                  pointerEvents="none"
                  style={styles.input}
                />
                <Image
                  source={imagePath.calendarIcon}
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: "49%" }}>
            <Text style={styles.label}>
              {strings.to_date} <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={{ width: "100%" }}>
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                onPress={() => showPicker(false)}
              >
                <TextInput
                  placeholder={strings.to_date}
                  value={moment(endDate).format("DD/MM/YYYY")}
                  editable={false}
                  pointerEvents="none"
                  style={styles.input}
                />
                <Image
                  source={imagePath.calendarIcon}
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="date"
          date={
            isSelectingStart ? startDate || new Date() : endDate || new Date()
          }
          display={Platform.OS == strings.ios ? "spinner" : "calendar"}
          minimumDate={minDate ?? new Date()}
          maximumDate={maxDate ?? new Date()}
          onConfirm={handleConfirm}
          onCancel={() => setPickerVisible(false)}
        />

        <View key={`document-sections-${refreshKey}`}>
          {renderDocumentSection(strings.statement_of_account)}
          {renderDocumentSection(strings.amortization_schedule)}
          {renderDocumentSection(strings.welcome_letter)}
          {isForeclosureAllowedValue &&
            renderDocumentSection("Foreclosure Letter", false, {
              showDetails: true,
            })}
          {activeValue && renderDocumentSection(strings.no_obj_certificate)}
          {renderDocumentSection(getInterestCertLabel(), true)}
        </View>

        <View style={styles.note}>
          <Image source={imagePath.info} style={{ height: 16, width: 16 }} />
          <Text style={styles.noteText}>{strings.document_note}</Text>
        </View>
        <CopyrightComponent />
        <Space />
      </ScrollView>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVisible(false)}
          style={styles.backdrop}
        />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              Appended is a quick synopsis of the foreclosure process for your
              reference.
            </Text>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              {/* <Icon name="close" size={22} color="#333" /> */}
              <Image
                source={imagePath.cross}
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: 8 }}>
            <View style={{ marginHorizontal: 20 }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Download and fill out the education loan foreclosure request
                  form for each account and share it with us to initiate the
                  foreclosure procedure.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Once we receive the updated foreclosure request form, we will
                  share all the foreclosure details within 12 working days from
                  the date of submission of the form.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  In addition, you will also receive a payment link from the
                  following email ID –{" "}
                  {/* <Text style={styles.link} onPress={handleEmailPress}> */}
                  <TouchableOpacity onPress={handleEmailPress}>
                    <Text
                      style={styles.link}
                      // onPress={() => {
                      //   NavigationService.navigate(
                      //     navigationStrings.WEB_VIEW_SCREEN,
                      //     {
                      //       URL: AppConstants.mailTo,
                      //     }
                      //   );
                      // }}
                    >
                      noreply@avanse.com
                    </Text>
                  </TouchableOpacity>
                  . You can pay online with the help of this link. However, if
                  you wish to make an offline transaction, the details will be
                  shared with you.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  The foreclosure payment will be updated in our system. This
                  process will take 15 working days, after which we will share
                  the NOC. Please note the original documents submitted at the
                  beginning of the loan process (if any) will be returned within
                  30 working days from the day of your loan closure.
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>
              Here are some of the important things to keep in mind while
              filling out the form:
            </Text>
            <View style={{ marginHorizontal: 20 }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Personal details:</Text> Fill Date,
                  full name, address, registered mobile number, and email ID
                  correctly.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Loan details:</Text> Branch name,
                  LAN, and PAN must be filled appropriately.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>In Point Number 8</Text> , you need
                  to select the source of funds for foreclosing the loan
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>In Point Number 9</Text> , please
                  capture the preferred mode of payment
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Point Number 14</Text> is about
                  insurance policy details (if any)
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  And lastly, at the end, request the relevant person to sign
                  the document before submitting the same.
                </Text>
              </View>
            </View>

            {/* <View style={styles.bulletRow}>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Loan details:</Text> Branch name, LAN,
                and PAN must be filled appropriately.
              </Text>
            </View> */}

            <Text style={styles.sectionTitle}>
              Here are some additional details for your reference:
            </Text>
            <View style={{ marginHorizontal: 20 }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Please ensure that the payment is made from the
                  applicant/co-applicant's Indian bank account or NRE/NRO
                  account, and we accept payment in Indian currency (INR = ₹)
                  only.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  You can only foreclose or make part payments post 06 months
                  from the date of the first instalment deduction.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  INR 2,950/- (INR 2,500 + 18% GST) is applicable as Document
                  Retrieval Charges. For more details, visit{" "}
                  {/* <Text style={styles.link} onPress={handleEmailPress}> */}
                  <Text
                    style={styles.link}
                    onPress={() => {
                      setVisible(false);
                      NavigationService.navigate(
                        navigationStrings.WEB_VIEW_SCREEN,
                        {
                          URL: AppConstants.responsibleLending,
                        }
                      );
                    }}
                  >
                    Responsible Lending
                  </Text>
                  .
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Charges for updating and handling the loan account would be
                  applicable as per the Schedule of Charges. For more details,
                  visit{" "}
                  {/* <Text style={styles.link} onPress={handleEmailPress}> */}
                  <Text
                    style={styles.link}
                    onPress={() => {
                      setVisible(false);
                      NavigationService.navigate(
                        navigationStrings.WEB_VIEW_SCREEN,
                        {
                          URL: AppConstants.scheduleOfCharges,
                        }
                      );
                    }}
                  >
                    Schedule Of Charges - All Products - Avanse Financial
                    Services
                  </Text>
                  .
                </Text>
              </View>
            </View>
            <View style={{ height: 20 }} />
            {/* Add your list items and paragraphs here */}
          </ScrollView>

          {/* Download Button */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadPDF}
          >
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {isLoading && <LoaderView />}
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#168794",
    marginTop: 16,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateInput: {
    flex: 0.48,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  card: {
    // backgroundColor: "#fff",
    // borderRadius: 10,
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    // marginBottom: 12,
    // elevation: 2,

    backgroundColor: colors.shadowCardBackground,
    borderRadius: moderateScale(10),
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(6),
    elevation: moderateScale(4),
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardTitle: {
    color: colors.textValueColor,
    fontFamily: fonts.semiBold,
    // marginBottom: 12,
    marginHorizontal: 8,
    fontSize: 15,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: colors.appThemeColor,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 4,
    marginLeft: 8,
  },
  dropdownWrapper: {
    marginTop: 12,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000066",
    padding: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
  },
  dropdownItem: {
    padding: 12,
    borderBottomColor: "#ddd",
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  noteText: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: fonts.regular,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    fontSize: 12,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: colors.textValueColor,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 12,
  },
  asterisk: {
    color: "red",
  },
  calendarIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  inputsView: {
    flexDirection: "row",
    flex: 1,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  icon: { height: 20, width: 20 },
  backdrop: {
    flex: 1,
    // width: "85%",
    justifyContent: "center",
    backgroundColor: "#00000099",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // maxWidth: "85%",
    maxHeight: "85%",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
    marginRight: 30,
  },
  closeButton: {
    padding: 4,
  },
  paragraph: {
    color: "#333",
    fontSize: 14,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: "#00b3b5",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 16,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#222",
    marginTop: 8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  dot: {
    fontSize: 18,
    marginRight: 6,
    color: "#00b3b5",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: "#333333",
  },
  bold: {
    fontFamily: fonts.bold,
  },
  link: {
    color: "#00b3b5",
    textDecorationLine: "underline",
  },
  listHeader: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  bulletDot: {
    fontSize: 20,
    lineHeight: 22,
    color: "#000",
    marginRight: 8,
    top: -1, // aligns vertically better
  },
});

export default DocumentScreen;
