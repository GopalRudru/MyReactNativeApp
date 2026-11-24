import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Yup from "yup";
import mainStyle from "../../res/mainStyles";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import Header from "../../components/common/Header";
import StepIndicator from "../../components/StepIndicator";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import { useDispatch, useSelector } from "react-redux";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import ListHeader from "../../components/ListHeader";
import * as NavigationService from "../../navigation/NavigationService";
import { RootState } from "../../services/redux/store";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import {
  setDocumentNewData,
  clearDocumentFormType,
  clearDocumentNewData,
} from "../../services/redux/slices/documentFormSlice";
import {
  actionRowDataSelector,
  resetDisbursementButtonValue,
} from "../../services/redux/slices/disbursementButtonSlice";
import postsServices from "../../services/api/service/postsService";
import {
  authSelector,
  userLoanCatSelector,
} from "../../services/redux/slices/authSlice";
import { formatIndianRupees } from "../../utils/formatting";
import { setDocumentFormType } from "../../services/redux/slices/documentFormSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AstricString, getInitials, Label } from "../../utils/helpers";
import strings from "../../res/strings";
import { Dropdown } from "react-native-element-dropdown";
import AppConstants from "../../constant/AppConstants";
import imagePath from "../../constant/imagePath";
import { useForm, Controller, set } from "react-hook-form";
import SearchSelectOptions from "./SearchSelectOptions";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import SelectOptions from "./SelectOptions";
import BasicDatePicker from "./BasicDatePicker";
import dayjs from "dayjs";
import InputField from "./InputField";
import service from "../../services/api/service";
import ModalPopup from "../../components/ModalPopup";
import {
  formatDate,
  getDateRangeObject,
  getDaysBetween,
} from "../../utils/dateFormatUtils";
import DisbursementFormTermDetails from "../../components/DisbursementFormTermDetails";
import DisbursementFormThanksPage from "../../components/DisbursementFormThanksPage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomSearchDropdown from "../../components/CustomSearchDropdown";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import { createModuleLogger } from "../../utils/logger";
import FundReleaseCard from "../../components/FundReleaseCard";
import { decrypt } from "../../utils/crypto";
import AccountAggregator from "./AccountAggregator";
import AddNewDocuments from "./AddNewDocuments";
import navigationStrings from "../../constant/navigationStrings";
import { useFocusEffect } from "@react-navigation/native";
import { AxiosError } from "axios";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
// Defined at module scope so their identity is stable across renders. Inside the
// component they were recreated every render, which made React remount the whole
// shimmer subtree each time; the useCallback around ShimmerRemark never helped
// because its only dependency (OptimizedShimmer) also changed every render.
const OptimizedShimmer = ({ style, ...props }: any) => (
  <ShimmerPlaceHolder LinearGradient={LinearGradient} style={style} {...props} />
);

const ShimmerRemark = () => (
  <View style={[styles.remarkContainer, { marginTop: 32 }]}>
    <View style={styles.fallbackImage}>
      <OptimizedShimmer style={styles.shimmerCicleView} />
    </View>
    <View style={styles.remarkTextContainer}>
      <OptimizedShimmer style={styles.shimmerTitle} />
      <OptimizedShimmer style={styles.shimmerDesc} />
    </View>
  </View>
);

interface Remark {
  updated_at: string;
  remark: string;
  role: string;
}

interface RemarkItem {
  role: string;
  remark: string;
  created_at: string;
}

interface ExtendedFormData extends FormData {
  disbursementFormId: any; // or the appropriate type
}

interface FormData {
  requestType: string;
  paymentTypeId: number;
  universityId: number;
  bankId: number;
  lienBankId: number;
  disbursementPurpose1: any;
  disbursementPurpose: any;
  disbursementPurposeId: any;
  changeUniversityName: boolean;
  newUniversityId?: number;
  paymentCurrencyId: any;
  paymentDate: string;
  ifsccode: string;
  accountNumber: string;
  reEnterAccountNumber: string;
  requestedAmount: string | number; // Changed from number | null to support string conversion
  overseasaddress: string;
  accHolderName: string;
  AmountPaid: string | number; // Changed from number | null to support string conversion
  countryCodeId: any;
  overseasNumber: string;
  isNewUniversity: boolean;
  loanAccountNumber: any;
  paymentMadeTo: any;
  avanseRemark: string;
  Remark: string;
  Key: string;
  accountTypeId: number;
  otherDisbursementPurpose: string;
  lienIfscCode: string;
  lienAccountHolderName: string;
  lienAccountNumber: string;
  reEnterLienAccountNumber: string;
}

interface Option {
  value: string;
  label: string;
}

interface QueryParams {
  loanAccountNumber: string | null;
}
interface FormValues {
  requestedAmount: number | "";
  // Add other fields as needed
}

const { width: deviceWidth } = Dimensions.get("window");
const isSmallDevice = deviceWidth < 361;

