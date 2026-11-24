import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Formik } from "formik";
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
import { formatIndianRupees } from "../../utils/formatting";
import { setDocumentFormType } from "../../services/redux/slices/documentFormSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AstricString, getInitials } from "../../utils/helpers";
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
import { formatDate } from "../../utils/dateFormatUtils";
import DisbursementFormTermDetails from "../../components/DisbursementFormTermDetails";
import DisbursementFormThanksPage from "../../components/DisbursementFormThanksPage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomSearchDropdown from "../../components/CustomSearchDropdown";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import { createModuleLogger } from "../../utils/logger";
import AddNewDocuments from "./AddNewDocuments";

// Performance optimized interfaces
interface FormData {
  paymentTypeId: number;
  disbursementPurposeId?: number;
  universityId?: number;
  paymentCurrencyId?: number;
  requestedAmount: string;
  bankId?: number;
  accountNumber?: string;
  ifsccode?: string;
  accHolderName?: string;
  AmountPaid?: string;
  countryCodeId?: number;
  overseasNumber?: string;
  overseasaddress?: string;
  paymentDate?: string;
  paymentMadeTo?: string;
  Remark?: string;
  avanseRemark?: string;
  accountTypeId: number;
  isNewUniversity: boolean;
  newUniversityId?: number;
  loanAccountNumber: string;
  Key: string;
  otherDisbursementPurpose?: string;
}

// Consolidated state interface
interface FormStateType {
  changeUniversity: boolean;
  isLoading: boolean;
  isLoadingUpdate: boolean;
  isAddNewDocument: boolean;
  isConfirmed: boolean;
  isLoadingUpdateSave: boolean;
  activeStep: number;
  isEditable: boolean;
  showEditButton: boolean;
  buttonEnable: boolean;
  formID: number;
  paymentTypeId: number;
  errorMessage: string | null;
  isQueryable: boolean;
  isMoveToNext: boolean;
  formStatus: string;
  remarkId: number;
  isRemarkHistoryList: boolean;
  isContinue: boolean;
  paymentCurrencyField: boolean;
  isFormSaved: boolean;
  accountTypeId: number;
  focusedInput: string | null;
  refernceNo: string;
  showHello: boolean;
  showRemark: boolean;
  activeFunction: number;
  isModalOpen: boolean;
  step: number;
}

interface DataStateType {
  dataSet: any;
  dataSetRemark: any;
  disbList: any[];
  accountTypeList: any[];
}

