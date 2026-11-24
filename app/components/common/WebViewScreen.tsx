import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import mainStyle from "../../res/mainStyles";
import Header from "./Header";
import * as NavigationService from "../../navigation/NavigationService";
import WebView from "react-native-webview";
import colors from "../../res/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import imagePath from "../../constant/imagePath";
import AppConstants from "../../constant/AppConstants";
import { createModuleLogger } from "../../utils/logger";

// Create logger instance
const logger = createModuleLogger("WebViewScreen");

interface RouteParams {
  URL?: string;
}

const WebViewScreen = ({ route }: any) => {
  const URL = route?.params?.URL; 
  const headerVisible = route?.params?.headerVisible ?? false;

  logger.info("WebView URL received:", URL);

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  const isValidCondition = (url: string, toMatch: string): boolean => {
    return url.includes(toMatch);
  };

  const getPaymentRequestId = (url: string): string | null => {
    const match = url.match(/paymentRequestId=([^&]+)/);
    return match ? match[1] : null;
  };

  const savePaymentData = async (paymentRequestId: any) => {
    AsyncStorage.setItem("termLoanRequestId", paymentRequestId);
  };

  const getQueryParamValue = (url: string, key: string): string | null => {
    try {
      const urlParts = url.split('?');
      if (urlParts.length < 2) return null;
      
      const queryString = urlParts[1];
      const params = queryString.split('&');
      
      for (const param of params) {
        const [paramKey, paramValue] = param.split('=');
        if (paramKey === key) {
          return decodeURIComponent(paramValue || '');
        }
      }
      return null;
    } catch (error) {
      logger.error("Error parsing URL parameters:", String(error));
      return null;
    }
  };

  return (
    <SafeAreaView style={mainStyle.safeArea} edges={["top"]}>
      {headerVisible ? (
        <Header
          onMenuPress={() => {}}
          onAvatarPress={() => {}}
          backIconNeeded={true}
          showNotification={false}
          onBackPress={() => {handleBackPress()}}
          onNotiIconPress={() => {}}
        />
      ) : (
        <View style={{ backgroundColor: "rgb(57, 130, 133)" }}>
          <TouchableOpacity
            onPress={handleBackPress}
            activeOpacity={AppConstants.buttonActiveOpacity}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: "transparent",
              width: 50,
            }}
          >
            <Image
              source={imagePath.leftBackArrow}
              style={{ height: 28, width: 28, tintColor: colors.white }}
            />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <WebView
          style={{ flex: 1 }}
          source={{ uri: URL || "" }}
          useWebKit={true}
          hideKeyboardAccessoryView={true}
          onShouldStartLoadWithRequest={(request) => {
            logger.debug("Intercepted WebView request:", request);

            //check condition for payment success
            if (isValidCondition(request.url, "paymentid=")) {
              logger.info("Payment success detected");
              const paymentReqId = getPaymentRequestId(request.url);
              //logger.info("Payment request ID extracted:", paymentReqId);
              savePaymentData(paymentReqId);
              AsyncStorage.setItem(
                "isUpdatePyamentStatus",
                JSON.stringify(true)
              );
              NavigationService.goBack();
              return false;
            } else if (isValidCondition(request.url, "consent=")) {
              logger.info("Consent request success detected");
              const consentValue = getQueryParamValue(request.url, "consent");
              AsyncStorage.setItem("consentStatus", consentValue || "");
              AsyncStorage.setItem("isConsentStatus", JSON.stringify(true));
              NavigationService.goBack();
              return false;
            }

            return true; // allow loading
          }}
          startInLoadingState={true}
          cacheEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // Default (LAYER_TYPE_NONE). "hardware" forces the WebView into its own
          // off-screen GPU texture, which Android trims while backgrounded and
          // does not invalidate on resume — the page stays blank until a touch
          // redraws it.
          androidLayerType="none"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  webViewStyle: {
    backgroundColor: colors.blackOpacity10,
  },
});
