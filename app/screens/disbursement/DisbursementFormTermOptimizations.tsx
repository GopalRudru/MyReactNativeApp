// PERFORMANCE OPTIMIZED VERSION OF KEY FUNCTIONS
// Apply these changes to the existing DisbursementFormTerm.tsx

import logger from "../../utils/logger";

// 1. CONSOLIDATE STATE MANAGEMENT (Replace existing state declarations)
const [formState, setFormState] = useState({
  changeUniversity: false,
  isLoading: false,
  isLoadingUpdate: false,
  isAddNewDocument: false,
  isConfirmed: false,
  activeStep: 0,
  isEditable: true,
  showEditButton: false,
  formID: 0,
  paymentTypeId: 0,
  errorMessage: null,
  isQueryable: false,
  isMoveToNext: false,
  formStatus: "",
  remarkId: 0,
  isFormSaved: false,
  accountTypeId: 0,
  focusedInput: null,
  refernceNo: "",
  showHello: false,
  activeFunction: 0,
  isModalOpen: false,
  step: 1,
});

// Optimized state updater
const updateFormState = useCallback((updates) => {
  setFormState(prev => ({ ...prev, ...updates }));
}, []);

// 2. OPTIMIZE SELECTORS (Replace existing selectors)
const dashboardDataSet = useSelector(
  (state) => state.dashboardData.sanctionedDisbursedData,
  (left, right) => left?.length === right?.length && 
    left?.every((item, index) => item?.id === right[index]?.id)
);

const selectedLoanNumber = useSelector(
  (state) => state?.dashboardData?.selectedLoanNumber
);

const lastDisbursementStatus = useSelector(
  (state) => state?.disbursementButtonSlice?.lastDisbursementStatus,
  (left, right) => left?.lastDisbFormId === right?.lastDisbFormId
);

// 3. MEMOIZE HEAVY COMPUTATIONS (Replace existing computations)
const convertUndisbValue = useMemo(() => {
  const value = formatIndianRupees(
    lastDisbursementStatus?.loanUndisbursedAmount || 0
  );
  return Number(value.replace(/[^\d.-]/g, "").split(".")[0]);
}, [lastDisbursementStatus?.loanUndisbursedAmount]);

const options1 = useMemo(
  () =>
    (dataSet?.UniversityData || [])
      .filter(
        (uc, index, self) =>
          index === self.findIndex((u) => u.name === uc.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((uc) => ({
        value: uc.id,
        label: uc.name.trim(),
      })),
  [dataSet?.UniversityData]
);

const phoneCodeOptions = useMemo(
  () =>
    dataSet.PhoneCodes?.filter(
      (pc, index, self) =>
        index === self.findIndex((p) => p.countryCode === pc.countryCode)
    )
      .sort((a, b) => a.countryCode - b.countryCode)
      .map((pc) => ({
        value: pc.id,
        label: `+${pc.countryCode}`,
      })) || [],
  [dataSet.PhoneCodes]
);

// 4. OPTIMIZE INPUT HANDLERS (Replace existing handlers)
const handleInputFocus = useCallback((inputName) => {
  updateFormState({ focusedInput: inputName });
}, [updateFormState]);

const handleInputBlur = useCallback(() => {
  updateFormState({ focusedInput: null });
}, [updateFormState]);

const handleIsFormSaved = useCallback(() => {
  updateFormState({ isFormSaved: true });
  dispatch(setDocumentNewData(true));
  dispatch(setDocumentFormType("continue"));
}, [updateFormState, dispatch]);

// 5. DEBOUNCE EXPENSIVE OPERATIONS
const debouncedRequestedAmountHandler = useMemo(
  () => {
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    return debounce((value) => {
      const numValue = Number(value);
      let errorMsg = null;

      if (numValue > convertUndisbValue) {
        errorMsg = `Amount cannot exceed ${formatIndianRupees(convertUndisbValue)}`;
      } else if (!formState.showHello && getValues("AmountPaid")) {
        const amountPaid = Number(getValues("AmountPaid"));
        if (numValue > amountPaid) {
          errorMsg = "Requested amount cannot exceed amount paid";
        }
      }

      updateFormState({ errorMessage: errorMsg });
    }, 300);
  },
  [convertUndisbValue, formState.showHello, getValues, updateFormState]
);

// 6. OPTIMIZE API CALLS
const fetchInitialData = useCallback(async () => {
  if (formState.isLoading) return; // Prevent duplicate calls
  
  updateFormState({ isLoading: true });
  
  try {
    const formIdpayload = rowData === "" 
      ? lastDisbursementStatus?.lastDisbFormId 
      : rowData?.disbFormId;

    let payloadData = {};
    if (Object.keys(rowData).length <= 0) {
      payloadData = {
        formId: formIdpayload,
        type: 1,
      };
    } else {
      payloadData = {
        formId: formIdpayload,
      };
    }

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

    // Process and set data efficiently
    const defaultData = response?.data?.data?.getDefaltData;
    if (defaultData) {
      defaultData["AccountType"] = [
        { id: 1, accountType: "International Account" },
        { id: 2, accountType: "Indian Account" },
      ];

      setDataSet(defaultData);
      setDisbList(response?.data?.data?.disbPurspose || []);
      setAccountTypeList(defaultData.AccountType || []);
    }

    // Handle existing data
    const existingData = response?.data?.data?.getExistingData;
    if (existingData && typeof existingData === "object") {
      updateFormState({
        paymentTypeId: existingData.paymentTypeId,
        accountTypeId: existingData.accountTypeId,
        refernceNo: existingData.refernceNo,
        showHello: existingData.paymentTypeId === 2
      });

      // Process and reset form data
      const updatedData = {
        ...existingData,
        avanseRemark: (existingData.avanseRemarks || "").trim(),
        Remark: (existingData.customerRemarks || "").trim(),
        Key: "continue",
      };

      reset(updatedData);
    }

  } catch (error) {
    logger.error("Error fetching initial data:", error);
    const isConnected = await checkConnectivity();
    if (isConnected) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Failed to load form data. Please try again.",
          buttonStatus: false,
        })
      );
    }
  } finally {
    updateFormState({ isLoading: false });
  }
}, [
  rowData, 
  lastDisbursementStatus, 
  selectedLoanNumber, 
  formState.isLoading,
  updateFormState, 
  reset, 
  dispatch, 
  logger
]);

