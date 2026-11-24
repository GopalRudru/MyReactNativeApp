# Left Navigation Drawer (Config-Driven)

Reference for the generic expandable drawer menu introduced in `app/navigation/drawer/`.
The old `app/navigation/CustomDrawerContent.tsx` is **deprecated** and no longer used
(kept only for reference — do not extend it).

---

## File Overview

| File | Responsibility |
|------|----------------|
| `drawerMenuConfig.ts` | Single source of truth for the entire menu (sections, items, navigation behavior). **Most changes happen only here.** |
| `useDrawerMenu.ts` | All behavior: section visibility, default expansion, access guards, analytics, tab-index dispatch, navigation per type. |
| `ExpandableMenu.tsx` | Purely presentational expand/collapse menu with active-item highlighting. Knows nothing about navigation. |
| `AppDrawerContent.tsx` | Drawer shell: logo/close, profile header, `ExpandableMenu`, Logout. Wired in `Routes.js` via `drawerContent`. |
| `../../screens/webview/DrawerWebViewScreen.tsx` | Generic WebView screen used by `WEBVIEW` items that have no dedicated screen. Fetches `secureWebViewToken`, appends the item's `webPath`, keeps the hamburger header, no bottom nav. |

Wiring:

- `Routes.js` → `drawerContent={(props) => <AppDrawerContent {...props} />}`
- `AppNavigationStack.js` → registers `DrawerWebViewScreen` on the root stack
- `navigationStrings.js` → `DRAWER_WEB_VIEW_SCREEN`, `DISBURSEMENT_HISTORY`

---

## Navigation Types

| Type | Meaning | Hamburger | Bottom nav |
|------|---------|-----------|------------|
| `WEBVIEW` | Opens inside a WebView. Uses `screen` if a dedicated webview screen exists, otherwise the generic `DrawerWebViewScreen` with `webPath`. | ✅ | ❌ |
| `SCREEN` | Pushes a standalone native screen (existing navigation flow). | per screen | ❌ |
| `EXISTING_FLOW` | Resets/navigates into the bottom-tab dashboard flow. | ✅ | ✅ |

## Config Schema (`DrawerMenuItem`)

```ts
{
  id: "termLoanPayment",          // unique, used for active highlighting
  title: "Payment",               // label shown in the drawer
  icon: imagePath.payment,        // drawer icon
  navigation: {
    type: NAVIGATION_TYPE.EXISTING_FLOW, // WEBVIEW | SCREEN | EXISTING_FLOW
    screen: navigationStrings.DASHBOARD_SCREEN, // target route (optional for WEBVIEW)
    params: { screen: "Payment" },        // params passed to the route
    resetStack: true,                     // EXISTING_FLOW only: resetTo vs navigate
    webPath: "/payment",                  // WEBVIEW only: portal path for DrawerWebViewScreen
  },
  bottomNavVisible: true,         // documents intended behavior (driven by where the screen is mounted)
  guard: MENU_GUARD.PAYMENT_ACCESS,      // optional access check (see Guards)
  analyticsEvent: "Dashboard_Payment",   // optional Firebase event
  selectedTabIndex: 2,            // optional tabsSlice index dispatched on select
  keepSelected: false,            // false -> highlight stays on the previous item (push-style screens)
}
```

Sections (`DrawerMenuSection`) carry `id`, `title`, `icon`, `visibility`, `items`.

## Section Visibility

Evaluated in `useDrawerMenu` against redux state (same rules as the old drawer):

- `ALWAYS` — always shown (Application)
- `TERM_LOAN` — `loanCategory.TermLoan.length > 0` AND (`businessType` is `retail`/`entity` OR `tabType === "Term Loan"`)
- `FLEXI_LOAN` — `loanCategory.Flexi.length > 0` AND (`businessType === "flexi"` OR `tabType === "Flexi Term Loan"`)

## Guards

Run before navigating; on failure a "No access" status popup is shown and navigation is blocked.
Logic copied verbatim from the old drawer (Term Loan business rules unchanged):

- `PAYMENT_ACCESS` — Android-or-India region check, then loan status `"A"` unless `otpUserData.altAccessFlag` is true.
- `DISBURSEMENT_ACCESS` — `altAccessFlag` OR (`isExistDisbursementAllowdLoan` AND loan status `"A"`).

To add a guard: add a key to `MENU_GUARD` in the config and a branch in `runGuard()` in `useDrawerMenu.ts`.

---

## Current Menu Mapping

| Section | Item | Type | Target | Bottom nav |
|---------|------|------|--------|------------|
| Application | Existing Application | WEBVIEW | `ExistingApplication` (dedicated webview screen) | ❌ |
| Application | New Application | WEBVIEW | `NewApplicationScreen` | ❌ |
| Term Loan | Dashboard | EXISTING_FLOW | resetTo Dashboard tab | ✅ |
| Term Loan | Fund Request | SCREEN | `RequestForDisbursement` (guard: disbursement) | ❌ |
| Term Loan | Payment | EXISTING_FLOW | resetTo Dashboard → Payment tab (guard: payment) | ✅ |
| Term Loan | Documents | EXISTING_FLOW | resetTo Dashboard → Document tab | ✅ |
| Term Loan | History | SCREEN | `DisbursementHistory` | ❌ |
| Flexi Loan | Loan | WEBVIEW | `DrawerWebViewScreen` + `/dashboard` | ❌ |
| Flexi Loan | Withdraw | SCREEN | **TBD** (no-ops with a logged warning until wired) | ❌ |
| Flexi Loan | Payments | WEBVIEW | `DrawerWebViewScreen` + `/payment` | ❌ |
| Flexi Loan | Documents | WEBVIEW | `DrawerWebViewScreen` + `/documents` | ❌ |

