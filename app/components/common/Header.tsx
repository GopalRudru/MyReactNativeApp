import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import imagePath from "../../constant/imagePath";
import { authSelector, setMpinData } from "../../services/redux/slices/authSlice";
import { useSelector } from "react-redux";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import AppConstants from "../../constant/AppConstants";
import CustomMenuModal from "../CustomMenuModal";
import * as NavigationService from "../../navigation/NavigationService";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import AvatarMenu from "../../screens/dashboard/AvatarMenu";
import {
  clearAsyncStoreAndReduxStore,
  IS_LOGGED_IN,
  setItem,
} from "../../utils/storageUtils";
import navigationStrings from "../../constant/navigationStrings";
import { useDispatch } from "react-redux";
import { setSelectedIndex } from "../../services/redux/slices/tabsSlice";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import { RootState, store } from "../../services/redux/store";
import analytics from "@react-native-firebase/analytics";
import NotificationModal from "../NotificationModal";
import { notificationSelector } from "../../services/redux/slices/notificationSlice";
import { decrypt } from "../../utils/crypto";
import logger from "../../utils/logger";
import useGeoLocation from "react-ipgeolocation";
import strings from "../../res/strings";
import { enableBiometricAuth, isBiometricEnabled } from "../../screens/auth/mpinBiometric/BiometricUtils";

const menuItems = [
  { label: "Dashboard", route: "Dashboard" },
  { label: "Fund Request", route: "Disbursement" },
  { label: "Payment", route: "Payment" },
  { label: "Documents", route: "Documents" },
  { label: "History", route: "History" },
];

