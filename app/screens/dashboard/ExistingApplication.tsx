import {
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/common/Header";
import service from "../../services/api/service";
import { store, RootState } from "../../services/redux/store";
import { setSessionExpired, setUserAuth } from "../../services/redux/slices/authSlice";
import { clearStatusPopup, setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import { useDispatch, useSelector } from "react-redux";
import logger from "../../utils/logger";
import { authSelector } from "../../services/redux/slices/authSlice";
import { getDeviceName, isSessionActive } from "../../utils/helpers";
import { decrypt } from "../../utils/crypto";
import LoaderView from "../../components/common/LoaderView";
import colors from "../../res/colors";
import WebView from "react-native-webview";
import { clearAsyncStoreAndReduxStore, IS_SESSION_TIME_OUT, IS_LOGGED_IN, getItem, setItem } from "../../utils/storageUtils";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import * as NavigationService from "../../navigation/NavigationService"
import navigationStrings from "../../constant/navigationStrings";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import AppLoadingView from "../../components/common/AppLoadingView";
import SmallButtonComponent from "../../components/common/SmallButtonComponent";
import strings from "../../res/strings";
import fonts from "../../res/fonts";
import { moderateScale } from "react-native-size-matters";
import { useNotifications } from "../../hooks/useNotifications";
const { getNotificationsList } = useNotifications();

let isSessionClearing = false;

/**
 * The URL returned by `secureWebViewToken` is a one-shot hand-off ticket: the
 * portal redeems the token on first load, establishes its own session, and then
 * rotates the token back to us via the MOBILE_TOKEN message below. Re-loading a
 * URL we have already spent renders an invalid-token page, so recovering a dead
 * WebView means minting a fresh URL with `fetchWebViewToken()`, never
 * `webViewRef.current.reload()`.
 *
 * Minting a fresh URL also remounts the WebView back to the portal's landing
 * page, discarding however many steps the user had worked through inside it. So
 * we only ever do it when the page is already gone — the renderer died, or the
 * user asked to retry. A live page is never reloaded on foreground, no matter
 * how long the app was away: the portal signals its own expiry over
 * SESSION_TIME_OUT, which is handled below.
 */



interface ExistingApplicationProps {
  updateLoadingFlag?: (flag: boolean) => void;
  /**
   * true when rendered inside DashboardScreen (which already provides
   * SafeAreaView/StatusBar/Header and shows the bottom tab bar).
   * false when mounted as a standalone route from the drawer.
   */
  embedded?: boolean;
}

export default function ExistingApplication({
  embedded = false,
}: ExistingApplicationProps) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [webViewKey, setWebViewKey] = useState(0);
  const [hasWebViewError, setHasWebViewError] = useState(false);
  const webViewRef = useRef<any>(null);
  // Guards a token fetch from being started twice — renderer-death and the
  // foreground check can both ask to recover at the same moment.
  const isFetchingRef = useRef(false);
  const rendererDiedRef = useRef(false);
  // Late-resolving token requests must not paint an error onto a screen that is
  // already being torn down by the logout navigation.
  const isMountedRef = useRef(true);
  // Latest fetchWebViewToken, so the AppState listener can subscribe once and
  // still call the current closure.
  const fetchRef = useRef<() => void>(() => {});
  const { userProfile, userId, token: authToken, sessionExpired } =
    useSelector(authSelector);
  // Render-time guard. `isSessionActive()` is async and cannot be used while
  // rendering, so mirror it from the store: logout clears the token before it
  // navigates away, and this screen stays mounted through that window.
  const isLoggedIn = !!authToken && !sessionExpired;
  const isBottomNavVisible = useSelector(
    (state: RootState) => state.tabs.isBottomNavVisible
  );

  // Held in a ref: a plain `let` is re-created on every render, so the
  // MOBILE_TOKEN comparison below would always see an empty string.
  const tokenRef = useRef("");

  const existingApplicationRefreshCount = useSelector(
    (state: RootState) => state.tabs.existingApplicationRefreshCount
  );

  useEffect(() => {
    dispatch(clearStatusPopup());
    fetchWebViewToken();
    try {
       getNotificationsList();
    } catch(e) {
      logger.debug("ExistingApplication getNotification Error: "+e)
    }
   
  }, [dispatch, existingApplicationRefreshCount]);

  useEffect(() => {
    tokenRef.current = decrypt(store.getState()?.auth?.token);
  }, []);

  const fetchWebViewToken = async () => {
    // Only fetch while the session is genuinely active — guards against the
    // navigation refocus that fires this during a 409/401 teardown.
    if (!(await isSessionActive())) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setHasWebViewError(false);

    const id = userProfile?.id?.toString()?.trim() ? userProfile.id.toString() : userId;
    const decryptedEmail = decrypt(userProfile?.email);

    const payload = {
      id: id || "",
      email: decryptedEmail || "",
      deviceInfo: await getDeviceName(),
      preLogin: false,
      appType: "existing_application"
    };
    setIsLoading(true);
    service?.customerJourney
      ?.secureWebViewToken(payload)
      .then((response: any) => {
        const url = response?.data?.url || "";
        if (url) {
          if (webViewRef.current?.clearCache) {
            webViewRef.current.clearCache(true);
          }
          // A new key forces a brand-new native WebView, so a dead renderer is
          // discarded rather than reused.
          setWebViewKey((prevKey) => prevKey + 1);
          rendererDiedRef.current = false;
        } else {
          // No URL means nothing to show — render the retry state instead of a
          // WebView pointed at an empty uri, which just paints white.
          showErrorIfLoggedIn();
        }
        setIsWebLoading(!!url);
        setWebUrl(url);
      })
      .catch(async (error: any) => {
        //handleSnackbarOpen(error.response.data.message,"error");
        // Leave the previous webUrl alone but stop rendering it: after a failed
        // refresh it is a spent token that would only load white.
        showErrorIfLoggedIn();
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: error,
            }),
          );
        }
      })
      .finally(() => {
        logger.debug("WebView Token fetch process completed.");
        isFetchingRef.current = false;
        setTimeout(()=>{
          setIsLoading(false);
        }, 2000)
        
      });
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * The only way this screen raises its error state.
   *
   * Logging out clears the store and only then resets navigation, so this screen
   * renders for a moment with no session — and any request already in flight
   * fails right afterwards. Neither is something to show the user a "couldn't
   * load this page" panel for: they are on their way to the login screen.
   *
   * IS_LOGGED_IN is checked separately because `isSessionActive()` does not look
   * at it, and logout writes that flag first — before ~500ms of awaits and only
   * then clearing the store (see AppDrawerContent.handleLogout). For that whole
   * window the redux token is still present, so the flag is the earliest
   * reliable signal that the user is on their way out.
   */
  const showErrorIfLoggedIn = async () => {
    if (!isMountedRef.current) return;
    const loggedIn = (await getItem<boolean>(IS_LOGGED_IN)) ?? false;
    if (!loggedIn) return;
    if (!(await isSessionActive())) return;
    if (!isMountedRef.current) return;
    setHasWebViewError(true);
  };

  // Keep the AppState listener pointed at the current closure without having to
  // re-subscribe on every render.
  useEffect(() => {
    fetchRef.current = fetchWebViewToken;
  });

  // Memoised so a re-render never hands the native view a fresh object.
  const webViewSource = useMemo(() => ({ uri: webUrl || "" }), [webUrl]);

  /**
   * Returning from background can leave the WebView's surface disconnected:
   * logcat shows `BLASTBufferItemConsumer::onDisconnect()` followed by
   * `onSurfaceShowChange show = false` for our package, and the view then keeps
   * painting only its own background colour. The renderer is alive and the page
   * is intact — the view simply never invalidates, which is why a stray touch or
   * scroll "fixes" it.
   *
   * Nudge the *content* rather than the React tree. Re-rendering this component
   * to change a style prop also works, but it makes react-native-webview
   * re-apply `source`, which calls loadUrl() and throws the user back to the
   * portal's landing page — memoising `source` does not prevent it. A one-pixel
   * scroll produces a compositor frame with no re-render and no navigation.
   */
  const nudgeWebViewRedraw = () => {
    webViewRef.current?.injectJavaScript(
      "window.scrollBy(0,1); window.scrollBy(0,-1); true;",
    );
  };

  /**
   * Bring the WebView back after the OS has torn its renderer down. Always
   * re-mints the URL — see the note at the top of this file for why reload()
   * is not enough.
   */
  const recoverWebView = async (reason: string) => {
    if (isFetchingRef.current) return;
    logger.debug(`Recovering ExistingApplication WebView: ${reason}`);
    rendererDiedRef.current = false;
    if (!(await isSessionActive())) {
      // Session gone — the 401/409 teardown (or logout) drives its own
      // navigation to login. Nothing to show and nothing to recover.
      return;
    }
    fetchRef.current();
  };

  // Only touches refs and stable setters, so the listener may subscribe once.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState !== "active") return;

        // Always safe: repaints the existing page without touching its state.
        nudgeWebViewRedraw();

        // Only re-mint the URL when there is no page left to preserve.
        if (rendererDiedRef.current) {
          recoverWebView("renderer was torn down while backgrounded");
        }
      },
    );
    return () => subscription.remove();
  }, []);

  const performSessionTimeoutActions = async () => {
    if (isSessionClearing) return;
    isSessionClearing = true;
    try {
      const timeOut = await getItem<boolean>(IS_SESSION_TIME_OUT);
      if (!timeOut) {
        NavigationService.closeDrawer();
        await setItem(IS_SESSION_TIME_OUT, true);
        store.dispatch(setSessionExpired(true));
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
      logger.error("Session clear error:", e);
    }
  };

  const ShimmerReviewRow = () => (
    <View style={styles.shimmerContainer}>
      <View style={[styles.column]}>
        {/* Top buttons */}
        <View style={styles.row}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerButton}
          />

          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerButton}
          />
        </View>

        <ShadowCardComponent
          paddingHorizonatal={10}
          paddingVertical={1}
          marginVertical={1}
          marginHorizontal={1}
        >
          {/* Application name + status */}
          <View style={[styles.row, styles.sectionSpacing]}>
            <View style={styles.row}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerButton}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerButton}
              />
            </View>
          </View>

          {/* Country / University */}
          <View style={styles.row}>
            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValue}
              />
            </View>

            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValue}
              />
            </View>
          </View>

          {/* Loan Amount / Created On */}
          <View style={styles.row}>
            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValue}
              />
            </View>

            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValue}
              />
            </View>
          </View>

          {/* Partner / Sales Manager */}
          <View style={styles.row}>
            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValueSmall}
              />
            </View>

            <View style={styles.shimmerColumn}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerLabel}
              />

              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.shimmerValue}
              />
            </View>
          </View>

          {/* Thank you message */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerMessageBox}
          />
        </ShadowCardComponent>

        {/* Application submitted info */}
        {/* <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerInfoBox}
        /> */}

        {/* Application Progress */}
        {/* <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerProgress}
        /> */}
      </View>
    </View>
  );

  const content = (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <AppLoadingView />
        ) : // ShimmerReviewRow()
        hasWebViewError && isLoggedIn ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{strings.unable_to_load_page}</Text>
            <SmallButtonComponent
              title={strings.retry}
              disabled={false}
              imageNotNeeded={true}
              onPress={() => recoverWebView("user tapped retry")}
            />
          </View>
        ) : !webUrl ? (
          // Idle, not failed: no URL yet (first mount, or the session was torn
          // down under us). Never render a WebView with an empty uri — that is
          // what used to paint white — and never call it an error.
          <AppLoadingView />
        ) : (
          <WebView
            key={webViewKey}
            style={{ flex: 1, backgroundColor: "rgb(245,246,250)" }}
            ref={webViewRef}
            source={webViewSource}
            hideKeyboardAccessoryView={true}
            useWebKit={true}
            onLoadEnd={() => {
              // Hide the loader once the page finishes. Not re-shown on
              // onLoadStart, since SPA redirects/internal navigations fire it
              // repeatedly and would keep the loader stuck on screen.
              setIsWebLoading(false);
            }}
            onError={(syntheticEvent) => {
              // `onLoadError` is not a react-native-webview prop; main-frame
              // load failures arrive here.
              logger.debug(
                "WebView load error: ",
                syntheticEvent?.nativeEvent?.description,
              );
              setIsWebLoading(false);
              showErrorIfLoggedIn();
            }}
            onRenderProcessGone={(syntheticEvent) => {
              // Android reclaimed the WebView's renderer process — usually while
              // we were backgrounded. The library only reports this; the native
              // view is now a dead, blank surface, so we must re-create it.
              logger.debug(
                "WebView renderer process gone. didCrash: ",
                syntheticEvent?.nativeEvent?.didCrash,
              );
              rendererDiedRef.current = true;
              if (AppState.currentState === "active") {
                recoverWebView("renderer process gone");
              }
            }}
            onContentProcessDidTerminate={() => {
              // iOS equivalent: WKWebView jettisoned its content process.
              logger.debug("WebView content process terminated.");
              rendererDiedRef.current = true;
              if (AppState.currentState === "active") {
                recoverWebView("content process terminated");
              }
            }}
            onNavigationStateChange={(navState) => {
              //setIsLoading(navState.loading);
            }}
            onShouldStartLoadWithRequest={(request) => {
              return true;
            }}
            onMessage={async (event) => {
              logger.debug(
                "onMessage - Message received from WebView @#@#@##:..... : ",
                event.nativeEvent.data,
              );
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (
                  data.type === "SESSION_TIME_OUT"
                  //data.type === "LOGOUT_ANOTHERDEVICE" ||
                ) {
                  await performSessionTimeoutActions();
                } else if (
                  data.type === "LOGOUT_ANOTHERDEVICE_CLOSE" ||
                  data.type === "USER_LOGOUT" ||
                  data.type === "LOGOUT"
                ) {
                  //dispatch(clearAuth());
                  await clearAsyncStoreAndReduxStore();
                  //NavigationService.resetTo(navigationStrings.LOGIN);
                  NavigationService.resetTo(
                    navigationStrings.BIOMETRIC_MPIN_LOGIN,
                  );
                  dispatch(clearStatusPopup());
                  //getNotificationsList();
                } else if (data.type === "MOBILE_TOKEN") {
                  const parentNewToken = data.token;
                  if (parentNewToken && tokenRef.current !== parentNewToken) {
                    tokenRef.current = parentNewToken;
                    store.dispatch(setUserAuth(parentNewToken));
                  }
                }
              } catch (error) {
                logger.debug("Invalid message: ", error);
              }
            }}
            startInLoadingState={true}
            cacheEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            // Default (LAYER_TYPE_NONE). "hardware" forces the WebView into its own
            // off-screen GPU texture, which Android trims while backgrounded and
            // does not invalidate on resume — the page stays blank until a touch
            // redraws it.
            androidLayerType="none"
          />
        )}

        {embedded && isBottomNavVisible && (
          <View style={{ width: "100%", height: 80 }} />
        )}
      </KeyboardAvoidingView>
      {/* {(isLoading || isWebLoading) && <LoaderView />} */}
      <DialogStatusPopup />
    </>
  );

  if (embedded) {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        backIconNeeded={false}
        onBackPress={() => {}}
        onNotiIconPress={() => {}}
      />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(32),
  },
  errorText: {
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
    fontSize: moderateScale(13),
    textAlign: "center",
    marginBottom: moderateScale(16),
  },
  shimmerContainer: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingRight: 16,
  },
  column: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  shimmerColumn: {
    width: "48%",
  },

  sectionSpacing: {
    marginTop: 20,
  },

  shimmerButton: {
    width: "47%",
    height: 24,
    borderRadius: 10,
    marginBottom: 20,
  },

  shimmerTitle: {
    width: "55%",
    height: 20,
    borderRadius: 5,
    marginBottom: 10,
  },

  shimmerSubTitle: {
    width: "75%",
    height: 20,
    borderRadius: 5,
  },

  shimmerStatus: {
    width: "45%",
    height: 48,
    borderRadius: 8,
  },

  shimmerLabel: {
    width: "55%",
    height: 18,
    borderRadius: 5,
    marginBottom: 10,
  },

  shimmerValue: {
    width: "80%",
    height: 20,
    borderRadius: 5,
    marginBottom: 28,
  },

  shimmerValueSmall: {
    width: "20%",
    height: 20,
    borderRadius: 5,
    marginBottom: 28,
  },

  shimmerMessageBox: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 20,
  },

  shimmerInfoBox: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    marginBottom: 25,
  },

  shimmerProgress: {
    width: "100%",
    height: 70,
    borderRadius: 15,
    marginBottom: 20,
  },
});
