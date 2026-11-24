import type {
  DrawerMenuSection,
  DrawerNavigationSpec,
} from "./drawerMenuConfig";

export interface FocusedRoute {
  name: string;
  params?: object;
}

export interface DrawerRouteMatch {
  sectionId: string;
  /** null when a section is itself a direct link (has no child items). */
  itemId: string | null;
}

/**
 * Scores how specifically a menu item's navigation spec matches the focused
 * route chain. 0 = no match. Items targeting a nested screen (e.g. the Payment
 * tab inside the dashboard navigator) score higher than items that only match
 * the navigator route itself, so "Payment" wins over "Dashboard" when the
 * Payment tab is focused.
 */
const scoreNavigation = (
  navigation: DrawerNavigationSpec,
  chain: FocusedRoute[],
  genericWebViewScreen: string
): number => {
  const { type, screen, params, webPath } = navigation;
  const names = chain.map((route) => route.name);

  if (type === "WEBVIEW" && !screen) {
    const webViewRoute = chain.find(
      (route) => route.name === genericWebViewScreen
    );
    const routeWebPath = (
      webViewRoute?.params as Record<string, unknown> | undefined
    )?.webPath;
    return webViewRoute && routeWebPath === webPath ? 2 : 0;
  }

  if (!screen || !names.includes(screen)) {
    return 0;
  }

  const nestedScreen = (params as Record<string, unknown> | undefined)?.screen;
  if (typeof nestedScreen === "string") {
    return names.includes(nestedScreen) ? 2 : 0;
  }
  return 1;
};

/**
 * Finds the menu item matching the current navigation state, so the drawer
 * can expand the right section and highlight the right item. Items with
 * keepSelected === false (push-style screens) never claim the highlight.
 */
export function findMenuItemForRouteChain(
  sections: DrawerMenuSection[],
  chain: FocusedRoute[],
  genericWebViewScreen: string
): DrawerRouteMatch | null {
  let best: DrawerRouteMatch | null = null;
  let bestScore = 0;

  for (const section of sections) {
    // A section that is itself a direct link (no children) can claim the
    // highlight, e.g. "Loan" -> No Loans screen.
    if (section.navigation) {
      const score = scoreNavigation(
        section.navigation,
        chain,
        genericWebViewScreen
      );
      if (score > bestScore) {
        bestScore = score;
        best = { sectionId: section.id, itemId: null };
      }
    }
    for (const item of section.items) {
      if (item.keepSelected === false) continue;
      const score = scoreNavigation(
        item.navigation,
        chain,
        genericWebViewScreen
      );
      if (score > bestScore) {
        bestScore = score;
        best = { sectionId: section.id, itemId: item.id };
      }
    }
  }

  return best;
}
