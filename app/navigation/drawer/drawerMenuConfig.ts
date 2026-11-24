import { ImageSourcePropType } from "react-native";
import imagePath from "../../constant/imagePath";
import navigationStrings from "../../constant/navigationStrings";

/**
 * WEBVIEW       -> opens inside a WebView (hamburger accessible, no bottom nav).
 *                  Uses `screen` when a dedicated webview screen exists,
 *                  otherwise the generic DrawerWebViewScreen with `webPath`.
 * SCREEN        -> pushes a standalone native screen (existing navigation flow).
 * EXISTING_FLOW -> resets/navigates into the bottom-tab dashboard flow
 *                  (bottom nav stays visible).
 */
export const NAVIGATION_TYPE = {
  WEBVIEW: "WEBVIEW",
  SCREEN: "SCREEN",
  EXISTING_FLOW: "EXISTING_FLOW",
} as const;

export type NavigationType =
  (typeof NAVIGATION_TYPE)[keyof typeof NAVIGATION_TYPE];

/** Access checks evaluated before navigating; logic lives in useDrawerMenu. */
export const MENU_GUARD = {
  PAYMENT_ACCESS: "PAYMENT_ACCESS",
  DISBURSEMENT_ACCESS: "DISBURSEMENT_ACCESS",
} as const;

export type MenuGuard = (typeof MENU_GUARD)[keyof typeof MENU_GUARD];

/** Section-level visibility rules evaluated against redux state in useDrawerMenu. */
export const SECTION_VISIBILITY = {
  ALWAYS: "ALWAYS",
  LOAN: "LOAN",
  TERM_LOAN: "TERM_LOAN",
  FLEXI_LOAN: "FLEXI_LOAN",
} as const;

export type SectionVisibility =
  (typeof SECTION_VISIBILITY)[keyof typeof SECTION_VISIBILITY];

export interface DrawerNavigationSpec {
  type: NavigationType;
  /** Target route name. For WEBVIEW it is optional — omit to use the generic DrawerWebViewScreen. */
  screen?: string;
  params?: Record<string, unknown>;
  /** EXISTING_FLOW only: reset the stack instead of pushing. */
  resetStack?: boolean;
  /** WEBVIEW only: web portal path appended to the secure-token base URL. */
  webPath?: string;
}

export interface DrawerMenuItem {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  navigation: DrawerNavigationSpec;
  /** Whether the target screen shows the bottom tab bar (driven by where the screen is mounted). */
  bottomNavVisible: boolean;
  guard?: MenuGuard;
  analyticsEvent?: string;
  /** Bottom tab index dispatched to tabsSlice on selection. */
  selectedTabIndex?: number;
  /** false -> drawer highlight stays on the previous item (push-style screens). */
  keepSelected?: boolean;
  drawerMenuItemVisible?: boolean;
}

export interface DrawerMenuSection {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  visibility: SectionVisibility;
  items: DrawerMenuItem[];
  drawerMenuSectionVisible: boolean;
  /**
   * When set, the section behaves as a single, non-expandable link: tapping the
   * header navigates directly instead of expanding child items. Use only with an
   * empty `items` array.
   */
  navigation?: DrawerNavigationSpec;
  guard?: MenuGuard;
  analyticsEvent?: string;
}

