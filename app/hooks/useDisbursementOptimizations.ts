import { useState, useCallback, useMemo } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook for optimized form state management in DisbursementFormTerm
 * This consolidates multiple useState hooks into efficient state management
 */
export const useDisbursementFormState = () => {
  // Consolidated form state
  const [formState, setFormState] = useState({
    changeUniversity: false,
    isLoading: false,
    isLoadingUpdate: false,
    isAddNewDocument: false,
    isConfirmed: false,
    isLoadingUpdateSave: false,
    activeStep: 0,
    isEditable: true,
    isEditableNext: true,
    showEditButton: false,
    buttonEnable: true,
    formID: 0,
    paymentTypeId: 0,
    isModalOpen: false,
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
    errorMessageAmountPaid: null,
    focusedInput: null,
    refernceNo: "",
    showHello: false,
    showRemark: false,
    activeFunction: 0,
    step: 1,
  });

  // Data state for API responses
  const [dataState, setDataState] = useState({
    dataSet: {},
    dataSetRemark: {},
    disbList: [],
    accountTypeList: [],
  });

  // UI state for modals and loading
  const [uiState, setUiState] = useState({
    isRemarkLoading: false,
    confirmModal: false,
    cancelRemark: "",
  });

  // Optimized state updaters with batching
  const updateFormState = useCallback((updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDataState = useCallback((updates) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUiState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  // Batch multiple state updates for better performance
  const batchStateUpdates = useCallback((formUpdates, dataUpdates, uiUpdates) => {
    if (formUpdates) updateFormState(formUpdates);
    if (dataUpdates) updateDataState(dataUpdates);
    if (uiUpdates) updateUiState(uiUpdates);
  }, [updateFormState, updateDataState, updateUiState]);

  // Reset specific state sections
  const resetFormState = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      isLoading: false,
      isLoadingUpdate: false,
      errorMessage: null,
      isFormSaved: false,
    }));
  }, []);

  return {
    // State objects
    formState,
    dataState,
    uiState,
    
    // Update functions
    updateFormState,
    updateDataState,
    updateUiState,
    batchStateUpdates,
    resetFormState,
    
    // Computed values
    isDisabled: !formState.isEditable || formState.activeStep === 5,
    isEnabled: formState.isMoveToNext,
    canProceed: !formState.isLoadingUpdate && !formState.isLoading,
  };
};

/**
 * Custom hook for optimized dropdown data processing
 * Memoizes expensive filtering and sorting operations
 */
export const useOptimizedDropdownData = (dataSet) => {
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

  const options2 = useMemo(
    () =>
      dataSet?.defaultUniversity?.map((uc) => ({
        value: uc.id,
        label: uc.name.trim(),
      })) || [],
    [dataSet?.defaultUniversity]
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

  const uniqueSortedBankData = useMemo(
    () =>
      (dataSet.Bankdata || [])
        .filter(
          (bd, index, self) =>
            index === self.findIndex((b) => b.bankName === bd.bankName)
        )
        .sort((a, b) => a.bankName.localeCompare(b.bankName))
        .map((bd) => ({
          value: bd.id,
          label: bd.bankName,
        })),
    [dataSet.Bankdata]
  );

  const paymentTypeOptions = useMemo(
    () =>
      dataSet.PaymentType?.map((bd) => ({
        value: bd.id,
        label: bd.paymentType,
      })) || [],
    [dataSet.PaymentType]
  );

  return {
    options1,
    options2,
    phoneCodeOptions,
    uniqueSortedBankData,
    paymentTypeOptions,
  };
};

/**
 * Custom hook for debounced input validation
 */
export const useDebouncedValidation = (delay = 300) => {
  const createDebouncedHandler = useCallback(
    (validationFn) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => validationFn(...args), delay);
      };
    },
    [delay]
  );

  return { createDebouncedHandler };
};

/**
 * Custom hook for optimized form input handlers
 */
export const useOptimizedInputHandlers = (updateFormState, handleIsFormSaved) => {
  const handleInputFocus = useCallback((inputName) => {
    updateFormState({ focusedInput: inputName });
  }, [updateFormState]);

  const handleInputBlur = useCallback(() => {
    updateFormState({ focusedInput: null });
  }, [updateFormState]);

  const handleInputChange = useCallback((fieldName, value, shouldSave = true) => {
    // Update form value and optionally trigger save state
    if (shouldSave) {
      handleIsFormSaved();
    }
  }, [handleIsFormSaved]);

  return {
    handleInputFocus,
    handleInputBlur,
    handleInputChange,
  };
};

/**
 * Custom hook for performance monitoring (development only)
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useMemo(() => ({ current: 0 }), []);
  
  renderCount.current += 1;
  
  if (__DEV__) {
    logger.log(`${componentName} render count: ${renderCount.current}`);
  }
  
  return renderCount.current;
};

/**
 * Custom hook for optimized API calls with caching
 */
export const useOptimizedApiCalls = () => {
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(new Set());

  const cachedApiCall = useCallback(async (key, apiCall, dependencies = []) => {
    const cacheKey = `${key}_${JSON.stringify(dependencies)}`;
    
    // Return cached result if available
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Prevent duplicate requests
    if (loading.has(cacheKey)) {
      return null;
    }

    try {
      setLoading(prev => new Set(prev).add(cacheKey));
      const result = await apiCall();
      
      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, result));
      
      return result;
    } catch (error) {
      logger.error(`API call failed for key: ${key}`, error);
      throw error;
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, [cache, loading]);

  const clearCache = useCallback((key) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        Array.from(newCache.keys())
          .filter(k => k.startsWith(key))
          .forEach(k => newCache.delete(k));
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  return {
    cachedApiCall,
    clearCache,
    isLoading: (key) => Array.from(loading).some(k => k.startsWith(key)),
  };
};

export default {
  useDisbursementFormState,
  useOptimizedDropdownData,
  useDebouncedValidation,
  useOptimizedInputHandlers,
  usePerformanceMonitor,
  useOptimizedApiCalls,
};
