import { Platform } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import logger from "../../../utils/logger";
import { setItem, getItem, removeItem, BIOMETRIC_ENABLED_KEY, MPIN_ENABLED_KEY, BIOMETRIC_LOCK_ENABLED_KEY } from "../../../utils/storageUtils";


// ─── Types ─────────────────────────────────────────────────────────────────────
export type BiometricType = "FaceID" | "TouchID" | "Biometrics" | "None";

export const BiometricUnavailableReason = {
  NO_HARDWARE: "no_hardware",
  NOT_ENROLLED: "not_enrolled",
  UNAVAILABLE: "unavailable",
  /** iOS only: user tapped "Don't Allow" on the Face ID / biometric permission dialog */
  PERMISSION_DENIED: "permission_denied",
  /** iOS Code=-8 / Android BIOMETRIC_ERROR_LOCKOUT: too many failed attempts, biometry locked */
  BIOMETRIC_LOCKED: "biometric_locked",
} as const;

export type BiometricUnavailableReason =
  | (typeof BiometricUnavailableReason)[keyof typeof BiometricUnavailableReason]
  | null;

export interface BiometricCheckResult {
  available: boolean;
  biometryType: BiometricType;
  unavailableReason: BiometricUnavailableReason;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  isTooManyAttempts?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const resolveUnavailableReason = (
  error?: string
): BiometricUnavailableReason => {
  if (!error) return BiometricUnavailableReason.UNAVAILABLE;

  if (Platform.OS === "android") {
    if (error === "BIOMETRIC_ERROR_NO_HARDWARE") return BiometricUnavailableReason.NO_HARDWARE;
    if (error === "BIOMETRIC_ERROR_NONE_ENROLLED") return BiometricUnavailableReason.NOT_ENROLLED;
    if (error === "BIOMETRIC_ERROR_LOCKOUT" || error === "BIOMETRIC_ERROR_LOCKOUT_PERMANENT") return BiometricUnavailableReason.BIOMETRIC_LOCKED;
  } else if (Platform.OS === "ios") {
    if (error.includes("Code=-8")) return BiometricUnavailableReason.BIOMETRIC_LOCKED;
    if (error.includes("Code=-6")) {
      // Code=-6 (LAErrorBiometryNotAvailable) 
      // covers both no-hardware AND permission denied
      if (error.toLowerCase().includes("denied")) {
        return BiometricUnavailableReason.PERMISSION_DENIED;
      }
      return BiometricUnavailableReason.NO_HARDWARE;
    }
    if (error.includes("Code=-7")) 
      return BiometricUnavailableReason.NOT_ENROLLED;
  }

  return BiometricUnavailableReason.UNAVAILABLE;
};

/**
 * Checks whether biometric authentication is available on the device
 * and returns the type (FaceID / TouchID / Biometrics / None).
 */
export const checkBiometricAvailability =
  async (): Promise<BiometricCheckResult> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType, error } =
        await rnBiometrics.isSensorAvailable();

        logger.debug("Biometric sensor availability check", { available, biometryType, error });

      if (!available || !biometryType) {
        const unavailableReason = resolveUnavailableReason(error);
        // Preserve biometryType when permission denied so callers can show correct messaging
        let resolvedType: BiometricType = "None";
        if (biometryType) {
          if (biometryType === BiometryTypes.FaceID) resolvedType = "FaceID";
          else if (biometryType === BiometryTypes.TouchID) resolvedType = "TouchID";
          else if (biometryType === BiometryTypes.Biometrics) resolvedType = "Biometrics";
        }
        return { available: false, biometryType: resolvedType, unavailableReason };
      }

      let type: BiometricType = "None";
      if (biometryType === BiometryTypes.FaceID) {
        type = "FaceID";
      } else if (biometryType === BiometryTypes.TouchID) {
        type = "TouchID";
      } else if (biometryType === BiometryTypes.Biometrics) {
        type = "Biometrics";
      }

      logger.debug("Biometric availability check", { available, type });
      return { available, biometryType: type, unavailableReason: null };
    } catch (error) {
      logger.debug("Biometric availability check failed", { error });
      return { available: false, biometryType: "None", unavailableReason: BiometricUnavailableReason.UNAVAILABLE };
    }
  };

/**
 * Prompts the user for biometric authentication.
 * @param promptMessage - The message shown to the user on the biometric prompt.
 */
// export const authenticateWithBiometrics = async (
//   promptMessage: string = "Authenticate to continue"
// ): Promise<BiometricAuthResult> => {
//   try {
//     const rnBiometrics = new ReactNativeBiometrics();
//     const { success, error } = await rnBiometrics.simplePrompt({
//       promptMessage,
//     });

//     if (success) {
//       logger.debug("Biometric authentication succeeded");
//       return {
//         success: true,
//       };
//     }

//     const isTooManyAttempts = (error?.toLowerCase() ?? "").includes("too many attempts");
//     logger.debug("Biometric authentication failed", { error, isTooManyAttempts });
//     return {
//       success: false,
//       error: error ?? "Authentication failed",
//       isTooManyAttempts,
//     };
//   } catch (error: any) {
//     const message: string = error?.message ?? "Unexpected biometric error";
//     const isTooManyAttempts = message.toLowerCase().includes("too many attempts");
//     logger.debug("Biometric authentication error", { error, isTooManyAttempts });
//     return {
//       success: false,
//       error: message,
//       isTooManyAttempts,
//     };
//   }
// };

