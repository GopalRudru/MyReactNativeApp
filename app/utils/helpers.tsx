import imagePath from "../constant/imagePath";
import { RootState, store } from "../services/redux/store";
import RNFS from "react-native-fs";
import React from "react";
import { Dimensions, Image, Text, TextStyle } from "react-native";
import dayjs from "dayjs";
import DeviceInfo from "react-native-device-info";
import { getMessaging } from "@react-native-firebase/messaging";
import { createModuleLogger } from "./logger";
import { IS_SESSION_TIME_OUT, getItem } from "./storageUtils";

const logger = createModuleLogger("Helpers");


const { width: screenWidth } = Dimensions.get("window");
export const MPIN_LENGTH = 6;
export const SPACING_BETWEEN_INPUTS = 16;
export const PADDING = 20;
export const totalSpacing = (MPIN_LENGTH - 1) * SPACING_BETWEEN_INPUTS;
export const availableWidth = screenWidth - PADDING * 2 - totalSpacing;
export const mpinInputWidth = availableWidth / MPIN_LENGTH;
export const { width, height } = Dimensions.get("window");

export const loginTypeData = (userData: any) => {
  if (userData?.loginType === "cif") return userData?.cif;
  else if (userData?.loginType === "phone") return userData?.mobile;
  else if (userData?.loginType === "email") return userData?.email;
  else return null;
};

