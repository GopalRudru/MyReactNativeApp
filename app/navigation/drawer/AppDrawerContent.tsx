import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useSelector } from "react-redux";
import analytics from "@react-native-firebase/analytics";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import AppConstants from "../../constant/AppConstants";
import mainStyles from "../../res/mainStyles";
import { decrypt } from "../../utils/crypto";
import {
  clearAsyncStoreAndReduxStore,
  setItem,
  IS_LOGGED_IN,
} from "../../utils/storageUtils";
import * as NavigationService from "../NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import { RootState } from "../../services/redux/store";
import ExpandableMenu from "./ExpandableMenu";
import useDrawerMenu from "./useDrawerMenu";

const capitalizeFirstLetter = (value?: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function AppDrawerContent(props: any) {
  const { userProfile } = useSelector((state: RootState) => state.auth);

  const {
    sections,
    expandedSectionId,
    activeItemId,
    handleSectionPress,
    handleItemPress,
    resetMenuState,
  } = useDrawerMenu(() => props.navigation.closeDrawer());

  const handleLogout = async () => {
    resetMenuState();
    props.navigation.closeDrawer();
    setItem(IS_LOGGED_IN, false);
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

  const openProfileScreen = () => {
    props.navigation.closeDrawer();
    NavigationService.navigate(navigationStrings.USER_PROFILE_SCREEN);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
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
          >
            <Image source={imagePath.cross} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={openProfileScreen}
            >
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
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={openProfileScreen}
            >
              <View style={styles.editIconContainer}>
                <Image source={imagePath.editIcon} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              marginStart: 15,
            }}
          >
            <TouchableOpacity
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={openProfileScreen}
              style={{ paddingBottom: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={styles.profileName}>
                    {capitalizeFirstLetter(userProfile?.fullName)}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {decrypt(userProfile?.email)}
                  </Text>
                </View>
                <Image source={imagePath.blackBack} style={{ transform: [{ rotate: '180deg' }] }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <ExpandableMenu
          sections={sections}
          expandedSectionId={expandedSectionId}
          activeItemId={activeItemId}
          onSectionPress={handleSectionPress}
          onItemPress={handleItemPress}
        />
      </View>

      <TouchableOpacity
        activeOpacity={AppConstants.textActiveOpacity}
        style={styles.logoutSection}
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
    fontSize: 15,
    marginTop: 2,
    fontFamily: fonts.medium,
    color: colors.leftNavBarNameColor,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.leftNavBarEmailColor,
  },
  menuSection: {
    flex: 1,
    paddingTop: 10,
  },
  logoutSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(238, 238, 242, 1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    fontWeight: "400",
    color: "#DB4437",
  },
});