export const authenticateWithBiometrics = async (
  promptMessage: string = "Authenticate to continue"
): Promise<BiometricAuthResult> => {
  try {
    const rnBiometrics = new ReactNativeBiometrics();

    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage,
    });

    if (success) {
      logger.debug("Biometric authentication succeeded");
      return { success: true };
    }

    const errorMessage = error ?? "Authentication failed";
    const isTooManyAttempts = checkLockout(errorMessage);

    logger.debug("Biometric authentication failed", {
      error: errorMessage,
      isTooManyAttempts,
    });

    return {
      success: false,
      error: errorMessage,
      isTooManyAttempts,
    };
  } catch (err: any) {
    const message: string = err?.message ?? "Unexpected biometric error";
    const isTooManyAttempts = checkLockout(message);

    logger.debug("Biometric authentication error", {
      error: message,
      isTooManyAttempts,
    });

    return {
      success: false,
      error: message,
      isTooManyAttempts,
    };
  }
};

const checkLockout = (msg: string = "") => {
  const message = msg.toLowerCase();

  return (
    message.includes("too many attempts") ||
    message.includes("lockout") ||
    message.includes("locked")
  );
};

/**
 * Returns a user-friendly label for the given biometry type.
 */
export const getBiometricLabel = (biometryType: BiometricType): string => {
  switch (biometryType) {
    case "FaceID":
      return "Face ID";
    case "TouchID":
      return "Touch ID";
    case "Biometrics":
      return "Biometrics";
    default:
      return "Biometrics";
  }
};

/**
 * Persists a flag indicating the user has opted in to biometric authentication
 * (Fingerprint / Face ID). Call this when the user taps "Yes, enable …" in the
 * BioMetricBottomSheet.
 */
export const enableBiometricAuth = async (): Promise<void> => {
  try {
    await setItem(BIOMETRIC_ENABLED_KEY, true);
    logger.debug("Biometric authentication enabled and saved to storage");
  } catch (error) {
    logger.debug("Failed to save biometric enabled flag", { error });
  }
};

/**
 * Removes the biometric-enabled flag (user opted out or MPIN was reset).
 */
export const disableBiometricAuth = async (): Promise<void> => {
  try {
    await removeItem(BIOMETRIC_ENABLED_KEY);
    logger.debug("Biometric authentication disabled and removed from storage");
  } catch (error) {
    logger.debug("Failed to remove biometric enabled flag", { error });
  }
};

/**
 * Returns true if the user has previously enabled biometric authentication.
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const value = await getItem<boolean>(BIOMETRIC_ENABLED_KEY);
    return value === true;
  } catch (error) {
    logger.debug("Failed to read biometric enabled flag", { error });
    return false;
  }
};


///**************** MPIN Utils ****************/

/**
 * Persists a flag indicating the user has opted in to MPIN authentication.
 * Call this when the user taps "Yes, enable …" in the MPINBottomSheet.
 */
export const enableMpinAuth = async (): Promise<void> => {
  try {
    await setItem(MPIN_ENABLED_KEY, true);
    logger.debug("MPIN authentication enabled and saved to storage");
  } catch (error) {
    logger.debug("Failed to save MPIN enabled flag", { error });
  }
};

/**
 * Removes the MPIN-enabled flag (user opted out or MPIN was reset).
 */
export const disableMpinAuth = async (): Promise<void> => {
  try {
    await removeItem(MPIN_ENABLED_KEY);
    logger.debug("MPIN authentication disabled and removed from storage");
  } catch (error) {
    logger.debug("Failed to remove MPIN enabled flag", { error });
  }
};

/**
 * Returns true if the user has previously enabled mpin authentication.
 */
export const isMpinEnabled = async (): Promise<boolean> => {
  try {
    const value = await getItem<boolean>(MPIN_ENABLED_KEY);
    return value === true;
  } catch (error) {
    logger.debug("Failed to read mpin enabled flag", { error });
    return false;
  }
};




// Biometric lock

/**
 * Persists a flag indicating the user has opted in to biometric lock.
 * Call this when the user taps "Yes, enable …" in the BiometricLockBottomSheet.
 */
export const enableBiometricLock = async (): Promise<void> => {
  try {
    await setItem(BIOMETRIC_LOCK_ENABLED_KEY, true);
    logger.debug("Biometric lock enabled and saved to storage");
  } catch (error) {
    logger.debug("Failed to save biometric lock enabled flag", { error });
  }
};

/**
 * Removes the biometric lock-enabled flag (user opted out or MPIN was reset).
 */
export const disableBiometricLock = async (): Promise<void> => {
  try {
    await removeItem(BIOMETRIC_LOCK_ENABLED_KEY);
    logger.debug("Biometric lock disabled and removed from storage");
  } catch (error) {
    logger.debug("Failed to remove biometric lock enabled flag", { error });
  }
};

/**
 * Returns true if the user has previously enabled biometric lock.
 */
export const isBiometricLockEnabled = async (): Promise<boolean> => {
  try {
    const value = await getItem<boolean>(BIOMETRIC_LOCK_ENABLED_KEY);
    return value === true;
  } catch (error) {
    logger.debug("Failed to read biometric lock enabled flag", { error });
    return false;
  }
};

