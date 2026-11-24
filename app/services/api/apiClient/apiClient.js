import axios from "axios";
import { store } from "../../redux/store";
import { setUserAuth, setRequestSignature } from "../../redux/slices/authSlice";
import { setStatusPopup } from "../../redux/slices/statusPopupSlice";
import { showNoInternetModal } from "../../redux/slices/networkSlice";
import { setSessionExpired } from "../../redux/slices/authSlice";
import { clearAsyncStoreAndReduxStore, IS_SESSION_TIME_OUT, getItem, setItem } from "../../../utils/storageUtils";
import NetInfo from "@react-native-community/netinfo";
import { fetch as secureRNFetch } from "react-native-ssl-pinning";
import { createModuleLogger } from "../../../utils/logger";
import { messages } from "../../../constant/AppConstants";
import { decrypt, encrypt } from "../../../utils/crypto";
import { Platform } from "react-native";
import * as NavigationService from "../../../navigation/NavigationService";

//UAT
// const BASE_URL = "https://api-customerportalnewuat.avanse.com/"; //"https://api-customerportaluat.avanse.com/";
//Pre-Prod
// const BASE_URL = "https://customerportaldiy-preprod.avanse.com/" //"https://api-customerportalpreprod.avanse.com/";
//Prod
const BASE_URL = "https://api-customerportal.avanse.com/";
const TIME_OUT = 1000 * 60 * 2;

// Create password-specific logger
const logger = createModuleLogger("ApiClient");

// Guard flag to ensure session-clear runs only once across concurrent 401 responses
let isSessionClearing = false;

export const checkConnectivity = async () => {
  const networkData = await NetInfo.fetch();
  return !!networkData?.isConnected;
};

// 🔒 Secure Fetch with SSL Pinning
export const secureFetch = async ({
  url,
  method = "GET",
  body,
  headers = {},
  timeout = TIME_OUT,
}) => {
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    store.dispatch(showNoInternetModal());
    throw { message: "No internet connection" };
  }

  try {
    const token = decrypt(store.getState()?.auth?.token);
    const isBypassLoginUrl = url.includes("/user-lead/bypass-login");
    const requestSignature = store?.getState()?.auth?.requestSignature;

    let akSessionRef = null;
    if (isBypassLoginUrl) {
      try {
        akSessionRef = decrypt(store.getState()?.auth?.akSessionRef)
      } catch(error) {
        // logger.debug('Error', error)
      }
    }

    const finalHeaders = {
      "Content-Type": "application/json",

      Accept: "application/json",
      ...(token ? { Authorization: token } : {}),
      ...headers,
      ...(isBypassLoginUrl && akSessionRef
        ? { Authorization: akSessionRef }
        : {}),

      // ...(
        // url.includes("/user-lead/send-otp") ||
      // url.includes("/verify-otp/") ||
      // url.includes("/user-lead/bypass-login") ||
      // url.includes("/webview-token") 
      // ? { } : {}
    // ),
      "x-source": Platform.OS === "ios" ? "ios_mobile_app" : "android_mobile_app",
      ...(requestSignature ? { "x-request-signature": requestSignature } : {}),
    };

    const fullUrl = `${BASE_URL}${url}`;

    if (fullUrl.includes("verify-otp/")) {
    }
    // 📤 Log request
    // logger.log("🔐⚙️ Secure Request Headers:\n", JSON.stringify(finalHeaders));
    // logger.log("🔐📡 Secure Request", method + " " + fullUrl);
    if (body) {
      // logger.log("🔐📦 Secure Request Body:", JSON.stringify(body));
    }

    const requestConfig = {
      method,
      headers: finalHeaders,
      timeoutInterval: timeout,
      sslPinning: {
        certs: ["star_avanse_com", "star_avanse_com_new"],
        // Enhanced SSL pinning security
        validateCertificateChain: true,
        validateDomainName: true,
        allowInvalidCertificates: false,
        disableAllSecurity: false,
      },
      // Additional security headers
      //pkPinning: true,
      disableRedirects: true,
    };

    if (method !== "GET") {
      // For PUT/POST/PATCH requests, always add a body (even if empty)
      if (body !== null && body !== undefined) {
        requestConfig.body = JSON.stringify(body);
      } else if (method === "PUT" || method === "PATCH") {
        // PUT and PATCH require a body, so provide empty object if none given
        requestConfig.body = JSON.stringify({});
        // logger.log("🔐⚠️ Empty body provided for", method, "request");
      }
    }
    const response = await secureRNFetch(fullUrl, requestConfig);

    // 📥 Log raw response before parsing
    // logger.log("🔐🟢 Secure Response API Name 👉 ", apiName(fullUrl));
    // logger.log("🔐🟢 Secure Response Status:", response.status);

    const json = await response.json();
    // 📥 Log parsed JSON
    // logger.log("🔐✅📦 Secure Response Body:", json);

    // Simulated response interceptor
    const newToken = response.headers?.["x-new-token"];
    if (newToken && token !== newToken) {
      store.dispatch(setUserAuth(encrypt(newToken)));
    } //

    const parentNewToken = response.headers?.["x-parent-new-token"];
    if (parentNewToken && token !== parentNewToken) {
      store.dispatch(setUserAuth(parentNewToken));
    }

    // Capture x-request-signature from loan-type-permission or bypass-login response and save to Redux
    const isLoanTypePermission = fullUrl.includes("loan-type-permission");
    const isBypassLogin = fullUrl.includes("bypass-login");
    const signature =
      response?.headers?.["x-request-signature"] ??
      response?.headers?.["X-Request-Signature"];
    if ((isLoanTypePermission || isBypassLogin) && signature) {
      store?.dispatch(setRequestSignature(signature));
    }

    return { data: json, status: response.status };
  } catch (error) {
    // logger.error("🔐🚫Secure Fetch Error:", error);

    let errorMessage = messages.withdrErrorMessages.commonError;

    // Check if this is an SSL pinning failure
    const isSSLPinningError =
      error?.message?.includes("SSL") ||
      error?.message?.includes("certificate") ||
      error?.message?.includes("pinning") ||
      error?.code === "ESSLPINNING" ||
      error?.message?.includes("Network request failed");

    if (isSSLPinningError) {
      // logger.error("🔐🚫SSL Pinning Error detected:", {
      //   error: error.message,
      //   code: error.code,
      //   timestamp: new Date().toISOString(),
      // });

      // Don't crash the app, show a user-friendly message
      errorMessage =
        "Network security error. Please check your connection and try again.";

      // Log security event for monitoring
      // logger.log("🔐⚠️ SSL Pinning bypass may have been attempted");
    } else {
      // Handle other errors normally
      // logger.error("🔐🚫Error:", error);
      try {
        if (error?.bodyString) {
          const parsed = JSON.parse(error.bodyString);
          errorMessage = parsed?.message || errorMessage;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } catch (e) {
        // logger.error("Error parsing error message:", e);
      }
    }

    if (error.status === 409) {
      store.dispatch(
        setStatusPopup({
          status: "Error",
          message: errorMessage, //error.message,
          anotherDeviceAuth: true,
        }),
      );
      return;
    } else if (
      error.status === 401 &&
      errorMessage === "Your session is timed out. Please login again"
    ) {
      if (!isSessionClearing) {
        isSessionClearing = true;
        try {
          const timeOut = await getItem(IS_SESSION_TIME_OUT);
          if (!timeOut) {
            await setItem(IS_SESSION_TIME_OUT, true);
            store.dispatch(setSessionExpired(true));
            NavigationService.closeDrawer()
            setTimeout(async () => {
              try {
                await clearAsyncStoreAndReduxStore();
              } finally {
                isSessionClearing = false;
              }
            }, 1000);
          } else {
            isSessionClearing = false;
          }
        } catch (e) {
          isSessionClearing = false;
          // logger.error("Session clear error:", e);
        }
      }
      return;
    }

    // logger.error("🔐🚫Error Message:", errorMessage);

    throw errorMessage;
  }
};