const data = [
  {
    message: "The tranche disbursement request raised …",
    time: "06-06-2025 11:56:57 AM",
  },
  {
    message: "The tranche disbursement request raised …",
    time: "05-06-2025 05:28:27 AM",
  },
  {
    message: "The tranche disbursement request raised …",
    time: "04-06-2025 02:12:45 PM",
  },
  {
    message: "The tranche disbursement request raised …",
    time: "03-06-2025 09:45:30 AM",
  },
  {
    message: "The tranche disbursement request raised …",
    time: "02-06-2025 06:39:16 AM",
  },
  {
    message: "This one won't show since limit is 5",
    time: "01-06-2025 10:00:00 AM",
  },
];
const Header = ({
  onMenuPress,
  onAvatarPress,
  backIconNeeded,
  showProfile = true,
  showNotification = true,
  onBackPress,
  onNotiIconPress,
  setIsLoggedOut,
}) => {
  const { userProfile, businessType } = useSelector(authSelector);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [avatarMenuVisible, setAvatarMenuVisible] = useState(false);
  const dispatch = useDispatch();
  const { unreadCount } = useSelector(notificationSelector);
  const location = useGeoLocation();

  // Helper function to validate profile image URL
  const isValidImageUrl = (url: string | undefined | null) => {
    return (
      url &&
      typeof url === "string" &&
      url.trim() !== "" &&
      url !== "null" &&
      url !== "undefined"
    );
  };

  const handleHamburgerPress = () => {
    Keyboard.dismiss();
    navigation.openDrawer();
  };

  const handleProfile = () => {
    setAvatarMenuVisible(false);
    NavigationService.navigate(navigationStrings.USER_PROFILE_SCREEN);
  };

  const dashboardDataSet = useSelector(
    (state: RootState) => state.dashboardData.sanctionedDisbursedData
  );
  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );
  const otpUserData = useSelector((state: RootState) => state.auth.otpUserData);

  let user_id = "";
  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const handleSelect = async (route) => {
    if (route === "Payment") {
      // Check if platform is Android or location is India
      // const isAndroid = Platform.OS === "android";
      // const isIndia = location?.country_name === "IN" || location?.country === "IN";
      //const remoteCif = firebaseRemoteConfigService.getString('remote_cif');

      // if (!isAndroid && remoteCif == decrypt(userProfile?.cifNumber)) {
      //   dispatch(
      //     setStatusPopup({
      //       status: "No access",
      //       message:
      //         strings.this_functionality_is_currently_unavailable_in_your_region,
      //     })
      //   );

      //   return;
      // }

      // if (isAndroid || isIndia) {
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
          NavigationService.navigate("Payment", {
            screen: "PaymentScreen", // this is the internal screen in the Payments stack
          });
        }
      // } else {
      //   dispatch(
      //     setStatusPopup({
      //       status: "No access",
      //       message:
      //         strings.this_functionality_is_currently_unavailable_in_your_region,
      //     })
      //   );
      // }
    } else if (route === "Documents") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_Documents", { user_id: user_id });
      NavigationService.navigate("Document", {
        screen: "DocumentScreen",
      });
    } else if (route === "Dashboard") {
      await analytics().setUserId(user_id);
      analytics().logEvent("Dashboard_Dashboard", { user_id: user_id });
      NavigationService.navigate("Dashboard", {
        screen: "DashboardScreen",
      });
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

  const handleLogout = async () => {
    try {
      setIsLoggedOut?.(true);
    } catch (error) {
      logger.error("Error during logout process", { error });
    }
    setAvatarMenuVisible(false);
    await setItem(IS_LOGGED_IN, false);
    await analytics().setUserId(null);
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

  return (
    <View style={styles.headerContainer}>
      {/* Menu Icon */}
      {backIconNeeded ? (
        <TouchableOpacity
          onPress={onBackPress}
          activeOpacity={AppConstants.buttonActiveOpacity}
        >
          <Image
            source={imagePath.back} // Replace with actual image URL
            style={{ height: 24, width: 24 }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={AppConstants.buttonActiveOpacity}
          onPress={() => {
            handleHamburgerPress();
          }}
        >
          <Image
            source={imagePath.menu} // Replace with actual image URL
            style={{ height: 24, width: 24 }}
          />
        </TouchableOpacity>
      )}

      {/* Center Logo */}
      <Image source={imagePath.logo} style={styles.logo} resizeMode="contain" />

      {/* Right Icons */}
      <View style={styles.rightIcons}>
        {showNotification && (
          <View style={{}}>
            <TouchableOpacity
              onPress={() => setNotificationVisible(true)}
              style={styles.iconSpacing}
            >
              <Image
                source={imagePath.bell} // Replace with actual image URL
                style={{ height: 24, width: 24, marginTop: 10 }}
              />
            </TouchableOpacity>
            {unreadCount > 0 &&
              (Platform.OS === "ios" ? (
                // iOS only: RCTText does not round its own background, so the
                // badge painted as a square. Move the circle onto a wrapping
                // View (which does honour borderRadius) and let the Text just
                // carry the number. Android keeps the original Text styling.
                <View
                  style={{
                    backgroundColor: colors.red,
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    top: 0,
                    right: 2,
                  }}
                >
                  <Text
                    style={{
                      color: colors.white,
                      textAlign: "center",
                      fontFamily: fonts.semiBold,
                      fontSize: 10,
                    }}
                  >
                    {unreadCount}
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    backgroundColor: colors.red,
                    borderRadius: 20,
                    color: colors.white,
                    width: 20,
                    height: 20,
                    textAlign: "center",
                    lineHeight: 20,
                    fontFamily: fonts.semiBold,
                    fontSize: 10,
                    position: "absolute",
                    top: 0,
                    right: 2,
                  }}
                >
                  {unreadCount}
                </Text>
              ))}
          </View>
        )}

        {
          /*showProfile*/ false && (
            <TouchableOpacity
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={() => {
                setAvatarMenuVisible(true);
              }}
            >
              {imageLoadFailed ? (
                <View style={styles.fallbackImage}>
                  <Text style={styles.fallbackText}>
                    {userProfile?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <>
                  {!userProfile?.profileImage ? (
                    <View style={styles.fallbackImage}>
                      <Text style={styles.fallbackText}>
                        {userProfile?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <>
                      {isValidImageUrl(userProfile?.profileImage) ? (
                        <Image
                          source={{ uri: userProfile?.profileImage }}
                          style={styles.avatar}
                          onError={() => {
                            setImageLoadFailed(true);
                          }}
                          onLoadStart={() => {}}
                          onLoadEnd={() => {
                            setImageLoadFailed(false);
                          }}
                          onLoad={() => {
                            setImageLoadFailed(false);
                          }}
                        />
                      ) : (
                        <View style={styles.fallbackImage}>
                          <Text style={styles.fallbackText}>
                            {userProfile?.name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </TouchableOpacity>
          )
        }
      </View>
      <CustomMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={handleSelect}
        menuItems={menuItems}
      />

      <NotificationModal
        visible={notificationVisible}
        setNotificationVisible={setNotificationVisible}
        onClose={() => setNotificationVisible(false)}
        data={data}
        onViewAll={() => {
          setNotificationVisible(false);
          NavigationService.navigate(navigationStrings.NOTIFICATION_SCREEN);
        }}
      />

      {/* {avatarMenuVisible && ( */}
      <AvatarMenu
        onProfilePress={handleProfile}
        onLogoutPress={handleLogout}
        onRequestClose={() => setAvatarMenuVisible(false)}
        visible={avatarMenuVisible}
      />
      {/* )} */}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    height: 35,
    width: 150,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  fallbackImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 20,
  },
});