export const registerTypeData = (userData: any) => {
  if (userData?.type === "cif") return userData?.cif;
  else if (userData?.type === "Mobile") return userData?.mobile;
  else if (userData?.type === "Email") return userData?.email;
  else return null;
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const capitalizeFirstLetter = (str: string) => {
  return str?.charAt(0).toUpperCase() + str?.toLowerCase().slice(1);
};

export const businessTypeLabel = (businessType: string) => {
  if (businessType?.includes("retail")) return "Login as Individual";
  else if (businessType?.includes("entity")) return "Login as Institutional";
  else return `Login as ${capitalizeFirstLetter(businessType)}`;
};

export const loginTypeIcon = (
  businessType: string,
  selected: boolean = false
) => {
  if (businessType?.includes("retail")) return imagePath.userIcon;
  else if (businessType?.includes("entity")) return imagePath.institutionIcon;
  else return imagePath.userIcon;
};

export const quickHelpIcon = (fieldName: string, platform: string) => {
  const androidIcons: Record<string, any> = {
    "Loan Account Info": "file:///android_asset/gif/loanInfo.gif",
    "Account Statements": "file:///android_asset/gif/accountStatement.gif",
    "Repayment Schedule":
      "file:///android_asset/gif/amortizationSchedule.gif",
    "Disbursement Request": "file:///android_asset/gif/disburesmentRequest.gif",
    Payment: "file:///android_asset/gif/payment.gif",
    FAQ: "file:///android_asset/gif/faq.gif",
  };
  const iosIcons: Record<string, any> = {
    "Loan Account Info": imagePath.loanInfo,
    "Account Statements": imagePath.accountStatement,
    "Repayment Schedule": imagePath.amortizationSchedule,
    "Disbursement Request": imagePath.disbursementRequest,
    Payment: imagePath.paymentGif,
    FAQ: imagePath.faq,
  };

  const icons: Record<string, any> =
    platform === "android" ? androidIcons : iosIcons;
  return icons[fieldName];
};

export const termLoanPermissionCheck = () => {
  const userLoanCategory = store?.getState()?.auth?.loanCategory;
  const userBusinessSelected = store?.getState()?.auth?.businessType;
  if (userLoanCategory && userBusinessSelected) {
    const selectedLoanCategoryObj = userLoanCategory?.TermLoan?.find(
      (loan: any) => loan?.businessId === userBusinessSelected?.id
    );
    return selectedLoanCategoryObj?.permissionBypass;
  } else {
    return false;
  }
};

export const getQueryString = (queryParams: any) => {
  let queryParamsString = "";
  const params: string[] = Object.keys(queryParams);
  params.forEach((param: any, index: number) => {
    if (index == 0) {
      queryParamsString += `?${param}=${queryParams[param]}`;
    } else {
      queryParamsString += `&${param}=${queryParams[param]}`;
    }
  });
  return queryParamsString;
};

export const encodeToBase64 = async (fileUri: any) => {
  try {
    // In dev mode the Metro bundler serves assets over http(s)
    // (e.g. http://localhost:8081/assets/...), which RNFS cannot read
    // from the filesystem. Fetch those and encode the bytes instead.
    if (/^https?:\/\//.test(fileUri)) {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // result is a data URL ("data:...;base64,xxxx"); return raw base64
          resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const path = fileUri.replace("file://", "");
    const base64String = await RNFS.readFile(path, "base64");
    return base64String;
  } catch (error) {
    logger.error("Failed to convert image to base64:", error);
    throw error;
  }
};

export const dateToFinYearOptions = (fromDate: string, toDate?: string) => {
  type optionsType = {
    label: string;
    value: string;
  };

  let finYearsOptions: Array<optionsType> = [];
  let finYearsCount: number = 0;

  type finYearType = {
    year: number;
    month: number;
  };

  const fromFinYear: finYearType = {
    year: +dayjs(fromDate).format("YY"),
    month: +dayjs(fromDate).format("MM"),
  };
  const toFinYear: finYearType = {
    year: +dayjs(toDate && toDate).format("YY"),
    month: +dayjs(toDate && toDate).format("MM"),
  };

  if (toFinYear?.year > fromFinYear?.year) {
    finYearsCount = toFinYear?.year - fromFinYear?.year;
    // from date month count less then or equal to 3 then add one more previous fin year
    if (fromFinYear?.month <= 3) {
      finYearsCount = finYearsCount + 1; // add one more fin year
      fromFinYear.year = fromFinYear.year - 1; // start from 1 fin year previous
    }
    // // to month greater then 3 add one more fin year
    if (toFinYear?.month > 3) {
      finYearsCount = finYearsCount + 1;
    }
  } else if (toFinYear?.year == fromFinYear?.year) {
    // from date month count less then or equal to 3 then add one more previous fin year
    if (fromFinYear?.month <= 3) {
      finYearsCount = finYearsCount + 1; // add one more fin year
      fromFinYear.year = fromFinYear.year - 1; // start from 1 fin year previous
    }
    // to date value month greater then 3 add one more fin year
    if (toFinYear?.month > 3) {
      finYearsCount = finYearsCount + 1;
    }
  }

  for (let index: number = 0; index < finYearsCount; index++) {
    finYearsOptions.push({
      label: `FY${fromFinYear.year + index}-${fromFinYear.year + index + 1}`,
      value: `20${fromFinYear.year + index}`,
    });
  }

  return finYearsOptions;
};

interface AstricStringProps {
  label: string;
  style?: TextStyle;
}

export const AstricString: React.FC<AstricStringProps> = ({
  label,
  style = {},
}) => (
  <Text style={style}>
    {label}
    <Text style={{ color: "red" }}> *</Text>
  </Text>
);
export const Label: React.FC<AstricStringProps> = ({ label, style = {} }) => (
  <Text style={style}>{label}</Text>
);

export const getInitials = (text: any) => {
  const words = text.trim().split(" ");
  const firstLetter = words[0][0]; // First letter of the first word
  const lastLetter = words[words.length - 1][0]; // First letter of the last word
  return `${firstLetter}${lastLetter}`.toUpperCase(); // Combine and make uppercase
};

export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

export const capitalizeStatusFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Returns the unique device ID (IDFV for iOS, SSAID for Android).
 */
export const getDeviceUniqueId = async (): Promise<string> => {
  try {
    const uniqueId = await DeviceInfo.getUniqueId();
    logger.log("Device Unique ID:", uniqueId);
    return uniqueId;
  } catch (error) {
    logger.error("Error fetching unique device ID:", error);
    return "";
  }
};

/**
 * Retrieves the Firebase Cloud Messaging (FCM) token for the device.
 * This token is required to receive push notifications.
 *
 * @returns {Promise<string>} A promise that resolves to the FCM device token as a string.
 */
export const getFmcToken = async (): Promise<string> => {
  try {
    // Get the messaging instance (modular approach)
    const messagingInstance = getMessaging();

    // Retrieve the FCM token
    const deviceToken = await messagingInstance.getToken();

    // Log the token for debugging purposes
    //logger.log("FCM Token:", deviceToken);

    // Return the token (empty string if null or undefined)
    return deviceToken || "";
  } catch (error) {
    logger.error("Failed to retrieve FCM token:", error);
    return "";
  }
};

/**
 * Returns formatted device information as a string.
 */
export const getDeviceInfo = (): string => {
  const systemName = DeviceInfo.getSystemName();
  const systemVersion = DeviceInfo.getSystemVersion();
  const brand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel();
  const deviceType = DeviceInfo.getDeviceType();

  const deviceInfo =
    `Brand: ${brand}, Model: ${model}, OS: ${systemName} ${systemVersion}, Device Type: ${deviceType}`.trim();

  return deviceInfo;
};

/**
 * Retrieves the device name (e.g., "John's iPhone" or "Pixel 5").
 *
 * @returns {Promise<string>} A promise that resolves to the device name as a string.
 */
export const getDeviceName = async (): Promise<string> => {
  try {
    // Get the device name asynchronously
    const deviceName = await DeviceInfo.getDeviceName();

    // If for some reason deviceName is null/undefined, return an empty string
    return deviceName || "";
  } catch (error) {
    logger.error("Failed to get device name:", error);
    return "";
  }
};

export function maskCifNumber(data: any) {
  const str = String(data ?? "");
  if (str.length <= 3) return str;
  return "*".repeat(str.length - 3) + str.slice(-3);
}


export function maskEmailOrMobile(data: any) {
  const mobilePattern = /^\d{10}$/; // Pattern for 10-digit mobile number
  const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Pattern for email

  if (mobilePattern.test(data)) {
    // Check if the input is a mobile number
    return "*".repeat(6) + data.slice(-4); // Mask first 6 digits
  } else if (emailPattern.test(data)) {
    // Check if the input is an email address
    const [name, domain] = data.split("@");
    // Mask email name except for the first three characters
    const maskedName = name.slice(0, 3) + "*".repeat(name?.length - 3);
    return `${maskedName}@${domain}`; // Return masked email address
  } else {
    return "Invalid input"; // Handle invalid input
  }
}

export enum SCREEN_NAME {
  CREATE_MPIN = "CREATE_MPIN",
  RESET_MPIN = "RESET_MPIN",
  MPIN_LOGIN = "MPIN_LOGIN",
}

/**
 * Returns true when the user session is genuinely active.
 *
 * During the another-device (409) / session-timeout (401) teardown the
 * navigation stack momentarily refocuses embedded screens, which would
 * otherwise fire unauthorized requests while resetting to the MPIN login.
 * Reads fresh state from the store/AsyncStorage rather than captured
 * (potentially stale) closure values.
 */
export const isSessionActive = async (): Promise<boolean> => {
  const timeOut = (await getItem<boolean>(IS_SESSION_TIME_OUT)) ?? false;
  const { auth, statusPopup } = store.getState();
  if (
    timeOut ||
    auth?.sessionExpired ||
    !auth?.token ||
    statusPopup?.anotherDeviceAuth
  ) {
    logger.debug("Session not active — skipping request.");
    return false;
  }
  return true;
};

// export const getFmcUserId = async (): Promise<string> => {
//   let user_id = "";
//   const isLoggedIn = await getItem<boolean>(IS_LOGGED_IN);
//   console.log(userProfile?.cifNumber, "userProfile cifNumber");
//   console.log(selectedLoanNumber, "selectedLoanNumber");
//   if (isLoggedIn) {
//     const cif = userProfile?.cifNumber ? decrypt(userProfile.cifNumber) : null;
//     // Only add user_id if both are available
//     if (cif && selectedLoanNumber) {
//       user_id = `${cif}_${selectedLoanNumber}`;
//     }
//   }
//   console.log(user_id, "getFmcUserId");

//   return user_id ? user_id : "";
// };