const DisbursementFormTerm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    changeUniversity: false,
    isLoading: false,
    isLoadingUpdate: false,
    isAddNewDocument: false,
    isConfirmed: false,
    isLoadingUpdateSave: false,
    isEditable: true,
    isEditableNext: true,
    showEditButton: false,
    buttonEnable: true,
    formID: 0,
    paymentTypeId: 0,
    errorMessage: null as string | null,
    isQueryable: false,
    isMoveToNext: false,
    formStatus: "",
    remarkId: 0,
    isRemarkHistoryList: false,
    isContinue: false,
    paymentCurrencyField: false,
    isFormSaved: false,
    accountTypeId: 0,
    errorMessageAmountPaid: null as string | null,
    focusedInput: null as string | null,
    refernceNo: "",
    showHello: false,
    showRemark: false,
    activeFunction: 0,
    isModalOpen: false,
  });

  const [dataState, setDataState] = useState({
    dataSet: {} as any,
    dataSetRemark: {} as any,
    disbList: [] as any[],
    accountTypeList: [] as any[],
  });
  const [accountNumberFocused, setAccountNumberFocused] = useState(false);


  const [accountNumberMinMaxError, setAccountNumberMinMaxError] = useState("");
  const [lienAccountNumberMinMaxError, setLienAccountNumberMinMaxError] = useState("");

  const [accountNumberError, setAccountNumberError] = useState("");
  const [lienAccountNumberError, setLienAccountNumberError] = useState("");

  const [uiState, setUiState] = useState({
    isRemarkLoading: false,
    confirmModal: false,
    cancelRemark: "",
  });
  const [bankList, setBankList] = useState<any>([]);
  const [bankListLien, setBankListLien] = useState<any>([]);
  const [aggregatorData, setAggregatorData] = useState<any>([]);
  const [validConsent, setValidConsent] = React.useState<any>(false);
  const [aggregatorNo, setAggregatorNo] = React.useState<any>("");
  const [continueButton, setContinueButton] = React.useState<any>(false);
  const [isLienTranchNonEditable, setIsLienTranchNonEditable] =
    useState<boolean>(false);

  // Persistent cache for lien data from getDefaultData.existingLienValues.
  // Stored in a ref so it is never wiped by state resets or re-renders.
  const cacheLienDataRef = useRef<any>(null);
  const setCacheLienData = (data: any) => {
    if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
      cacheLienDataRef.current = data;
    }
  };
  const getCacheLienData = () => cacheLienDataRef.current;

  const updateFormState = useCallback((updates: Partial<typeof formState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDataState = useCallback((updates: Partial<typeof dataState>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  }, []);

  const {
    changeUniversity,
    isLoading,
    isLoadingUpdate,
    isAddNewDocument,
    isConfirmed,
    isLoadingUpdateSave,
    isEditable,
    isEditableNext,
    showEditButton,
    buttonEnable,
    formID,
    paymentTypeId,
    errorMessage,
    isQueryable,
    isMoveToNext,
    formStatus,
    remarkId,
    isRemarkHistoryList,
    isContinue,
    paymentCurrencyField,
    isFormSaved,
    accountTypeId,
    errorMessageAmountPaid,
    focusedInput,
    refernceNo,
    showHello,
    showRemark,
    activeFunction,
    isModalOpen,
  } = formState;

  const { dataSet, dataSetRemark, disbList, accountTypeList } = dataState;
  const { isRemarkLoading, confirmModal, cancelRemark } = uiState;

  const setIsFormSaved = (value: boolean) =>
    updateFormState({ isFormSaved: value });
  const setConfirmModal = (value: boolean) =>
    updateUiState({ confirmModal: value });
  const [visible, setVisible] = useState(false);
  const [isLoadingUpdateNew, setIsLoadingUpdateNew] = React.useState(true);
  const setChangeUniversity = (value: boolean) =>
    updateFormState({ changeUniversity: value });
  const setIsLoadingUpdate = (value: boolean) =>
    updateFormState({ isLoadingUpdate: value });
  const setIsLoading = (value: boolean) =>
    updateFormState({ isLoading: value });
  const setRemarkId = (value: number) => updateFormState({ remarkId: value });
  const setAccountTypeId = (value: number) =>
    updateFormState({ accountTypeId: value });
  const setPaymentTypeId = (value: number) =>
    updateFormState({ paymentTypeId: value });
  const [requestType, setRequestType] = useState("");
  const setFormID = (value: number) => updateFormState({ formID: value });
  const [isDisbTypeApproved, setisDisbTypeApproved] =
    React.useState<boolean>(false);
  const [allDocsPresent, setallDocsPresent] = React.useState<boolean>(false);
  const setRefernceNo = (value: string) =>
    updateFormState({ refernceNo: value });
  const setIsRemarkHistoryList = (value: boolean) =>
    updateFormState({ isRemarkHistoryList: value });
  const setFormStatus = (value: string) =>
    updateFormState({ formStatus: value });
  const setIsAddNewDocumnet = (value: boolean) =>
    updateFormState({ isAddNewDocument: value });
  const setDisbList = (value: any[]) => updateDataState({ disbList: value });
  const setAccountTypeList = (value: any[]) =>
    updateDataState({ accountTypeList: value });
  const setDataSet = (value: any) => updateDataState({ dataSet: value });
  const setIsRemarkLoading = (value: boolean) =>
    updateUiState({ isRemarkLoading: value });
  const setCancelRemark = (value: string) =>
    updateUiState({ cancelRemark: value });
  const setErrorMessage = (value: string | null) =>
    updateFormState({ errorMessage: value });
  const setErrorMessageAmountPaid = (value: string | null) =>
    updateFormState({ errorMessageAmountPaid: value });
  const setIsContinue = (value: boolean) =>
    updateFormState({ isContinue: value });
  const setMoveToNext = (value: boolean) =>
    updateFormState({ isMoveToNext: value });
  const setIsEditable = (value: boolean) =>
    updateFormState({ isEditable: value });
  const setActiveFunction = (value: number) =>
    updateFormState({ activeFunction: value });
  const setIsModalOpen = (value: boolean) =>
    updateFormState({ isModalOpen: value });
  const [showHelloOne, setShowHelloOne] = React.useState<boolean>(false);
  const setShowHello = (value: boolean) =>
    updateFormState({ showHello: value });
  const setShowRemark = (value: boolean) =>
    updateFormState({ showRemark: value });
  const setIsLoadingUpdateSave = (value: boolean) =>
    updateFormState({ isLoadingUpdateSave: value });
  const setIsConfirmed = (value: boolean) =>
    updateFormState({ isConfirmed: value });
  const setIsQueryable = (value: boolean) =>
    updateFormState({ isQueryable: value });
  const setPaymentCurrencyField = (value: boolean) =>
    updateFormState({ paymentCurrencyField: value });
  const setShowEditButton = (value: boolean) =>
    updateFormState({ showEditButton: value });

  const isAddNewDocumnet = isAddNewDocument;

  const initialFetch = useRef(false);
  const dispatch = useDispatch();
  const { width } = Dimensions.get("window");
  const shimmerWidth = width - 32;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>();
  const logger = createModuleLogger("DisbursementFormTerm");

  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
  );
  const actionRowData = useSelector(actionRowDataSelector);
  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber,
  );
  const matchedObject = dashboardDataSet.find(
    (data: any) => data.lanNumber === selectedLoanNumber,
  );
  const lastDisbursementStatus = useSelector(
    (state: RootState) =>
      state?.disbursementButtonSlice?.lastDisbursementStatus,
  );
  const rowData = useSelector(
    (state: RootState) => state?.disbursementButtonSlice?.actionRowData,
  );
  const formStatusValue = useSelector(
    (state: RootState) => state?.documentFormSlice?.formType,
  );
  const { userProfile, businessType } = useSelector(authSelector);
  const userLoanCategory = useSelector(userLoanCatSelector);

  const isDisabled = !formState.isEditable || activeStep === 5;
  const isEnabled = formState.isMoveToNext;
  const [mobileNumberNew, setMobileNumber] = useState<string>(
    decrypt(userProfile?.phoneNumber) || "",
  );
  const [isLoadingConsent, setisLoadingConsent] = React.useState<any>(false);
  const handleInputFocus = (inputName: string) => {
    updateFormState({ focusedInput: inputName });
  };

  const convertSanctionedValue = useMemo(() => {
    const value = formatIndianRupees(
      lastDisbursementStatus?.totalSanctionedAmount,
    );
    return Number(value.replace(/[^\d.-]/g, "").split(".")[0]);
  }, [lastDisbursementStatus?.totalSanctionedAmount]);

  useEffect(() => {
    if (
      formStatus == "reject" ||
      formStatus == "approve" ||
      formStatus == "pendingFromOperationMaker" ||
      formStatus == "pendingFromLienOperationChecker" ||
      formStatus == "pendingFromOperationChecker" ||
      formStatus == "pendingFromCredit" ||
      formStatus == "pendingFromCollection" ||
      formStatus == "cancelled" ||
      formStatus == "pendingFromSalesCoordinator"
    ) {
      setContinueButton(true);
    }
    if (formStatus == "query") {
      dispatch(
        setStatusPopup({
          status: "info",
          message:
            "A query is raised on this request. Please review the remarks provided. You can then click edit to update the request details or upload additional documents as required.",
          buttonStatus: false,
        }),
      );
    }
  }, [formStatus]);

  const handleInputBlur = () => {
    updateFormState({ focusedInput: null });
  };

  const getInputStyle = (
    inputName: string,
    error?: boolean,
    additionalStyles?: any,
  ) => {
    const baseStyle: any[] = [styles.input];

    if (error) {
      baseStyle.push(styles.errorInput);
    } else if (formState.focusedInput === inputName) {
      baseStyle.push(styles.inputFocused);
    }

    if (additionalStyles) {
      baseStyle.push(additionalStyles);
    }

    return baseStyle;
  };

  const handleNext = () => {
    switch (activeStep) {
      case 0:
      case 1:
        break;
      default:
        break;
    }
    setActiveStep(1);
  };

  const handleBack = () => {
    if (formState.isFormSaved) {
      dispatch(
        setStatusPopup({
          status: "warning",
          message:
            "Unsaved data will be lost. Please save your changes before leaving this page.",
          isFunction: true,
          locationFunction: () => handleCancelIsFormSaved(),
        }),
      );
    } else {
      if (activeStep == 2) {
        setActiveStep(1);
        setStep(2);
        return;
      }
      handlePrevNavigate();
    }
  };

  /**
   * Handles the cancel action for the form and updates the state accordingly.
   *
   * This function performs the following actions:
   * 1. Sets the `isFormSaved` state to `false`.
   * 2. Dispatches an action to update the document new data state to `false`.
   * 3. Navigates to the previous page.
   *
   * @returns {void}
   */
  const handleCancelIsFormSaved = () => {
    setIsFormSaved(false);
    dispatch(clearDocumentFormType());
    handlePrevNavigate();
  };

  const handleCancelForm = () => {
    setConfirmModal(true);
  };

  const handlePrevNavigate = () => {
    dispatch(resetDisbursementButtonValue());
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
    if (step > 0) {
      setStep(step - 1);
    }
    if (step <= 0 || activeStep === 0) {
      NavigationService.goBack();
    }
  };

  const handleCheckboxChange = (checked: any) => {
    if (isEditable) {
      setChangeUniversity(checked);
      setValue("isNewUniversity", checked);
      setValue("newUniversityId", undefined);
    }

    if (!checked) {
      setValue("newUniversityId", undefined);
    }
  };

  const onSubmit = async (data: FormData, endpoint: string) => {
    try {
      setIsLoadingUpdate(true);
      setIsLoading(true);
      const createDataResponse = await postsServices.secureAddPost(
        endpoint,
        data,
      );

      const dataValue: any =
        createDataResponse?.data?.data?.saveForm?.remark?.find(
          (elem: any) => elem?.role === "customer",
        );

      setRemarkId(dataValue?.id);
      setAccountTypeId(data?.accountTypeId);
      setPaymentTypeId(data.paymentTypeId);
      setRequestType(data?.requestType);
      setFormID(createDataResponse?.data?.data?.saveForm?.id);
      AsyncStorage.setItem("disbursementFormId", String(createDataResponse?.data?.data?.saveForm?.id ?? ""));
      setRefernceNo(createDataResponse?.data?.data?.saveForm?.refernceNo);
      setIsRemarkHistoryList(true);
      setFormStatus(createDataResponse?.data?.data?.saveForm?.status);
      if (createDataResponse?.data?.data?.referenceNo) {
        setAggregatorNo(createDataResponse?.data?.data?.referenceNo);
      }
      dispatch(
        setDocumentFormType(
          createDataResponse?.data?.data?.saveForm?.formStatus,
        ),
      );

      handleIsFormSavedFalse();
      handleNext();
      setStep(2);
      setIsAddNewDocumnet(true);
    } catch (error) {
      setIsLoadingUpdate(false);
      const errorMessage = error;
      logger.error("error", error);
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: errorMessage || "Something went wrong!",
            buttonStatus: false,
          }),
        );
      }
      throw error; // So handleContinue can catch it
    } finally {
      setIsLoadingUpdate(false);
      setIsLoading(false);
    }
  };

  const handleRequestDetailsCondition = () => {
    if (getValues("requestType") == "lien") {
      return true;
    }
    return false;
  };
  const handleBankDetailsCondition = () => {
    if (getValues("paymentTypeId") == 3 && getValues("accountTypeId") == 2) {
      return true;
    } else if (getValues("paymentTypeId") == 5) {
      return true;
    } else if (
      getValues("paymentTypeId") == 1 &&
      getValues("accountTypeId") == 2
    ) {
      return true;
    } else if (
      getValues("paymentTypeId") == 1 &&
      getValues("accountTypeId") == 1
    ) {
      return false;
    } else if (
      getValues("paymentTypeId") == 4 &&
      getValues("accountTypeId") == 1
    ) {
      return false;
    } else if (
      getValues("paymentTypeId") == 3 &&
      getValues("accountTypeId") == 1
    ) {
      return false;
    }

    return false;
  };

  // const handleBankDetailsCondition = () => {
  //   if (getValues("paymentTypeId") == 3 && getValues("accountTypeId") == 2) {
  //     return true;
  //   } else if (
  //     getValues("paymentTypeId") == 1 &&
  //     getValues("accountTypeId") == 2
  //   ) {
  //     return true;
  //   } else if (
  //     getValues("paymentTypeId") == 1 &&
  //     getValues("accountTypeId") == 1
  //   ) {
  //     return false;
  //   } else if (
  //     getValues("paymentTypeId") == 4 &&
  //     getValues("accountTypeId") == 1
  //   ) {
  //     return false;
  //   } else if (
  //     getValues("paymentTypeId") == 3 &&
  //     getValues("accountTypeId") == 1
  //   ) {
  //     return false;
  //   }

  //   return false;
  // };

  const handleContinueUnderStand = async () => {
    // setOpenModalNew(true);
    // if (isXsOrSm) {
    setVisible(true);
    // } else {
    // setIsLoadingUpdate(true);
    // dispatch(
    //   setStatusPopup({
    //     status: "Important Information",
    //     // message: `One request is already raised, and its status is ${lastDisbFormStatusData?.lastDisbStatus}. You cannot raise a new request until the current request is approved or rejected. To continue with the open request, please click the action button below.`,
    //     message:
    //       "While processing the final disbursement amount, the amount marked as lien in your partner bank account will be disbursed first by lien removal and any additional funds required will be disbursed from Avanse as a tranche disbursement provided the total disbursement amount is within the sanctioned limit.\nPlease confirm to proceed.",
    //     buttonConfirm: true,
    //     btnFunc: handleContinousSave,
    //   })
    // );
    // setIsLoadingUpdate(false);
    // }
  };

  /**
   * Handles the continuous save operation for document submission.
   *
   * This function validates that every document in the form has at least one file uploaded.
   * If validation passes, it submits all documents using the `documentsServices.submitAllDocument` service.
   * Depending on the response status, it updates the loading state and active function.
   * If validation fails, it sets an error message and displays a toast notification.
   *
   * @async
   * @function handleContinousSave
   * @returns {Promise<void>} A promise that resolves when the save operation is complete.
   */
  const handleContinousSave = async (): Promise<void> => {
    setVisible(false);
    setIsConfirmed(true);
    setActiveFunction(0);

    const body = {
      disbursementFormId: formID,
      remark: watch("Remark"),
      remarkId: remarkId,
      business: businessType?.id,
      loanCategory: userLoanCategory?.TermLoan[0]?.loanCategoryId,
      type: requestType === "lien" ? "lien" : "tranche",
    };

    if (!watch("Remark")) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Remark is required field.",
          buttonStatus: false,
        }),
      );
      return;
    }

    // const response: any = await documentsServices.submitAllDocument(body);
    const response: any = await service.docs.secureSubmitAllDocument(body);
    if (response?.status == 200) {
      setActiveStep(4);
      AsyncStorage.setItem("activeFormStep", "4");
      dispatch(clearDocumentFormType());
    }
    setIsConfirmed(false);
  };

  /**
   * Converts the undisbursed loan amount from the last disbursement status to a number.
   * The amount is formatted as Indian Rupees and then stripped of any non-numeric characters
   * before being converted to a number.
   *
   * @returns {number} The undisbursed loan amount as a number.
   */
  const convertUndisbValue = useMemo(() => {
    const value = formatIndianRupees(
      lastDisbursementStatus?.loanUndisbursedAmount,
    );
    return Number(value.replace(/[^\d.-]/g, "").split(".")[0]);
  }, [lastDisbursementStatus?.loanUndisbursedAmount]);

  // Validation logic
  const handleValidateForm = () => {
    const formValues = getValues();

    let objectValue: any;
    if (showHello) {
      objectValue = {
        paymentTypeId: formValues.paymentTypeId,
        universityId: formValues.universityId,
        disbursementPurposeId: formValues.disbursementPurposeId,
        overseasaddress: formValues.overseasaddress,
        paymentCurrencyId: formValues.paymentCurrencyId,
        requestedAmount: formValues.requestedAmount,
        countryCodeId: formValues.countryCodeId,
        overseasNumber: formValues.overseasNumber,
        Remark: formValues.Remark,
        accountType: formValues.accountTypeId,
      };
    } else {
      objectValue = {
        paymentTypeId: formValues.paymentTypeId,
        universityId: formValues.universityId,
        disbursementPurposeId: formValues.disbursementPurposeId,
        paymentCurrencyId: formValues.paymentCurrencyId,
        paymentDate: formValues.paymentDate,
        requestedAmount: formValues.requestedAmount,
        overseasaddress: formValues.overseasaddress,
        AmountPaid: formValues.AmountPaid,
        countryCodeId: formValues.countryCodeId,
        overseasNumber: formValues.overseasNumber,
        paymentMadeTo: formValues.paymentMadeTo,
        Remark: formValues.Remark,
        accountType: formValues.accountTypeId,
      };
    }

    if (getValues("paymentTypeId") == 3) {
      delete objectValue?.paymentDate;
      delete objectValue?.disbursementPurposeId;
      if (!objectValue?.overseasNumber) {
        delete objectValue?.overseasNumber;
      }
      if (!objectValue?.overseasaddress) {
        delete objectValue?.overseasaddress;
      }
      if (!objectValue?.countryCodeId) {
        delete objectValue?.countryCodeId;
      }
      objectValue = {
        ...objectValue,
        otherDisbursementPurpose: formValues.otherDisbursementPurpose,
      };
    }
    if (getValues("paymentTypeId") == 5) {
      delete objectValue?.AmountPaid;
      delete objectValue?.paymentDate;
      delete objectValue?.paymentMadeTo;
      delete objectValue?.disbursementPurposeId;
      if (!objectValue?.overseasNumber) {
        delete objectValue?.overseasNumber;
      }
      if (!objectValue?.overseasaddress) {
        delete objectValue?.overseasaddress;
      }
      if (!objectValue?.countryCodeId) {
        delete objectValue?.countryCodeId;
      }
      objectValue = {
        ...objectValue,
        otherDisbursementPurpose: formValues.otherDisbursementPurpose,
      };
    }
    if (getValues("paymentTypeId") == 5 || getValues("paymentTypeId") == 3) {
      if (objectValue?.countryCodeId == null) {
        delete objectValue?.countryCodeId;
      }
      if (objectValue?.overseasNumber == "") {
        delete objectValue?.overseasNumber;
      }
      if (objectValue?.overseasaddress == "") {
        delete objectValue?.overseasaddress;
      }
      objectValue = {
        ...objectValue,
      };
    }
    if (getValues("paymentTypeId") != 1) {
      delete objectValue?.paymentDate;
      delete objectValue?.AmountPaid;
      delete objectValue?.paymentMadeTo;
      objectValue = {
        ...objectValue,
      };
    }
    if (handleBankDetailsCondition()) {
      objectValue = {
        ...objectValue,
        bankId: formValues.bankId,
        accountNumber: formValues.accountNumber,
        ifsccode: formValues.ifsccode,
        accHolderName: formValues.accHolderName,
      };
    } else {
      objectValue = {
        ...objectValue,
      };
    }

    // formatIndianRupees
    if (
      formStatus == "reject" ||
      formStatus == "approve" ||
      formStatus == "pendingFromOperationMaker" ||
      formStatus == "pendingFromLienOperationChecker" ||
      formStatus == "pendingFromOperationChecker" ||
      formStatus == "pendingFromCredit" ||
      formStatus == "pendingFromCollection" ||
      formStatus == "cancelled" ||
      formStatus == "pendingFromSalesCoordinator" ||
      (isEnabled && formStatus == "query")
    ) {
      return false;
    }

    if (formValues?.isNewUniversity == true) {
      if (
        formValues?.newUniversityId == undefined ||
        formValues?.newUniversityId == null
      ) {
        return true;
      }
    }

    if (
      objectValue?.AmountPaid &&
      Number(objectValue?.AmountPaid) > Number(convertUndisbValue) &&
      getValues("accountTypeId") == 2 &&
      getValues("requestType") != "lien"
    ) {
      return true;
    }
    if (
      objectValue?.AmountPaid &&
      Number(objectValue?.AmountPaid) > Number(convertSanctionedValue) &&
      getValues("accountTypeId") == 2 &&
      getValues("requestType") == "lien"
    ) {
      return true;
    }
    if (
      objectValue?.requestedAmount &&
      Number(objectValue?.requestedAmount) > Number(convertUndisbValue) &&
      getValues("accountTypeId") == 2 &&
      getValues("requestType") != "lien"
    ) {
      return true;
    }
    if (
      objectValue?.requestedAmount &&
      Number(objectValue?.requestedAmount) > Number(convertSanctionedValue) &&
      getValues("accountTypeId") == 2 &&
      getValues("requestType") == "lien"
    ) {
      return true;
    }

    // Add validation for lien account fields when requestType is "2"
    if (getValues("requestType") == "lien") {
      // Check if lien account fields are required and filled
      if (
        !formValues.lienBankId ||
        formValues.lienBankId === null ||
        formValues.lienBankId === undefined
      ) {
        return true;
      }
      if (
        !formValues.lienAccountNumber ||
        formValues.lienAccountNumber === ""
      ) {
        return true;
      }
      if (
        !formValues.lienAccountHolderName ||
        formValues.lienAccountHolderName === ""
      ) {
        return true;
      }
      if (!formValues.lienIfscCode || formValues.lienIfscCode === "") {
        return true;
      }
      // Validate re-enter lien account number
      if (
        !formValues.reEnterLienAccountNumber ||
        formValues.reEnterLienAccountNumber === ""
      ) {
        return true;
      }
      if (
        formValues.lienAccountNumber !== formValues.reEnterLienAccountNumber
      ) {
        return true;
      }
    }
    // Add validation for beneficiary account number re-enter field
    if (handleBankDetailsCondition()) {
      if (
        !formValues.reEnterAccountNumber ||
        formValues.reEnterAccountNumber === ""
      ) {
        return true;
      }
      if (formValues.accountNumber !== formValues.reEnterAccountNumber) {
        return true;
      }
    }

    const allAccess = otpUserData?.altAccessFlag === true;

    // Optimized validation using for-of loop instead of Object.entries().some()
    for (const [key, value] of Object.entries(objectValue)) {
      if (
        ((key === "overseasNumber" ||
          key === "overseasaddress" ||
          key === "countryCodeId") &&
          (getValues("paymentTypeId") == 3 ||
            getValues("paymentTypeId") == 5)) ||
        key === "disbursementPurposeId"
      ) {
        return false;
      }
      if (value == "" || value == null) return true;

      switch (key) {
        case "requestedAmount":
          // Skip validation for special access users with non-active status
          if (allAccess && matchedObject?.status !== "A") {
            return false;
          }
          if (
            getValues("requestType") != "lien" &&
            getValues("paymentTypeId") != 5
          ) {
            return (
              parseInt(value as string) <= 0 ||
              parseInt(value as string) > convertUndisbValue
            );
          }
          return false;
        case "AmountPaid": {
          // Skip validation for special access users with non-active status
          if (allAccess && matchedObject?.status !== "A") {
            return false;
          }

          const requestedAmount = getValues("requestedAmount");
          if (
            getValues("paymentTypeId") !== 5 &&
            getValues("accountTypeId") != 1 &&
            getValues("paymentTypeId") !== 1
          ) {
            return (
              (requestedAmount !== null &&
                Number(requestedAmount) > Number(value)) ||
              Number(value) > convertUndisbValue
            );
          }
          return false; // skip validation if paymentTypeId === 5
        }
        case "overseasNumber":
          if ((value as string).length < 7 || (value as string).length > 15)
            return true;
          return false;
        case "ifsccode":
          if (value) {
            return !/^[A-Z0-9]{11}$/.test(value as string);
          }
          return false;
        case "accountNumber":
          if (value) {
            return (
              (value as string).length < 8 || (value as string).length > 17
            );
          }
          return false;
        default:
          return false;
      }
    }

    return false;
  };

  const handleContinue = async (data: any) => {
    try {
      let continueData: any = getPayload(data, "continue");

      if (!handleValidateForm()) {
        if (!handleBankDetailsCondition()) {
          delete continueData.bankId;
          delete continueData.accountNumber;
          delete continueData.ifsccode;
          delete continueData.accHolderName;
        } else {
          delete continueData.exchangePartner;
        }
        const createData: any = {
          ...continueData,
          requestedAmount: parseInt(continueData.requestedAmount),
          disbursementFormId: formID,
          exchangePartner: "",
        };
        if (getValues("paymentTypeId") == 3 && createData.referenceNo) {
          delete createData?.disbursementFormId;
        }
        if (getValues("paymentTypeId") == 1) {
          const str = createData.AmountPaid;
          const num = parseInt(str, 10);
          createData.AmountPaid = num;
        }

        if (formStatus != "query") {
          if (remarkId > 0) {
            createData["remarkId"] = remarkId;
          }
        }

        if (refernceNo) {
          createData["referenceNo"] = refernceNo;
        }

        if (isMoveToNext === false) {
          onSubmit(createData, "api/v1/disbursement-form/create-form");
        } else {
          //handleNext();
          setActiveStep(1);
          setStep(2);
        }
      } else {
        setIsContinue(true);
      }
    } catch (error) {
      setIsLoadingUpdate(false);
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Something went wrong!",
          buttonStatus: false,
        }),
      );
    } finally {
    }
  };

  const getPayload = (
    data: FormData,
    key: string,
    existingData: FormData[] = [],
  ): FormData => {
    const {
      paymentTypeId,
      bankId,
      disbursementPurpose1,
      disbursementPurpose,
      disbursementPurposeId,
      changeUniversityName,
      overseasNumber,
      requestedAmount,
      paymentCurrencyId,
      paymentDate,
      ifsccode,
      accountNumber,
      overseasaddress,
      accHolderName,
      AmountPaid,
      countryCodeId,
      paymentMadeTo,
      Remark,
      // exchangePartner,
      newUniversityId,
      accountTypeId,
      otherDisbursementPurpose,
      requestType,
    } = data;
    type CommonFields = {
      universityId: number | null;
      isNewUniversity: boolean;
      newUniversityId: number | undefined;
      overseasNumber?: string;
      requestedAmount: string | number;
      paymentCurrencyId: any;
      loanAccountNumber: any;
      Remark: string;
      Key: string;
      accountTypeId: number | null;
      requestType: string | null;
      overseasaddress?: string | null;
      countryCodeId?: number | null;
      // Optional lien fields
      lienAccountHolderName?: string;
      lienBankId?: number | null;
      lienAccountNumber?: string;
      lienIfscCode?: string;
    };
    let commonFields: CommonFields = {
      universityId: data?.universityId || null,
      isNewUniversity: data?.isNewUniversity || false,
      newUniversityId: data.newUniversityId,
      overseasNumber,
      overseasaddress,
      countryCodeId,
      requestedAmount,
      paymentCurrencyId: paymentCurrencyId || null,
      loanAccountNumber: selectedLoanNumber, // Ensure this is set correctly
      Remark,
      Key: key,
      // exchangePartner,
      accountTypeId: accountTypeId || null,
      requestType: requestType || null,
    };

    if (requestType === "lien") {
      commonFields = {
        ...commonFields,
        lienAccountHolderName: data?.lienAccountHolderName || "",
        lienBankId: data?.lienBankId || null,
        lienAccountNumber: data?.lienAccountNumber || "",
        lienIfscCode: data?.lienIfscCode || "",
      };
    }

    // Determine universityId based on existingData
    const universityId =
      existingData[0]?.isNewUniversity === true
        ? data.universityId || existingData[0]?.universityId
        : undefined; // Do not include if not needed
    if (!commonFields?.overseasNumber) {
      delete commonFields?.overseasNumber;
    }
    if (!commonFields?.overseasaddress) {
      delete commonFields?.overseasaddress;
    }
    if (!commonFields?.countryCodeId) {
      delete commonFields?.countryCodeId;
    }
    if (paymentTypeId === 1) {
      return {
        ...commonFields,
        paymentTypeId,
        disbursementPurpose1: disbursementPurpose1 || "",
        disbursementPurpose: disbursementPurpose || "",
        disbursementPurposeId: disbursementPurposeId || null,
        paymentDate: paymentDate || "",
        // overseasaddress: overseasaddress || "",

        bankId: bankId || 0,
        accHolderName: accHolderName || "",
        ifsccode: ifsccode || "",
        accountNumber: accountNumber || "",

        AmountPaid: AmountPaid || null,
        // countryCodeId: countryCodeId || "",
        paymentMadeTo: paymentMadeTo || "",
        newUniversityId: newUniversityId,
        ...(universityId !== undefined && {
          universityId,
        }), // Include only if defined
      } as FormData;
    } else if (paymentTypeId === 2) {
      return {
        ...commonFields,
        paymentTypeId,
        disbursementPurposeId,
        // overseasaddress,
        // countryCodeId,
        ...(universityId !== undefined && {
          universityId,
        }), // Include only if defined
      } as FormData;
    } else if (paymentTypeId === 3) {
      if (!commonFields?.overseasNumber) {
        delete commonFields?.overseasNumber;
      }
      if (!commonFields?.overseasaddress) {
        delete commonFields?.overseasaddress;
      }
      if (!commonFields?.countryCodeId) {
        delete commonFields?.countryCodeId;
      }
      return {
        ...commonFields,
        // countryCodeId,
        paymentTypeId,
        otherDisbursementPurpose,
        // paymentMadeTo: paymentMadeTo || "",
        // AmountPaid: AmountPaid || null,
        bankId: bankId || 0,
        accHolderName: accHolderName || "",
        ifsccode: ifsccode || "",
        accountNumber: accountNumber || "",
        // overseasaddress,
        ...(universityId !== undefined && {
          universityId,
        }), // Include only if defined
      } as FormData;
    } else if (paymentTypeId === 4) {
      return {
        ...commonFields,
        paymentTypeId,
        disbursementPurposeId,
        // paymentMadeTo: paymentMadeTo || "",
        // paymentDate: paymentDate || "",
        // AmountPaid: AmountPaid || null,
        // overseasaddress,
        // countryCodeId,
        ...(universityId !== undefined && {
          universityId,
        }), // Include only if defined
      } as FormData;
    } else if (paymentTypeId === 5) {
      if (!commonFields.overseasNumber) {
        delete commonFields.overseasNumber;
      }
      if (!commonFields.overseasaddress) {
        delete commonFields.overseasaddress;
      }
      if (!commonFields.countryCodeId) {
        delete commonFields.countryCodeId;
      }

      return {
        ...commonFields,
        paymentTypeId,
        //disbursementPurposeId: disbursementPurposeId || null,
        otherDisbursementPurpose: otherDisbursementPurpose,
        //overseasaddress: overseasaddress || "",
        bankId: bankId || 0,
        accHolderName: accHolderName || "",
        ifsccode: ifsccode || "",
        accountNumber: accountNumber || "",
        // ...(overseasaddress ? { overseasaddress } : {}), // only add if truthy
        // ...(countryCodeId ? { countryCodeId } : {}), // only add if truthy
        newUniversityId: newUniversityId,
        ...(universityId !== undefined && {
          universityId,
        }), // Include only if defined
      } as FormData;
    }

    // Handle case if paymentTypeId is neither 1 nor 2
    return {} as FormData; // Adjust as necessary based on your requirements
  };

  /**
   * Handles the form saved state by setting the `isFormSaved` state to true
   * and dispatching an action to update the document data.
   *
   * @function handleIsFormSaved
   * @returns {void}
   */
  const handleIsFormSaved = (): void => {
    setIsFormSaved(true);
    dispatch(setDocumentNewData(true));
    dispatch(setDocumentFormType("continue"));
  };

  /**
   * Handles the action to set the form saved state to false.
   * This function updates the state to indicate that the form is not saved
   * and dispatches an action to update the document data state.
   */
  const handleIsFormSavedFalse = () => {
    setIsFormSaved(false);
    dispatch(clearDocumentNewData());
  };

  /**
   * Validates the form values based on specific business rules.
   *
   * @returns {boolean} - Returns `true` if the form values pass all validation checks, otherwise `false`.
   *
   * The validation checks include:
   * - If `showHello` is false, the `AmountPaid` should not exceed the `loanUndisbursedAmount`.
   * - If `accountTypeId` is 2, the `accountNumber` should be between 8 and 17 characters long,
   *   and the `ifsccode` should match the regex pattern `/^[A-Z0-9]{11}$/`.
   * - The `requestedAmount` should not exceed the `loanUndisbursedAmount`.
   * - The `requestedAmount` should not exceed the `AmountPaid`.
   * - The `overseasNumber` should be between 7 and 15 characters long.
   */
  const handleSaveFormValidation = (): boolean => {
    const formValues: any = getValues();

    const allAccess = otpUserData?.altAccessFlag === true;

    if (!showHello) {
      if (Number(formValues?.AmountPaid) > convertUndisbValue) {
        if (allAccess && matchedObject?.status !== "A") {
          return true;
        } else {
          return false;
        }
      }
    }

    if (formValues?.accountTypeId == 2) {
      if (formValues?.ifsccode != "" && formValues?.accountNumber?.length > 0) {
        if (
          formValues?.accountNumber?.length < 8 ||
          formValues?.accountNumber?.length > 17
        ) {
          return false;
        } else if (!/^[A-Z0-9]{11}$/.test(formValues?.ifsccode)) {
          return false;
        }
      }
    }

    if (formValues?.requestedAmount) {
      if (Number(formValues?.requestedAmount) > convertUndisbValue) {
        if (allAccess && matchedObject?.status !== "A") {
          return true;
        } else {
          return false;
        }
      }
    } else if (formValues?.requestedAmount && formValues?.AmountPaid) {
      if (
        Number(formValues?.requestedAmount) > Number(formValues?.AmountPaid)
      ) {
        if (allAccess && matchedObject?.status !== "A") {
          return true;
        } else {
          return false;
        }
      }
    }

    if (formValues?.overseasNumber) {
      if (
        formValues?.overseasNumber.length < 7 ||
        formValues?.overseasNumber.length > 15
      ) {
        return false;
      }
    }

    return true;
  };

  const handleSave = async (data: FormData) => {
    if (!handleSaveFormValidation()) {
      return;
    }

    setIsLoadingUpdateSave(true);
    setIsLoading(true);

    const payload: any = {
      ...data, // Spread the existing FormData
      Key: "save",
      disbursementFormId: formID,
      requestedAmount: parseInt(String(data.requestedAmount)),
      loanAccountNumber: selectedLoanNumber,
    };
    if (formStatus != "query") {
      if (remarkId > 0) {
        payload["remarkId"] = remarkId;
      }
    }
    if (isQueryable) {
      payload["type"] = 1;
    }

    if (refernceNo) {
      payload["referenceNo"] = refernceNo;
    }

    try {
      const response = await postsServices.secureAddPost(
        "api/v1/disbursement-form/save-form",
        payload,
      );
      setFormID(response?.data?.data?.id);
      AsyncStorage.setItem("disbursementFormId", String(response?.data?.data?.id ?? ""));
      setIsContinue(false);
      if (typeof response?.data?.data?.remark === "object") {
        const setRemarkIdValue: any = response?.data?.data?.remark.find(
          (elem: any) => elem?.role === "customer",
        );
        if (setRemarkIdValue?.role == "customer") {
          setRemarkId(setRemarkIdValue?.id);
        }
      }
      setFormStatus("save");
      setRefernceNo(response?.data?.data?.refernceNo);
      setIsRemarkHistoryList(true);
      handleIsFormSavedFalse();
      // // Handle success response
      dispatch(
        setStatusPopup({
          status: "success",
          message: "Data saved successfully.",
          buttonStatus: false,
        }),
      );
    } catch (error) {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: "An error occurred during save.",
            buttonStatus: false,
          }),
        );
      }
    } finally {
      setIsLoadingUpdateSave(false);
      setIsLoading(false);
    }
  };

  const formIdpayload =
    rowData === ""
      ? lastDisbursementStatus?.lastDisbFormId
      : rowData?.disbFormId;

  const loanTypeId = useSelector(
    (state: RootState) =>
      state?.dashboardData?.sanctionedDisbursedData[0]?.loanTypeId,
  );

  useEffect(() => {
    if (formStatus == "query") {
      dispatch(
        setStatusPopup({
          status: "info",
          message:
            "A query is raised on this request. Please review the remarks provided. You can then click edit to update the request details or upload additional documents as required.",
          buttonStatus: false,
        }),
      );
    }
  }, [formStatus]);

  useEffect(() => {
    let isMounted = true;

    const processResponseData = (response: any) => {
      if (!isMounted) return;
      const defaultData: any = response?.data?.data?.getDefaultData;
      const existingData = response?.data?.data?.getExistingData || [];
      const lienData: any =
        response?.data?.data?.getDefaultData?.existingLienValues || [];
      setCacheLienData(response?.data?.data?.getDefaultData?.existingLienValues || []);

      logger.info("lienData Data.................:", lienData);
      const remarksArray = existingData?.remark || [];
      let avanseRemarks = "";
      let customerRemarks = "";

      // Core form status setup
      setFormID(existingData?.id);
      setChangeUniversity(existingData?.isNewUniversity);
      setisDisbTypeApproved(response?.data?.data?.isDisbTypeApproved);
      setallDocsPresent(response?.data?.data?.allDocsPresent);
      if (response?.data?.data?.getExistingData?.status == "cancelled") {
        setFormStatus(response?.data?.data?.getExistingData?.status);
      } else {
        setFormStatus(
          response?.data?.data?.getExistingData?.formStatus == "save"
            ? "save"
            : response?.data?.data?.getExistingData?.status,
        );
      }

      if (typeof existingData === "object") {
        dispatch(setDocumentFormType(existingData?.formStatus));
        const dataValue: any = response?.data?.data?.getExistingData;
        const dataStatus: boolean = response?.data?.data?.allDocsPresent;
        setIsRemarkHistoryList(true);
        setPaymentTypeId(dataValue?.paymentTypeId);
        setRequestType(dataValue?.requestType);
        setAccountTypeId(dataValue?.accountTypeId);
        setRefernceNo(dataValue?.refernceNo);

        AsyncStorage.getItem("activeFormStep").then((activeStepValue) => {
          if (!isMounted) return;
          if (activeStepValue === "3") {
            setActiveStep(3);
          } else {
            if (
              dataValue?.requestType === "lien" &&
              dataValue?.formStatus == ""
            ) {
              setActiveStep(2);
            } else if (dataValue?.formStatus == "continue") {
              //ToDo
              // const params = new URLSearchParams(window.location.search);
              // const consent = params.get("consent");
              // if (consent != "true") {
              //   if (dataStatus == true) {
              //     setActiveStep(2);
              //   } else {
              //     setActiveStep(1);
              //   }
              // }

              if (dataStatus == true && dataValue?.requestType === "lien") {
                setActiveStep(2);
                setStep(3);
                setIsAddNewDocumnet(false);
              } else {
                setActiveStep(1);
                setStep(2);
                setIsAddNewDocumnet(true);
              }
              //setActiveStep(1);
              //setStep(3);
              //setIsAddNewDocumnet(true);
            }
          }
        });

        if (Object.keys(existingData).length > 0) {
          setPaymentCurrencyField(existingData?.paymentTypeId === 1);
          handleInvokeDisbursementPurposeApi(existingData?.paymentTypeId);

          const roleStatus: any = existingData?.remark.find(
            (elem: any) => elem?.role === "Avanse",
          );
          if (roleStatus?.remark) setShowRemark(true);

          const setRemarkIdValue: any = existingData?.remark.find(
            (elem: any) => elem?.role === "customer",
          );
          setRemarkId(setRemarkIdValue?.id);
        }
      }

      // Remarks processing
      remarksArray.forEach((item: Remark) => {
        if (item.role === "Avanse") {
          avanseRemarks += `${item.remark.trim()} `;
        } else if (item.role === "customer") {
          customerRemarks += `${item.remark.trim()} `;
        }
      });

      setValue("avanseRemark", avanseRemarks.trim());
      setValue("Remark", customerRemarks.trim());
      setShowHello(existingData?.paymentTypeId === 2);

      if (
        existingData?.paymentTypeId === 3 ||
        existingData?.paymentTypeId === 4 ||
        existingData?.paymentTypeId === 5
      ) {
        setShowHelloOne(true);
      } else {
        setShowHelloOne(false); // Optional: reset if it's not 2
      }

      defaultData["AccountType"] = [
        { id: 1, accountType: "International Account" },
        { id: 2, accountType: "Indian Account" },
      ];

      defaultData["RequestType"] = [
        {
          id: "tranche",
          requestType: "New Tranche",
        },
        {
          id: "lien",
          requestType: "Fund Release from Lien A/c",
        },
      ];

      setDataSet(defaultData);
      if (
        rowData &&
        rowData?.lienValues.find((item: any) => item.status === "query")
      ) {
        setIsQueryable(true);
      }

      // Check if lienValues contains both 'lien' and 'tranche' types with specific statuses
      const lienTranchNonEditableValue =
        rowData?.lienValues?.length === 2 &&
        rowData.lienValues.some(
          (item: any) => item.type === "lien" && item.status === "approved",
        ) &&
        rowData.lienValues.some(
          (item: any) => item.type === "tranche" && item.status === "query",
        );

      setIsLienTranchNonEditable(lienTranchNonEditableValue);

      // Prepare updated form data
      let updatedData: FormData;
      if (
        rowData?.status === "approve" ||
        rowData?.status === "reject" ||
        rowData?.status === "cancelled"
      ) {
        setMoveToNext(true);
        setIsEditable(false);
        setShowEditButton(false);
        updatedData = {
          ...existingData,
          avanseRemark: avanseRemarks.trim(),
          Remark: customerRemarks.trim(),
          Key: "continue",
          universityId: existingData?.universityId || null,
          paymentCurrencyId: existingData?.paymentCurrencyId || null,
          newUniversityId: existingData?.newUniversityId || null,
          reEnterAccountNumber: existingData?.accountNumber || "",
          reEnterLienAccountNumber: existingData?.lienAccountNumber || "",
        };
      } else if (rowData?.status == "query") {
        setIsQueryable(true);
        setMoveToNext(true);
        setIsEditable(false);
        setShowEditButton(true);
        updatedData = {
          ...existingData,
          avanseRemark: avanseRemarks.trim(),
          Remark: customerRemarks.trim(),
          Key: "continue",
          paymentCurrencyId: existingData?.paymentCurrencyId || null,
          newUniversityId: existingData?.newUniversityId || null,
          reEnterAccountNumber: existingData?.accountNumber || "",
          reEnterLienAccountNumber: existingData?.lienAccountNumber || "",
        };
      } else if (
        rowData?.status == "pendingFromAvanse" ||
        rowData?.status == "pendingFromOperationMaker" ||
        rowData?.status == "pendingFromOperationChecker" ||
        rowData?.status == "pendingFromCredit" ||
        rowData?.status == "pendingFromCollection" ||
        rowData?.status == "pendingFromSalesCoordinator" ||
        rowData?.status == "pendingFromLienOperationChecker" ||
        rowData?.status == "pending" ||
        rowData?.status=="partiallyApproved"
      ) {
        setIsEditable(false);
        setMoveToNext(true);
        updatedData = {
          ...existingData,
          avanseRemark: avanseRemarks.trim(),
          Remark: customerRemarks.trim(),
          Key: "continue",
          paymentCurrencyId: existingData?.paymentCurrencyId || null,
          newUniversityId: existingData?.newUniversityId || null,
          reEnterAccountNumber: existingData?.accountNumber || "",
          reEnterLienAccountNumber: existingData?.lienAccountNumber || "",
        };
      } else if (
        lastDisbursementStatus.lastDisbFormStatus === "approve" ||
        lastDisbursementStatus.lastDisbFormStatus === "reject"
      ) {
        updatedData = {
          otherDisbursementPurpose: "",
          accountTypeId: 0,
          paymentTypeId: 0,
          universityId: 0,
          bankId: 0,
          disbursementPurpose1: "",
          disbursementPurpose: "",
          disbursementPurposeId: "",
          changeUniversityName: false,
          paymentCurrencyId: null,
          paymentDate: "",
          ifsccode: "",
          accountNumber: "",
          requestedAmount: "",
          overseasaddress: "",
          accHolderName: "",
          AmountPaid: 0,
          countryCodeId: "",
          overseasNumber: "",
          isNewUniversity: false,
          loanAccountNumber: selectedLoanNumber,
          paymentMadeTo: "",
          avanseRemark: "",
          Remark: "",
          Key: "save",
          newUniversityId: 0,
          requestType: "",
          lienAccountNumber: "",
          lienIfscCode: "",
          lienBankId: 0,
          lienAccountHolderName: "",
          reEnterAccountNumber: "",
          reEnterLienAccountNumber: "",
        };
      } else {
        updatedData = {
          ...existingData,
          avanseRemark: avanseRemarks.trim(),
          Remark: customerRemarks.trim(),
          Key: "continue",
          paymentCurrencyId: existingData?.paymentCurrencyId || null,
          newUniversityId: existingData?.newUniversityId || null,
          lienAccountNumber: existingData?.lienAccountNumber
            ? existingData?.lienAccountNumber
            : lienData?.lienAccountNumber
            ? lienData?.lienAccountNumber
            : "",
          lienIfscCode: existingData?.lienIfscCode
            ? existingData?.lienIfscCode
            : lienData?.lienIfscCode
            ? lienData?.lienIfscCode
            : "",
          lienBankId: existingData?.lienBankId
            ? existingData?.lienBankId
            : lienData?.lienBankId
            ? lienData?.lienBankId
            : existingData?.lienBankId,
          lienAccountHolderName: existingData?.lienAccountHolderName
            ? existingData?.lienAccountHolderName
            : lienData?.lienAccountHolderName
            ? lienData?.lienAccountHolderName
            : "",
          reEnterAccountNumber: existingData?.accountNumber || "",
          reEnterLienAccountNumber: existingData?.lienAccountNumber
            ? existingData?.lienAccountNumber
            : lienData?.lienAccountNumber
            ? lienData?.lienAccountNumber
            : "",
        };
        if (lastDisbursementStatus?.loanUndisbursedAmount < 1) {
          handleIsFormSaved();
          updatedData.requestType = "lien";
          setShowHello(true);
          handleBankNameLien();
        }
      }

      // Reset form with updated data
      reset(updatedData);

      // Stop loading after minimum shimmer delay
      setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 300);
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let resolvedFormId = formIdpayload;
        if (!resolvedFormId && rowData === "") {
          const storedId = await AsyncStorage.getItem("disbursementFormId");
          resolvedFormId = storedId ? Number(storedId) : undefined;
        }
        
        let payloadData: any = {};
        if (Object.keys(rowData).length <= 0) {
          payloadData = {
            formId: resolvedFormId,
            type: 1,
            loanAccountNumber: selectedLoanNumber,
          };
        } else {
          payloadData = { formId: resolvedFormId };
        }
        if (
          loanTypeId != undefined &&
          loanTypeId != null &&
          loanTypeId != "" &&
          loanTypeId != 0
        ) {
          payloadData["loanTypeId"] = loanTypeId;
        }

        let response;
        if (resolvedFormId) {
          response = await postsServices.secureAddPost(
            "api/v1/disbursement-form/default",
            payloadData,
          );
        } else {
          response = await postsServices.secureAddPost(
            "api/v1/disbursement-form/default",
            { loanAccountNumber: selectedLoanNumber },
          );
        }
        processResponseData(response);
      } catch (error) {
        logger.error(String(error));
        setIsLoading(false);
      }
    };

    if (!initialFetch.current) {
      fetchData();
      initialFetch.current = true;
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLoanNumber, reset, lastDisbursementStatus, formIdpayload]);

  /**
   * Handles the invocation of the Disbursement Purpose API.
   *
   * This function sends a POST request to the specified endpoint with the provided payment type ID.
   * If the request is successful, it updates the disbursement list state with the response data.
   * If an error occurs, it logs the error to the console.
   *
   * @param {any} value - The payment type ID to be sent in the request body.
   * @returns {Promise<void>} - A promise that resolves when the API call is complete.
   */
  const handleInvokeDisbursementPurposeApi = async (
    value: any,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await postsServices.secureAddPost(
        "api/v1/disbursement-form/disbursement-purpose",
        {
          paymentTypeId: value.value || value, // Ensure value is in the correct format
        },
      );
      setDisbList(response?.data?.data?.disbPurspose);
      setAccountTypeList(response?.data?.data?.accountType);

      // Update dataSet with RequestType from API response
      if (response?.data?.data?.requestType) {
        setDataSet((prevDataSet: any) => ({
          ...prevDataSet,
          RequestType: response?.data?.data?.requestType,
        }));
      }

      // if (response?.data?.data?.accountType.length === 1) {
      //   setValue("accountTypeId", response?.data?.data?.accountType?.[0]?.id);
      //   if (response?.data?.data?.accountType?.[0]?.id == 1) {
      //     setValue("paymentCurrencyId", 30);
      //   } else {
      //     setValue("paymentCurrencyId", 13);
      //   }
      // }
      if (response?.data?.data?.accountType.length === 1) {
        setValue("accountTypeId", response?.data?.data?.accountType?.[0]?.id);
        if (response?.data?.data?.accountType?.[0]?.id == 1) {
          if (
            watch("requestedAmount") == "" ||
            watch("paymentCurrencyId") == 13
          ) {
            setValue("paymentCurrencyId", 30);
          }
        } else {
          setValue("paymentCurrencyId", 13);
        }
      } else {
        if (
          response?.data?.data?.accountType?.[0]?.id == watch("accountTypeId")
        ) {
          if (
            watch("requestedAmount") == "" ||
            watch("paymentCurrencyId") == 13
          ) {
            setValue("paymentCurrencyId", 30);
          }
        } else if (
          response?.data?.data?.accountType?.[1]?.id == watch("accountTypeId")
        ) {
          if (watch("requestedAmount") == "") {
            setValue("paymentCurrencyId", 13);
          }
        }
      }

      if (response?.data?.data?.disbPurspose?.length === 1) {
        setValue(
          "disbursementPurposeId",
          response?.data?.data?.disbPurspose?.[0]?.id,
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const options = useMemo(() => {
    const seen = new Set<string>();
    const unsorted: { value: any; label: string }[] = [];
    (dataSet?.UniversityData || []).forEach((uc: any) => {
      const name = uc.name.trim();
      if (!seen.has(name)) {
        seen.add(name);
        unsorted.push({ value: uc.id, label: name });
      }
    });
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      if (!sortedCache) {
        sortedCache = [...unsorted].sort((a, b) =>
          a.label.localeCompare(b.label),
        );
      }
      return sortedCache;
    };
  }, [dataSet?.UniversityData]);

  // const options1 = useMemo(
  //   () =>
  //     (dataSet?.UniversityData || [])
  //       .filter(
  //         (uc: any, index: number, self: any[]) =>
  //           index === self.findIndex((u) => u.name === uc.name)
  //       )
  //       .sort((a: any, b: any) => a.name.localeCompare(b.name))
  //       .map((uc: any) => ({
  //         value: uc.id,
  //         label: uc.name.trim(),
  //       })),
  //   [dataSet?.UniversityData]
  // );

  const options1 = useMemo(() => {
    const seen = new Set<string>();
    const unsorted: { value: any; label: string }[] = [];
    (dataSet?.UniversityData || []).forEach((uc: any) => {
      const name = uc.name.trim();
      if (!seen.has(name)) {
        seen.add(name);
        unsorted.push({ value: uc.id, label: name });
      }
    });
    // Lazy sorting: sort only when accessed
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      // if (!sortedCache) {
      //   sortedCache = [...unsorted].sort((a, b) =>
      //     a.label.localeCompare(b.label)
      //   );
      // }
      // logger.info("Generating ### options1");
      // return sortedCache;
      return unsorted;
    };
  }, [dataSet?.UniversityData]);

  // const options1 = useMemo(() => {
  //   const seen = new Set<string>();
  //   const result: { value: any; label: string }[] = [];
  //   (dataSet?.UniversityData || []).forEach((uc: any) => {
  //     const name = uc.name.trim();
  //     if (!seen.has(name)) {
  //       seen.add(name);
  //       result.push({ value: uc.id, label: name });
  //     }
  //   });
  //   // Sort eagerly
  //   return result.sort((a, b) => a.label.localeCompare(b.label));
  // }, [dataSet?.UniversityData]);

  // const options2 = useMemo(
  //   () =>
  //     dataSet?.defaultUniversity?.map((uc: any) => ({
  //       value: uc.id,
  //       label: uc.name.trim(),
  //     })) || [],
  //   [dataSet?.defaultUniversity]
  // );

  const optionsUniverisityName = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: any; label: string }[] = [];
    (dataSet?.defaultUniversity || []).forEach((uc: any) => {
      const name = uc.name.trim();
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ value: uc.id, label: name });
      }
    });
    // Directly sort and return the result, no lazy cache
    //return result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }, [dataSet?.defaultUniversity]);

  const options2 = useMemo(() => {
    const seen = new Set<string>();
    const unsorted: { value: any; label: string }[] = [];
    (dataSet?.defaultUniversity || []).forEach((uc: any) => {
      const name = uc.name.trim();
      if (!seen.has(name)) {
        seen.add(name);
        unsorted.push({ value: uc.id, label: name });
      }
    });

    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      if (!sortedCache) {
        sortedCache = [...unsorted].sort((a, b) =>
          a.label.localeCompare(b.label),
        );
      }
      return sortedCache;
    };
  }, [dataSet?.defaultUniversity]);

  // const phoneCodeOptions = useMemo(
  //   () =>
  //     dataSet.PhoneCodes?.filter(
  //       (pc: any, index: number, self: any[]) =>
  //         index === self.findIndex((p) => p.countryCode === pc.countryCode)
  //     )
  //       .sort((a: any, b: any) => a.countryCode - b.countryCode)
  //       .map((pc: any) => ({
  //         value: pc.id,
  //         label: `+${pc.countryCode}`,
  //       })) || [],
  //   [dataSet.PhoneCodes]
  // );

  const phoneCodeOptions = useMemo(() => {
    // Deduplicate using Set, but do not sort immediately
    const seen = new Set<string>();
    const unsorted: { value: any; label: string }[] = [];
    (dataSet.PhoneCodes || []).forEach((pc: any) => {
      const code = String(pc.countryCode);
      if (!seen.has(code)) {
        seen.add(code);
        unsorted.push({ value: pc.id, label: `+${code}` });
      }
    });
    // Lazy sorting: sort only when accessed
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      if (!sortedCache) {
        sortedCache = [...unsorted].sort(
          (a, b) =>
            Number(a.label.replace("+", "")) - Number(b.label.replace("+", "")),
        );
      }
      return sortedCache;
    };
  }, [dataSet.PhoneCodes]);

  // Memoize all dropdown options to prevent recalculation
  // const paymentTypeOptions = useMemo(() =>
  //   dataSet.PaymentType?.map((bd: any) => ({
  //     value: bd.id,
  //     label: bd.paymentType,
  //   })) || [],
  //   [dataSet.PaymentType]
  // );

  const paymentTypeOptions = useMemo(() => {
    const seen = new Set<any>();
    const unsorted: { value: any; label: string }[] = [];
    (dataSet.PaymentType || []).forEach((bd: any) => {
      if (!seen.has(bd.id)) {
        seen.add(bd.id);
        unsorted.push({ value: bd.id, label: bd.paymentType });
      }
    });
    //return unsorted;
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      // if (!sortedCache) {
      //   sortedCache = [...unsorted].sort((a, b) => a.label.localeCompare(b.label));
      // }
      // return sortedCache;
      return unsorted;
    };
  }, [dataSet.PaymentType]);

  // const disbursementPurposeOptions = useMemo(() =>
  //   disbList?.map((bd: any) => ({
  //     value: bd.id,
  //     label: bd.disbursementPurpose,
  //   })) || [],
  //   [disbList]
  // );

  const disbursementPurposeOptions = useMemo(() => {
    const seen = new Set<any>();
    const unsorted: { value: any; label: string }[] = [];
    (disbList || []).forEach((bd: any) => {
      if (!seen.has(bd.id)) {
        seen.add(bd.id);
        unsorted.push({ value: bd.id, label: bd.disbursementPurpose });
      }
    });
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      // if (!sortedCache) {
      //   sortedCache = [...unsorted].sort((a, b) => a.label.localeCompare(b.label));
      // }
      // return sortedCache;
      return unsorted;
    };
  }, [disbList]);

  // const accountTypeOptions = useMemo(() =>
  //   accountTypeList?.map((bd: any) => ({
  //     value: bd.id,
  //     label: bd.accountType,
  //   })) || [],
  //   [accountTypeList]
  // );

  /**
   * Lazily generates and sorts account type dropdown options.
   * - Deduplicates by id using a Set (O(n) time, O(n) space).
   * - Sorting is deferred until options are accessed (lazy loading).
   * - Avoids blocking the main UI thread by not sorting on every render.
   * - Returns a function for fast rendering and minimal memory usage.
   */
  const accountTypeOptions = useMemo(() => {
    const seen = new Set<any>();
    const unsorted: { value: any; label: string }[] = [];
    // Deduplicate and collect options without sorting
    (accountTypeList || []).forEach((bd: any) => {
      if (!seen.has(bd.id)) {
        seen.add(bd.id);
        unsorted.push({ value: bd.id, label: bd.accountType });
      }
    });
    // Lazy sort: only sort when accessed
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      // if (!sortedCache) {
      //   sortedCache = [...unsorted].sort((a, b) => a.label.localeCompare(b.label));
      // }
      // return sortedCache;
      return unsorted;
    };
  }, [accountTypeList]);

  const currencyOptions = useMemo(
    () =>
      dataSet.Curencies?.map((uc: any) => ({
        value: uc.id,
        label: uc.currencyDescription,
      })) || [],
    [dataSet.Curencies],
  );

  // const filteredCurrencyOptions = useMemo(() =>
  //   dataSet.Curencies?.filter((uc: any) =>
  //     !(watch("accountTypeId") === 1 && uc.id === 13)
  //   ).map((uc: any) => ({
  //     value: uc.id,
  //     label: uc.currencyDescription,
  //   })) || [],
  //   [dataSet.Curencies, watch("accountTypeId")]
  // );

  /**
   * Lazily generates and sorts filtered currency dropdown options.
   * - Step 1: Get current accountTypeId (fast lookup, O(1)).
   * - Step 2: Deduplicate and filter currencies in a single pass (O(n) time, O(n) space).
   * - Step 3: Avoid blocking UI thread by deferring sorting until options are accessed (lazy loading).
   * - Step 4: Use a Set to avoid duplicate currency IDs (minimal memory usage).
   * - Step 5: Return a function that sorts only once and caches the result for fast repeated rendering.
   */
  const filteredCurrencyOptions = useMemo(() => {
    const accountTypeId = watch("accountTypeId"); // Step 1: Get account type
    const seen = new Set<any>(); // Step 4: Deduplicate by currency ID
    const unsorted: { value: any; label: string }[] = [];
    // Step 2: Filter and deduplicate in one pass
    for (const uc of dataSet.Curencies || []) {
      if (!(accountTypeId === 1 && uc.id === 13) && !seen.has(uc.id)) {
        seen.add(uc.id);
        unsorted.push({ value: uc.id, label: uc.currencyDescription });
      }
    }
    // Step 3 & 5: Lazy sort and cache result
    let sortedCache: { value: any; label: string }[] | null = null;
    return () => {
      if (!sortedCache) {
        sortedCache = [...unsorted].sort((a, b) =>
          a.label.localeCompare(b.label),
        );
      }
      return sortedCache;
    };
  }, [dataSet.Curencies, watch("accountTypeId")]);

  // useEffect(() => {
  //   if (options2?.length > 0) {
  //     setValue("universityId", options2[0].value);
  //   }
  // }, [options2]);

  useEffect(() => {
    if (optionsUniverisityName?.length > 0 && !watch("universityId")) {
      setValue("universityId", optionsUniverisityName[0].value);
    }
  }, [optionsUniverisityName, watch("universityId")]);

  const handleFromDateChange = (date: any) => {
    // Date change logic can be added here if needed
  };

  const handleFunctionForStep2 = (step: number, nextClick: boolean = false) => {
    if (requestType === "lien") {
      if (activeStep === 1 && step === 2 && nextClick) {
        setStep(3);
      } else {
        setStep(step);
      }
      setActiveFunction(step);
      setallDocsPresent(true);
      //setActiveStep(step);
      //setStep(step);
    } else if (step === 1) {
      setActiveFunction(1);
      setActiveStep(1);
      setStep(1);
    } else {
      setActiveFunction(2);
      //setActiveFunction(3);
      //setActiveStep(3);
    }

    // setActiveFunction(step);
    // if (step != 2)
    //    setStep(1);
  };

  // Utility function to validate account number match
  const validateAccountNumberMatch = (
    original: string,
    reEnter: string,
  ): boolean => {
    return original === reEnter && original !== "" && reEnter !== "";
  };

  /**
   * Validates the form fields based on the provided field name.
   *
   * @param fieldValue - The name of the field to validate.
   * @returns A string containing the validation error message if the field is invalid, otherwise an empty string.
   *
   * The function checks if the form can continue (`isContinue` is true) and validates the specified field.
   * It returns appropriate error messages for the following fields if they are invalid:
   * - `paymentTypeId`: "Payment Type is required."
   * - `universityId`: "University is required."
   * - `paymentCurrencyId`: "Payment Currency is required."
   * - `requestedAmount`: "Requested Amount is required."
   * - `disbursementPurposeId`: "Disbursement Purpose is required."
   * - `exchangePartner`: "Exchange Partner is required."
   * - `countryCodeId`: "Country Code is required."
   * - `overseasNumber`: "Overseas Number is required."
   * - `overseasaddress`: "Overseas Address is required."
   * - `paymentDate`: "Payment Date is required."
   * - `bankId`: "Bank Name is required."
   * - `ifsccode`: "IFSC Number is required."
   * - `accountNumber`: "Account Number is required."
   * - `paymentMadeTo`: "Payment Made To is required."
   * - `AmountPaid`: "Amount Paid is required."
   * - `accHolderName`: "Account Holder Name is required."
   * - `Remark`: "Remark is required."
   *
   * If the field is valid or `isContinue` is false, it returns an empty string.
   */
  const handleFormValidation = (fieldValue: string) => {
    // Special cases for fields that should always validate (like matching fields)
    if (fieldValue === "lienAccountNumber") {
      // Only check required validation when form is being submitted
      if (handleRequestDetailsCondition() && isContinue) {
        if (
          getValues("lienAccountNumber") == null ||
          getValues("lienAccountNumber") == ""
        ) {
          return "Lien Account Number is required.";
        }
      }
      return "";
    }

    if (isContinue) {
      switch (fieldValue) {
        case "requestType": {
          return getValues("requestType") == ""
            ? "Request Type is required."
            : "";
        }
        case "paymentTypeId": {
          return getValues("paymentTypeId") == null
            ? "Payment Type is required."
            : "";
        }
        case "accountTypeId": {
          return getValues("accountTypeId") == null
            ? "Account Type is required."
            : "";
        }
        case "universityId": {
          return getValues("universityId") == null
            ? "University is required."
            : "";
        }
        case "requestedAmount": {
          return getValues("requestedAmount") == ""
            ? "Requested Amount is required."
            : getValues("requestType") != "lien" &&
              getValues("accountTypeId") != 1 &&
              (Number(getValues("requestedAmount")) <= 0 ||
                Number(getValues("requestedAmount")) > convertUndisbValue)
            ? "Requested Amount must not be greater than undisbursed loan amount."
            : Number(getValues("requestedAmount")) >
                Number(convertSanctionedValue) &&
              getValues("accountTypeId") == 2 &&
              getValues("requestType") == "lien"
            ? "Requested Amount must not be greater than the sanctioned loan amount."
            : "";
        }
        // case "requestedAmount": {
        //   return getValues("requestedAmount") == ""
        //     ? "Requested Amount is required."
        //     : "";
        // }
        case "disbursementPurposeId": {
          return getValues("disbursementPurposeId") == null
            ? "Disbursement Purpose is required."
            : "";
        }
        // case "exchangePartner": {
        //   return getValues("exchangePartner") == ""
        //     ? "Exchange Partner is required."
        //     : "";
        // }
        case "countryCodeId": {
          return getValues("countryCodeId") != null &&
            getValues("countryCodeId") != 0 &&
            getValues("paymentTypeId") != 1 &&
            getValues("paymentTypeId") != 2 &&
            getValues("paymentTypeId") != 4 &&
            getValues("paymentTypeId") != 3 &&
            getValues("paymentTypeId") != 5
            ? "Country Code is required."
            : "";
        }
        case "overseasNumber": {
          return getValues("overseasNumber") !== "" &&
            getValues("paymentTypeId") != 1 &&
            getValues("paymentTypeId") != 2 &&
            getValues("paymentTypeId") != 4 &&
            getValues("paymentTypeId") != 3 &&
            getValues("paymentTypeId") != 5
            ? "Overseas Number is required."
            : "";
        }
        case "overseasaddress": {
          return getValues("overseasaddress") != "" &&
            getValues("paymentTypeId") != 1 &&
            getValues("paymentTypeId") != 2 &&
            getValues("paymentTypeId") != 4 &&
            getValues("paymentTypeId") != 3 &&
            getValues("paymentTypeId") != 5
            ? "Overseas Address is required."
            : "";
        }
        case "paymentDate": {
          return getValues("paymentDate") == ""
            ? "Payment Date is required."
            : "";
        }
        case "paymentCurrencyId": {
          return getValues("paymentCurrencyId") == null
            ? "Payment Currency is required."
            : "";
        }

        case "newUniversityId": {
          return getValues("isNewUniversity") &&
            getValues("newUniversityId") == null
            ? "New University is required."
            : "";
        }

        // =============================================================================
        case "bankId": {
          return handleBankDetailsCondition() && getValues("bankId") == null
            ? "Bank Name is required."
            : "";
        }
        case "ifsccode": {
          return handleBankDetailsCondition() && getValues("ifsccode") == ""
            ? "IFSC Number is required."
            : "";
        }
        case "accountNumber": {
          return handleBankDetailsCondition() &&
            (getValues("accountNumber") == null ||
              getValues("accountNumber") == "")
            ? "Account Number is required."
            : "";
        }
        case "accHolderName": {
          return handleBankDetailsCondition() &&
            getValues("accHolderName") == ""
            ? "Account Holder Name is required."
            : "";
        }
        // =============================================================================
        // =============================================================================
        case "lienBankId": {
          return handleRequestDetailsCondition() && !getValues("lienBankId")
            ? "Debit Bank is required."
            : "";
        }
        case "lienIfscCode": {
          return handleRequestDetailsCondition() &&
            getValues("lienIfscCode") == ""
            ? "IFSC Number is required."
            : "";
        }

        case "lienAccountHolderName": {
          return handleRequestDetailsCondition() &&
            getValues("lienAccountHolderName") == ""
            ? "Account Holder Name is required."
            : "";
        }
        case "reEnterLienAccountNumber": {
          if (
            handleRequestDetailsCondition() &&
            (getValues("reEnterLienAccountNumber") == null ||
              getValues("reEnterLienAccountNumber") == "")
          ) {
            return "Re-enter Account Number is required.";
          }
          if (
            handleRequestDetailsCondition() &&
            !validateAccountNumberMatch(
              getValues("lienAccountNumber"),
              getValues("reEnterLienAccountNumber"),
            )
          ) {
            return "Account Number does not match.";
          }
          return "";
        }
        // =============================================================================
        case "reEnterAccountNumber": {
          if (
            handleBankDetailsCondition() &&
            (getValues("reEnterAccountNumber") == null ||
              getValues("reEnterAccountNumber") == "")
          ) {
            return "Re-enter Account Number is required.";
          }
          if (
            handleBankDetailsCondition() &&
            !validateAccountNumberMatch(
              getValues("accountNumber"),
              getValues("reEnterAccountNumber"),
            )
          ) {
            return "Account Number does not match.";
          }
          return "";
        }
        case "paymentMadeTo": {
          return getValues("paymentMadeTo") == ""
            ? "Payment Made To is required."
            : "";
        }
        case "AmountPaid": {
          return getValues("requestType") != "lien" &&
            getValues("accountTypeId") != 1 &&
            (Number(getValues("requestedAmount")) >
              Number(getValues("AmountPaid")) ||
              Number(getValues("AmountPaid")) > convertUndisbValue)
            ? "Amount Paid must not be greater than undisbursed loan amount."
            : Number(getValues("AmountPaid")) >
                Number(convertSanctionedValue) &&
              getValues("accountTypeId") != 1 &&
              getValues("requestType") == "lien"
            ? "Amount Paid must not be greater than the sanctioned loan amount."
            : "";
        }

        case "Remark": {
          return getValues("Remark") == "" ? "Remark is required." : "";
        }
        case "otherDisbursementPurpose": {
          return getValues("otherDisbursementPurpose") == ""
            ? "Disbursement Purpose is required."
            : "";
        }
        default: {
          return "";
        }
      }
    } else {
      return "";
    }
  };

  const otpUserData = useSelector((state: RootState) => state.auth.otpUserData);
  /**
   * Handles the change event for the requested disbursement amount input field.
   * It validates the input value against the amount paid and the undisbursed loan amount,
   * and sets appropriate error messages if the validation fails.
   *
   * @param {any} event - The change event triggered by the input field.
   */
  const handleRequestedDisbAmount = (event: any) => {
    handleIsFormSaved();

    if (getValues("paymentTypeId") != 1) {
      setErrorMessage(null);
      return;
    }

    // Safely parse AmountPaid, removing commas, defaulting to 0
    const amountPaid = Number(
      (watch("AmountPaid") || "0").toString().replace(/,/g, ""),
    );
    const requestedAmount = Number((event || "0").toString().replace(/,/g, ""));
    const undisbursedAmount = Number(
      (convertUndisbValue || "0").toString().replace(/,/g, ""),
    );

    const allAccess = otpUserData?.altAccessFlag === true;
    if (allAccess && matchedObject?.status !== "A") {
      setErrorMessage(null);
      return;
    }

    if (!showHello && requestedAmount > amountPaid) {
      setErrorMessage(
        "The requested disbursement amount cannot exceed the amount paid.",
      );
    }
    // else if (requestedAmount > undisbursedAmount) {
    //   setErrorMessage(
    //     "Requested Amount must not be greater than the undisbursed loan amount."
    //   );
    // }
    else {
      setErrorMessage(null);
    }
  };

  /**
   * Handles the change event for the requested disbursement amount input field.
   * It validates the input value against the amount paid and the undisbursed loan amount,
   * and sets appropriate error messages if the validation fails.
   *
   * @param {any} event - The change event triggered by the input field.
   */
  const handleAmountPaid = (event: any) => {
    handleIsFormSaved();

    // Safely parse AmountPaid, removing commas, defaulting to 0
    const requestedAmount = Number(
      (watch("requestedAmount") || "0").toString().replace(/,/g, ""),
    );
    const paidAmount = Number((event || "0").toString().replace(/,/g, ""));
    const undisbursedAmount = Number(
      (convertUndisbValue || "0").toString().replace(/,/g, ""),
    );

    const allAccess = otpUserData?.altAccessFlag === true;
    if (allAccess && matchedObject?.status !== "A") {
      setErrorMessageAmountPaid(null);
      if (requestedAmount <= paidAmount) {
        setErrorMessage(null);
      }
      return;
    }

    if (!showHello && paidAmount < requestedAmount) {
      setErrorMessageAmountPaid(
        "The paid amount cannot be less than the requested disbursement amount.",
      );
    } else if (paidAmount > undisbursedAmount) {
      setErrorMessageAmountPaid(
        "Paid Amount must not be greater than the undisbursed loan amount.",
      );
    } else {
      setErrorMessageAmountPaid(null);
      if (requestedAmount <= paidAmount) {
        setErrorMessage(null);
      }
    }
  };

  /**
   * Handles the display of the new university selection form.
   *
   * This function returns a JSX fragment containing a checkbox to indicate whether the user wants to change the university,
   * and if the checkbox is checked, it displays a dropdown to select the new university.
   *
   * @returns {JSX.Element} A fragment containing the form elements for changing the university.
   *
   * @component
   * @example
   * // Example usage:
   * const element = handleShowNewUniversity();
   *
   * @remarks
   * - The checkbox is controlled by the `isNewUniversity` field from the form.
   * - The dropdown for selecting the new university is controlled by the `newUniversityId` field from the form.
   * - The `isEditable` prop determines whether the form elements are enabled or disabled.
   * - The `changeUniversity` state determines whether the dropdown is displayed.
   * - The `options1` prop provides the options for the university dropdown.
   * - The `setIsFormSaved` prop is a callback function to update the form's saved state.
   */
  const getButton = () => {
    if (
      formStatus != "query" &&
      formStatus != "pendingFromOperationMaker" &&
      formStatus != "pendingFromOperationChecker" &&
      formStatus != "pendingFromLienOperationChecker" &&
      formStatus != "pendingFromCredit" &&
      formStatus != "pendingFromCollection" &&
      formStatus != "pendingFromSalesCoordinator" &&
      formStatus != "approve" &&
      formStatus != "reject" &&
      formStatus != "cancelled"
    ) {
      return (
        <></>
        // <TouchableOpacity
        //   style={[
        //     styles.editBtn,
        //     { paddingHorizontal: isSmallDevice ? 6 : 16 },
        //   ]}
        //   activeOpacity={AppConstants.buttonActiveOpacity}
        //   onPress={() => {
        //     if (formStatus == "query") {
        //       setActiveStep(1);
        //     } else {
        //       setActiveStep(0);
        //       setStep(1);
        //     }
        //     setFormStatus(
        //       formStatus == "query"
        //         ? "query"
        //         : formStatus == "pendingFromOperationMaker"
        //         ? "pendingFromOperationMaker"
        //         : formStatus === "pendingFromCredit"
        //         ? "pendingFromCredit"
        //         : formStatus == "pendingFromCollection"
        //         ? "pendingFromCollection"
        //         : formStatus == "pendingFromSalesCoordinator"
        //         ? "pendingFromSalesCoordinator"
        //         : formStatus == "approve"
        //         ? "approve"
        //         : formStatus == "cancelled"
        //         ? "cancelled"
        //         : "save"
        //     );
        //   }}
        // >
        //   <Image source={imagePath.editImage} style={styles.editIcon} />
        //   <Text style={[styles.borderBtnTextStyle, { color: colors.white }]}>
        //     {strings.edit}
        //   </Text>
        // </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { paddingHorizontal: isSmallDevice ? 6 : 16 },
          ]}
          activeOpacity={AppConstants.buttonActiveOpacity}
          onPress={() => {
            if (formStatus == "query") {
              setActiveStep(1);
            } else {
              setActiveStep(0);
              setStep(1);
            }
            setFormStatus(
              formStatus == "query"
                ? "query"
                : formStatus == "pendingFromSalesCoordinator"
                ? "pendingFromSalesCoordinator"
                : formStatus == "pendingFromOperationMaker"
                ? "pendingFromOperationMaker"
                : formStatus == "pendingFromLienOperationChecker"
                ? "pendingFromLienOperationChecker"
                : formStatus == "pendingFromOperationChecker"
                ? "pendingFromOperationChecker"
                : formStatus == "pendingFromCredit"
                ? "pendingFromCredit"
                : formStatus == "pendingFromCollection"
                ? "pendingFromCollection"
                : formStatus == "approve"
                ? "approve"
                : formStatus == "cancelled"
                ? "cancelled"
                : "save",
            );
          }}
        >
          <Image source={imagePath.backArrow} style={styles.leftArrowIcon} />
          <Text style={styles.borderBtnTextStyle}>{strings.previous}</Text>
        </TouchableOpacity>
      );
    }
  };

  //--------------------------------

  const validationSchema = Yup.object().shape({
    paymentTypeId: Yup.string().required("Payment type is required"),
    disbursementPurpose: Yup.string().required(
      "Disbursement Purpose is required",
    ),
    accountType: Yup.string().required("Account type is required"),
    university: Yup.string().required("University is required"),
    newNameOfTheUniversity: Yup.string().required(
      "New Name of the University is required",
    ),
    currency: Yup.string().required("Currency is required"),
    amount: Yup.string()
      .matches(/^[0-9]+$/, "Only numeric value allowed")
      .required("Amount is required"),
    countryCode: Yup.string().required("Country code is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{6,15}$/, "Enter a valid mobile number")
      .required("Mobile number is required"),
    address: Yup.string().required("Overseas Address is required"),
    remark: Yup.string().required("Remark is required"),
    bankName: Yup.string().required("Bank name is required"),
    accNumber: Yup.string().required("Account number is required"),
    IfscCode: Yup.string().required("IFSC code is required"),
    AccHolderName: Yup.string().required("Account holder name is required"),
    paymentDate: Yup.string().required("Payment date is required"),
    paymentMode: Yup.string().required("Payment made is required"),
    amountPaid: Yup.string()
      .matches(/^[0-9]+$/, "Only numeric value allowed")
      .required("Amount paid is required"),
  });

  const initialValues = {
    paymentTypeId: Number,
    disbursementPurpose: "",
    accountType: "",
    university: "(MIT) MAHARASHTRA INSTITUTE OF TECHNOLOGY",
    newNameOfTheUniversity: "",
    currency: "",
    paymentDate: "",
    paymentMode: "",
    amount: "",
    amountPaid: "",
    countryCode: "",
    mobile: "",
    address: "",
    bankName: "",
    accNumber: "",
    IfscCode: "",
    AccHolderName: "",
    remark: "",
  };

  const handleBackPress = () => {
    if (val == 4) {
      NavigationService.navigate(navigationStrings.REQUEST_FOR_DISBURSEMENT, {
        showFeedback: true,
      });
    } else {
      NavigationService.goBack();
    }
  };

  // Memoized shimmer styles for better performance
  const shimmerStyles = useMemo(
    () => ({
      fieldContainer: { marginBottom: 0, marginTop: 15 },
      labelShimmer: {
        width: shimmerWidth * 0.5,
        height: 14,
        borderRadius: 4,
        marginBottom: 8,
      },
      fieldShimmerBase: {
        width: "100%",
        borderRadius: 8,
      },
      buttonRow: {
        // flexDirection: "row" as const,
        // justifyContent: "space-between" as const,
        marginTop: 32,
      },
      bankDetailsContainer: { marginTop: 16 },
      remarkContainer: { marginTop: 16 },
      remarkLabel: {
        width: shimmerWidth * 0.5,
        height: 12,
        borderRadius: 4,
        marginBottom: 8,
      },
      remarkField: {
        width: "100%",
        height: 80,
        borderRadius: 8,
      },
    }),
    [shimmerWidth],
  );

  // Memoized shimmer buttons array to prevent recreation
  const shimmerButtons = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => ({
        key: `shimmer-btn-${i}`,
        style: {
          width: (shimmerWidth - 48) / 2,
          height: 40,
          borderRadius: 6,
        },
      })),
    [shimmerWidth],
  );

  // Memoized loading state buttons
  const loadingStateButtons = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        key: `btn-shimmer-${i}`,
        style: {
          marginVertical: 5,
          width: "100%",
          // width: (shimmerWidth - 48) / 4,
          height: 40,
          borderRadius: 6,
        },
      })),
    [shimmerWidth],
  );

  // Optimized shimmer component with better performance
  // Memoized shimmer field component
  const ShimmerField = ({ height = 45 }: { height?: number }) => (
    <View style={shimmerStyles.fieldContainer}>
      <OptimizedShimmer style={shimmerStyles.labelShimmer} />
      <OptimizedShimmer style={[shimmerStyles.fieldShimmerBase, { height }]} />
    </View>
  );

  // Comprehensive loading state component
  const LoadingStateShimmer = () => (
    <>
      {/* Remarks */}
      <View style={shimmerStyles.remarkContainer}>
        <OptimizedShimmer style={shimmerStyles.remarkLabel} />
        <OptimizedShimmer style={shimmerStyles.remarkField} />
      </View>

      {/* Buttons */}
      <View style={shimmerStyles.buttonRow}>
        {loadingStateButtons.map((button) => (
          <OptimizedShimmer key={button.key} style={button.style} />
        ))}
      </View>
    </>
  );

  const renderField = (height = 45) => <ShimmerField height={height} />;

  const shimmerCard = () => {
    return (
      <>
        <View style={shimmerStyles.fieldContainer}>{renderField()}</View>
        {renderField()}
        {renderField()}
        {renderField()}
        {renderField(90)}
        {renderField()}
        {renderField()}
        {renderField()}

        {/* Bank Details */}
        <View style={shimmerStyles.bankDetailsContainer}>
          {renderField()}
          {renderField()}
          {renderField()}
          {renderField()}
          {renderField()}
        </View>
        <View style={shimmerStyles.buttonRow}>
          {shimmerButtons.map((button) => (
            <OptimizedShimmer key={button.key} style={button.style} />
          ))}
        </View>
      </>
    );
  };

  const handleRemarkChange = (event: any) => {
    const debounce = (func: Function, delay: number) => {
      let timer: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
      };
    };

    const handleDebouncedRemarkChange = debounce((value: string) => {
      setValue("Remark", value);
    }, 300);

    handleDebouncedRemarkChange(event);
  };

  /**
   * Handles the click event for the filter button.
   *
   * This function performs the following actions:
   * 1. Sets the loading state to false.
   * 2. Makes an API call to fetch the remarks history based on the provided disbursement request ID and role.
   * 3. Updates the state with the fetched data.
   * 4. Handles any errors that occur during the API call by setting the loading state to false.
   * 5. Opens the modal.
   *
   * @returns {void}
   */
  const handleFilterButtonClick = async () => {
    setIsModalOpen(true);
    setIsLoading(false);
    setIsRemarkLoading(true);
    try {
      const response = await postsServices.secureGetPosts(
        `api/v1/remarks/history?disbursementRequestId=${formID}&role=customer`,
      );
      updateDataState({ dataSetRemark: response?.data?.data || [] });
    } catch (error) {
      // Drop stale remarks so a failed request cannot display the previously
      // loaded history, and record the failure instead of swallowing it.
      updateDataState({ dataSetRemark: [] });
      logger.error("Failed to load remark history", error);
    } finally {
      // Single exit path: these run on success and failure alike, so the
      // shimmer can never stay stuck and the modal always opens.
      setIsRemarkLoading(false);
      // setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBankName = async () => {
    const response = await postsServices.secureAddPost(
      "api/v1/lien-bank-details/fetch",
      {},
    );
    setBankList(response?.data?.data);
  };

  const handleBankNameLien = async () => {
    const response = await postsServices.secureAddPost(
      "api/v1/lien-bank-details/fetch",
      {},
    );
    setBankListLien(response?.data?.data);
  };

  // Memoized handler for requestType change
  const handleRequestTypeChange = useCallback(
    (selected: any) => {
      const timeoutId = setTimeout(() => {
        clearErrors("requestType");
        handleIsFormSaved();
        setValue("requestType", String(selected.value));
        setShowHello(selected.value === "lien");
        if (selected.value === "lien") {
          handleBankNameLien();
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    },
    [
      clearErrors,
      handleIsFormSaved,
      setValue,
      setShowHello,
      handleBankNameLien,
    ],
  );

  // Memoized handler for paymentType change
  const handlePaymentTypeChange = useCallback(
    (value: any) => {
      // Reduce timeout for better UX
      const timeoutId = setTimeout(() => {
        clearErrors("paymentTypeId");
        handleInvokeDisbursementPurposeApi(value);
        handleIsFormSaved();
        setValue("paymentTypeId", Number(value.value));
        setShowHello(Number(value.value) === 2);
        setShowHelloOne(
          value.value === 3 || value.value === 4 || value.value === 5,
        );
      }, 50);
      return () => clearTimeout(timeoutId);
    },
    [
      clearErrors,
      handleInvokeDisbursementPurposeApi,
      handleIsFormSaved,
      setValue,
      setShowHello,
      setShowHelloOne,
    ],
  );

  const findSelectedBankDetailsById = (dataList: any, bankId: any) => {
    return dataList?.find((bank: any) => bank.id === bankId);
  };

  const maxBankAccountNumberLength = (dataList: any, bankId: any) => {
    const bank = findSelectedBankDetailsById(dataList, bankId);
    if (bank) {
      return bank.maxLength || 30; // Default to 30 if maxLength is not defined
    }
    return 30;
  };

  const maxBankAccountNumberMinLength = (dataList: any, bankId: any) => {
    const bank = findSelectedBankDetailsById(dataList, bankId);
    if (bank) {
      return bank.minLength; // Default to 8 if minLength is not defined
    }
    return 1;
  };

  const renderStepContent = (uniqueSortedBankData: any, val: any) => {
    const lienAccountNumber = getValues("lienAccountNumber");
    switch (val) {
      case 0:
        return (
          <>
            {isLoading ? (
              shimmerCard()
            ) : (
              <>
                <>
                  <AstricString label="Request Type" style={styles.label} />

                  <Controller
                    name="requestType"
                    control={control}
                    rules={{
                      required: "Request Type is required.",
                    }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Dropdown
                        data={
                          dataSet?.RequestType?.map((bd: any) => ({
                            value: bd.id,
                            label: bd.requestType,
                          })) || []
                        }
                        labelField="label"
                        valueField="value"
                        value={watch("requestType")}
                        onChange={handleRequestTypeChange}
                        placeholder=""
                        style={[styles.dropdown, error && styles.errorBorder]}
                        placeholderStyle={styles.dropDownTextStyle}
                        selectedTextStyle={styles.dropDownTextStyle}
                        disable={
                          isLienTranchNonEditable ||
                          !isEditable ||
                          convertUndisbValue < 1 ||
                          isDisbTypeApproved
                        }
                      />
                    )}
                  />

                  {!!errors.requestType?.message && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {errors.requestType.message}
                    </Text>
                  )}
                </>
                {/* Payment Type */}
                <>
                  <AstricString
                    label={strings.Payment_Type}
                    style={styles.label}
                  />

                  <Controller
                    name="paymentTypeId"
                    control={control}
                    rules={{
                      required: "Payment Type is required.",
                    }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Dropdown
                        // data={paymentTypeOptions()}
                        data={paymentTypeData || []}
                        labelField="label"
                        valueField="value"
                        value={watch("paymentTypeId")}
                        onChange={handlePaymentTypeChange}
                        placeholder=""
                        style={[styles.dropdown, error && styles.errorBorder]}
                        placeholderStyle={styles.dropDownTextStyle}
                        selectedTextStyle={styles.dropDownTextStyle}
                        disable={
                          !isEditable ||
                          isLienTranchNonEditable /*|| formStatus === 'save'*/
                        }
                      />
                    )}
                  />

                  {!!errors.paymentTypeId?.message && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {errors.paymentTypeId.message}
                    </Text>
                  )}
                </>

                {/* Disbursement Purpose */}
                <>
                  {disbList &&
                  (getValues("paymentTypeId") === 3 ||
                    getValues("paymentTypeId") === 5) ? (
                    <Controller
                      name="otherDisbursementPurpose"
                      control={control}
                      rules={{
                        required: "Disbursement purpose is required.",
                      }}
                      render={({
                        field: { onChange, onBlur, value },
                        fieldState: { error },
                      }) => (
                        <InputField
                          label="Disbursement Purpose"
                          placeholder="Disbursement Purpose "
                          value={value}
                          onChange={(val: string) => {
                            const filtered = val
                              .replace(/[^a-zA-Z ]/g, "")
                              .trimStart();
                            onChange(filtered);
                            handleIsFormSaved();
                          }}
                          onBlur={() => {
                            onChange(value?.trim() ?? "");
                            onBlur();
                          }}
                          editable={
                            isLienTranchNonEditable ? false : isEditable
                          }
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      name="disbursementPurposeId"
                      control={control}
                      rules={{
                        required: "Disbursement purpose is required.",
                      }}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <SelectOptions
                          label="Disbursement Purpose"
                          isMandatory={true}
                          options={disbursementPurposeOptions()}
                          value={value}
                          onChange={(selectedValue: any) => {
                            const timeoutId = setTimeout(() => {
                              handleIsFormSaved();
                              onChange(selectedValue);
                            }, 50);
                            return () => clearTimeout(timeoutId);
                          }}
                          disabled={
                            !isEditable ||
                            disbList?.length <= 1 ||
                            isLienTranchNonEditable
                          }
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                </>

                {/* Account Type */}
                <>
                  <Controller
                    name="accountTypeId"
                    control={control}
                    rules={{
                      required: "Account Type is required.",
                      validate: (value) => {
                        if (
                          value === undefined ||
                          value === null ||
                          value === 0 ||
                          String(value) === "" ||
                          String(value) === "0"
                        ) {
                          return "Account Type is required.";
                        }
                        return true;
                      },
                    }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <SelectOptions
                        label="Account Type"
                        isMandatory={true}
                        options={accountTypeOptions()}
                        value={value}
                        onChange={(selectedValue: any) => {
                          const timeoutId = setTimeout(() => {
                            handleIsFormSaved();
                            onChange(selectedValue);
                            clearErrors("paymentCurrencyId");
                            if (selectedValue === 2) {
                              setValue("paymentCurrencyId", 13);
                              setPaymentCurrencyField(true);
                            } else {
                              setValue("paymentCurrencyId", 30);
                              setPaymentCurrencyField(false);
                            }
                          }, 0);
                          return () => clearTimeout(timeoutId);
                        }}
                        disabled={
                          !isEditable ||
                          accountTypeList?.length <= 1 ||
                          isLienTranchNonEditable
                        }
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </>

                {/* university name */}
                {showHello ? (
                  <>
                    <Controller
                      name="universityId"
                      control={control}
                      render={({ field: { onChange, value, name } }) => (
                        <CustomSearchDropdown
                          options={(() => {
                            const opts2 = options2();
                            return opts2.length > 0 ? opts2 : options();
                          })()}
                          label="Name of the University"
                          isMandatory={true}
                          value={value || ""}
                          onChange={(selectedValue) => {
                            setIsFormSaved?.(true);
                            onChange(selectedValue);
                          }}
                          disabled={
                            !isEditable ||
                            options2?.length > 0 ||
                            isDisbTypeApproved ||
                            isLienTranchNonEditable
                          }
                          helperText={handleFormValidation("universityId")}
                          error={!!handleFormValidation("universityId")}
                          placeholder="Select University"
                          isChangeUniversity={true}
                          handleChangeUniversity={handleCheckboxChange}
                          changeUniversityValue={changeUniversity}
                          singleLine={true}
                          isLienTranchNonEditable={isLienTranchNonEditable}
                        />
                      )}
                    />
                    <>
                      {changeUniversity && (
                        <>
                          <Controller
                            name="newUniversityId"
                            control={control}
                            rules={{
                              required: "New University is required.",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <CustomSearchDropdown
                                options={options1()}
                                label="New Name of the University"
                                title="Select university"
                                isMandatory={true}
                                value={getValues("newUniversityId") || ""}
                                onChange={(selectedValue) => {
                                  setIsFormSaved?.(true);
                                  onChange(selectedValue);
                                }}
                                disabled={
                                  !isEditable || isLienTranchNonEditable
                                }
                                helperText={error?.message}
                                error={!!error}
                                placeholder=""
                                singleLine={true}
                              />
                            )}
                          />
                        </>
                      )}
                    </>

                    {/* currency for payment */}
                    <>
                      <Controller
                        name="paymentCurrencyId"
                        rules={{ required: "Payment Currency is required." }}
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <CustomSearchDropdown
                            options={filteredCurrencyOptions()}
                            label="Currency For Payment"
                            title="Select currency for payment"
                            isMandatory={true}
                            value={value || ""}
                            onChange={(selectedValue: any) => {
                              setIsFormSaved?.(true);
                              onChange(selectedValue);
                            }}
                            disabled={
                              !isEditable ||
                              watch("paymentCurrencyId") == 13 ||
                              isLienTranchNonEditable
                            }
                            helperText={error?.message}
                            error={!!error}
                            placeholder=""
                          />
                        )}
                      />
                    </>

                    {/* Requested Amount for disbursement */}
                    <>
                      <Controller
                        name="requestedAmount"
                        control={control}
                        rules={{
                          required: "Requested amount is required",
                          validate: (value) => {
                            if (
                              formStatus == "reject" ||
                              formStatus == "approve" ||
                              formStatus == "pendingFromOperationMaker" ||
                              formStatus == "pendingFromLienOperationChecker" ||
                              formStatus == "pendingFromOperationChecker" ||
                              formStatus == "pendingFromCredit" ||
                              formStatus == "pendingFromCollection" ||
                              formStatus == "cancelled" ||
                              formStatus == "pendingFromSalesCoordinator" ||
                              (isEnabled && formStatus == "query")
                            ) {
                              return true;
                            }
                            // Early validation checks
                            if (!value || value === "") {
                              return "Requested Amount is required.";
                            }

                            if (isNaN(Number(value))) {
                              return "Amount must be a number.";
                            }

                            const requestedAmount = Number(value);
                            const requestType = getValues("requestType");
                            const accountTypeId = getValues("accountTypeId");

                            // Validation for non-lien requests with non-international accounts
                            if (requestType !== "lien" && accountTypeId !== 1) {
                              if (
                                requestedAmount <= 0 ||
                                requestedAmount > convertUndisbValue
                              ) {
                                return "Requested Amount must not be greater than undisbursed loan amount.";
                              }
                            }

                            // Validation for lien requests with Indian accounts
                            if (requestType === "lien" && accountTypeId === 2) {
                              if (
                                requestedAmount > Number(convertSanctionedValue)
                              ) {
                                return "Requested Amount must not be greater than the sanctioned loan amount.";
                              }
                            }

                            // All validations passed
                            return true;
                          },
                        }}
                        render={({
                          field: { onChange, value, onBlur },
                          fieldState: { error },
                        }) => (
                          <View>
                            <AstricString
                              label={strings.Requested_Amount_For_Disbursement}
                              style={styles.label}
                            />

                            <TextInput
                              style={[
                                styles.input,
                                {
                                  borderColor: error?.message
                                    ? styles.errorInput.borderColor
                                    : styles.input.borderColor,
                                  maxHeight: 43,
                                  height: 43,
                                },
                              ]}
                              placeholderTextColor="#a5a3ae"
                              value={value?.toString() ?? ""}
                              onFocus={() =>
                                handleInputFocus("requestedAmount1")
                              }
                              onBlur={() => {
                                handleInputBlur();
                                onBlur();
                              }}
                              onChangeText={(text) => {
                                handleIsFormSaved?.();
                                const numericText = text.replace(/[^0-9]/g, "");
                                onChange(numericText);
                                handleRequestedDisbAmount(numericText);
                                clearErrors("requestedAmount");
                              }}
                              placeholder="Requested Amount For Disbursement *"
                              keyboardType="numeric"
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                            />

                            {/* {!!error?.message && (
                              <Text style={styles.error}>{error.message}</Text>
                            )} */}

                            {!errorMessage && !!error?.message && (
                              <Text style={styles.error}>{error.message}</Text>
                            )}
                            {errorMessage && (
                              <Text style={styles.error}>{errorMessage}</Text>
                            )}
                          </View>
                        )}
                      />
                    </>

                    {/* overseas mobile number */}
                    <>
                      {/* <AstricString
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      /> */}
                      <Label
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      />

                      {/* Container for Country Code and Mobile Number .... */}
                      <View style={[styles.row, { gap: 5 }]}>
                        {/* Country Code Dropdown */}
                        <View style={{ flex: 1.2, height: 40 }}>
                          <Controller
                            name="countryCodeId"
                            control={control}
                            // rules={{
                            //   required: "Country Code is required.",
                            // }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <View style={{ marginTop: -20, width: "100%" }}>
                                <CustomSearchDropdown
                                  options={phoneCodeOptions()}
                                  value={value || ""}
                                  title="Select country code"
                                  onChange={(selectedValue: any) => {
                                    handleIsFormSaved?.();
                                    setValue("countryCodeId", selectedValue);
                                    onChange(selectedValue);
                                  }}
                                  // isMandatory={false}
                                  // error={!!error}
                                  // helperText={error?.message}
                                  disabled={
                                    !isEditable || isLienTranchNonEditable
                                  }
                                  placeholder="Search "
                                />
                              </View>
                            )}
                          />
                        </View>

                        {/* Mobile Number Input */}
                        <View style={{ flex: 2.8 }}>
                          <Controller
                            name="overseasNumber"
                            control={control}
                            // rules={{
                            //   required: "Overseas mobile number is required.",
                            //   minLength: {
                            //     value: 7,
                            //     message: "Must be at least 7 digits.",
                            //   },
                            //   maxLength: {
                            //     value: 15,
                            //     message: "Must not exceed 15 digits.",
                            //   },
                            //   pattern: {
                            //     value: /^[0-9]+$/,
                            //     message: "Only numeric digits are allowed.",
                            //   },
                            // }}
                            render={({
                              field: { onChange, value, onBlur },
                              fieldState: { error },
                            }) => (
                              <>
                                <TextInput
                                  style={[
                                    getInputStyle("overseasNumber1", !!error, {
                                      fontSize: 15,
                                    }),
                                    { height: 43 },
                                  ]}
                                  placeholderTextColor="#a5a3ae"
                                  value={value}
                                  onFocus={() =>
                                    handleInputFocus("overseasNumber1")
                                  }
                                  onBlur={() => {
                                    handleInputBlur();
                                    onBlur();
                                  }}
                                  onChangeText={(text: string) => {
                                    handleIsFormSaved?.();
                                    // Remove any non-numeric characters
                                    const numericText = text.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    onChange(numericText);
                                  }}
                                  editable={
                                    isLienTranchNonEditable ? false : isEditable
                                  }
                                  keyboardType="numeric"
                                  placeholder="Please Enter Mobile Number"
                                  maxLength={15}
                                  numberOfLines={1}
                                />
                                {/* {!!error?.message && (
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: "red",
                                      marginTop: 4,
                                    }}
                                  >
                                    {error.message}
                                  </Text>
                                )} */}
                              </>
                            )}
                          />
                        </View>
                      </View>
                    </>

                    {/* Overseas Address */}
                    <>
                      <Controller
                        name="overseasaddress"
                        control={control}
                        // rules={{
                        //   required: "Overseas Address is required.",
                        // }}
                        render={({
                          field: { onChange, onBlur, value },
                          fieldState: { error },
                        }) => (
                          <InputField
                            label="Overseas Address"
                            placeholder="Overseas Address"
                            value={value}
                            onChange={(val: string) => {
                              onChange(val);
                              handleIsFormSaved();
                            }}
                            onBlur={onBlur}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            optional={true}
                            // helperText={error?.message}
                            // error={!!error}
                          />
                        )}
                      />
                    </>
                  </>
                ) : showHelloOne ? (
                  <>
                    {/* === University === */}
                    <View style={styles.section}>
                      <Controller
                        name="universityId"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <SearchSelectOptions
                            isChangeUniversity
                            searchEnabled={false}
                            handleChangeUniversity={handleCheckboxChange}
                            changeUniversityValue={changeUniversity}
                            helperText={handleFormValidation("universityId")}
                            error={!!handleFormValidation("universityId")}
                            // options={() => {
                            //   const opts2 = options2();
                            //   return opts2.length > 0 ? opts2 : options();
                            // }}
                            options={(() => {
                              const opts2 = options2();
                              return opts2.length > 0 ? opts2 : options();
                            })()}
                            label="Name of the University"
                            isMandatory
                            value={value}
                            onChange={onChange}
                            disabled={
                              !isEditable ||
                              options2()?.length > 0 ||
                              isDisbTypeApproved ||
                              isLienTranchNonEditable
                            }
                            setIsFormSaved={setIsFormSaved}
                            isChangeUniversityClickable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            width="100%"
                            isLienTranchNonEditable={isLienTranchNonEditable}
                          />
                        )}
                      />

                      {changeUniversity && (
                        <Controller
                          name="newUniversityId"
                          control={control}
                          rules={{ required: "New University is required." }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <CustomSearchDropdown
                              options={options1()}
                              label="New Name of the University"
                              title="Select university"
                              isMandatory
                              value={getValues("newUniversityId") || ""}
                              onChange={(selectedValue) => {
                                setIsFormSaved?.(true);
                                onChange(selectedValue);
                              }}
                              disabled={!isEditable || isLienTranchNonEditable}
                              helperText={error?.message}
                              error={!!error}
                              placeholder=""
                              singleLine
                            />
                          )}
                        />
                      )}
                    </View>

                    {/* === Currency for Payment === */}
                    <View style={styles.section}>
                      <Controller
                        name="paymentCurrencyId"
                        rules={{ required: "Payment Currency is required." }}
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <CustomSearchDropdown
                            options={filteredCurrencyOptions()}
                            label="Currency For Payment"
                            title="Select currency for payment"
                            isMandatory={true}
                            value={value || ""}
                            onChange={(selectedValue) => {
                              setIsFormSaved?.(true);
                              onChange(selectedValue);
                            }}
                            disabled={
                              !isEditable ||
                              watch("paymentCurrencyId") === 13 ||
                              isLienTranchNonEditable
                            }
                            helperText={error?.message}
                            error={!!error}
                            placeholder=""
                          />
                        )}
                      />
                    </View>

                    {/* === Date of Payment === */}
                    {getValues("paymentTypeId") == 1 && (
                      <View style={styles.section}>
                        <Controller
                          name="paymentDate"
                          rules={{ required: "Payment Date is required." }}
                          control={control}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <BasicDatePicker
                              helperText={error?.message}
                              error={!!error}
                              padding="7px 14px"
                              label="Date of Payment Made"
                              disabled={!isEditable || isLienTranchNonEditable}
                              onChange={(date) => {
                                onChange(date?.toISOString() + "");
                                handleFromDateChange(date?.toISOString() + "");
                                handleIsFormSaved();
                              }}
                              value={value ? dayjs(value).toDate() : null}
                              minDate={dayjs().subtract(5, "month").toDate()}
                            />
                          )}
                        />
                      </View>
                    )}

                    {/* === Payment Made To === */}
                    {getValues("paymentTypeId") == 1 && (
                      <View style={styles.section}>
                        <Controller
                          name="paymentMadeTo"
                          rules={{ required: "Payment Made To is required." }}
                          control={control}
                          render={({
                            field: { onChange, value, onBlur },
                            fieldState: { error },
                          }) => (
                            <InputField
                              label="Payment Made To"
                              placeholder="Payment Made To *"
                              value={value}
                              onChange={(val) => {
                                onChange(val);
                                handleIsFormSaved();
                              }}
                              onBlur={onBlur}
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                              helperText={error?.message}
                              error={!!error}
                            />
                          )}
                        />
                      </View>
                    )}

                    {/* === Amount Paid === */}
                    {getValues("paymentTypeId") == 1 && (
                      <View style={styles.section}>
                        <Controller
                          name="AmountPaid"
                          rules={{
                            required: "Amount Paid is required.",
                            validate: (value) => {
                              setErrorMessageAmountPaid(null);

                              if (
                                formStatus == "reject" ||
                                formStatus == "approve" ||
                                formStatus == "pendingFromOperationMaker" ||
                                formStatus ==
                                  "pendingFromLienOperationChecker" ||
                                formStatus == "pendingFromOperationChecker" ||
                                formStatus == "pendingFromCredit" ||
                                formStatus == "pendingFromCollection" ||
                                formStatus == "cancelled" ||
                                formStatus == "pendingFromSalesCoordinator" ||
                                (isEnabled && formStatus == "query")
                              ) {
                                return true;
                              }
                              // Early validation checks
                              if (!value || value === "") {
                                return "Amount Paid is required.";
                              }

                              if (isNaN(Number(value))) {
                                return "Amount must be a number.";
                              }

                              const amountPaid = Number(value);
                              const requestedAmount = Number(
                                getValues("requestedAmount") || 0,
                              );
                              const requestType = getValues("requestType");
                              const accountTypeId = getValues("accountTypeId");

                              // Validation for non-lien requests with non-international accounts
                              if (
                                requestType !== "lien" &&
                                accountTypeId !== 1
                              ) {
                                if (requestedAmount > amountPaid) {
                                  return "Amount Paid must not be less than requested amount.";
                                }
                                if (amountPaid > convertUndisbValue) {
                                  return "Amount Paid must not be greater than undisbursed loan amount.";
                                }
                              }

                              // Validation for lien requests with non-international accounts
                              if (
                                requestType === "lien" &&
                                accountTypeId !== 1
                              ) {
                                if (
                                  amountPaid > Number(convertSanctionedValue)
                                ) {
                                  return "Amount Paid must not be greater than the sanctioned loan amount.";
                                }
                              }

                              // All validations passed
                              return true;
                            },
                          }}
                          control={control}
                          render={({
                            field: { onChange, value, onBlur },
                            fieldState: { error },
                          }) => (
                            <>
                              <InputField
                                label="Amount Paid"
                                placeholder="Amount Paid *"
                                value={value ? String(value) : ""}
                                onChange={(val) => {
                                  handleIsFormSaved?.();
                                  const numericText = val.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  onChange(numericText);
                                  handleAmountPaid(numericText);
                                  clearErrors("AmountPaid");
                                  setErrorMessageAmountPaid(null);
                                }}
                                onBlur={onBlur}
                                editable={
                                  isLienTranchNonEditable ? false : isEditable
                                }
                                keyboardType="numeric"
                                helperText={error?.message}
                                error={!!error}
                              />

                              {errorMessageAmountPaid && (
                                <Text style={styles.error}>
                                  {errorMessageAmountPaid}
                                </Text>
                              )}
                            </>
                          )}
                        />
                      </View>
                    )}

                    {/* === Requested Amount for Disbursement === */}
                    <View style={styles.section}>
                      <Controller
                        name="requestedAmount"
                        rules={{
                          required: "Requested amount is required",
                          validate: (value) => {
                            if (
                              formStatus == "reject" ||
                              formStatus == "approve" ||
                              formStatus == "pendingFromOperationMaker" ||
                              formStatus == "pendingFromLienOperationChecker" ||
                              formStatus == "pendingFromOperationChecker" ||
                              formStatus == "pendingFromCredit" ||
                              formStatus == "pendingFromCollection" ||
                              formStatus == "cancelled" ||
                              formStatus == "pendingFromSalesCoordinator" ||
                              (isEnabled && formStatus == "query")
                            ) {
                              return true;
                            }
                            // Early validation checks
                            if (!value || value === "") {
                              return "Requested Amount is required.";
                            }

                            if (isNaN(Number(value))) {
                              return "Amount must be a number.";
                            }

                            const requestedAmount = Number(value);
                            const requestType = getValues("requestType");
                            const accountTypeId = getValues("accountTypeId");

                            // Validation for non-lien requests with non-international accounts
                            if (requestType !== "lien" && accountTypeId !== 1) {
                              if (
                                requestedAmount <= 0 ||
                                requestedAmount > convertUndisbValue
                              ) {
                                return "Requested Amount must not be greater than undisbursed loan amount.";
                              }
                            }

                            // Validation for lien requests with Indian accounts
                            if (requestType === "lien" && accountTypeId === 2) {
                              if (
                                requestedAmount > Number(convertSanctionedValue)
                              ) {
                                return "Requested Amount must not be greater than the sanctioned loan amount.";
                              }
                            }

                            // All validations passed
                            return true;
                          },
                        }}
                        control={control}
                        render={({
                          field: { onChange, value, onBlur },
                          fieldState: { error },
                        }) => (
                          <View>
                            <AstricString
                              label={strings.Requested_Amount_For_Disbursement}
                              style={styles.label}
                            />
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  borderColor: error?.message
                                    ? styles.errorInput.borderColor
                                    : styles.input.borderColor,
                                },
                              ]}
                              placeholder="Requested Amount For Disbursement *"
                              placeholderTextColor="#a5a3ae"
                              value={value?.toString() ?? ""}
                              onFocus={() =>
                                handleInputFocus("requestedAmount")
                              }
                              onBlur={() => {
                                handleInputBlur();
                                onBlur();
                              }}
                              onChangeText={(text) => {
                                handleIsFormSaved?.();
                                const numericText = text.replace(/[^0-9]/g, "");
                                onChange(numericText);
                                handleRequestedDisbAmount(numericText);
                                clearErrors("requestedAmount");
                              }}
                              keyboardType="numeric"
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                            />
                            {!!error?.message && !errorMessage && (
                              <Text style={styles.error}>{error.message}</Text>
                            )}
                            {errorMessage && (
                              <Text style={styles.error}>{errorMessage}</Text>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    {/* === Overseas Mobile Number === */}
                    {/* <View style={styles.section}> */}
                    <>
                      {/* <AstricString
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      /> */}
                      <Label
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      />

                      <View style={[styles.row, { gap: 5 }]}>
                        {/* Country Code */}
                        <View style={{ flex: 1.2, height: 40 }}>
                          <Controller
                            name="countryCodeId"
                            control={control}
                            // rules={{ required: "Country Code is required." }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <View style={{ marginTop: -20, width: "100%" }}>
                                <CustomSearchDropdown
                                  options={phoneCodeOptions()}
                                  value={value || ""}
                                  title="Select country code"
                                  placeholder="Search"
                                  onChange={(val) => {
                                    handleIsFormSaved?.();
                                    setValue("countryCodeId", val);
                                    onChange(val);
                                  }}
                                  disabled={
                                    !isEditable || isLienTranchNonEditable
                                  }
                                  // error={!!error}
                                  // helperText={error?.message}
                                />
                              </View>
                            )}
                          />
                        </View>

                        {/* Mobile Number */}
                        <View style={{ flex: 2.8 }}>
                          <Controller
                            name="overseasNumber"
                            // rules={{
                            //   required: "Overseas mobile number is required.",
                            //   minLength: {
                            //     value: 7,
                            //     message: "Must be at least 7 digits.",
                            //   },
                            //   maxLength: {
                            //     value: 15,
                            //     message: "Must not exceed 15 digits.",
                            //   },
                            //   pattern: {
                            //     value: /^[0-9]+$/,
                            //     message: "Only numeric digits are allowed.",
                            //   },
                            // }}
                            control={control}
                            render={({
                              field: { onChange, value, onBlur },
                              fieldState: { error },
                            }) => (
                              <TextInput
                                style={getInputStyle("overseasNumber", !!error)}
                                placeholder="Please Enter Mobile Number"
                                placeholderTextColor="#a5a3ae"
                                value={value}
                                onFocus={() =>
                                  handleInputFocus("overseasNumber")
                                }
                                onBlur={() => {
                                  handleInputBlur();
                                  onBlur();
                                }}
                                onChangeText={(text) => {
                                  handleIsFormSaved?.();
                                  const numericText = text.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  onChange(numericText);
                                }}
                                editable={
                                  isLienTranchNonEditable ? false : isEditable
                                }
                                keyboardType="numeric"
                                maxLength={15}
                              />
                            )}
                          />
                        </View>
                      </View>
                    </>
                    {/* </View> */}

                    {/* === Overseas Address === */}
                    <View style={styles.section}>
                      <Controller
                        name="overseasaddress"
                        // rules={{ required: "Overseas Address is required." }}
                        control={control}
                        render={({
                          field: { onChange, value, onBlur },
                          fieldState: { error },
                        }) => (
                          <InputField
                            label="Overseas Address"
                            placeholder="Overseas Address"
                            value={value}
                            onChange={(val) => {
                              onChange(val);
                              handleIsFormSaved();
                            }}
                            onBlur={onBlur}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            optional={true}
                            // helperText={error?.message}
                            // error={!!error}
                          />
                        )}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <>
                      {/* ================= University ================= */}
                      <Controller
                        name="universityId"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <SearchSelectOptions
                            isChangeUniversity
                            searchEnabled={false}
                            handleChangeUniversity={handleCheckboxChange}
                            changeUniversityValue={changeUniversity}
                            helperText={handleFormValidation("universityId")}
                            error={!!handleFormValidation("universityId")}
                            // options={() => {
                            //   const opts2 = options2();
                            //   return opts2.length > 0 ? opts2 : options();
                            // }}
                            options={(() => {
                              const opts2 = options2();
                              return opts2.length > 0 ? opts2 : options();
                            })()}
                            label="Name of the University"
                            isMandatory
                            value={value}
                            onChange={onChange}
                            disabled={
                              !isEditable ||
                              options2()?.length > 0 ||
                              isDisbTypeApproved ||
                              isLienTranchNonEditable
                            }
                            setIsFormSaved={setIsFormSaved}
                            isChangeUniversityClickable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            width="100%"
                          />
                        )}
                      />

                      {/* If Change University is checked */}
                      {changeUniversity && (
                        <Controller
                          name="newUniversityId"
                          control={control}
                          rules={{ required: "New University is required." }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <CustomSearchDropdown
                              options={options1()}
                              label="New Name of the University"
                              title="Select university"
                              isMandatory
                              value={getValues("newUniversityId") || ""}
                              onChange={(selectedValue) => {
                                setIsFormSaved?.(true);
                                onChange(selectedValue);
                              }}
                              disabled={!isEditable || isLienTranchNonEditable}
                              helperText={error?.message}
                              error={!!error}
                              singleLine
                            />
                          )}
                        />
                      )}

                      {/* ================= Currency ================= */}
                      <Controller
                        name="paymentCurrencyId"
                        rules={{ required: "Payment Currency is required." }}
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <CustomSearchDropdown
                            options={filteredCurrencyOptions()}
                            label="Currency For Payment"
                            title="Select currency for payment"
                            isMandatory={true}
                            value={value || ""}
                            onChange={(selectedValue: any) => {
                              setIsFormSaved?.(true);
                              onChange(selectedValue);
                            }}
                            disabled={
                              !isEditable ||
                              watch("paymentCurrencyId") === 13 ||
                              isLienTranchNonEditable
                            }
                            helperText={error?.message}
                            error={!!error}
                            placeholder=""
                          />
                        )}
                      />

                      {/* ================= Payment Date (if paymentTypeId != 3) ================= */}
                      {getValues("paymentTypeId") == 1 && (
                        <Controller
                          name="paymentDate"
                          control={control}
                          rules={{ required: "Payment Date is required." }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <BasicDatePicker
                              helperText={error?.message}
                              error={!!error}
                              padding="7px 14px 7px 14px"
                              label="Date of Payment Made"
                              disabled={!isEditable || isLienTranchNonEditable}
                              onChange={(date) => {
                                onChange(date?.toISOString() ?? "");
                                handleFromDateChange(date?.toISOString() ?? "");
                                handleIsFormSaved();
                              }}
                              value={value ? dayjs(value).toDate() : null}
                              minDate={dayjs().subtract(5, "month").toDate()}
                            />
                          )}
                        />
                      )}

                      {/* ================= Payment Made To ================= */}
                      {getValues("paymentTypeId") == 1 && (
                        <Controller
                          name="paymentMadeTo"
                          control={control}
                          rules={{ required: "Payment Made To is required." }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <InputField
                              label="Payment Made To"
                              placeholder="Payment Made To *"
                              value={value}
                              onChange={(val) => {
                                onChange(val);
                                handleIsFormSaved();
                              }}
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                              helperText={error?.message}
                              error={!!error}
                            />
                          )}
                        />
                      )}

                      {/* ================= Amount Paid ================= */}
                      {getValues("paymentTypeId") == 1 && (
                        <Controller
                          name="AmountPaid"
                          control={control}
                          rules={{
                            required: "Amount Paid is required.",
                            validate: (value) => {
                              setErrorMessageAmountPaid(null);
                              if (
                                formStatus == "reject" ||
                                formStatus == "approve" ||
                                formStatus == "pendingFromOperationMaker" ||
                                formStatus ==
                                  "pendingFromLienOperationChecker" ||
                                formStatus == "pendingFromOperationChecker" ||
                                formStatus == "pendingFromCredit" ||
                                formStatus == "pendingFromCollection" ||
                                formStatus == "cancelled" ||
                                formStatus == "pendingFromSalesCoordinator" ||
                                (isEnabled && formStatus == "query")
                              ) {
                                return true;
                              }

                              // Early validation checks
                              if (!value || value === "") {
                                return "Amount Paid is required.";
                              }

                              if (isNaN(Number(value))) {
                                return "Amount must be a number.";
                              }

                              const amountPaid = Number(value);
                              const requestedAmount = Number(
                                getValues("requestedAmount") || 0,
                              );
                              const requestType = getValues("requestType");
                              const accountTypeId = getValues("accountTypeId");

                              // Validation for non-lien requests with non-international accounts
                              if (
                                requestType !== "lien" &&
                                accountTypeId !== 1
                              ) {
                                if (requestedAmount > amountPaid) {
                                  return "Amount Paid must not be less than requested amount.";
                                }
                                if (amountPaid > convertUndisbValue) {
                                  return "Amount Paid must not be greater than undisbursed loan amount.";
                                }
                              }

                              // Validation for lien requests with non-international accounts
                              if (
                                requestType === "lien" &&
                                accountTypeId !== 1
                              ) {
                                if (
                                  amountPaid > Number(convertSanctionedValue)
                                ) {
                                  return "Amount Paid must not be greater than the sanctioned loan amount.";
                                }
                              }

                              // All validations passed
                              return true;
                            },
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <>
                              <InputField
                                label="Amount Paid"
                                placeholder="Amount Paid *"
                                value={value != null ? String(value) : ""}
                                onChange={(val) => {
                                  handleIsFormSaved?.();
                                  const numericText = val.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  onChange(numericText);
                                  handleAmountPaid(numericText);
                                  clearErrors("AmountPaid");
                                  setErrorMessageAmountPaid(null);
                                }}
                                editable={
                                  isLienTranchNonEditable ? false : isEditable
                                }
                                keyboardType="numeric"
                                helperText={error?.message}
                                error={!!error}
                              />
                              {errorMessageAmountPaid && (
                                <Text style={styles.error}>
                                  {errorMessageAmountPaid}
                                </Text>
                              )}
                            </>
                          )}
                        />
                      )}

                      {/* ================= Requested Amount ================= */}
                      <Controller
                        name="requestedAmount"
                        control={control}
                        rules={{
                          required: "Requested amount is required",
                          validate: (value) => {
                            if (
                              formStatus == "reject" ||
                              formStatus == "approve" ||
                              formStatus == "pendingFromOperationMaker" ||
                              formStatus == "pendingFromLienOperationChecker" ||
                              formStatus == "pendingFromOperationChecker" ||
                              formStatus == "pendingFromCredit" ||
                              formStatus == "pendingFromCollection" ||
                              formStatus == "cancelled" ||
                              formStatus == "pendingFromSalesCoordinator" ||
                              (isEnabled && formStatus == "query")
                            ) {
                              return true;
                            }
                            // Early validation checks
                            if (!value || value === "") {
                              return "Requested Amount is required.";
                            }

                            if (isNaN(Number(value))) {
                              return "Amount must be a number.";
                            }

                            const requestedAmount = Number(value);
                            const requestType = getValues("requestType");
                            const accountTypeId = getValues("accountTypeId");

                            // Validation for non-lien requests with non-international accounts
                            if (requestType !== "lien" && accountTypeId !== 1) {
                              if (
                                requestedAmount <= 0 ||
                                requestedAmount > convertUndisbValue
                              ) {
                                return "Requested Amount must not be greater than undisbursed loan amount.";
                              }
                            }

                            // Validation for lien requests with Indian accounts
                            if (requestType === "lien" && accountTypeId === 2) {
                              if (
                                requestedAmount > Number(convertSanctionedValue)
                              ) {
                                return "Requested Amount must not be greater than the sanctioned loan amount.";
                              }
                            }

                            // All validations passed
                            return true;
                          },
                        }}
                        render={({
                          field: { onChange, value, onBlur },
                          fieldState: { error },
                        }) => (
                          <View>
                            <AstricString
                              label={strings.Requested_Amount_For_Disbursement}
                              style={styles.label}
                            />
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  borderColor: error?.message
                                    ? styles.errorInput.borderColor
                                    : styles.input.borderColor,
                                  backgroundColor:
                                    !isEditable || isLienTranchNonEditable
                                      ? "#fff"
                                      : undefined,
                                  height: 43,
                                },
                              ]}
                              placeholderTextColor="#a5a3ae"
                              value={value?.toString() ?? ""}
                              onBlur={onBlur}
                              onChangeText={(text) => {
                                handleIsFormSaved?.();
                                const numericText = text.replace(/[^0-9]/g, "");
                                onChange(numericText);
                                handleRequestedDisbAmount(numericText);
                                clearErrors("requestedAmount");
                              }}
                              placeholder="Requested Amount For Disbursement *"
                              keyboardType="numeric"
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                            />
                            {(errorMessage || error?.message) && (
                              <Text style={styles.error}>
                                {errorMessage || error?.message}
                              </Text>
                            )}
                          </View>
                        )}
                      />

                      {/* ================= Overseas Mobile ================= */}
                      {/* <AstricString
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      /> */}
                      <Label
                        label={strings.overseas_mobile_number}
                        style={styles.label}
                      />
                      <View style={[styles.row, { gap: 5 }]}>
                        {/* Country Code */}
                        <View style={{ flex: 1.2, height: 40 }}>
                          <Controller
                            name="countryCodeId"
                            control={control}
                            // rules={{ required: "Country Code is required." }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <View style={{ marginTop: -20, width: "100%" }}>
                                <CustomSearchDropdown
                                  options={phoneCodeOptions()}
                                  value={value || ""}
                                  title="Select country code"
                                  placeholder="Search"
                                  // placeholder="Select country code"
                                  onChange={(val) => {
                                    handleIsFormSaved?.();
                                    setValue("countryCodeId", val);
                                    onChange(val);
                                  }}
                                  disabled={
                                    !isEditable || isLienTranchNonEditable
                                  }
                                  // error={!!error}
                                  // helperText={error?.message}
                                />
                              </View>
                            )}
                          />
                        </View>
                        {/* Mobile Number */}
                        <View style={{ flex: 2.8 }}>
                          <Controller
                            name="overseasNumber"
                            control={control}
                            // rules={{
                            //   required: "Overseas mobile number is required.",
                            //   minLength: {
                            //     value: 7,
                            //     message: "Must be at least 7 digits.",
                            //   },
                            //   maxLength: {
                            //     value: 15,
                            //     message: "Must not exceed 15 digits.",
                            //   },
                            //   pattern: {
                            //     value: /^[0-9]+$/,
                            //     message: "Only numeric digits are allowed.",
                            //   },
                            // }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <TextInput
                                style={[
                                  getInputStyle("overseasNumber", !!error, {
                                    backgroundColor:
                                      !isEditable || isLienTranchNonEditable
                                        ? "#fff"
                                        : undefined,
                                  }),
                                  { height: 43 },
                                ]}
                                placeholderTextColor="#a5a3ae"
                                value={value}
                                onChangeText={(text) => {
                                  handleIsFormSaved?.();
                                  const numericText = text.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  onChange(numericText);
                                }}
                                editable={
                                  isLienTranchNonEditable ? false : isEditable
                                }
                                keyboardType="numeric"
                                placeholder="Please Enter Mobile Number"
                                maxLength={15}
                              />
                            )}
                          />
                        </View>
                      </View>

                      {/* ================= Overseas Address ================= */}
                      <Controller
                        name="overseasaddress"
                        control={control}
                        // rules={{ required: "Overseas Address is required." }}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <InputField
                            label="Overseas Address"
                            placeholder="Overseas Address"
                            value={value}
                            onChange={(val) => {
                              onChange(val);
                              handleIsFormSaved();
                            }}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            optional={true}
                            // helperText={error?.message}
                            // error={!!error}
                          />
                        )}
                      />
                    </>
                  </>
                )}

                {/* Lien A/C Details */}

                <>
                  {handleRequestDetailsCondition() && (
                    <>
                      <Text style={styles.sectionTitleStyle}>
                        {strings.LIEN_ACCOUNT_DETAILS}
                      </Text>

                      {/* Bank Name */}
                      <Controller
                        name="lienBankId"
                        control={control}
                        rules={{
                          required: "Bank Name is required.",
                        }}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <CustomSearchDropdown
                            options={
                              bankListLien?.map((bd: any) => ({
                                value: bd.id,
                                label: bd.bankName,
                              })) || []
                            }
                            label="Bank Name"
                            title="Select bank name"
                            singleLine={true}
                            isMandatory={true}
                            value={value || ""}
                            onChange={(selectedValue: any) => {
                              if (getCacheLienData()?.lienBankId !== selectedValue) {
                                setValue("lienAccountNumber", "");
                                setValue("reEnterLienAccountNumber", "");
                                setValue("lienIfscCode", "");
                                setValue("lienAccountHolderName", "");
                              } else {
                                setValue("lienAccountNumber", getCacheLienData()?.lienAccountNumber || "");
                                setValue("reEnterLienAccountNumber", getCacheLienData()?.lienAccountNumber || "");
                                setValue("lienIfscCode", getCacheLienData()?.lienIfscCode || "");
                                setValue("lienAccountHolderName", getCacheLienData()?.lienAccountHolderName || "");
                              }
                              logger.debug("value.........", value);
                              logger.debug("lienAccountNumber:......... ", getValues("lienAccountNumber"));
                              logger.debug("reEnterLienAccountNumber:......... ", getValues("reEnterLienAccountNumber"));
                              logger.debug("lienIfscCode:......... ", getValues("lienIfscCode"));
                              logger.debug("lienAccountHolderName:......... ", getValues("lienAccountHolderName"));
                              handleIsFormSaved();
                              onChange(selectedValue);
                            }}
                            disabled={!isEditable || isLienTranchNonEditable}
                            helperText={error?.message}
                            error={!!error}
                            placeholder="Select Bank"
                          />
                        )}
                      />
                      {/* Line Account Number */}
                      <Controller
                        name="lienAccountNumber"
                        control={control}
                        rules={{
                          required: "Account number is required.",
                          // minLength: {
                          //   value: 8,
                          //   message:
                          //     "Account number must be at least 8 digits.",
                          // },
                          // maxLength: {
                          //   value: 17,
                          //   message:
                          //     "Account number must not exceed 17 digits.",
                          // },
                          minLength: {
                            value: maxBankAccountNumberMinLength(
                              bankListLien,
                              getValues("lienBankId"),
                            ),
                            message: `Account number must be at least ${maxBankAccountNumberMinLength(
                              bankListLien,
                              getValues("lienBankId"),
                            )} digits.`,
                          },
                          maxLength: {
                            value: maxBankAccountNumberLength(
                              bankListLien,
                              getValues("lienBankId"),
                            ),
                            message: `Account number must not exceed ${maxBankAccountNumberLength(
                              bankListLien,
                              getValues("lienBankId"),
                            )} digits.`,
                          },
                          validate: (value) =>
                            /^[0-9]+$/.test(value) ||
                            "Account number must contain digits only.",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <InputField
                            label="Account Number"
                            placeholder="Enter Account Number"
                            value={value}
                            lienDetails={true}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            keyboardType="numeric"
                            maxLength={maxBankAccountNumberLength(
                              bankListLien,
                              getValues("lienBankId"),
                            )}
                            onBlur={onBlur}
                            onChange={(text: string) => {
                              handleIsFormSaved();
                              const numericValue = text.replace(/[^0-9]/g, "");
                              onChange(numericValue);

                              // Validate match with re-enter field
                              const selectedBank = findSelectedBankDetailsById(
                                bankListLien,
                                getValues("lienBankId"),
                              );

                              if (selectedBank != null) {
                                if (
                                  selectedBank.maxLength != null &&
                                  selectedBank.minLength != null &&
                                  selectedBank.minLength ===
                                    selectedBank.maxLength &&
                                  numericValue.length < selectedBank.maxLength
                                ) {
                                  setLienAccountNumberMinMaxError(
                                    `Please enter a valid ${selectedBank.maxLength}-digit ${selectedBank.bankName} account number to proceed.`,
                                  );
                                } else if (
                                  selectedBank.maxLength != null &&
                                  selectedBank.minLength != null &&
                                  selectedBank.minLength !=
                                    selectedBank.maxLength &&
                                  numericValue.length < selectedBank.minLength
                                ) {
                                  setLienAccountNumberMinMaxError(
                                    `Please enter a valid ${selectedBank.bankName} account number between ${selectedBank.minLength} and ${selectedBank.maxLength} digits to proceed.`,
                                  );
                                } else {
                                  setLienAccountNumberMinMaxError("");
                                  clearErrors("lienAccountNumber");
                                }
                              } else {
                                setLienAccountNumberMinMaxError("");
                                clearErrors("lienAccountNumber");
                              }

                              try {
                                const reEnterAccountNumber = getValues(
                                  "reEnterLienAccountNumber",
                                );
                                if (
                                  reEnterAccountNumber.trim().length > 0 &&
                                  numericValue.length ==
                                    reEnterAccountNumber.length &&
                                  numericValue === reEnterAccountNumber
                                ) {
                                  setLienAccountNumberError("");
                                  clearErrors("reEnterLienAccountNumber");
                                }
                              } catch (error) {
                                logger.error(
                                  "Error in validating account number length: ",
                                  error,
                                );
                              }
                              
                            }}
                            error={
                              !!lienAccountNumberMinMaxError || !!errors.lienAccountNumber
                            }
                            helperText={
                              lienAccountNumberMinMaxError ||
                              errors.lienAccountNumber?.message
                            }
                          />
                        )}
                      />

                      {/* Re-enter Account Number */}
                      <Controller
                        name="reEnterLienAccountNumber"
                        control={control}
                        rules={{
                          required: "Re-enter account number is required.",
                          // minLength: {
                          //   value: 8,
                          //   message:
                          //     "Account number must be at least 8 digits.",
                          // },
                          // maxLength: {
                          //   value: 17,
                          //   message:
                          //     "Account number must not exceed 17 digits.",
                          // },
                          validate: (value) =>
                            value === getValues("lienAccountNumber") ||
                            "Account numbers do not match",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <InputField
                            label="Re-enter Account Number"
                            placeholder="Re-enter Account Number"
                            value={value}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            keyboardType="numeric"
                            // maxLength={17}
                            onChange={(text: string) => {
                              handleIsFormSaved();
                              const numericValue = text.replace(/[^0-9]/g, "");
                              onChange(numericValue);

                              // Validate match with re-enter field
                              const reEnterValue =
                                getValues("lienAccountNumber");
                              if (numericValue.trim().length > 0) {
                                if (
                                  reEnterValue &&
                                  reEnterValue !== numericValue
                                ) {
                                  setLienAccountNumberError(
                                    "Account numbers do not match",
                                  );
                                  // setError("reEnterAccountNumber", {
                                  //   type: "manual",
                                  //   message: "Account numbers do not match",
                                  // });
                                } else {
                                  setLienAccountNumberError("");
                                  clearErrors("reEnterLienAccountNumber");
                                }
                              } else {
                                setLienAccountNumberError("");
                                clearErrors("reEnterLienAccountNumber");
                              }
                            }}
                            onBlur={onBlur}
                            // onChange={(text: string) =>
                            //   onChange(text.replace(/[^0-9]/g, ""))
                            // }

                            error={
                              !!lienAccountNumberError ||
                              !!errors.reEnterLienAccountNumber
                            }
                            helperText={
                              lienAccountNumberError ||
                              errors.reEnterLienAccountNumber?.message
                            }
                          />
                        )}
                      />

                      {/* IFSC Code */}
                      <Controller
                        name="lienIfscCode"
                        control={control}
                        rules={{
                          required: "IFSC Code is required.",
                          pattern: {
                            value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                            message:
                              "IFSC Code must be 11 characters: first 4 uppercase letters, followed by 0, and ending with 6 alphanumeric characters.",
                          },
                          validate: (value) =>
                            /[a-z]/.test(value)
                              ? "IFSC Code must be uppercase letters only."
                              : true,
                        }}
                        render={({
                          field: { onChange, onBlur, value },
                          fieldState: { error },
                        }) => (
                          <InputField
                            label="IFSC Code"
                            placeholder="IFSC Code *"
                            value={value}
                            onChange={(text: string) => {
                              handleIsFormSaved();
                              onChange(
                                text.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
                              );
                            }}
                            onBlur={onBlur}
                            editable={
                              isLienTranchNonEditable ? false : isEditable
                            }
                            keyboardType="default"
                            autoComplete="off"
                            maxLength={11}
                            autoCorrect={false}
                            autoCapitalize="characters"
                            helperText={error?.message}
                            error={!!error}
                            // maxLength={11}
                          />
                        )}
                      />

                      {/* Account Holder Name */}
                      <Controller
                        name="lienAccountHolderName"
                        control={control}
                        rules={{
                          required: "Account Holder Name is required.",
                          validate: (value) => {
                            // Early validation checks
                            if (!value || value?.trimStart() === "") {
                              return "Account Holder Name is required.";
                            }

                            // All validations passed
                            return true;
                          },
                        }}
                        render={({
                          field: { onChange, onBlur, value },
                          fieldState: { error },
                        }) => (
                          <InputField
                            label="Account Holder Name"
                            placeholder="Account Holder Name *"
                            value={value}
                            onChange={(text: string) => {
                              handleIsFormSaved();
                              onChange(text);
                            }}
                            onBlur={onBlur}
                            editable={
                              isLienTranchNonEditable
                                ? false
                                : isEditable || isDisbTypeApproved
                            }
                            helperText={error?.message}
                            error={!!error}
                          />
                        )}
                      />
                    </>
                  )}
                </>

                <>
                  {/* {bankDetail()} */}
                  {handleBankDetailsCondition() && (
                    <>
                      <Text style={styles.sectionTitleStyle}>
                        {strings.BANK_DETAILS}
                      </Text>

                      {/* Bank Name */}
                      <>
                        <Controller
                          name="bankId"
                          control={control}
                          rules={{
                            required: "Bank Name is required.",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <CustomSearchDropdown
                              options={uniqueSortedBankData}
                              label="Bank Name"
                              title="Select bank name"
                              singleLine={true}
                              isMandatory={true}
                              value={value || ""}
                              onChange={(selectedValue: any) => {
                                if (selectedValue !== getValues("bankId")) {
                                  setValue("accountNumber", "");
                                  setValue("reEnterAccountNumber", "");
                                  setValue("ifsccode", "");
                                  setValue("accHolderName", "");
                                }
                                handleIsFormSaved?.();
                                onChange(selectedValue);
                              }}
                              disabled={!isEditable || isLienTranchNonEditable}
                              helperText={error?.message}
                              error={!!error}
                              placeholder="Select Bank"
                            />
                          )}
                        />
                      </>

                      {/* Account Number */}
                      <>
                        <Controller
                          name="accountNumber"
                          control={control}
                          rules={{
                            required: "Account number is required.",
                            // minLength: {
                            //   value: 8,
                            //   message:
                            //     "Account number must be at least 8 digits.",
                            // },
                            // maxLength: {
                            //   value: 17,
                            //   message:
                            //     "Account number must not exceed 17 digits.",
                            // },
                            minLength: {
                              value: maxBankAccountNumberMinLength(
                                dataSet.Bankdata,
                                getValues("bankId"),
                              ),
                              message: `Account number must be at least ${maxBankAccountNumberMinLength(
                                dataSet.Bankdata,
                                getValues("bankId"),
                              )} digits.`,
                            },
                            maxLength: {
                              value: maxBankAccountNumberLength(
                                dataSet.Bankdata,
                                getValues("bankId"),
                              ),
                              message: `Account number must not exceed ${maxBankAccountNumberLength(
                                dataSet.Bankdata,
                                getValues("bankId"),
                              )} digits.`,
                            },
                            validate: (value) =>
                              /^[0-9]+$/.test(value) ||
                              "Account number must contain digits only",
                          }}
                          render={({ field: { onChange, onBlur, value } }) => {
                            return (
                              <View style={styles.fieldContainer}>
                                <InputField
                                  value={value}
                                  label="Account Number"
                                  maxLength={maxBankAccountNumberLength(
                                    dataSet.Bankdata,
                                    getValues("bankId"),
                                  )}
                                  onChange={(text: string) => {
                                    handleIsFormSaved();
                                    const numericValue = text.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    onChange(numericValue);

                                    // Validate match with re-enter field
                                    const selectedBank =
                                      findSelectedBankDetailsById(
                                        dataSet.Bankdata,
                                        getValues("bankId"),
                                      );

                                    if (selectedBank != null) {
                                      if (
                                        selectedBank.maxLength != null &&
                                        selectedBank.minLength != null &&
                                        selectedBank.minLength ===
                                          selectedBank.maxLength &&
                                        numericValue.length <
                                          selectedBank.maxLength
                                      ) {
                                        setAccountNumberMinMaxError(
                                          `Please enter a valid ${selectedBank.maxLength}-digit ${selectedBank.bankName} account number to proceed.`,
                                        );
                                      } else if (
                                        selectedBank.maxLength != null &&
                                        selectedBank.minLength != null &&
                                        selectedBank.minLength !=
                                          selectedBank.maxLength &&
                                        numericValue.length <
                                          selectedBank.minLength
                                      ) {
                                        setAccountNumberMinMaxError(
                                          `Please enter a valid ${selectedBank.bankName} account number between ${selectedBank.minLength} and ${selectedBank.maxLength} digits to proceed.`,
                                        );
                                      } else {
                                        setAccountNumberMinMaxError("");
                                        clearErrors("accountNumber");
                                      }
                                    } else {
                                      setAccountNumberMinMaxError("");
                                      clearErrors("accountNumber");
                                    }

                                    const reEnterAccountNumber = getValues("reEnterAccountNumber");
                                    if (
                                      reEnterAccountNumber.trim().length > 0 &&
                                      numericValue.length ==
                                        reEnterAccountNumber.length &&
                                      numericValue === reEnterAccountNumber
                                    ) {
                                      setAccountNumberError("");
                                      clearErrors("reEnterAccountNumber");
                                    }
                                  }}
                                  bankDetails={true}
                                  onBlur={() => onBlur()}
                                  placeholder="Account Number *"
                                  editable={
                                    isLienTranchNonEditable ? false : isEditable
                                  }
                                  keyboardType="numeric"
                                  error={
                                    !!accountNumberMinMaxError ||
                                    !!errors.accountNumber?.message
                                  }
                                  helperText={
                                    accountNumberMinMaxError ||
                                    errors.accountNumber?.message
                                  }
                                />
                              </View>
                            );
                          }}
                        />
                      </>
                      <>
                        {/* Re-enter Account Number */}
                        <Controller
                          name="reEnterAccountNumber"
                          control={control}
                          rules={{
                            required: "Re-enter account number is required.",
                            // minLength: {
                            //   value: 8,
                            //   message:
                            //     "Account number must be at least 8 digits.",
                            // },
                            // maxLength: {
                            //   value: 17,
                            //   message:
                            //     "Account number must not exceed 17 digits.",
                            // },
                            validate: (value) =>
                              value === getValues("accountNumber") ||
                              "Account numbers do not match",
                          }}
                          render={({ field: { onChange, onBlur, value } }) => {
                            return (
                              <View style={styles.fieldContainer}>
                                {/* <Text
                                style={[
                                  styles.label,
                                  (accountNumberError ||
                                    errors.reEnterAccountNumber) && {
                                    color: "red",
                                  },
                                ]}
                              >
                                Re-enter Account Number{" "}
                                <Text style={{ color: "red" }}>*</Text>
                              </Text> */}

                                <InputField
                                  value={value}
                                  label=" Re-enter Account Number"
                                  onChange={(text: string) => {
                                    handleIsFormSaved();
                                    const numericValue = text.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    onChange(numericValue);

                                    // Validate matching
                                    const accountNumber =
                                      getValues("accountNumber");
                                    if (numericValue.trim().length > 0) {
                                      if (
                                        accountNumber &&
                                        numericValue !== accountNumber
                                      ) {
                                        setAccountNumberError(
                                          "Account numbers do not match",
                                        );
                                        // setError("reEnterAccountNumber", {
                                        //   type: "manual",
                                        //   message: "Account numbers do not match",
                                        // });
                                      } else {
                                        setAccountNumberError("");
                                        clearErrors("reEnterAccountNumber");
                                      }
                                    } else {
                                      setAccountNumberError("");
                                      clearErrors("reEnterAccountNumber");
                                    }
                                  }}
                                  onBlur={onBlur}
                                  placeholder="Re-enter Account Number *"
                                  editable={
                                    isLienTranchNonEditable ? false : isEditable
                                  }
                                  keyboardType="numeric"
                                  //maxLength={17} // always hidden
                                  error={
                                    !!accountNumberError ||
                                    !!errors.reEnterAccountNumber?.message
                                  }
                                  helperText={
                                    accountNumberError||
                                    errors.reEnterAccountNumber?.message
                                  }
                                />
                              </View>
                            );
                          }}
                        />
                      </>

                      {/* IFSC Code */}
                      <>
                        <Controller
                          name="ifsccode"
                          control={control}
                          rules={{
                            required: "IFSC Code is required.",
                            pattern: {
                              value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                              message:
                                "IFSC Code must be 11 characters: first 4 uppercase letters, followed by 0, and ending with 6 alphanumeric characters.",
                            },
                            validate: (value) =>
                              /[a-z]/.test(value)
                                ? "IFSC Code must be uppercase letters only."
                                : true,
                          }}
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { error },
                          }) => (
                            <InputField
                              label="IFSC Code"
                              placeholder="IFSC Code *"
                              value={value}
                              onChange={(text: string) => {
                                handleIsFormSaved();
                                onChange(
                                  text
                                    .replace(/[^A-Za-z0-9]/g, "")
                                    .toUpperCase(),
                                );
                              }}
                              onBlur={onBlur}
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                              maxLength={11}
                              keyboardType="default"
                              autoComplete="off"
                              autoCorrect={false}
                              autoCapitalize="characters"
                              //helperText={handleFormValidation("ifsccode")}
                              helperText={errors.ifsccode?.message}
                              //error={!!handleFormValidation("ifsccode")}
                              error={!!errors.ifsccode?.message}
                            />
                          )}
                        />

                        {/* {!!errors.ifsccode?.message && (
                          <Text
                            style={{
                              color: "red",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.ifsccode.message}
                          </Text>
                        )} */}
                      </>

                      {/* Account Holder Name */}
                      <>
                        <Controller
                          name="accHolderName"
                          control={control}
                          rules={{
                            required: "Account Holder Name is required.",
                            validate: (value) => {
                              // Early validation checks
                              if (!value || value?.trimStart() === "") {
                                return "Account Holder Name is required.";
                              }

                              // All validations passed
                              return true;
                            },
                          }}
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { error },
                          }) => (
                            <InputField
                              label="Account Holder Name"
                              placeholder="Account Holder Name *"
                              value={value}
                              onChange={onChange}
                              onBlur={onBlur}
                              editable={
                                isLienTranchNonEditable ? false : isEditable
                              }
                              helperText={error?.message}
                              error={!!error}
                            />
                          )}
                        />
                      </>
                    </>
                  )}
                </>
                {/* ... END make changes in code ... */}
              </>
            )}
          </>
        );
      case 1:
        //setIsAddNewDocumnet(true)
        return (
          <AddNewDocuments
            disbursementFormId={formID}
            activeFunction={activeFunction}
            setActiveFunction={setActiveFunction}
            activeStep={activeStep}
            setStep={setStep}
            paymentTypeId={paymentTypeId}
            setActiveStep={setActiveStep}
            remarkId={remarkId}
            remark={watch("Remark")}
            isNewUniversity={watch("isNewUniversity")}
            accountTypeId={accountTypeId}
            isMoveToNext={isMoveToNext}
            setIsLoadingUpdate={setIsLoadingUpdate}
            isLoadingUpdate={isLoadingUpdate}
            isAddNewDocumnet={isAddNewDocumnet}
            setIsAddNewDocumnet={setIsAddNewDocumnet}
            requestType={getValues("requestType")}
            setallDocsPresent={setallDocsPresent}
            step={step}
          />
        );
      case 2:
        return (
          <>
            <AccountAggregator
              onBack={() => setActiveStep(1)}
              onSkipConsent={handleSkipAggregator}
              onProvideConsent={handleProvideConsent}
              bankName={getValues("lienBankId")}
              accountNumber={getValues("lienAccountNumber")}
              ifscCode={getValues("lienIfscCode")}
              mobileNumber={mobileNumberNew}
              setMobileNumbers={setMobileNumber}
              consentStatus={validConsent ? "approved" : "pending"}
              dateRange=""
              bankListLien={bankListLien}
              aggregatorData={aggregatorData}
              validConsent={validConsent}
              isLoadingUpdateNew={isLoadingUpdateNew}
              isLoadingConsent={isLoadingConsent}
              continueButton={continueButton}
              isEditable={isEditable}
            />
          </>
        );
      case 3:
        return (
          <DisbursementFormTermDetails
            disbursementFormId={formID}
            validConsent={validConsent}
            formStatus={formStatus}
            onClickFunc={handleEditDetails}
          />
        );
      case 4:
        return <DisbursementFormThanksPage />;
    }
  };

  const handleEditDetails = () => {
    if (formStatus == "query") {
      setActiveStep(1);
      setStep(2);
    } else {
      setActiveStep(0);
      setStep(1);
    }
    setFormStatus(
      formStatus == "query"
        ? "query"
        : formStatus == "pendingFromOperationMaker"
        ? "pendingFromOperationMaker"
        : formStatus == "pendingFromLienOperationChecker"
        ? "pendingFromLienOperationChecker"
        : formStatus === "pendingFromCredit"
        ? "pendingFromCredit"
        : formStatus == "pendingFromCollection"
        ? "pendingFromCollection"
        : formStatus == "pendingFromSalesCoordinator"
        ? "pendingFromSalesCoordinator"
        : formStatus == "approve"
        ? "approve"
        : formStatus == "cancelled"
        ? "cancelled"
        : "save",
    );
  };

  const LoanAccountHeading = () => {
    return (
      <View style={styles.headinContainer}>
        <Text style={styles.mainHeading}>Loan A/C {selectedLoanNumber}</Text>
        <Text style={styles.subHeading}>
          {" "}
          {dashboardDataSet?.[0]?.description}
        </Text>
      </View>
    );
  };

  const LanStatusSection = () => {
    return (
      <View style={styles.container}>
        <LoanAccountHeading />
        <Text style={styles.activeStatusText}>Active</Text>
      </View>
    );
  };

  // Memoize bank data processing to prevent recalculation on every render
  const uniqueSortedBankData = useMemo(() => {
    // If paymentTypeId is 5, use bankList instead of dataSet.Bankdata
    if (getValues("paymentTypeId") == 5) {
      return (
        bankList?.map((bank: any) => ({
          value: bank.id,
          label: bank.bankName,
        })) || []
      );
    }

    // Default behavior for other payment types
    return (dataSet.Bankdata || [])
      .filter(
        (bd: any, index: number, self: any[]) =>
          index === self.findIndex((b) => b.bankName === bd.bankName),
      )
      .sort((a: any, b: any) => a.bankName.localeCompare(b.bankName))
      .map((bd: any) => ({
        value: bd.id,
        label: bd.bankName,
      }));
  }, [dataSet.Bankdata, bankList, getValues("paymentTypeId")]);

  let val = activeStep;
  AsyncStorage.getItem("activeFormStep").then((activeStepValue) => {
    if (activeStepValue === "3") {
      val = Number(activeStepValue);
    }
  });

  const renderRemark = ({ item }: { item: RemarkItem }) => (
    <View style={styles.remarkContainer}>
      <View style={styles.fallbackImage}>
        <Text style={styles.fallbackText}>
          {getInitials(item?.role === "customer" ? item?.role : "Avanse User")}
        </Text>
      </View>

      <View style={styles.remarkTextContainer}>
        <View style={styles.remarkHeader}>
          <Text style={styles.remarkAuthor}>
            {item?.role === "customer" ? item?.role : "Avanse User"}
          </Text>
          <Text style={styles.remarkDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.remarkText}>{item?.remark}</Text>
      </View>
    </View>
  );

  const remarkList = Object.entries(dataSetRemark).flatMap(([date, remarks]) =>
    (remarks as any[]).map((remark: any) => ({ ...remark, created_at: date })),
  );

  const nextBtnDisabled = (): boolean => {
    return (
      (!isEnabled && isDisabled) ||
      isLoadingUpdate ||
      (formStatus == "query" && activeStep == 3 && isEnabled == true) ||
      (formStatus == "pendingFromOperationMaker" && activeStep == 3) ||
      (formStatus == "pendingFromLienOperationChecker" && activeStep == 3) ||
      (formStatus == "pendingFromOperationChecker" && activeStep == 3) ||
      (formStatus == "approve" && activeStep == 3) ||
      (formStatus == "reject" && activeStep == 3) ||
      (formStatus == "pendingFromCredit" && activeStep == 3) ||
      (formStatus == "pendingFromCollection" && activeStep == 3) ||
      (formStatus == "cancelled" && activeStep == 3) ||
      (formStatus == "cancelled" && activeStep == 1) ||
      (formStatus == "pendingFromSalesCoordinator" && activeStep == 3) ||
      (formStatus == "partiallyApproved" && activeStep == 3) || 
      isLoadingUpdateSave
    );
  };

  const handleAgreeSubmit = async (type: string) => {
    try {
      setConfirmModal(false);
      setIsLoadingUpdate(true);
      setIsAddNewDocumnet(true);
      const obj: any = {
        formId: formID,
        type: type == "Yes" ? 1 : 2,
        lan: selectedLoanNumber,
        remark: cancelRemark || "No remark provided",
        loanCategory: userLoanCategory?.TermLoan[0]?.loanCategoryId || null,
        business: businessType?.id || null,
        cif: userProfile?.cifNumber,
        cifEntity: userProfile?.cifEntity,
      };

      if (type === "No") {
        // delete obj.remark;
        delete obj.cifEntity;
        return;
      }

      const response = await postsServices.secureAddPost(
        "api/v1/disbursement-form/tranche-cancel",
        obj,
      );

      if (response?.status === 200) {
        setConfirmModal(false);
        setCancelRemark("");
        dispatch(
          setStatusPopup({
            status: "success",
            message: response?.data?.message,
            buttonStatus: false,
          }),
        );
        if (type == "Yes") {
          //handleBack();
          NavigationService.goBack();
        }
      }
    } catch (error: any) {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            // message: error?.data?.message,
            message: error,
            buttonStatus: false,
          }),
        );
      }
    } finally {
      setIsLoadingUpdate(false);
      setIsAddNewDocumnet(false);
    }
  };

  const [paymentTypeData, setPaymentTypeData] = useState<any>([]);

  useEffect(() => {
    let paymentTypeList =
      dataSet.PaymentType?.map((bd: any) => ({
        value: bd.id,
        label: bd.paymentType,
      })) || [];
    if (getValues("requestType") == "lien") {
      paymentTypeList = paymentTypeList.filter((item: any) => item.value !== 5);
    }
    setPaymentTypeData(paymentTypeList);
  }, [getValues("requestType"), dataSet.PaymentType]);

  useEffect(() => {
    const fetchDataBank = async () => {
      if (getValues("paymentTypeId") == 5) {
        await handleBankName();
      }
    };
    fetchDataBank();
  }, [getValues("paymentTypeId")]);
  useEffect(() => {
    (async () => {
      if (getValues("requestType") == "lien") {
        await handleBankNameLien();
      }
    })();
  }, [getValues("requestType")]);

  const handleSkipAggregator = () => {
    setActiveStep(3);
  };

  const handleGetAggregatorDetails = async () => {
    try {
      let aggAppNo = await AsyncStorage.getItem("aggApplicationNo");
      if (!aggAppNo) {
        aggAppNo = aggregatorNo;
      }

      // First check lienAccountNumber and selectedLoanNumber
      if (
        getValues("lienAccountNumber") !== undefined &&
        getValues("lienAccountNumber") !== "undefined" &&
        getValues("lienAccountNumber") !== "" &&
        getValues("lienAccountNumber") !== null &&
        selectedLoanNumber !== undefined
      ) {
        const consent = await AsyncStorage.getItem("consentStatus");
        setIsLoadingUpdateNew(true);
        if ((await AsyncStorage.getItem("isEdit")) == "true") {
          setIsEditable(true);
          setMoveToNext(false);
        }
        // First API call → consent-details
        service.posts
          .getPosts(
            `/api/v1/third-party-apis/consent-details?lan_number=${selectedLoanNumber}&lien_account_number=${getValues(
              "lienAccountNumber",
            )}`,
          )
          .then(async (response) => {
            const data: any = response?.data?.data?.data || [];
            await AsyncStorage.removeItem("isEdit");

            if (data && data?.mobile_no) {
              setMobileNumber(data?.mobile_no);
            }
            if (checkConsent(data) === true) {
              setValidConsent(true);
            } else if (data?.consent_status?.toLowerCase() === "in-progress") {
              setValidConsent("in-progress");
            } else {
              setValidConsent(false);
            }
          })
          .catch((error) => {
            setIsLoadingUpdateNew(false);
          })
          .finally(() => {
            setIsLoadingUpdateNew(false);
          });

        // 🔹 Now handle aggregator details if consent == true OR validConsent == "in-progress"
        if (
          (consent === "true" || validConsent === "in-progress") &&
          aggAppNo !== "" &&
          aggAppNo !== null &&
          aggAppNo !== undefined &&
          aggAppNo !== "undefined"
        ) {
          let statusVal = "in-progress";
          AsyncStorage.removeItem("disbursementFormId");
          service.posts
            .getPosts(
              `api/v1/third-party-apis/account-aggregator-get-details/${aggAppNo}`,
            )
            .then(async (response) => {
              const data: any = response?.data?.data || [];
              const appVal = data?.appVal?.[0];

              if (appVal) {
                setAggregatorData(appVal);
                setMobileNumber(appVal?.applicantMobile);
                setIsLoading(true);
                setisLoadingConsent(true);
                const validConsentData = await hasValidConsent(
                  appVal?.consentDetails,
                  data?.consentInfo?.lienAccountNumber,
                );

                setValidConsent(validConsentData);

                statusVal = checkValidationConsent(
                  appVal?.consentDetails,
                  data?.consentInfo?.lienAccountNumber,
                );
              }
            })
            .catch((error) => {
              logger.error(
                "Error in account-aggregator-get-details API:",
                error,
              );
              statusVal = "in-progress"; // fallback
              setValidConsent(statusVal);
            })
            .finally(() => {
              setIsLoading(false);
              setisLoadingConsent(false);
              // Update consent status
              service.posts
                .updatePost(
                  `api/v1/third-party-apis/consent-status-update/${aggAppNo}/${statusVal}`,
                )
                .catch((error) => {
                  logger.error("Error in consent-status-update API:", error);
                })
                .finally(() => {
                  setIsLoadingUpdateNew(false);
                });
            });
        }
      }
    } catch (error) {
      setIsLoadingUpdateNew(false);
    }
  };

  const checkConsent = (data: any) => {
    const isConsentValid =
      data.consent_status?.toLowerCase() === "approved" &&
      new Date(data.consent_to_date) >= new Date();

    return isConsentValid;
  };

  // const hasValidConsent = async (consents: any, lienAcc: string) => {
  //   const today = new Date();

  //   return consents?.some(async (consent: any) => {
  //     const start = new Date(consent?.request?.dataRange?.from);
  //     const expiry = new Date(consent?.request?.dataRange?.to);

  // // Get last 4 digits of lienAccountNumber
  // let lienAccountNumber = lienAcc;
  // const lienLast4 = lienAccountNumber?.slice(-4);

  // const last4Digits = consent?.response?.accountsLinked
  //   ?.map((acc: any) => acc?.maskedAccNumber)
  //   .filter(Boolean)
  //   .join(", ");

  //     // ✅ Case 1: Correct account linked
  //     if (
  //       consent?.response?.accountsLinked?.some(
  //         (acc: any) => acc?.maskedAccNumber?.slice(-4) === lienLast4
  //       ) &&
  //       consent?.response?.status === "ACTIVE" &&
  //       today >= start &&
  //       today <= expiry
  //     ) {
  //       return true;
  //     }

  //     // ❌ Case 2: Wrong account linked → revoke consent
  //     else if (
  //       consent?.response?.accountsLinked?.some(
  //         (acc: any) => acc?.maskedAccNumber?.slice(-4) !== lienLast4
  //       ) &&
  //       consent?.response?.status === "ACTIVE" &&
  //       today >= start &&
  //       today <= expiry
  //     ) {
  //       setContinueButton(true);

  //       let aggAppNo = await AsyncStorage.getItem("aggApplicationNo");
  //       if (!aggAppNo) {
  //         aggAppNo = aggregatorNo;
  //       }

  //       if (
  //         consent?.consentId &&
  //         aggAppNo !== "" &&
  //         aggAppNo !== null &&
  //         aggAppNo !== undefined &&
  //         aggAppNo !== "undefined"
  //       ) {
  //         const objData = {
  //           applicationNo: aggAppNo,
  //           lan: selectedLoanNumber,
  //           consentId: consent?.consentId,
  //           reason: "Customer requested revocation",
  //         };

  //         await postsServices.addPost(
  //           "/api/v1/third-party-apis/revoke-consent-short-url",
  //           objData
  //         );
  //       }

  // dispatch(
  //   setStatusPopup({
  //     status: "Incorrect Account Selected",
  //     message: `The account you selected for consent [${last4Digits}] does not match the lien account [XXXXXXXX${lienLast4}] in your request. A consent revocation link has been sent to your registered email and phone number.`,
  //     buttonStatus: false,
  //     submessage:
  //       'You can now close this message and click "Continue" to proceed with your request submission.',
  //   })
  // );
  //       return false;
  //     }

  //     // 🔄 Case 3: Default validation
  //     else {
  //       return (
  //         consent?.response?.accountsLinked?.some(
  //           (acc: any) => acc?.maskedAccNumber?.slice(-4) === lienLast4
  //         ) &&
  //         consent?.response?.status === "ACTIVE" &&
  //         today >= start &&
  //         today <= expiry
  //       );
  //     }
  //   });
  // };
  const hasValidConsent = async (consents: any, lienAcc: string) => {
    const today = new Date();
    const lienLast4 = lienAcc?.slice(-4);

    for (const consent of consents ?? []) {
      const start = new Date(consent?.request?.dataRange?.from);
      const expiry = new Date(consent?.request?.dataRange?.to);
      // Get last 4 digits of lienAccountNumber
      let lienAccountNumber = lienAcc;
      const lienLast4 = lienAccountNumber?.slice(-4);

      const last4Digits = consent?.response?.accountsLinked
        ?.map((acc: any) => acc?.maskedAccNumber)
        .filter(Boolean)
        .join(", ");
      // ✅ Case 1
      if (
        consent?.response?.accountsLinked?.some(
          (acc: any) => acc?.maskedAccNumber?.slice(-4) === lienLast4,
        ) &&
        consent?.response?.status === "ACTIVE" &&
        today >= start &&
        today <= expiry
      ) {
        return true;
      }

      // ❌ Case 2
      else if (
        consent?.response?.accountsLinked?.some(
          (acc: any) => acc?.maskedAccNumber?.slice(-4) !== lienLast4,
        ) &&
        consent?.response?.status === "ACTIVE" &&
        today >= start &&
        today <= expiry
      ) {
        setContinueButton(true);
        let aggAppNo = await AsyncStorage.getItem("aggApplicationNo");
        if (!aggAppNo) aggAppNo = aggregatorNo;

        if (consent?.consentId && aggAppNo) {
          const objData = {
            applicationNo: aggAppNo,
            lan: selectedLoanNumber,
            consentId: consent?.consentId,
            reason: "Customer requested revocation",
          };

          await postsServices.secureAddPost(
            "api/v1/third-party-apis/revoke-consent-short-url",
            objData,
          );
        }

        dispatch(
          setStatusPopup({
            status: "Incorrect Account Selected",
            message: `The account you selected for consent [${last4Digits}] does not match the lien account [XXXXXXXX${lienLast4}] in your request. A consent revocation link has been sent to your registered email and phone number.`,
            buttonStatus: false,
            submessage:
              'You can now close this message and click "Continue" to proceed with your request submission.',
          }),
        );

        return false; // <-- Explicit return here
      }

      // 🔄 Case 3
      else {
        return (
          consent?.response?.accountsLinked?.some(
            (acc: any) => acc?.maskedAccNumber?.slice(-4) === lienLast4,
          ) &&
          consent?.response?.status === "ACTIVE" &&
          today >= start &&
          today <= expiry
        );
      }
    }

    return false;
  };

  const checkValidationConsent = (consents: any, lienAcc: string) => {
    const today = new Date();
    const lienLast4 = lienAcc?.slice(-4);

    return consents?.map((consent: any) => {
      const start = new Date(consent?.request?.dataRange?.from);
      const expiry = new Date(consent?.request?.dataRange?.to);

      const hasMatchingAcc = consent?.response?.accountsLinked?.some(
        (acc: any) => acc?.maskedAccNumber?.slice(-4) === lienLast4,
      );

      const hasDifferentAcc = consent?.response?.accountsLinked?.some(
        (acc: any) => acc?.maskedAccNumber?.slice(-4) !== lienLast4,
      );

      if (
        hasMatchingAcc &&
        consent?.response?.status === "ACTIVE" &&
        today >= start &&
        today <= expiry
      ) {
        return "approved";
      } else if (
        hasDifferentAcc &&
        consent?.response?.status === "ACTIVE" &&
        today >= start &&
        today <= expiry
      ) {
        return "wrong-consent";
      } else if (consent?.response?.status === "REJECTED") {
        return "expired";
      } else {
        return "pending";
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUpdateStatus = async () => {
        try {
          const value = await AsyncStorage.getItem("isConsentStatus");
          const isUpdate = JSON.parse(value ?? "false");
          if (isUpdate) {
            // Get the current activeStep value instead of using the closure value
            const currentActiveStep = activeStep;
            if (currentActiveStep === 2) {
              (async () => {
                await handleGetAggregatorDetails();
                AsyncStorage.setItem("isConsentStatus", JSON.stringify(false));
                AsyncStorage.removeItem("consentStatus");
              })();
            }
          }
        } catch (error) {
          logger.error("Error reading AsyncStorage:", error);
        }
      };
      fetchUpdateStatus();
    }, [activeStep]), // Add activeStep as dependency
  );

  useEffect(() => {
    //let activeStepValue = AsyncStorage.getItem("activeStepValue");
    if (activeStep === 2) {
      (async () => {
        await handleGetAggregatorDetails();
      })();
    }
  }, [activeStep, actionRowData?.aggApplicationNo]);

  // 👇 This runs when user comes back from redirect
  useEffect(() => {
    // const params = new URLSearchParams(window.location.search);
    // const consent = params.get("consent");
    // if (consent == "true") {
    // (async () => {
    //   await handleGetAggregatorDetails();
    // })();
    // }
    // handleGetAggregatorDetails();
  }, []);

  const handleProvideConsent = async () => {
    let dateValue = getDateRangeObject(actionRowData?.loanDetails?.loanEndDate);
    // Generate a four-digit random number
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);

    let payload = {
      applicationNo: `${refernceNo}${randomFourDigit}`,
      name: userProfile?.name,
      apiFetchType: 1,
      mobile: mobileNumberNew
        ? mobileNumberNew
        : decrypt(userProfile?.phoneNumber),
      email: decrypt(userProfile?.email),
      applicantType: "0",
      consentProductType: "2",
      fromDate: `${dateValue.startDate}`,
      toDate: `${dateValue.endDate}`,
      consentDuration: "DAY",
      consentDurationValue: getDaysBetween(
        dateValue.startDate,
        dateValue.endDate,
      ).toString(),
      accountType: "",
      lan: selectedLoanNumber,
      cif: "",
      landingPageNotRequired: true,
      disbursementFormId: formID,
      lienAccountNumber: getValues("lienAccountNumber"),
      redirectLink: "https://customerportal.avanse.com/dashboard",
    };
    try {
      setisLoadingConsent(true);
      AsyncStorage.setItem("isEdit", "true");
      const response = await postsServices.secureAddPost(
        "api/v1/third-party-apis/create-consent",
        payload,
      );
      setisLoadingConsent(false);
      if (response?.data?.data?.link) {
        AsyncStorage.setItem(
          "aggApplicationNo",
          response?.data?.data?.consentApplicationNo,
        );
        AsyncStorage.setItem("isConsentStatus", JSON.stringify(false));
        NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
          URL: `https://${response?.data?.data?.link}`,
        });

        //can i call callback function here?
      }
      // // Handle success response
      // dispatch(
      //   setStatusPopup({
      //     status: "success",
      //     message: "Data saved successfully.",
      //     buttonStatus: false,
      //   })
      // );
    } catch (error) {
      // Handle error response
      setisLoadingConsent(false);
      //const err = error as AxiosError<{ message?: string }>;
      dispatch(
        setStatusPopup({
          status: "error",
          message:
            error ??
            //err?.response?.data?.message
            "An error occurred during save.",
          buttonStatus: false,
        }),
      );
    }
  };

  const scrollRef = useRef(null);

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <Header
        backIconNeeded="true"
        showNotification={true}
        showProfile={true}
        onBackPress={handleBackPress}
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        onNotiIconPress={() => {}}
      />

      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          extraScrollHeight={Platform.OS === "ios" ? 100 : 0}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ marginLeft: 8, marginTop: 24 }}>
            <ListHeader
              rightText={
                activeStep == 0 || activeStep == 1
                  ? "Fund Release"
                  : "Fund Release Details"
              }
            />
          </View>

          {/* {(activeStep == 0 ||
            activeStep == 1 ||
            activeStep == 2 ||
            activeStep == 3 ||
            activeStep == 4) &&
            rowData &&
            rowData?.lienValues?.length > 0 && (
              <FundReleaseCard data={rowData} />
            )} */}

          {/* {(activeStep == 0 || activeStep == 1) && <LanStatusSection />} */}

          {(activeStep == 0 ||
            activeStep == 1 ||
            activeStep == 2 ||
            activeStep == 3 ||
            activeStep == 4) &&
            rowData &&
            rowData?.lienValues?.length > 0 && (
              <View style={{ marginHorizontal: 16 }}>
                <FundReleaseCard data={rowData} />
              </View>
            )}

          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={16}
            marginVertical={1}
            marginHorizontal={16}
          >
            {(activeStep == 0 || activeStep == 1 || activeStep == 2) && (
              <>
                <View style={{ flex: 1, width: "100%" }}>
                  <StepIndicator
                    currentStep={step}
                    requestType={getValues("requestType")}
                  />
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.darkGreyTextColor,
                    marginTop: 24,
                  }}
                />
              </>
            )}

            {renderStepContent(uniqueSortedBankData, val)}

            {isLoadingConsent ||
            isLoading ||
            isLoadingUpdate ||
            isAddNewDocumnet ? (
              <LoadingStateShimmer />
            ) : (
              <>
                {(activeStep == 0 || activeStep == 1) && (
                  <>
                    <View>
                      <View style={styles.remarkContainer}>
                        <Text style={styles.remarkTxtStyle}>
                          {strings.REMARKS}
                        </Text>

                        {isRemarkHistoryList && (
                          <>
                            <TouchableOpacity
                              style={[styles.nextBtn]}
                              onPress={() => {
                                handleFilterButtonClick();
                              }}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                            >
                              <Image
                                source={imagePath.remarkHistory}
                                style={[
                                  styles.remarkHistoryIcon,
                                  { tintColor: colors.white },
                                ]}
                              />
                              <Text style={styles.remarkhistoryTxtStyle}>
                                {strings.Remark_History}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>

                      {showRemark && (
                        <>
                          <Controller
                            control={control}
                            name="avanseRemark"
                            rules={{
                              required: "Remark is required.",
                            }}
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { error },
                            }) => (
                              <InputField
                                label="Avanse Remark"
                                placeholder="Please enter Avanse remark"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                editable={false} // corresponds to disabled={true}
                                multiline={true}
                                numberOfLines={3}
                                helperText={error?.message}
                                error={!!error}
                              />
                            )}
                          />
                        </>
                      )}
                    </View>

                    <Controller
                      control={control}
                      name="Remark"
                      rules={{
                        required: "Remark is required.",
                      }}
                      render={({
                        field: { onChange, onBlur, value },
                        fieldState: { error },
                      }) => (
                        <InputField
                          value={value}
                          onChange={(val) => {
                            onChange(val);
                            //handleRemarkChange(val); // pass raw value to your handler
                          }}
                          scrollRef={scrollRef}
                          onBlur={onBlur}
                          label={`Customer Remark`}
                          placeholder="Please enter remarks"
                          editable={isEditable}
                          multiline={true}
                          numberOfLines={3}
                          helperText={error?.message}
                          error={!!error}
                        />
                      )}
                    />
                  </>
                )}

                {activeStep != 4 && (
                  <>
                    {/* Last Four button: Edit, Cancel, Save, Next */}
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "stretch",
                        flex: 1,
                        width: "100%",
                        justifyContent: "flex-end",
                        alignContent: "flex-end",
                        backgroundColor: "transparent",
                        marginTop: 30,
                      }}
                    >
                      {/* Next */}
                      <>
                        {activeStep !== 2 && (
                          <TouchableOpacity
                            style={[
                              styles.nextBtn,
                              {
                                paddingHorizontal: isSmallDevice ? 6 : 16,
                              },
                              nextBtnDisabled() || isConfirmed
                                ? styles.nextBtnDisabled
                                : null,
                            ]}
                            onPress={handleSubmit((data) => {
                              // logger.log(
                              //   "Active Step on Next:%%%%%%%%%%%%%",
                              //   activeStep,
                              // );
                              if (activeStep == 1) {
                                //document upload form
                                handleFunctionForStep2(2, true);
                              } else if (activeStep == 0) {
                                //tranche form
                                handleContinue(data);
                              } else {
                                handleContinueUnderStand(); //Consent form
                              }
                            })}
                            activeOpacity={AppConstants.buttonActiveOpacity}
                            disabled={
                              (!isEnabled && isDisabled) ||
                              isLoadingUpdate ||
                              (formStatus == "query" && activeStep == 3 && isEnabled == true) ||
                              (formStatus == "pendingFromOperationMaker" && activeStep == 3) ||
                              (formStatus == "pendingFromLienOperationChecker" && activeStep == 3) ||
                              (formStatus == "pendingFromOperationChecker" && activeStep == 3) ||
                              (formStatus == "approve" && activeStep == 3) ||
                              (formStatus == "reject" && activeStep == 3) ||
                              (formStatus == "pendingFromCredit" && activeStep == 3) ||
                              (formStatus == "pendingFromCollection" && activeStep == 3) ||
                              (formStatus == "cancelled" && activeStep == 3) ||
                              (formStatus == "cancelled" && activeStep == 1) ||
                              (formStatus == "pendingFromSalesCoordinator" && activeStep == 3) ||
                              (formStatus == "partiallyApproved" && activeStep == 3) ||
                              isLoadingUpdateSave
                            }
                          >
                            {activeStep == 2 ? (
                              <>
                                <Text
                                  style={[
                                    styles.nextBtnTxtStyle,
                                    nextBtnDisabled() &&
                                      styles.confirmBtnTxtStyle,
                                  ]}
                                >
                                  {strings.Confirm}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text style={styles.nextBtnTxtStyle}>
                                  {activeStep == 3
                                    ? "Confirm Fund Release Request"
                                    : strings.Next}
                                </Text>
                              </>
                            )}

                            {activeStep != 2 && (
                              <Image
                                source={imagePath.forwardArrow}
                                style={styles.righArrowIcon}
                              />
                            )}
                          </TouchableOpacity>
                        )}
                        {activeStep === 2 &&
                          (validConsent === true ||
                          continueButton ||
                          isEditable === false ? (
                            <TouchableOpacity
                              style={[
                                styles.nextBtn,
                                { paddingHorizontal: isSmallDevice ? 6 : 16 },
                                /*nextBtnDisabled()*/ isLoadingUpdateNew ||
                                isConfirmed
                                  ? styles.nextBtnDisabled
                                  : null,
                              ]}
                              onPress={handleSkipAggregator}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                              disabled={isLoadingUpdateNew}
                            >
                              <Text
                                style={[
                                  styles.nextBtnTxtStyle,
                                  nextBtnDisabled() &&
                                    styles.confirmBtnTxtStyle,
                                ]}
                              >
                                Continue
                              </Text>

                              {!isLoadingUpdateNew && (
                                <Image
                                  source={imagePath.forwardArrow}
                                  style={styles.righArrowIcon}
                                />
                              )}
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={[
                                styles.nextBtn,
                                { paddingHorizontal: isSmallDevice ? 6 : 16 },
                                nextBtnDisabled() || isConfirmed
                                  ? styles.nextBtnDisabled
                                  : null,
                              ]}
                              onPress={handleSubmit((data) => {
                                handleProvideConsent();
                              })}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                              disabled={isLoadingConsent}
                            >
                              <Text
                                style={[
                                  styles.nextBtnTxtStyle,
                                  nextBtnDisabled() &&
                                    styles.confirmBtnTxtStyle,
                                ]}
                              >
                                Provide Consent
                              </Text>

                              {activeStep != 2 && (
                                <Image
                                  source={imagePath.forwardArrow}
                                  style={styles.righArrowIcon}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                      </>

                      {/* Previous */}
                      <>
                        {activeStep == 0 ||
                        activeStep == 1 ||
                        activeStep == 2 ? (
                          <TouchableOpacity
                            style={[
                              styles.secondaryBtn,
                              { paddingHorizontal: isSmallDevice ? 6 : 14 },
                            ]}
                            activeOpacity={AppConstants.buttonActiveOpacity}
                            onPress={() => {
                              logger.log(
                                "Active Step on Back:%%%%%%%%%%%%%",
                                activeStep,
                              );
                              if (activeStep == 1) {
                                setFormStatus(
                                  formStatus == "query"
                                    ? "query"
                                    : formStatus ==
                                      "pendingFromOperationChecker"
                                    ? "pendingFromOperationChecker"
                                    : formStatus == "pendingFromOperationMaker"
                                    ? "pendingFromOperationMaker"
                                    : formStatus ==
                                      "pendingFromOperationChecker"
                                    ? "pendingFromOperationChecker"
                                    : formStatus ==
                                      "pendingFromLienOperationChecker"
                                    ? "pendingFromLienOperationChecker"
                                    : formStatus == "approve"
                                    ? "approve"
                                    : formStatus == "reject"
                                    ? "reject"
                                    : formStatus == "pendingFromCredit"
                                    ? "pendingFromCredit"
                                    : formStatus == "pendingFromCollection"
                                    ? "pendingFromCollection"
                                    : formStatus ==
                                      "pendingFromSalesCoordinator"
                                    ? "pendingFromSalesCoordinator"
                                    : formStatus == "cancelled"
                                    ? "cancelled"
                                    : "save",
                                );
                                handleFunctionForStep2(1);
                              } else {
                                handleBack();
                              }
                            }}
                          >
                            <Image
                              source={imagePath.backArrow}
                              style={[
                                styles.leftArrowIcon,
                                {
                                  width: 15,
                                  marginRight: isSmallDevice ? 2 : 5,
                                },
                              ]}
                            />
                            <Text style={styles.borderBtnTextStyle}>
                              {strings.previous}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          getButton()
                        )}
                      </>

                      {/* Edit Button */}
                      {activeStep == 0 &&
                        formStatus == "query" &&
                        !isEditable && (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.secondaryBtn,
                                {
                                  paddingHorizontal: isSmallDevice ? 6 : 16,
                                  marginRight: 5,
                                  borderColor: colors.editYellow,
                                  backgroundColor: colors.editYellow,
                                },
                              ]}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                              onPress={() => {
                                setIsEditable(true);
                                setMoveToNext(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.borderBtnTextStyle,
                                  {
                                    color: colors.white,
                                  },
                                ]}
                              >
                                {strings.edit}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}

                      {/* Cancel */}
                      <>
                        {formStatus &&
                          (formStatus == "indraft" || isEditable) &&
                          isDisbTypeApproved === false && (
                            <TouchableOpacity
                              style={[
                                styles.borderBtn,
                                {
                                  marginRight: 4,
                                  paddingHorizontal: isSmallDevice ? 6 : 10,
                                },
                              ]}
                              onPress={() => {
                                handleCancelForm();
                              }}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                            >
                              <Text style={styles.borderBtnTextStyle}>
                                {strings.Cancel}
                              </Text>
                            </TouchableOpacity>
                          )}
                      </>
                      {/* Skip Consent */}
                      <>
                        {activeStep == 2 &&
                          (validConsent === false ||
                            validConsent === "in-progress") &&
                          continueButton === false && (
                            <TouchableOpacity
                              style={[
                                styles.borderBtn,
                                {
                                  marginRight: 4,
                                  paddingHorizontal: isSmallDevice ? 6 : 10,
                                },
                              ]}
                              onPress={() => {
                                handleSkipAggregator();
                              }}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                            >
                              <Text style={styles.borderBtnTextStyle}>
                                Skip Consent
                              </Text>
                            </TouchableOpacity>
                          )}
                      </>

                      {/* Save */}
                      <>
                        {activeStep == 0 &&
                          isEditable &&
                          formStatus != "query" && (
                            <TouchableOpacity
                              style={[
                                styles.borderBtn,
                                {
                                  marginRight: 4,
                                  paddingHorizontal: isSmallDevice ? 6 : 10,
                                },
                              ]}
                              onPress={() => {
                                const data = getValues(); // ✅ gets form data without validation
                                handleSave(data);
                              }}
                              activeOpacity={AppConstants.buttonActiveOpacity}
                            >
                              <Text style={styles.borderBtnTextStyle}>
                                {strings.save_as_draft}
                              </Text>
                            </TouchableOpacity>
                          )}
                      </>
                    </View>
                  </>
                )}
              </>
            )}
          </ShadowCardComponent>

          <ConfirmDialog
            type={"info"}
            open={confirmModal}
            onClose={() => setConfirmModal(false)}
            title="Cancel Request?"
            content="Are you sure you want to cancel this request?"
            onAgree={() => handleAgreeSubmit("Yes")}
            onDisagree={() => handleAgreeSubmit("No")}
            inputField={(value: any) => setCancelRemark(value)}
            fieldValue={cancelRemark}
          />
          <ModalPopup
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title="Remark History"
            style={{ maxHeight: "80%" }}
            childrenAction={
              <TouchableOpacity
                onPress={handleCloseModal}
                activeOpacity={AppConstants.buttonActiveOpacity}
              >
                <View style={styles.closeBtn}>
                  <Text style={{ fontSize: 14, fontFamily: fonts.medium }}>
                    Close
                  </Text>
                </View>
              </TouchableOpacity>
            }
          >
            <View style={{ maxHeight: 400 }}>
              {isRemarkLoading ? (
                <>
                  <ShimmerRemark />
                  <ShimmerRemark />
                  <ShimmerRemark />
                  <ShimmerRemark />
                </>
              ) : remarkList.length > 0 ? (
                <FlatList
                  data={remarkList}
                  renderItem={renderRemark}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={styles.remarkList}
                />
              ) : (
                <Text style={styles.noRemarkText}>No remarks available.</Text>
              )}
            </View>
          </ModalPopup>

          {/* CopyrightComponent for activeStep == 0 and activeStep == 1 (case 0 and case 1) - placed after ShadowCardComponent */}
          {(activeStep == 0 ||
            activeStep == 1 ||
            activeStep == 2 ||
            activeStep == 3) && <CopyrightComponent />}
        </KeyboardAwareScrollView>

        {/* CopyrightComponent for other cases (case 2 & 3) - stays at bottom */}
        {activeStep != 0 &&
          activeStep != 1 &&
          activeStep != 2 &&
          activeStep != 3 && <CopyrightComponent />}
        <Modal
          transparent
          animationType="fade"
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.title}>Important Information</Text>
                  <Text style={styles.message}>
                    While processing the final disbursement amount, the amount
                    marked as lien in your partner bank account will be
                    disbursed first by lien removal and any additional funds
                    required will be disbursed from Avanse as a tranche
                    disbursement provided the total disbursement amount is
                    within the sanctioned limit.
                  </Text>
                  <Text style={styles.message}>Please confirm to proceed.</Text>

                  <Pressable
                    style={styles.button}
                    onPress={handleContinousSave}
                  >
                    <Text style={styles.buttonText}>I understand</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default DisbursementFormTerm;

const styles = StyleSheet.create({
  shimmerCicleView: { width: 40, height: 40, borderRadius: 20 },
  shimmerTitle: { width: 100, height: 16, borderRadius: 4, marginBottom: 4 },
  shimmerDesc: { width: 200, height: 16, borderRadius: 4, marginTop: 8 },
  container: {
    marginHorizontal: 16,
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.appThemeColor,
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  activeStatusText: {
    borderColor: colors.appThemeColor,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 6,
    color: colors.appThemeColor,
    fontSize: 13,
    fontFamily: fonts.medium,
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
  nextBtnTxtStyle: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  confirmBtnTxtStyle: {
    color: colors.confirmText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  borderBtnTextStyle: {
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  remarkhistoryTxtStyle: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  remarkTxtStyle: {
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  remarkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  label: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    color: colors.subHeaderTextColor, //colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
  },
  errorInput: {
    borderColor: "red",
  },
  inputFocused: {
    borderColor: colors.appThemeColor,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  error: {
    color: "red",
    fontSize: 12,
  },
  footerButtons: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  secondaryBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.appThemeColor,
    //minWidth: '30%',
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  nextBtn: {
    padding: 10,
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  nextBtnDisabled: {
    backgroundColor: "#e6e6e6",
  },
  borderBtn: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    alignItems: "center",
    marginTop: 10,
  },
  dropDownTextStyle: {
    color: colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  leftArrowIcon: {
    height: 10,
    width: 20,
    marginRight: 5,
    tintColor: colors.appThemeColor,
  },
  editIcon: {
    height: 15,
    width: 20,
    marginRight: 5,
  },
  righArrowIcon: {
    height: 10,
    width: 20,
    marginLeft: 5,
    tintColor: colors.white,
  },
  sectionTitleStyle: {
    marginTop: 24,
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  errorBorder: {
    borderColor: "red",
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 16,
  },
  remarkList: {
    paddingBottom: 16,
  },
  remarkContainerNew: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  avatar: {
    backgroundColor: "#00B3B5",
    marginRight: 12,
  },
  remarkTextContainer: {
    flex: 1,
    marginHorizontal: 10,
    alignSelf: "center",
  },

  remarkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  remarkAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  remarkDate: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  remarkText: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
    textAlign: "justify",
  },
  noRemarkText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 60,
  },
  fallbackImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "rgb(224, 247, 250)",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: colors.appThemeColor,
    fontFamily: fonts.regular,
    fontSize: 20,
  },

  editBtn: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: colors.disabledTextColor,
    alignItems: "center",
    flexDirection: "row",
  },
  remarkHistoryIcon: {
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    // alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    // fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 10,
    color: "#333",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#00C0C8",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontFamily: fonts.medium,
    // fontWeight: "600",
  },
});
