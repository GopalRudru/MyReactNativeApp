import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useSelector } from "react-redux";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";
import mainStyles from "../res/mainStyles";
import { decrypt } from "../utils/crypto";
import { clearAsyncStoreAndReduxStore, setItem } from "../utils/storageUtils";
import { IS_LOGGED_IN } from "../utils/storageUtils";
import analytics from "@react-native-firebase/analytics";
import * as NavigationService from "./NavigationService";
import navigationStrings from "../constant/navigationStrings";
import { authSelector } from "../services/redux/slices/authSlice";
import { RootState } from "../services/redux/store";
import useGeoLocation from "react-ipgeolocation";
import { useDispatch } from "react-redux";
import { setStatusPopup } from "../services/redux/slices/statusPopupSlice";
import { setSelectedIndex } from "../services/redux/slices/tabsSlice";
import strings from "../res/strings";
import logger from "../utils/logger";

const menuItems = [
  { label: "Dashboard", route: "Dashboard" },
  { label: "Fund Request", route: "Disbursement" },
  { label: "Payment", route: "Payment" },
  { label: "Documents", route: "Documents" },
  { label: "History", route: "History" },
];

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export interface MobileMenuItem {
  title: string;
  path?: string;
  activeIcon?: React.ElementType | string; 
  inActiveIcon?: React.ElementType | string;
  subMenus?: MobileMenuItem[];
}

// const mobileMenuItems: MobileMenuItem[] = useMemo(() => {
//     const INTERNAL_MENUS: MobileMenuItem[] = [
//       {
//         path: "",
//         title: "Application",
//         activeIcon: ActiveApplicationIcon,
//         inActiveIcon: InActiveApplicationIcon,
//         subMenus: [
//           // {
//           //   path: "/application",
//           //   title: "New Applications",
//           //   activeIcon: ActiveApplicationIcon,
//           //   inActiveIcon: InActiveApplicationIcon,
//           // },
//           {
//             path: "/application/existing-application",
//             title: "Existing Applications",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//         ],
//       },
//       {
//         path: "",
//         title: "Term Loan",
//         activeIcon: ActiveTermLoanIcon,
//         inActiveIcon: InActiveTermLoanIcon,
//         subMenus: [
//           {
//             path: "/dashboard",
//             title: "Dashboard",
//             activeIcon: ActiveDashboardTermIcon,
//             inActiveIcon: InActiveDashboardTermIcon,
//           },
//           {
//             path: "",
//             title: "Disbursement",
//             activeIcon: ActiveFundReqTermIcon,
//             inActiveIcon: InActiveFundReqTermIcon,
//           },
//           {
//             path: "",
//             title: "Payment",
//             activeIcon: ActivePaymentTermIcon,
//             inActiveIcon: InActivePaymentTermIcon,
//           },
//           {
//             path: "",
//             title: "Documents",
//             activeIcon: ActiveDocumentTermIcon,
//             inActiveIcon: InActiveDocumentTermIcon,
//           },
//           {
//             path: "",
//             title: "History",
//             activeIcon: ActiveHistoryTermIcon,
//             inActiveIcon: InActiveHistoryTermIcon,
//           },
//         ],
//       },
//       {
//         path: "",
//         title: "Flexi Loan",
//         activeIcon: ActiveFlexiIcon,
//         inActiveIcon: InActiveFlexiIcon,
//         subMenus: [
//           {
//             path: "/dashboard",
//             title: "Loans",
//             activeIcon: ActiveLoanFlexiIcon,
//             inActiveIcon: InActiveLoanFlexiIcon,
//           },
//           {
//             path: "",
//             title: "Withdraw",
//             activeIcon: ActiveWithdrawFlexiIcon,
//             inActiveIcon: InActiveWithdrawFlexiIcon,
//           },
//           {
//             path: "",
//             title: "Payment",
//             activeIcon: ActivePaymentsFlexiIcon,
//             inActiveIcon: InActivePaymentsFlexiIcon,
//           },
//           {
//             path: "",
//             title: "Documents",
//             activeIcon: ActiveDocumentFlexiIcon,
//             inActiveIcon: InActiveDocumentFlexiIcon,
//           },
//         ],
//       },
//       {
//         path: "",
//         title: "Quick Links",
//         activeIcon: ActiveQuickLinksIcon,
//         inActiveIcon: InActiveQuickLinksIcon,
//         subMenus: [
//           {
//             path: "https://www.avanse.com/disclaimer",
//             title: "Disclaimer",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//           {
//             path: "https://www.avanse.com/privacy-policy",
//             title: "Privacy Policy",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//           {
//             path: "https://www.avanse.com/terms-conditions",
//             title: "Terms & Conditions",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//           {
//             path: "https://www.avanse.com/grievance-redressal-mechanism#ombudsman-scheme",
//             title: "Ombudsman Scheme",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//           {
//             path: "https://www.avanse.com/viewPagesAssets/pdf/grievance-redressal-mechanism-2022.pdf",
//             title: "Customer Complaint",
//             activeIcon: ActiveApplicationIcon,
//             inActiveIcon: InActiveApplicationIcon,
//           },
//         ],
//       },
//     ];