// 7. MEMOIZE RENDER COMPONENTS
const PaymentTypeDropdown = memo(({ value, onChange, error, isEditable, dataSet }) => (
  <>
    <AstricString
      label={strings.Payment_Type}
      style={styles.label}
    />
    <Dropdown
      data={
        dataSet.PaymentType?.map((bd) => ({
          value: bd.id,
          label: bd.paymentType,
        })) || []
      }
      labelField="label"
      valueField="value"
      value={value}
      onChange={(selectedValue) => {
        setTimeout(() => {
          onChange(selectedValue.value);
          updateFormState({ 
            paymentTypeId: selectedValue.value,
            showHello: selectedValue.value === 2 
          });
          handleIsFormSaved();
        }, 0);
      }}
      placeholder=""
      style={[styles.dropdown, error && styles.errorBorder]}
      placeholderStyle={styles.dropDownTextStyle}
      selectedTextStyle={styles.dropDownTextStyle}
      disable={!isEditable}
    />
    {error?.message && (
      <Text style={styles.errorText}>{error.message}</Text>
    )}
  </>
));

// 8. OPTIMIZE FORM CONFIGURATION
const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  control,
  getValues,
  trigger,
  formState: { errors },
} = useForm({
  mode: 'onBlur', // Only validate on blur for better performance
  reValidateMode: 'onBlur',
  defaultValues: {
    paymentTypeId: 0,
    disbursementPurposeId: null,
    universityId: null,
    requestedAmount: "",
    // ... other default values
  },
});

// 9. OPTIMIZE EFFECT HOOKS
useEffect(() => {
  fetchInitialData();
}, []); // Remove unnecessary dependencies

useEffect(() => {
  if (options2?.length > 0) {
    setValue("universityId", options2[0]?.value);
  }
}, [options2, setValue]); // Only run when options2 changes

// 10. IMPLEMENT LOADING STATES EFFICIENTLY
const LoadingOverlay = memo(() => (
  formState.isLoading ? (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={colors.appThemeColor} />
      <Text style={styles.loadingText}>Loading form data...</Text>
    </View>
  ) : null
));

// ADDITIONAL PERFORMANCE STYLES
const performanceStyles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textColor,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  // Add other optimized styles as needed
});

// PERFORMANCE MONITORING (Optional - for development)
const usePerformanceMonitor = () => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      logger.log(`DisbursementFormTerm render count: ${renderCount.current}`);
    }
  });
  
  return renderCount.current;
};

// Usage in component:
// const renderCount = usePerformanceMonitor();

export default DisbursementFormTerm;
