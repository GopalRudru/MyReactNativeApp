import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import WebView from "react-native-webview";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header";
import LoaderView from "../../components/common/LoaderView";
import colors from "../../res/colors";
import service from "../../services/api/service";
import { store } from "../../services/redux/store";
import { setSessionExpired, authSelector } from "../../services/redux/slices/authSlice";
import { clearAsyncStoreAndReduxStore, IS_SESSION_TIME_OUT, setItem } from "../../utils/storageUtils";
import { decrypt } from "../../utils/crypto";
import { getDeviceName, isSessionActive } from "../../utils/helpers";
import { createModuleLogger } from "../../utils/logger";

const logger = createModuleLogger("DrawerWebViewScreen");

/**
 * Generic WebView screen for drawer items of navigation type WEBVIEW.
 * Fetches a secure web token and appends the configured `webPath`
 * (e.g. "/dashboard") to the returned portal URL. Mounted on the root
 * stack, so the bottom tab bar is never visible; the Header keeps the
 * hamburger menu accessible.
 */
const buildWebUrl = (baseUrl: string, webPath?: string): string => {
  if (!baseUrl || !webPath) return baseUrl;
  const [base, query] = baseUrl.split("?");
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return query ? `${trimmedBase}${webPath}?${query}` : `${trimmedBase}${webPath}`;
};

export default function DrawerWebViewScreen({ route }: any) {
  const webPath = route?.params?.webPath;
  const [isLoading, setIsLoading] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const { userProfile, userId } = useSelector(authSelector);

  useEffect(() => {
    fetchWebViewToken();
  }, [webPath]);

  const fetchWebViewToken = async () => {
    // Only fetch while the session is genuinely active — guards against the
    // navigation refocus that fires this during a 409/401 teardown.
    if (!(await isSessionActive())) return;

    const id = userProfile?.id?.toString()?.trim()
      ? userProfile.id.toString()
      : userId;

    const payload = {
      id: id || "",
      email: decrypt(userProfile?.email) || "",
      deviceInfo: await getDeviceName(),
    };
    setIsLoading(true);
    service?.customerJourney
      ?.secureWebViewToken(payload)
      .then((response: any) => {
        logger.debug("WebView token URL received:", response?.data?.url);
        setWebUrl(buildWebUrl(response?.data?.url || "", webPath));
      })
      .catch((error: any) => {
        logger.error("WebView token fetch failed:", String(error));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const performSessionTimeoutActions = async () => {
    logger.info("Performing session timeout actions...");
    await setItem(IS_SESSION_TIME_OUT, true);
    store.dispatch(setSessionExpired(true));
    setTimeout(async () => {
      await clearAsyncStoreAndReduxStore();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        backIconNeeded={false}
        onBackPress={() => {}}
        onNotiIconPress={() => {}}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <WebView
          style={{ flex: 1 }}
          source={{ uri: webUrl || "" }}
          useWebKit={true}
          onShouldStartLoadWithRequest={(request) => {
            if (request.url.includes("session-timeout")) {
              performSessionTimeoutActions();
              return false;
            }
            return true;
          }}
          onMessage={async (event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === "LOGOUT") {
                await performSessionTimeoutActions();
              }
            } catch (error) {
              logger.debug("Ignoring non-JSON WebView message");
            }
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
      {isLoading && <LoaderView />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
