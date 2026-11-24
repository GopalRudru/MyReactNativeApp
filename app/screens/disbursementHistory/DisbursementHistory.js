import { Alert, BackHandler, SafeAreaView, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import Header from "../../components/common/Header";
import ListHeader from "../../components/ListHeader";
import * as NavigationService from "../../navigation/NavigationService";
import DisbursementCard from "../../components/DisbursementCard";
import AvatarMenu from "../dashboard/AvatarMenu";
import { useCallback, useState } from "react";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import navigationStrings from "../../constant/navigationStrings";
import { IS_LOGGED_IN, setItem } from "../../utils/storageUtils";
import AccountSelectorDropDown from "../dashboard/AccountSelectorDropDown";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import fonts from "../../res/fonts";
import logger from "../../utils/logger";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";

const lanDropdown = (
  <AccountSelectorDropDown
    labelText="Loan account number"
    buttonText=" N/A"
    isActive={""}
    backgroundColor="transparent"
    borderWidth="0px"
    marginTop="0px"
  />
);

const DisbursementHistory = () => {
  const [avatarMenuVisible, setAvatarMenuVisible] = useState(false);
  const navigation = useNavigation();

  const handleProfile = () => {
    setAvatarMenuVisible(false);
    // NavigationService.navigate(navigationStrings.PROFILE);
  };

  // Back always lands on Dashboard (same as RequestForDisbursement), not on
  // whatever screen the drawer navigation left below this one in the stack.
  const handleBackPress = () => {
    NavigationService.resetBackTo(navigationStrings.DASHBOARD_SCREEN);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        NavigationService.resetBackTo(navigationStrings.DASHBOARD_SCREEN);
        return true; // ⛔ block default back
      };

      // RN 0.77 removed BackHandler.removeEventListener; addEventListener
      // returns a subscription that is released via .remove().
      const backSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      navigation.setOptions({ gestureEnabled: false });
      return () => backSubscription.remove();
    }, []),
  );

  const handleLogout = async () => {
    setAvatarMenuVisible(false);
    setItem(IS_LOGGED_IN, false);
    await clearAsyncStoreAndReduxStore();
    //NavigationService.resetTo(navigationStrings.LOGIN);
    //NavigationService.resetTo(navigationStrings.WELCOME_SCREEN);
    NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        onAvatarPress={() => setAvatarMenuVisible(true)}
        backIconNeeded={true}
        onBackPress={handleBackPress}
      />
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ marginTop: 16, marginHorizontal: 16 }}>
              {/* <ListHeader
                rightText={"Disbursement History"}
                // leftText={props.showDisbursementHistory ? "" : "View all"}
                // onLeftTextPress={
                //   props.showDisbursementHistory ? "" : handleLeftTextPress
                // }
              /> */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#168794",
                  fontFamily: fonts.bold,
                }}
              >
                Disbursement History
              </Text>
            </View>
            <View style={{ marginTop: 0 }}>
              <ShadowCardComponent
                paddingHorizonatal={16}
                paddingVertical={16}
                marginVertical={16}
                marginHorizontal={16}
              >
                {lanDropdown}
              </ShadowCardComponent>
            </View>
            <DisbursementCard showDisbursementHistory={true} />
          </View>
          <CopyrightComponent />
        </ScrollView>
      </View>
      {avatarMenuVisible && (
        <AvatarMenu
          onProfilePress={handleProfile}
          onLogoutPress={handleLogout}
          onRequestClose={() => setAvatarMenuVisible(false)}
          visible={avatarMenuVisible}
        />
      )}
       <DialogStatusPopup />
    </SafeAreaView>
  );
};
export default DisbursementHistory;