//     const showTermLoan =
//       termLoanData?.TermLoan?.length > 0 &&
//       (businessType === "retail" || businessType === "entity" || tabType === "Term Loan");

//     const showFlexiLoan =
//       termLoanData?.Flexi?.length > 0 &&
//       (businessType === "flexi" || tabType === "Flexi Term Loan");

//     const filteredMenus = INTERNAL_MENUS.filter((menu) => {
//       if (menu.title === "Term Loan") return showTermLoan;
//       if (menu.title === "Flexi Loan") return showFlexiLoan;
//       return true;
//     });
    
//     if (!showTermLoan && !showFlexiLoan) {
//       const fallbackLoanMenu: MobileMenuItem = {
//         title: "Loans",
//         path: "/dashboard",
//         activeIcon: ActiveLoanFlexiIcon, 
//         inActiveIcon: InActiveLoanFlexiIcon,
//       };
//       filteredMenus.splice(1, 0, fallbackLoanMenu);
//     }

//     return filteredMenus;
//   }, [tabType, businessType, termLoanData]);



export default function CustomDrawerContent(props) {

      const INTERNAL_MENUS: MobileMenuItem[] = [
        {
          path: "",
          title: "Application",
          activeIcon: imagePath.application,
          inActiveIcon: imagePath.application,
          subMenus: [
            {
              path: "/application/existing-application",
              title: "Existing Applications",
              activeIcon: imagePath.application,
              inActiveIcon: imagePath.application,
            },
          ],
        },
        {
          path: "",
          title: "Term Loan",
          activeIcon: imagePath.leftNavTermLoan,
          inActiveIcon: imagePath.leftNavTermLoan,
          subMenus: [
            {
              path: "/dashboard",
              title: "Dashboard",
              activeIcon: imagePath.leftNavDashboard,
              inActiveIcon: imagePath.leftNavDashboard,
            },
            {
              path: "",
              title: "Disbursement",
              activeIcon: imagePath.fundRequest,
              inActiveIcon: imagePath.fundRequest,
            },
            {
              path: "",
              title: "Payment",
              activeIcon: imagePath.payment,
              inActiveIcon: imagePath.payment,
            },
            {
              path: "",
              title: "Documents",
              activeIcon: imagePath.document,
              inActiveIcon: imagePath.document,
            },
            {
              path: "",
              title: "History",
              activeIcon: imagePath.history,
              inActiveIcon: imagePath.history,
            },
          ],
        },
        {
          path: "",
          title: "Flexi Loan",
          activeIcon: imagePath.leftNavFlexiLoan,
          inActiveIcon: imagePath.leftNavFlexiLoan,
          subMenus: [
            {
              path: "/dashboard",
              title: "Loans",
              activeIcon: imagePath.loan,
              inActiveIcon: imagePath.loan,
            },
            {
              path: "",
              title: "Withdraw",
              activeIcon: imagePath.withdraw,
              inActiveIcon: imagePath.withdraw,
            },
            {
              path: "",
              title: "Payment",
              activeIcon: imagePath.payment,
              inActiveIcon: imagePath.payment,
            },
            {
              path: "",
              title: "Documents",
              activeIcon: imagePath.document,
              inActiveIcon: imagePath.document,
            },
          ],
        },
      ];

  const [expandedMenu, setExpandedMenu] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const { userProfile } = useSelector((state) => state.auth);
  const location = useGeoLocation();
  const dispatch = useDispatch();
  const businessType = useSelector((state: RootState) => state?.auth?.businessType?.name);
  const termLoanData = useSelector((state: RootState) => state?.auth?.loanCategory);

  let user_id = "";
  const { loanCategory } = useSelector(authSelector);
  const { Flexi = [], TermLoan = [] } = loanCategory || {};

  // Define state for the selected toggle
  const [alignment, setAlignment] = React.useState("Term Loan");

  const tabType = useSelector(
    (state: RootState) => state.tabs.tabType
  );

  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData
  );

  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );
  const otpUserData = useSelector((state: RootState) => state.auth.otpUserData);

  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const toggleMenu = (menuName) => {
    setExpandedMenu(menuName);
  };

  const toggleSubMenu = (subMenuName) => {
    setSelectedSubMenu(subMenuName);
  };

  const showTermLoan =
    termLoanData?.TermLoan?.length > 0 &&
    (businessType === "retail" ||
      businessType === "entity" ||
      tabType === "Term Loan");

  const showFlexiLoan =
    termLoanData?.Flexi?.length > 0 &&
    (businessType === "flexi" || tabType === "Flexi Term Loan");
    
  const handleLogout = async () => {
    // Add logout logic here
    console.log("Logout pressed");
    resetData();
    props.navigation.closeDrawer();

    //setAvatarMenuVisible(false);
    setItem(IS_LOGGED_IN, false);
    await analytics().setUserId(null);
    // await analytics().resetAnalyticsData();
    await analytics().resetAnalyticsData();
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Navigate BEFORE clearing. clearAsyncStoreAndReduxStore empties Redux, and
    // any dashboard still mounted would re-render against that empty store —
    // DashboardScreen would see zero loans, fall through to the Existing
    // Application view and flash its full-screen loader over the screen the user
    // is leaving. Resetting first unmounts it, so the clear happens off-screen.
    // The login screen is built for this: it caches mpinData in a ref precisely
    // because the store can be cleared while it is mounted.
    NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
    await clearAsyncStoreAndReduxStore();
  };

  const resetData = () => {
    setExpandedMenu(null);
    setSelectedSubMenu(null);
  }
  
  const openProfileScreen = () => {
    props.navigation.closeDrawer();
    NavigationService.navigate(navigationStrings.USER_PROFILE_SCREEN);
  };

  useEffect(() => {
    // Only run when user is logged in (userProfile exists)
    if (userProfile) {
      logger.debug("CustomDrawerContent initialized after login");
      if ((tabType === "Term Loan" || tabType == null) && TermLoan.length > 0) {
        toggleMenu("termLoan");
        toggleSubMenu("Dashboard");
      } else if (tabType === "Flexi Term Loan" && Flexi.length > 0) {
        toggleMenu("flexiLoan");
      } else if (Flexi.length === 0 && TermLoan.length === 0) {
        toggleMenu("application");
        toggleSubMenu("Existing Application");
      } else {
        toggleMenu("termLoan");
        toggleSubMenu("Dashboard");
      }
    }
  }, [userProfile, tabType, TermLoan.length, Flexi.length]);

  const handleSelect = async (route) => {
    props.navigation.closeDrawer();

    if (route === "New Application") {
      dispatch(setSelectedIndex(1.1));
      NavigationService.navigate(navigationStrings.NEW_APPLICATION_SCREEN);
    } else if (route === "Existing Application") {
      dispatch(setSelectedIndex(1.2));
      NavigationService.navigate(navigationStrings.EXISTING_APPLICATION_SCREEN);
    } else if (route === "Payment") {
      // Check if platform is Android or location is India
      const isAndroid = Platform.OS === "android";
      const isIndia =
        location?.country_name === "IN" || location?.country === "IN";
        
      if (isAndroid || isIndia) {
        const matchVal = dashboardDataSet?.find(
          (data: any) => data?.lanNumber === selectedLoanNumber
        );

        const allAccess = otpUserData?.altAccessFlag === true;

        if (!allAccess && (matchVal?.status || matchVal?.statusOfLoan) != "A") {
          dispatch(setSelectedIndex(0));
          dispatch(
            setStatusPopup({
              status: "No access",
              // message: `Disbursement requests are not permitted for this loan.`,
              message:
                "Payment requests are currently unavailable for this loan",
            })
          );
        } else {
          await analytics().setUserId(user_id);
          analytics().logEvent("Dashboard_Payment", { user_id: user_id });
          dispatch(setSelectedIndex(2));
          NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN, {
            screen: "Payment",
          });
          // NavigationService.navigate("Payment", {
          //   screen: "Payment",
          // });
        }
      } else {
        dispatch(
          setStatusPopup({
            status: "No access",
            message:
              strings.this_functionality_is_currently_unavailable_in_your_region,
          })
        );
      }
    } else if (route === "Documents") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_Documents", { user_id: user_id });
      NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN, {
        screen: "Document",
      });
      // NavigationService.navigate("Document", {
      //   screen: "Document",
      // });
    } else if (route === "Dashboard") {
      logger.debug(">>>>>>><<<<<<<<*********>>>>>>>>>((())))))******")
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_Dashboard", { user_id: user_id });
      NavigationService.resetTo(navigationStrings.DASHBOARD_SCREEN);
      // NavigationService.navigate("Dashboard", {
      //   screen: "Dashboard",
      // });
    } else if (route == "History") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_History", { user_id: user_id });
      NavigationService.navigate("DisbursementHistory");
    } else if (route == "Disbursement") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_Disbursement", { user_id: user_id });
      const matchVal = dashboardDataSet?.find(
        (data: any) => data?.lanNumber === selectedLoanNumber
      );

      // Check if user has all access privileges or loan is eligible for disbursement
      const allAccess = otpUserData?.altAccessFlag === true;
      const isLoanEligible =
        matchVal?.isExistDisbursementAllowdLoan === true &&
        (matchVal?.status || matchVal?.statusOfLoan) === "A";

      if (allAccess || isLoanEligible) {
        dispatch(setSelectedIndex(1));
        NavigationService.navigate(navigationStrings.REQUEST_FOR_DISBURSEMENT);
      } else {
        dispatch(setSelectedIndex(0));
        dispatch(
          setStatusPopup({
            status: "No access",
            message:
              "Disbursement requests are currently unavailable for this loan",
          })
        );
      }
    }
    logger.log("route", route);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      {/* Profile Section */}
      <View>
        <View
          style={[
            mainStyles.horizontalView,
            { justifyContent: "space-between", padding: 0 },
          ]}
        >
          <Image source={imagePath.leftNavLogo} />
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            activeOpacity={AppConstants.buttonActiveOpacity}
            style={{ padding: 0 }}
          >
            <Image source={imagePath.cross} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <View style={{ position: "relative" }}>
            {userProfile?.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.fallbackImage]}>
                <Text style={styles.fallbackText}>
                  {userProfile?.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={openProfileScreen}
            >
              <View style={styles.editIconContainer}>
                <Image source={imagePath.editIcon} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "column", marginStart: 15 }}>
            <Text style={styles.profileName}>
              {capitalizeFirstLetter(userProfile?.fullName)}
            </Text>
            <Text style={styles.profileEmail}>
              {decrypt(userProfile?.email)}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu Items Section */}
      <View style={styles.menuSection}>
        {/* Application */}
        <TouchableOpacity
          onPress={() => {
            toggleMenu("application");
          }}
          activeOpacity={AppConstants.textActiveOpacity}
          style={[
            styles.menuItem,
            { borderBottomWidth: expandedMenu === "application" ? 0 : 1 },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              source={imagePath.application}
              style={{
                tintColor:
                  expandedMenu === "application"
                    ? colors.appThemeColor
                    : colors.leftNavBarNameColor,
              }}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    expandedMenu === "application"
                      ? colors.appThemeColor
                      : colors.leftNavBarNameColor,
                },
              ]}
            >
              Application
            </Text>
          </View>
          <Image
            source={
              expandedMenu === "application"
                ? imagePath.leftNavUpArrow
                : imagePath.leftNavDownArrow
            }
          />
        </TouchableOpacity>
        {expandedMenu === "application" && (
          <View style={styles.subMenu}>
            {/* <TouchableOpacity
              onPress={() => {
                toggleSubMenu("New Application");
                handleSelect("New Application");
              }}
              activeOpacity={AppConstants.textActiveOpacity}
              style={[
                styles.subMenuItem,
                {
                  backgroundColor:
                    selectedSubMenu === "New Application"
                      ? "rgba(224, 224, 224, .5)"
                      : "transparent",
                },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  source={imagePath.newApplication}
                  style={{
                    tintColor:
                      selectedSubMenu === "New Application"
                        ? colors.appThemeColor
                        : colors.leftNavBarNameColor,
                  }}
                />
                <Text
                  style={[
                    styles.subMenuText,
                    {
                      color:
                        selectedSubMenu === "New Application"
                          ? colors.appThemeColor
                          : colors.leftNavBarNameColor,
                    },
                  ]}
                >
                  New Application
                </Text>
              </View>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => {
                toggleSubMenu("Existing Application");
                handleSelect("Existing Application");
              }}
              activeOpacity={AppConstants.textActiveOpacity}
              style={[
                styles.subMenuItem,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(238, 238, 242, 1)",
                  backgroundColor:
                    selectedSubMenu === "Existing Application"
                      ? "rgba(224, 224, 224, .5)"
                      : "transparent",
                },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  source={imagePath.newApplication}
                  style={{
                    tintColor:
                      selectedSubMenu === "Existing Application"
                        ? colors.appThemeColor
                        : colors.leftNavBarNameColor,
                  }}
                />
                <Text
                  style={[
                    styles.subMenuText,
                    {
                      color:
                        selectedSubMenu === "Existing Application"
                          ? colors.appThemeColor
                          : colors.leftNavBarNameColor,
                    },
                  ]}
                >
                  Existing Application
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Term Loan */}
        <>
          {showTermLoan && (
            <>
              <TouchableOpacity
                onPress={() => toggleMenu("termLoan")}
                activeOpacity={AppConstants.textActiveOpacity}
                style={[
                  styles.menuItem,
                  { borderBottomWidth: expandedMenu === "termLoan" ? 0 : 1 },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Image
                    source={imagePath.leftNavTermLoan}
                    style={{
                      tintColor:
                        expandedMenu === "termLoan"
                          ? colors.appThemeColor
                          : colors.leftNavBarNameColor,
                    }}
                  />

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          expandedMenu === "termLoan"
                            ? colors.appThemeColor
                            : colors.leftNavBarNameColor,
                      },
                    ]}
                  >
                    Term Loan
                  </Text>
                </View>
                <Image
                  source={
                    expandedMenu === "termLoan"
                      ? imagePath.leftNavUpArrow
                      : imagePath.leftNavDownArrow
                  }
                />
              </TouchableOpacity>
              {expandedMenu === "termLoan" && (
                <View style={styles.subMenu}>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Dashboard");
                      handleSelect("Dashboard");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.leftNavDashboard}
                        style={{
                          tintColor:
                            selectedSubMenu === "Dashboard"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Dashboard"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Dashboard
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      //toggleSubMenu("Disbursement");
                      handleSelect("Disbursement");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.fundRequest}
                        style={{
                          tintColor:
                            selectedSubMenu === "Disbursement"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Disbursement"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Fund Request
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Payment");
                      handleSelect("Payment");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.payment}
                        style={{
                          tintColor:
                            selectedSubMenu === "Payment"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Payment"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Payment
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Documents");
                      handleSelect("Documents");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.document}
                        style={{
                          tintColor:
                            selectedSubMenu === "Documents"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Documents"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Documents
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      //toggleSubMenu("History");
                      handleSelect("History");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={[
                      styles.subMenuItem,
                      {
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(238, 238, 242, 1)",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.history}
                        style={{
                          tintColor:
                            selectedSubMenu === "History"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "History"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        History
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </>

        {/* Flexi Loan */}
        <>
          {showFlexiLoan && (
            <>
              <TouchableOpacity
                onPress={() => toggleMenu("flexiLoan")}
                activeOpacity={AppConstants.textActiveOpacity}
                style={[
                  styles.menuItem,
                  { borderBottomWidth: expandedMenu === "flexiLoan" ? 0 : 1 },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Image
                    source={imagePath.leftNavFlexiLoan}
                    style={{
                      tintColor:
                        expandedMenu === "flexiLoan"
                          ? colors.appThemeColor
                          : colors.leftNavBarNameColor,
                    }}
                  />
                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          expandedMenu === "flexiLoan"
                            ? colors.appThemeColor
                            : colors.leftNavBarNameColor,
                      },
                    ]}
                  >
                    Flexi Loan
                  </Text>
                </View>
                <Image
                  source={
                    expandedMenu === "flexiLoan"
                      ? imagePath.leftNavUpArrow
                      : imagePath.leftNavDownArrow
                  }
                />
              </TouchableOpacity>
              {expandedMenu === "flexiLoan" && (
                <View style={styles.subMenu}>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Loan");
                      handleSelect("Loan");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.loan}
                        style={{
                          tintColor:
                            selectedSubMenu === "Loan"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Loan"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Loan
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Withdraw");
                      handleSelect("Withdraw");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.withdraw}
                        style={{
                          tintColor:
                            selectedSubMenu === "Withdraw"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Withdraw"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Withdraw
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Payments");
                      handleSelect("Payments");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={styles.subMenuItem}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.payment}
                        style={{
                          tintColor:
                            selectedSubMenu === "Payments"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Payments"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Payments
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      toggleSubMenu("Documents");
                      handleSelect("Documents");
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                    style={[
                      styles.subMenuItem,
                      {
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(238, 238, 242, 1)",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Image
                        source={imagePath.document}
                        style={{
                          tintColor:
                            selectedSubMenu === "Documents"
                              ? colors.appThemeColor
                              : colors.leftNavBarNameColor,
                        }}
                      />
                      <Text
                        style={[
                          styles.subMenuText,
                          {
                            color:
                              selectedSubMenu === "Documents"
                                ? colors.appThemeColor
                                : colors.leftNavBarNameColor,
                          },
                        ]}
                      >
                        Documents
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </>
      </View>

      {/* Logout Section */}
      <TouchableOpacity
        activeOpacity={AppConstants.textActiveOpacity}
        style={[
          styles.logoutSection,
          { flexDirection: "row", alignItems: "center", gap: 10 },
        ]}
        onPress={handleLogout}
      >
        <Image source={imagePath.leftNavLogout} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: 0,
    paddingVertical: 20,
    alignItems: "flex-start",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(238, 238, 242, 1)",
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 40,
  },
  editIconContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "rgba(245, 245, 245, 0.8)",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  editIcon: {
    width: 16,
    height: 16,
  },
  fallbackImage: {
    backgroundColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: colors.white,
    fontSize: 32,
    fontFamily: fonts.regular,
  },
  profileName: {
    marginTop: 0,
    fontSize: 15,
    marginTop: 2,
    fontFamily: fonts.medium,
    color: colors.leftNavBarNameColor,
  },
  profileEmail: {
    marginTop: 0,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.leftNavBarEmailColor,
  },
  menuSection: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(238, 238, 242, 1)",
  },
  menuText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    fontWeight: "400",
    color: colors.leftNavBarNameColor,
  },
  subMenu: {
    backgroundColor: "#fff",
  },
  subMenuItem: {
    paddingLeft: 50,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  subMenuText: {
    fontSize: 14,
  },
  logoutSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(238, 238, 242, 1)",
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    fontWeight: "400",
    color: "#DB4437",
  },
});
