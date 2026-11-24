import { useCallback, useEffect, useMemo, useState } from "react";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import analytics from "@react-native-firebase/analytics";
import useGeoLocation from "react-ipgeolocation";
import * as NavigationService from "../NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import strings from "../../res/strings";
import { decrypt } from "../../utils/crypto";
import { authSelector } from "../../services/redux/slices/authSlice";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import { setSelectedIndex, setSelectedSubTabName, triggerExistingApplicationRefresh } from "../../services/redux/slices/tabsSlice";
import { RootState } from "../../services/redux/store";
import { createModuleLogger } from "../../utils/logger";
import {
  DRAWER_MENU,
  DrawerMenuItem,
  DrawerMenuSection,
  MENU_GUARD,
  MenuGuard,
  NAVIGATION_TYPE,
  SECTION_VISIBILITY,
} from "./drawerMenuConfig";
import { findMenuItemForRouteChain } from "./drawerRouteMatcher";

const logger = createModuleLogger("DrawerMenu");

interface GuardResult {
  allowed: boolean;
  message?: string;
  resetTabIndex?: boolean;
}

export default function useDrawerMenu(closeDrawer: () => void) {
  const dispatch = useDispatch();
  const location = useGeoLocation();

  const { userProfile, loanCategory, otpUserData } = useSelector(authSelector);
  const businessType = useSelector(
    (state: RootState) => state?.auth?.businessType?.name
  );
  const tabType = useSelector((state: RootState) => state.tabs.tabType);
  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData
  );
  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );

  const { Flexi = [], TermLoan = [] } = loanCategory || {};

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    null
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const showTermLoan =
    TermLoan.length > 0 &&
    (businessType === "retail" ||
      businessType === "entity" ||
      tabType === "Term Loan");

  const showFlexiLoan =
    Flexi.length > 0;// && (businessType === "flexi" || tabType === "Flexi Term Loan");

  // DashboardScreen already renders <ExistingApplication embedded /> when the
  // user has no loans (see resolveDashboardView), and the native stack keeps it
  // mounted underneath. Pushing the standalone route on top of it would leave
  // two copies subscribed to existingApplicationRefreshCount, so every drawer
  // tap fired the secure-token fetch twice.
  const existingApplicationIsEmbedded =
    TermLoan.length === 0 && Flexi.length === 0;

  const sections = useMemo(
    () =>
      DRAWER_MENU.filter((section: DrawerMenuSection) => {
        switch (section.visibility) {
          case SECTION_VISIBILITY.LOAN:
            return !showTermLoan && !showFlexiLoan;
          case SECTION_VISIBILITY.TERM_LOAN:
            return showTermLoan;
          case SECTION_VISIBILITY.FLEXI_LOAN:
            return showFlexiLoan;
          default:
            return true;
        }
      }),
    [showTermLoan, showFlexiLoan]
  );

  // Single source of truth for the drawer selection: the current navigation
  // state. Login defaults only apply when the current route doesn't map to a
  // menu item, so they can never overwrite a route-derived selection.
  const syncWithCurrentRoute = useCallback(() => {
    const match = findMenuItemForRouteChain(
      sections,
      NavigationService.getFocusedRouteChain(),
      navigationStrings.DRAWER_WEB_VIEW_SCREEN
    );
    if (match) {
      setExpandedSectionId(match.sectionId);
      setActiveItemId(match.itemId);
      return;
    }

    if (!userProfile) return;
    if ((tabType === "Term Loan" || tabType == null) && TermLoan.length > 0) {
      setExpandedSectionId("termLoan");
      setActiveItemId("termLoanDashboard");
    } else if (tabType === "Flexi Term Loan" && Flexi.length > 0) {
      setExpandedSectionId("flexiLoan");
    } else if (Flexi.length === 0 && TermLoan.length === 0) {
      setExpandedSectionId("application");
      setActiveItemId("existingApplication");
    } else {
      setExpandedSectionId("termLoan");
      setActiveItemId("termLoanDashboard");
    }
  }, [sections, userProfile, tabType, TermLoan.length, Flexi.length]);

  // Re-sync on every navigation change (back button, tab presses, deep links).
  useEffect(() => {
    syncWithCurrentRoute();
    return NavigationService.addNavigationStateListener(syncWithCurrentRoute);
  }, [syncWithCurrentRoute]);

  // Re-sync whenever the drawer becomes visible, so the highlighted item can
  // never be stale at the moment the user is actually looking at the menu.
  const drawerStatus = useDrawerStatus();
  useEffect(() => {
    if (drawerStatus === "open") {
      syncWithCurrentRoute();
    }
  }, [drawerStatus, syncWithCurrentRoute]);

  let analyticsUserId = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    analyticsUserId = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const runGuard = (guard?: MenuGuard): GuardResult => {
    if (!guard) return { allowed: true };

    const matchVal = dashboardDataSet?.find(
      (data: any) => data?.lanNumber === selectedLoanNumber
    );
    const allAccess = otpUserData?.altAccessFlag === true;

    if (guard === MENU_GUARD.PAYMENT_ACCESS) {
      const isAndroid = Platform.OS === "android";
      const isIndia =
        location?.country_name === "IN" || location?.country === "IN";
      if (!isAndroid && !isIndia) {
        return {
          allowed: false,
          message:
            strings.this_functionality_is_currently_unavailable_in_your_region,
        };
      }
      if (!allAccess && (matchVal?.status || matchVal?.statusOfLoan) != "A") {
        return {
          allowed: false,
          message: "Payment requests are currently unavailable for this loan",
          resetTabIndex: true,
        };
      }
      return { allowed: true };
    }

    if (guard === MENU_GUARD.DISBURSEMENT_ACCESS) {
      const isLoanEligible =
        matchVal?.isExistDisbursementAllowdLoan === true &&
        (matchVal?.status || matchVal?.statusOfLoan) === "A";
      if (allAccess || isLoanEligible) {
        return { allowed: true };
      }
      return {
        allowed: false,
        message: "Disbursement requests are currently unavailable for this loan",
        resetTabIndex: true,
      };
    }

    return { allowed: true };
  };

  const navigateForItem = (item: DrawerMenuItem) => {
    const { type, screen, params, resetStack, webPath } = item.navigation;
    switch (type) {
      case NAVIGATION_TYPE.WEBVIEW:
        if (screen === navigationStrings.EXISTING_APPLICATION_SCREEN) {
          // Bump the counter before navigating, so a screen that mounts as a
          // result reads the new value on its first render instead of fetching
          // on mount and again when the counter lands.
          dispatch(triggerExistingApplicationRefresh());
          if (existingApplicationIsEmbedded) {
            NavigationService.popToRoute(navigationStrings.DASHBOARD_SCREEN);
          } else {
            NavigationService.navigate(screen, params);
          }
        } else if (screen) {
          NavigationService.navigate(screen, params);
        } else {
          NavigationService.navigate(navigationStrings.DRAWER_WEB_VIEW_SCREEN, {
            title: item.title,
            webPath,
            ...params,
          });
        }
        break;
      case NAVIGATION_TYPE.SCREEN:
        if (!screen) {
          logger.warn(`No screen configured for drawer item "${item.id}"`);
          return;
        }
        NavigationService.navigate(screen, params);
        break;
      case NAVIGATION_TYPE.EXISTING_FLOW: {
        const { screen: nestedScreen, ...restParams } = (params || {}) as any;
        if (resetStack && nestedScreen) {
          NavigationService.resetToNestedScreen(screen, nestedScreen, restParams);
        } else if (resetStack) {
          NavigationService.resetTo(screen, params);
        } else {
          NavigationService.navigate(screen, params);
        }
        break;
      }
      default:
        logger.warn(`Unknown navigation type for drawer item "${item.id}"`);
    }
  };

  const handleItemPress = async (item: DrawerMenuItem) => {
    closeDrawer();

    const guardResult = runGuard(item.guard);
    if (!guardResult.allowed) {
      if (guardResult.resetTabIndex) {
        dispatch(setSelectedIndex(0));
      }
      dispatch(
        setStatusPopup({ status: "No access", message: guardResult.message })
      );
      return;
    }

    if (item.keepSelected !== false) {
      setActiveItemId(item.id);
    }

    if (item.analyticsEvent) {
      try {
        await analytics().setUserId(analyticsUserId);
        analytics().logEvent(item.analyticsEvent, { user_id: analyticsUserId });
      } catch (error) {
        logger.warn("Drawer analytics logging failed:", String(error));
      }
    }

    if (item.selectedTabIndex !== undefined) {
      dispatch(setSelectedIndex(item.selectedTabIndex));
    }

    navigateForItem(item);
  };

  const toggleSection = (section: DrawerMenuSection) => {
    setExpandedSectionId((prev) => (prev === section.id ? null : section.id));
  };

  // A section carrying its own `navigation` acts as a single, non-expandable
  // link (e.g. "Loan" -> No Loans screen); otherwise it expands its children.
  const handleSectionPress = (section: DrawerMenuSection) => {
    if (!section.navigation) {
      toggleSection(section);
      return;
    }
    handleItemPress({
      id: section.id,
      title: section.title,
      icon: section.icon,
      navigation: section.navigation,
      guard: section.guard,
      analyticsEvent: section.analyticsEvent,
      bottomNavVisible: false,
      keepSelected: false,
    });
  };

  const resetMenuState = () => {
    setExpandedSectionId(null);
    setActiveItemId(null);
  };

  return {
    sections,
    expandedSectionId,
    activeItemId,
    toggleSection,
    handleSectionPress,
    handleItemPress,
    resetMenuState,
  };
}