export const DRAWER_MENU: DrawerMenuSection[] = [
  {
    id: "application",
    title: "Application",
    icon: imagePath.application,
    visibility: SECTION_VISIBILITY.ALWAYS,
    drawerMenuSectionVisible: true,
    items: [
      {
        id: "existingApplication",
        title: "Existing Application",
        icon: imagePath.newApplication,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          screen: navigationStrings.EXISTING_APPLICATION_SCREEN,
        },
        selectedTabIndex: 1.2,
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
      {
        id: "newApplication",
        title: "New Application",
        icon: imagePath.newApplication,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          screen: navigationStrings.NEW_APPLICATION_SCREEN,
        },
        selectedTabIndex: 1.1,
        bottomNavVisible: false,
        drawerMenuItemVisible: false,
      },
    ],
  },
  {
    id: "loans",
    title: "Loan",
    icon: imagePath.loan,
    visibility: SECTION_VISIBILITY.LOAN,
    drawerMenuSectionVisible: true,
    // Single, non-expandable link shown when the user has neither a Term Loan
    // nor a Flexi Loan. Opens the standalone "No Loans" screen.
    navigation: {
      type: NAVIGATION_TYPE.SCREEN,
      screen: navigationStrings.NO_LOANS_SCREEN,
    },
    items: [],
  },
  {
    id: "termLoan",
    title: "Term Loan",
    icon: imagePath.leftNavTermLoan,
    visibility: SECTION_VISIBILITY.TERM_LOAN,
    drawerMenuSectionVisible: true,
    items: [
      {
        id: "termLoanDashboard",
        title: "Dashboard",
        icon: imagePath.leftNavDashboard,
        navigation: {
          type: NAVIGATION_TYPE.EXISTING_FLOW,
          screen: navigationStrings.DASHBOARD_SCREEN,
          resetStack: true,
        },
        analyticsEvent: "Dashboard_Dashboard",
        bottomNavVisible: true,
        drawerMenuItemVisible: true,
      },
      {
        id: "termLoanFundRequest",
        title: "Fund Request",
        icon: imagePath.fundRequest,
        navigation: {
          type: NAVIGATION_TYPE.SCREEN,
          screen: navigationStrings.REQUEST_FOR_DISBURSEMENT,
        },
        guard: MENU_GUARD.DISBURSEMENT_ACCESS,
        analyticsEvent: "Dashboard_Disbursement",
        selectedTabIndex: 1,
        keepSelected: false,
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
      {
        id: "termLoanPayment",
        title: "Payment",
        icon: imagePath.payment,
        navigation: {
          type: NAVIGATION_TYPE.EXISTING_FLOW,
          screen: navigationStrings.DASHBOARD_SCREEN,
          params: { screen: "Payment" },
          resetStack: true,
        },
        guard: MENU_GUARD.PAYMENT_ACCESS,
        analyticsEvent: "Dashboard_Payment",
        selectedTabIndex: 2,
        bottomNavVisible: true,
        drawerMenuItemVisible: true,
      },
      {
        id: "termLoanDocuments",
        title: "Documents",
        icon: imagePath.document,
        navigation: {
          type: NAVIGATION_TYPE.EXISTING_FLOW,
          screen: navigationStrings.DASHBOARD_SCREEN,
          params: { screen: "Document" },
          resetStack: true,
        },
        analyticsEvent: "Dashboard_Documents",
        bottomNavVisible: true,
        drawerMenuItemVisible: true,
      },
      {
        id: "termLoanHistory",
        title: "History",
        icon: imagePath.history,
        navigation: {
          type: NAVIGATION_TYPE.SCREEN,
          screen: navigationStrings.DISBURSEMENT_HISTORY,
        },
        analyticsEvent: "Dashboard_History",
        keepSelected: false,
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
    ],
  },
  {
    id: "flexiLoan",
    title: "Flexi Loan",
    icon: imagePath.leftNavFlexiLoan,
    visibility: SECTION_VISIBILITY.FLEXI_LOAN,
    drawerMenuSectionVisible: false,
    items: [
      {
        id: "flexiLoanDashboard",
        title: "Loan",
        icon: imagePath.loan,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          webPath: "/dashboard",
        },
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
      {
        id: "flexiWithdraw",
        title: "Withdraw",
        icon: imagePath.withdraw,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          webPath: "/flexiWithdraw",
          //type: NAVIGATION_TYPE.SCREEN,
          // TODO: point to the flexi withdraw screen once it is available.
        },
        //keepSelected: false,
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
      {
        id: "flexiPayments",
        title: "Payments",
        icon: imagePath.payment,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          webPath: "/payment",
        },
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
      {
        id: "flexiDocuments",
        title: "Documents",
        icon: imagePath.document,
        navigation: {
          type: NAVIGATION_TYPE.WEBVIEW,
          webPath: "/documents",
        },
        bottomNavVisible: false,
        drawerMenuItemVisible: true,
      },
    ],
  },
];