Logout sits outside the config in `AppDrawerContent` (clears storage/redux/analytics, resets to `BiometricMpinLogin`).

> **Bottom navigation rule (current behavior):** the tab bar is visible **only** for
> Term Loan items that reset into the bottom-tab navigator — Dashboard, Payment,
> Documents. Application and all Flexi Loan items never show the bottom navigation.
> Term Loan Fund Request and History open as full-screen pushes (no tab bar).
> Visibility is a consequence of where a screen is mounted (inside `BottomTabNavigator`
> vs the root stack); the `bottomNavVisible` flag in the config documents the intent.

---

## How To: Add a New Menu Item

1. Open `drawerMenuConfig.ts`.
2. Add an object to the relevant section's `items` (or add a new section with a `visibility` rule).
3. Pick the navigation type:
   - Web page → `type: WEBVIEW` + `webPath: "/your-path"` (no screen needed).
   - Native screen → `type: SCREEN` + `screen: navigationStrings.YOUR_SCREEN` (register it in `AppNavigationStack.js` if new).
   - Bottom-tab flow → `type: EXISTING_FLOW` + `screen: DASHBOARD_SCREEN` + `params: { screen: "TabName" }` + `resetStack: true`.
4. Optionally set `guard`, `analyticsEvent`, `selectedTabIndex`, `keepSelected`.

No component or hook changes are needed for plain additions.

## ExistingApplication: Embedded vs Standalone

`ExistingApplication` renders in two modes (`embedded` prop):

- **Standalone** (drawer item → `EXISTING_APPLICATION_SCREEN` on the root stack): renders its own `SafeAreaView`/`StatusBar`/`Header`, no bottom-tab spacer.
- **Embedded** (`embedded={true}`, inside `DashboardScreen` when the user has no Term/Flexi loans): skips its own header — `DashboardScreen` already provides one (this was the double-header bug) — and adds an 80px bottom spacer to clear the absolute-positioned tab bar.

`DashboardScreen` picks what to render via `resolveDashboardView()` → `TERM_LOAN | FLEXI_LOAN | EXISTING_APPLICATION | NO_LOANS`.

## Selection Sync With the Current Screen

The drawer's expanded section + highlighted item always follow the actual
navigation state (back button, tab presses, deep links included) — not just the
last drawer press. `useDrawerMenu` subscribes to navigation state changes and,
on every change, `drawerRouteMatcher.ts` walks the focused route chain
(`NavigationService.getFocusedRouteChain()`) and scores it against each menu
item's own navigation spec:

- `screen` match (e.g. `ExistingApplication`) → score 1
- `screen` + nested `params.screen` match (e.g. Payment tab) → score 2 (beats
  the plain Dashboard match when a tab is focused)
- generic webview items match on `DRAWER_WEB_VIEW_SCREEN` + identical `webPath`
- `keepSelected: false` items never claim the highlight
- no match → login defaults apply (Term Loan/Dashboard, Flexi, or Application
  depending on `tabType` and available loan categories)

Sync runs from a single `syncWithCurrentRoute` callback triggered by three
things: hook mount, every navigation state change, and every drawer open
(`useDrawerStatus`) — so the selection can never be stale while the drawer is
visible, and the login defaults can never overwrite a route-derived selection.

Fully config-driven: new menu items are matched automatically from their
navigation spec. Tests: `__tests__/drawerRouteMatcher.test.ts`.

## Pitfall: duplicate "DashboardScreen" route name

The route name `DashboardScreen` exists at **two** levels: the root stack entry that
hosts `BottomTabNavigator`, and the screen inside the Dashboard tab's nested stack
(`BottomTabNavigator.js`). When the Dashboard tab is focused (i.e. whenever the user
opens the drawer from the dashboard), an untargeted `reset`/`navigate` to
`DashboardScreen` is captured by the **inner** stack, so `{ screen: "Payment" }`
never reaches the tab navigator and the app stays on Dashboard.

`NavigationService.resetToNestedScreen` fixes this by walking the focused state
chain from the root, finding the navigator that owns the route name, and
dispatching the reset with an explicit `target` key. EXISTING_FLOW items with a
nested `screen` param (`resetStack: true`) go through this helper.
Regression coverage: `__tests__/drawerTabNavRepro.test.tsx`.

## Open Items

- **Flexi Withdraw**: set `navigation.screen` once the withdraw screen exists.
- **Flexi web paths**: `/dashboard`, `/payment`, `/documents` are assumptions — confirm against the portal routes.
- **`buildWebUrl`** in `DrawerWebViewScreen.tsx` appends `webPath` before the token query string — verify against the actual `secureWebViewToken` URL format.