/**
 * Extracts the path after /api/v1/ from a given URL
 * @param url Full API URL
 * @returns string | null
 */
const apiName = (url) => {
  // Check for null, undefined, or empty string
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }
  
  const markers = ["/api/v1/", "/api/v2/"];
  for (const marker of markers) {
    const index = url.indexOf(marker);
    if (index !== -1) {
      const extractedPath = url.substring(index + marker.length);
      return extractedPath || null;
    }
  }
  return null;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    logger.log("inside request interceptor");
    // Check internet connectivity before every API call
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      store.dispatch(showNoInternetModal());
      return Promise.reject({ message: "No internet connection" });
    }
    // Add auth token from storage if needed
    const token = decrypt(store?.getState()?.auth?.token);
    if (token) {
      config.headers.Authorization = token;
    }
    config.headers["Content-Type"] = "application/json";

    logger.log("🧾 Headers Sent:", config.headers);
    if (
      config.url.includes("/user-lead/send-otp") ||
      config.url.includes("/verify-otp/") ||
      config.url.includes("/user-lead/bypass-login")
    ) {

    }

    logger.log(
      `Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data
    );
    logger.log("Request Config:", config);
    logger.log("Request Headers:", headers);
    return config;
  },
  (error) => {
    logger.error("Request Error:", error);
    logger.log("inerror");
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    logger.log("inside response interceptor");
    if (response?.headers?.["x-new-token"]) {
      if (
        decrypt(store?.getState()?.auth?.token) !==
        response?.headers?.["x-new-token"]
      ) {
        store?.dispatch(
          setUserAuth(encrypt(response?.headers?.["x-new-token"]))
        );
      }
    }
    logger.log("Response", response);
    return response;
  },
  async (error) => {
    logger.log("response interceptor: ", error?.response?.data?.message);
    logger.log("response interceptor: ", error?.response?.status);
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    // Handle error responses
    if (error?.response?.status === 409) {
      logger.log("inside status 409");
      store.dispatch(
        setStatusPopup({
          status: "Error",
          message: error?.response?.data?.message,
          anotherDeviceAuth: true,
        })
      );
      return Promise.reject(error);
    } else if (error?.response?.status === 401) {
      logger.log("inside status 401");
      if (
        error?.response?.data?.message ===
        "Your session is timed out. Please login again"
      ) {
        if (!isSessionClearing) {
          isSessionClearing = true;
          try {
            await setItem(IS_SESSION_TIME_OUT, true);
            store.dispatch(setSessionExpired(true));
            setTimeout(async () => {
              try {
                await clearAsyncStoreAndReduxStore();
              } finally {
                isSessionClearing = false;
              }
            }, 1000);
          } catch (e) {
            isSessionClearing = false;
            logger.error("Session clear error:", e);
          }
        }
      }
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
