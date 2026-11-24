import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
  DrawerActions,
} from "@react-navigation/native";
import { createModuleLogger } from "../utils/logger";


const logger = createModuleLogger("NavigationService");

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function replace(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  } else {
    logger.warn("Navigation not ready for replace", { name, params });
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * ✅ NEW: Set params for the current route
 */
export function setParams(params) {
  if (navigationRef.isReady()) {
    navigationRef.setParams(params);
  } else {
    logger.warn("Navigation not ready for setParams", params);
  }
}

export function goBackWithParams(params) {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.setParams(params); // 👈 set on previous route
    navigationRef.goBack();
  }
}

/**
 * Resets the entire navigation stack and navigates to the specified screen
 */
export function resetTo(name, params = {}) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      }),
    );
  }
}

/**
 * "Back" navigation to `name` even when it is not below the current screen in
 * the stack (e.g. drawer flows push screens on top of each other). A plain
 * resetTo() plays the forward (right-to-left) push animation; this instead
 * silently rebuilds the back stack as [name, currentScreen] — keeping the
 * current screen's key so it doesn't remount or animate — and then pops, so
 * the user sees the native back (left-to-right) transition.
 */
export function resetBackTo(name, params = {}) {
  if (!navigationRef.isReady()) {
    return;
  }
  // Walk the focused chain to the navigator that owns `name`.
  let state = navigationRef.getRootState();
  while (state && !state.routeNames?.includes(name)) {
    state = state.routes?.[state.index ?? 0]?.state;
  }
  const currentRoute = state?.routes?.[state.index ?? 0];
  if (!currentRoute || currentRoute.name === name) {
    resetTo(name, params);
    return;
  }
  navigationRef.dispatch({
    ...CommonActions.reset({
      index: 1,
      routes: [{ name, params }, currentRoute],
    }),
    ...(state.key ? { target: state.key } : {}),
  });
  // Pop on the next frame so it applies to the freshly reset state.
  requestAnimationFrame(() => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  });
}

/**
 * Finds the key of the highest navigator (walking the focused chain from the
 * root) whose route names include `name`. Needed because route names are
 * duplicated across levels (e.g. "DashboardScreen" exists both in the root
 * stack and inside the Dashboard tab's stack) — without an explicit target,
 * dispatched actions get captured by the deepest focused navigator that
 * happens to have a matching route name.
 */
const findNavigatorKeyForRoute = (name) => {
  let state = navigationRef.getRootState();
  while (state) {
    if (state.routeNames?.includes(name)) {
      return state.key;
    }
    state = state.routes?.[state.index ?? 0]?.state;
  }
  return undefined;
};

/**
 * Pops back to an existing `name` route, reusing that screen's instance rather
 * than rebuilding it — unlike resetTo(), which remounts the screen and every
 * child it renders. A no-op when `name` is already focused. Falls back to
 * replacing the current route if `name` is not in the stack at all.
 */
export function popToRoute(name, params) {
  if (!navigationRef.isReady()) {
    logger.warn("Navigation not ready for popToRoute", { name });
    return;
  }
  const target = findNavigatorKeyForRoute(name);
  if (!target) {
    logger.warn("No navigator owns route for popToRoute", { name });
    return;
  }
  navigationRef.dispatch({ ...StackActions.popTo(name, params), target });
}

/**
 * Returns the focused route chain from the root down to the deepest screen,
 * e.g. [AppNavigationStack, DashboardScreen, Payment, PaymentScreen].
 */
export function getFocusedRouteChain() {
  if (!navigationRef.isReady()) return [];
  const chain = [];
  let state = navigationRef.getRootState();
  while (state) {
    const route = state.routes?.[state.index ?? 0];
    if (!route) break;
    chain.push({ name: route.name, params: route.params });
    state = route.state;
  }
  return chain;
}

/**
 * Subscribes to navigation state changes. Returns the unsubscribe function.
 */
export function addNavigationStateListener(callback) {
  return navigationRef.addListener("state", callback);
}

/**
 * Resets the navigator owning `name` to that screen with a specific nested
 * screen focused (e.g. open the bottom tab navigator on the Payment tab).
 * `reset` ignores the `{ screen: ... }` params shortcut that `navigate`
 * supports, so the nested state must be set explicitly.
 */
export function resetToNestedScreen(name, nestedScreen, nestedParams = {}) {
  if (navigationRef.isReady()) {
    const target = findNavigatorKeyForRoute(name);
    navigationRef.dispatch({
      ...CommonActions.reset({
        index: 0,
        routes: [
          {
            name,
            state: {
              routes: [{ name: nestedScreen, params: nestedParams }],
            },
          },
        ],
      }),
      ...(target ? { target } : {}),
    });
  } else {
    logger.warn("Navigation not ready for resetToNestedScreen", {
      name,
      nestedScreen,
    });
  }
}


export function closeDrawer() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.closeDrawer());
  }
}

export function getCurrentRouteName() {
  if (!navigationRef.isReady()) return null;
  return navigationRef.getCurrentRoute()?.name ?? null;
}