import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistor, store } from '../services/redux/store';
import { createModuleLogger } from './logger';
import { disableBiometricAuth, disableBiometricLock, disableMpinAuth, enableBiometricAuth, enableBiometricLock, enableMpinAuth, isBiometricEnabled, isBiometricLockEnabled, isMpinEnabled } from '../screens/auth/mpinBiometric/BiometricUtils';
import { setMpinData, setOtpVerifyUsersData, setUserProfileData } from '../services/redux/slices/authSlice';

const logger = createModuleLogger('AsyncStorageUtils');

// Storage keys constants
export const SECURITY_THREAT_KEY = 'persistent_security_threat';
export const IS_LOGGED_IN = 'is_logged_in';
export const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
export const MPIN_ENABLED_KEY = 'mpin_enabled';
export const BIOMETRIC_LOCK_ENABLED_KEY = 'biometric_lock_enabled';
export const FEEDBACK_RATING_VISIBLE_COUNT_KEY = 'feedback_rating_visible_count';
export const IS_SESSION_TIME_OUT = 'isSessionTimeOut';

/**
 * Stores a value in AsyncStorage after serializing it to a JSON string.
 * @param key The key under which the value is stored.
 * @param value The value to store.
 */
export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    logger.error(`Error storing item with key "${key}":`, error);
  }
};

/**
 * Retrieves a value from AsyncStorage and parses it from a JSON string.
 * @param key The key of the value to retrieve.
 * @returns The parsed value, or null if not found or parsing fails.
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    logger.error(`Error retrieving item with key "${key}":`, error);
    return null;
  }
};

/**
 * Removes a value from AsyncStorage.
 * @param key The key of the value to remove.
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error removing item with key "${key}":`, error);
  }
};



//clear store and async-store 
export const clearAsyncStoreAndReduxStore = async (
  clearMpin: boolean = false,
) => {
  try {
    // Read auth state FIRST — before any await that could yield to a store reset
    const {
      mpinData: mpinDataFromStore,
      otpVerifyUsersData: otpVerifyUsersDataFromStore,
      userProfile: userProfileFromStore,
    } = store.getState().auth;

    const mpinEnabled = await isMpinEnabled();
    const biometricEnabled = await isBiometricEnabled();
    const biometricLockEnabled = await isBiometricLockEnabled();

    // Clear AsyncStorage (removes all keys and values)
    await AsyncStorage.clear();

    //Purge persisted store (clears AsyncStorage)
    await persistor.purge();
    
    //Reset Redux memory store manually
    store.dispatch({ type: "RESET_APP" });
    
    logger.log("✅ Redux store and AsyncStorage cleared successfully.");

    // Restore MPIN data if clearMpin is false and MPIN was enabled before clearing
    if (!clearMpin && mpinEnabled) {
      await enableMpinAuth();
      store.dispatch(setMpinData(mpinDataFromStore));
      store.dispatch(setOtpVerifyUsersData(otpVerifyUsersDataFromStore));
      store.dispatch(setUserProfileData(userProfileFromStore));
    } else {
      await disableMpinAuth();
    }

    if (biometricLockEnabled) {
      await enableBiometricLock();
    } else {
      await disableBiometricLock();
    }

    if (!clearMpin && biometricEnabled) {
      await enableBiometricAuth();
    } else {
      await disableBiometricAuth();
    }
  } catch (error) {
    logger.error("❌ Failed to clear store:", error);
  }
};

/**
 * Persists a flag indicating the user has opted in to biometric lock.
 * Call this when the user taps "Yes, enable …" in the BiometricLockBottomSheet.
 */
export const increaseFeedbackRatingCount = async (count: number): Promise<void> => {
  try {
    await setItem(FEEDBACK_RATING_VISIBLE_COUNT_KEY, count);
    logger.debug("Feedback rating enabled and saved to storage");
  } catch (error) {
    logger.debug("Failed to save feedback rating enabled flag", { error });
  }
};

/**
 * Removes the feedback rating-enabled flag (user opted out or MPIN was reset).
 */
export const removeFeedbackRatingCount = async (): Promise<void> => {
  try {
    await removeItem(FEEDBACK_RATING_VISIBLE_COUNT_KEY);
    logger.debug("Feedback rating disabled and removed from storage");
  } catch (error) {
    logger.debug("Failed to remove feedback rating enabled flag", { error });
  }
};

/**
 * Returns true if the user has previously enabled feedback rating.
 */
export const feedbackRatingCount = async (): Promise<number> => {
  try {
    const value = await getItem<number>(FEEDBACK_RATING_VISIBLE_COUNT_KEY);
    return value ?? 0;
  } catch (error) {
    logger.debug("Failed to read feedback rating enabled flag", { error });
    return 0;
  }
};

