import { StatusBar, StyleSheet, Text, View } from "react-native";
import React from "react";
import AuthTitleTextComponent from "../../components/AuthTitleTextComponent";
import strings from "../../res/strings";
import AuthSubTitleTextComponent from "../../components/AuthSubTitleTextComponent";
import CustomButton from "../../components/CustomButton";
import colors from "../../res/colors";
import * as NavigationService from "../../navigation/NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import { IS_SESSION_TIME_OUT, setItem } from "../../utils/storageUtils";

const SessionTimeout = () => {

  const handleLoginbtn = () => {
    NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
    // Reset the sessionExpired flag to prevent multiple navigations
    setItem(IS_SESSION_TIME_OUT, false);
  };
  
  return (
    <View style={styles.containerStyle}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <View style={styles.contentStyle}>
        <AuthTitleTextComponent
          text={strings.session_time_out}
          textStyle={styles.titleTextStyle}
        />

        <AuthSubTitleTextComponent
          text={strings.session_has_got_timed_out_please_login_again}
          textStyle={styles.subTitleTextStyle}
        />
        <CustomButton title={strings.login} onPress={handleLoginbtn} />
      </View>
      <CopyrightComponent />
      <DialogStatusPopup />
    </View>
  );
};

export default SessionTimeout;

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  contentStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextStyle: {
    fontSize: 40,
  },
  subTitleTextStyle: {
    marginTop: 24,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 50,
  },
});