const DisbursementFormTermOptimized = memo(() => {
  const logger = createModuleLogger("DisbursementFormTermOptimized");

  // Consolidated state management
  const [formState, setFormState] = useState<FormStateType>({
    changeUniversity: false,
    isLoading: false,
    isLoadingUpdate: false,
    isAddNewDocument: false,
    isConfirmed: false,
    isLoadingUpdateSave: false,
    activeStep: 0,
    isEditable: true,
    showEditButton: false,
    buttonEnable: true,
    formID: 0,
    paymentTypeId: 0,
    errorMessage: null,
    isQueryable: false,
    isMoveToNext: false,
    formStatus: "",
    remarkId: 0,
    isRemarkHistoryList: false,
    isContinue: false,
    paymentCurrencyField: false,
    isFormSaved: false,
    accountTypeId: 0,
    focusedInput: null,
    refernceNo: "",
    showHello: false,
    showRemark: false,
    activeFunction: 0,
    isModalOpen: false,
    step: 1,
  });

  const [dataState, setDataState] = useState<DataStateType>({
    dataSet: {},
    dataSetRemark: {},
    disbList: [],
    accountTypeList: [],
  });

  const [uiState, setUiState] = useState({
    isRemarkLoading: false,
    confirmModal: false,
    cancelRemark: "",
  });

  // Form hook
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur', // Only validate on blur to improve performance
    reValidateMode: 'onBlur',
  });

  const dispatch = useDispatch();
  const { width } = Dimensions.get("window");
  const shimmerWidth = width - 32;

  // Memoized selectors to prevent unnecessary re-renders
  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData,
    (left, right) => JSON.stringify(left) === JSON.stringify(right)
  );
  
  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber
  );
  
  const lastDisbursementStatus = useSelector(
    (state: RootState) => state?.disbursementButtonSlice?.lastDisbursementStatus,
    (left, right) => left?.lastDisbFormId === right?.lastDisbFormId
  );
  
  const rowData = useSelector(
    (state: RootState) => state?.disbursementButtonSlice?.actionRowData,
    (left, right) => left?.disbFormId === right?.disbFormId
  );
  
  const { userProfile, businessType } = useSelector(authSelector);
  const userLoanCategory = useSelector(userLoanCatSelector);

  // Optimized state updaters
  const updateFormState = useCallback((updates: Partial<FormStateType>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDataState = useCallback((updates: Partial<DataStateType>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized computed values
  const convertUndisbValue = useMemo(() => {
    const value = formatIndianRupees(
      lastDisbursementStatus?.loanUndisbursedAmount || 0
    );
    return Number(value.replace(/[^\d.-]/g, "").split(".")[0]);
  }, [lastDisbursementStatus?.loanUndisbursedAmount]);

  // Memoized options for dropdowns
  const options1 = useMemo(
    () =>
      (dataState.dataSet?.UniversityData || [])
        .filter(
          (uc: any, index: number, self: any[]) =>
            index === self.findIndex((u) => u.name === uc.name)
        )
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
        .map((uc: any) => ({
          value: uc.id,
          label: uc.name.trim(),
        })),
    [dataState.dataSet?.UniversityData]
  );

  const options2 = useMemo(
    () =>
      dataState.dataSet?.defaultUniversity?.map((uc: any) => ({
        value: uc.id,
        label: uc.name.trim(),
      })) || [],
    [dataState.dataSet?.defaultUniversity]
  );

  const phoneCodeOptions = useMemo(
    () =>
      dataState.dataSet.PhoneCodes?.filter(
        (pc: any, index: number, self: any[]) =>
          index === self.findIndex((p) => p.countryCode === pc.countryCode)
      )
        .sort((a: any, b: any) => a.countryCode - b.countryCode)
        .map((pc: any) => ({
          value: pc.id,
          label: `+${pc.countryCode}`,
        })) || [],
    [dataState.dataSet.PhoneCodes]
  );

  const uniqueSortedBankData = useMemo(
    () =>
      (dataState.dataSet.Bankdata || [])
        .filter(
          (bd: any, index: number, self: any[]) =>
            index === self.findIndex((b) => b.bankName === bd.bankName)
        )
        .sort((a: any, b: any) => a.bankName.localeCompare(b.bankName))
        .map((bd: any) => ({
          value: bd.id,
          label: bd.bankName,
        })),
    [dataState.dataSet.Bankdata]
  );

  // Optimized input handlers
  const handleInputFocus = useCallback((inputName: string) => {
    updateFormState({ focusedInput: inputName });
  }, [updateFormState]);

  const handleInputBlur = useCallback(() => {
    updateFormState({ focusedInput: null });
  }, [updateFormState]);

  const getInputStyle = useCallback((
    inputName: string,
    error?: boolean,
    additionalStyles?: any
  ) => {
    const baseStyle = [styles.input];

    if (error) {
      baseStyle.push(styles.inputError);
    } else if (formState.focusedInput === inputName) {
      baseStyle.push(styles.inputFocused);
    }

    if (additionalStyles) {
      baseStyle.push(additionalStyles);
    }

    return baseStyle;
  }, [formState.focusedInput]);

  // Optimized handlers
  const handleIsFormSaved = useCallback(() => {
    updateFormState({ isFormSaved: true });
    dispatch(setDocumentNewData(true));
    dispatch(setDocumentFormType("continue"));
  }, [updateFormState, dispatch]);

  const handleIsFormSavedFalse = useCallback(() => {
    updateFormState({ isFormSaved: false });
    dispatch(clearDocumentNewData());
  }, [updateFormState, dispatch]);

  // Debounced handlers for better performance
  const handleRequestedDisbAmount = useMemo(
    () => 
      debounce((value: string) => {
        const numValue = Number(value);
        let errorMsg = null;

        if (numValue > convertUndisbValue) {
          errorMsg = `Amount cannot exceed ${formatIndianRupees(convertUndisbValue)}`;
        } else if (formState.showHello === false && getValues("AmountPaid")) {
          const amountPaid = Number(getValues("AmountPaid"));
          if (numValue > amountPaid) {
            errorMsg = "Requested amount cannot exceed amount paid";
          }
        }

        updateFormState({ errorMessage: errorMsg });
      }, 300),
    [convertUndisbValue, formState.showHello, getValues, updateFormState]
  );

  // Optimized API calls
  const fetchInitialData = useCallback(async () => {
    if (formState.isLoading) return; // Prevent duplicate calls
    
    updateFormState({ isLoading: true });
    
    try {
      const formIdpayload = rowData === "" 
        ? lastDisbursementStatus?.lastDisbFormId 
        : rowData?.disbFormId;

      const payloadData = Object.keys(rowData).length <= 0 
        ? { formId: formIdpayload, type: 1 }
        : { formId: formIdpayload };

      let response;
      if (formIdpayload) {
        response = await postsServices.secureAddPost(
          "api/v1/disbursement-form/default",
          payloadData
        );
      } else {
        response = await postsServices.secureAddPost(
          "api/v1/disbursement-form/default-data",
          { loanAccountNumber: selectedLoanNumber }
        );
      }

      // Process response data
      const defaultData = response?.data?.data?.getDefaltData;
      if (defaultData) {
        updateDataState({
          dataSet: {
            ...defaultData,
            AccountType: [
              { id: 1, accountType: "International Account" },
              { id: 2, accountType: "Indian Account" }
            ]
          },
          disbList: response?.data?.data?.disbPurspose || [],
          accountTypeList: defaultData.AccountType || []
        });
      }

      // Handle existing form data
      const existingData = response?.data?.data?.getExistingData;
      if (existingData && typeof existingData === "object") {
        updateFormState({
          paymentTypeId: existingData.paymentTypeId,
          accountTypeId: existingData.accountTypeId,
          refernceNo: existingData.refernceNo,
          formStatus: existingData.formStatus || "continue"
        });

        if (existingData.paymentTypeId === 2) {
          updateFormState({ showHello: true });
        }

        // Populate form with existing data
        const formData = {
          ...existingData,
          avanseRemark: existingData.avanseRemarks?.trim() || "",
          Remark: existingData.customerRemarks?.trim() || "",
          Key: "continue",
        };
        
        reset(formData);
      }

    } catch (error) {
      logger.error("Error fetching initial data:", error);
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Failed to load form data. Please try again.",
          buttonStatus: false,
        })
      );
    } finally {
      updateFormState({ isLoading: false });
    }
  }, [
    rowData, 
    lastDisbursementStatus, 
    selectedLoanNumber, 
    formState.isLoading,
    updateFormState, 
    updateDataState, 
    reset, 
    dispatch, 
    logger
  ]);

  // Optimized form submission
  const handleContinue = useCallback(async (data: FormData) => {
    if (formState.isLoadingUpdate) return;
    
    updateFormState({ isLoadingUpdate: true });

    try {
      const payload = {
        ...data,
        requestedAmount: parseInt(data.requestedAmount),
        disbursementFormId: formState.formID,
        loanAccountNumber: selectedLoanNumber,
        Key: "continue",
      };

      const response = await postsServices.secureAddPost(
        "api/v1/disbursement-form/create-form",
        payload
      );

      const saveFormData = response?.data?.data?.saveForm;
      if (saveFormData) {
        updateFormState({
          formID: saveFormData.id,
          refernceNo: saveFormData.refernceNo,
          isRemarkHistoryList: true,
          formStatus: saveFormData.status,
          activeStep: 1,
          step: 2,
          isAddNewDocument: true,
        });

        dispatch(setDocumentFormType(saveFormData.formStatus));
        handleIsFormSavedFalse();
      }

    } catch (error) {
      logger.error("Error in handleContinue:", error);
      const isConnected = await checkConnectivity();
      if (isConnected) {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: "Something went wrong!",
            buttonStatus: false,
          })
        );
      }
    } finally {
      updateFormState({ isLoadingUpdate: false });
    }
  }, [
    formState.isLoadingUpdate,
    formState.formID,
    selectedLoanNumber,
    updateFormState,
    handleIsFormSavedFalse,
    dispatch,
    logger
  ]);

  // Memoized components for better performance
  const StepContent = memo(({ step }: { step: number }) => {
    switch (step) {
      case 0:
        return formState.isLoading ? (
          <ShimmerContent />
        ) : (
          <FormStep0 />
        );
      case 1:
        return (
          <AddNewDocuments
            disbursementFormId={formState.formID}
            activeFunction={formState.activeFunction}
            setActiveFunction={(value: number) => updateFormState({ activeFunction: value })}
            paymentTypeId={formState.paymentTypeId}
            setActiveStep={(step: number) => updateFormState({ activeStep: step })}
            remarkId={formState.remarkId}
            remark={watch("Remark")}
            isNewUniversity={watch("isNewUniversity")}
            accountTypeId={formState.accountTypeId}
            isMoveToNext={formState.isMoveToNext}
            setIsLoadingUpdate={(loading: boolean) => updateFormState({ isLoadingUpdate: loading })}
            isLoadingUpdate={formState.isLoadingUpdate}
            isAddNewDocumnet={formState.isAddNewDocument}
            setIsAddNewDocumnet={(value: boolean) => updateFormState({ isAddNewDocument: value })}
          />
        );
      case 2:
        return <DisbursementFormTermDetails disbursementFormId={formState.formID} />;
      case 3:
        return <DisbursementFormThanksPage disbursementFormId={formState.formID} />;
      default:
        return null;
    }
  });

  const ShimmerContent = memo(() => (
    <View>
      {Array.from({ length: 8 }, (_, index) => (
        <View key={index} style={{ marginBottom: 24 }}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={{
              width: shimmerWidth * 0.5,
              height: 14,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={{ width: "100%", height: 45, borderRadius: 8 }}
          />
        </View>
      ))}
    </View>
  ));

  const FormStep0 = memo(() => (
    <View>
      {/* Payment Type */}
      <Controller
        name="paymentTypeId"
        control={control}
        rules={{ required: "Payment Type is required." }}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <>
            <AstricString
              label={strings.Payment_Type}
              style={styles.label}
            />
            <Dropdown
              data={
                dataState.dataSet.PaymentType?.map((bd: any) => ({
                  value: bd.id,
                  label: bd.paymentType,
                })) || []
              }
              labelField="label"
              valueField="value"
              value={value}
              onChange={(selectedValue) => {
                onChange(selectedValue.value);
                updateFormState({ 
                  paymentTypeId: selectedValue.value,
                  showHello: selectedValue.value === 2 
                });
                handleIsFormSaved();
              }}
              placeholder=""
              style={[styles.dropdown, error && styles.errorBorder]}
              placeholderStyle={styles.dropDownTextStyle}
              selectedTextStyle={styles.dropDownTextStyle}
              disable={!formState.isEditable}
            />
            {error?.message && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </>
        )}
      />

      {/* University Selection */}
      <Controller
        name="universityId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <CustomSearchDropdown
            options={options2?.length > 0 ? options2 : options1}
            label="Name of the University"
            isMandatory={true}
            value={value || ""}
            onChange={(selectedValue) => {
              onChange(selectedValue);
              handleIsFormSaved();
            }}
            disabled={!formState.isEditable || options2?.length > 0}
            placeholder="Select University"
          />
        )}
      />

      {/* Other form fields... */}
    </View>
  ));

  // Initialize data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle back button
  const handleBackPress = useCallback(() => {
    NavigationService.goBack();
  }, []);

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <Header
        backIconNeeded={true}
        showNotification={false}
        showProfile={false}
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ marginLeft: 8, marginTop: 24 }}>
            <ListHeader
              rightText={
                formState.activeStep == 0 || formState.activeStep == 1
                  ? "Disbursement"
                  : "Disbursement Details"
              }
            />
          </View>

          <ShadowCardComponent
            paddingHorizonatal={16}
            paddingVertical={16}
            marginVertical={16}
            marginHorizontal={16}
          >
            {(formState.activeStep == 0 || formState.activeStep == 1 || formState.activeStep == 2) && (
              <>
                <StepIndicator currentStep={formState.step} />
                <View style={styles.divider} />
              </>
            )}

            <StepContent step={formState.activeStep} />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.nextBtn, { paddingHorizontal: 16 }]}
                onPress={handleSubmit(handleContinue)}
                activeOpacity={AppConstants.buttonActiveOpacity}
                disabled={formState.isLoadingUpdate}
              >
                {formState.isLoadingUpdate ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {formState.activeStep === 0 ? "Continue" : "Next"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ShadowCardComponent>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

// Helper function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    color: colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center" as const,
  },
  inputError: {
    borderColor: "red",
  },
  inputFocused: {
    borderColor: colors.appThemeColor,
  },
  label: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  dropDownTextStyle: {
    color: colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.darkGreyTextColor,
    marginTop: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 32,
  },
  nextBtn: {
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: "center",
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});

export default DisbursementFormTermOptimized;
