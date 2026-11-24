/**
 * Tests for the drawer selection <-> current route sync. The matcher walks
 * the focused route chain and picks the menu item whose navigation spec
 * matches most specifically, so the drawer always highlights the screen the
 * user is actually on.
 */
import {
  findMenuItemForRouteChain,
  FocusedRoute,
} from "../app/navigation/drawer/drawerRouteMatcher";
import type { DrawerMenuSection } from "../app/navigation/drawer/drawerMenuConfig";

const GENERIC_WEBVIEW = "DrawerWebViewScreen";

const icon = 0 as any;

const sections: DrawerMenuSection[] = [
  {
    id: "application",
    title: "Application",
    icon,
    visibility: "ALWAYS",
    items: [
      {
        id: "existingApplication",
        title: "Existing Application",
        icon,
        navigation: { type: "WEBVIEW", screen: "ExistingApplication" },
        bottomNavVisible: false,
      },
    ],
  },
  {
    id: "termLoan",
    title: "Term Loan",
    icon,
    visibility: "TERM_LOAN",
    items: [
      {
        id: "termLoanDashboard",
        title: "Dashboard",
        icon,
        navigation: {
          type: "EXISTING_FLOW",
          screen: "DashboardScreen",
          resetStack: true,
        },
        bottomNavVisible: true,
      },
      {
        id: "termLoanPayment",
        title: "Payment",
        icon,
        navigation: {
          type: "EXISTING_FLOW",
          screen: "DashboardScreen",
          params: { screen: "Payment" },
          resetStack: true,
        },
        bottomNavVisible: true,
      },
      {
        id: "termLoanHistory",
        title: "History",
        icon,
        navigation: { type: "SCREEN", screen: "DisbursementHistory" },
        keepSelected: false,
        bottomNavVisible: false,
      },
    ],
  },
  {
    id: "flexiLoan",
    title: "Flexi Loan",
    icon,
    visibility: "FLEXI_LOAN",
    items: [
      {
        id: "flexiPayments",
        title: "Payments",
        icon,
        navigation: { type: "WEBVIEW", webPath: "/payment" },
        bottomNavVisible: false,
      },
      {
        id: "flexiDocuments",
        title: "Documents",
        icon,
        navigation: { type: "WEBVIEW", webPath: "/documents" },
        bottomNavVisible: false,
      },
    ],
  },
];

const match = (chain: FocusedRoute[]) =>
  findMenuItemForRouteChain(sections, chain, GENERIC_WEBVIEW);

describe("findMenuItemForRouteChain", () => {
  it("matches the Dashboard item on the Dashboard tab", () => {
    expect(
      match([
        { name: "AppNavigationStack" },
        { name: "DashboardScreen" },
        { name: "Dashboard" },
        { name: "DashboardScreen" },
      ])
    ).toEqual({ sectionId: "termLoan", itemId: "termLoanDashboard" });
  });

  it("prefers the more specific Payment item on the Payment tab", () => {
    expect(
      match([
        { name: "AppNavigationStack" },
        { name: "DashboardScreen" },
        { name: "Payment" },
        { name: "PaymentScreen" },
      ])
    ).toEqual({ sectionId: "termLoan", itemId: "termLoanPayment" });
  });

  it("matches dedicated-screen webview items by route name", () => {
    expect(
      match([{ name: "AppNavigationStack" }, { name: "ExistingApplication" }])
    ).toEqual({ sectionId: "application", itemId: "existingApplication" });
  });

  it("distinguishes generic webview items by webPath param", () => {
    expect(
      match([
        { name: "AppNavigationStack" },
        { name: GENERIC_WEBVIEW, params: { webPath: "/documents" } },
      ])
    ).toEqual({ sectionId: "flexiLoan", itemId: "flexiDocuments" });
  });

  it("never selects keepSelected:false items", () => {
    expect(
      match([{ name: "AppNavigationStack" }, { name: "DisbursementHistory" }])
    ).toBeNull();
  });

  it("returns null for unrelated screens so the previous selection persists", () => {
    expect(
      match([{ name: "AppNavigationStack" }, { name: "UserProfileScreen" }])
    ).toBeNull();
  });
});
