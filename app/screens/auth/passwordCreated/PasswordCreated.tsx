import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import BackgroundImages from "../../../components/backgroundImages";
import ShadowCardComponent from "../../../components/ShadowCardComponent";
import AuthTitleTextComponent from "../../../components/AuthTitleTextComponent";
import { string } from "yup";
import { moderateVerticalScale } from "react-native-size-matters";
import AuthSubTitleTextComponent from "../../../components/AuthSubTitleTextComponent";
import strings from "../../../res/strings";
import CustomButton from "../../../components/CustomButton";
import imagePath from "../../../constant/imagePath";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

const PasswordCreated = () => {
  const onLoginClick = () => {
    NavigationService.resetTo(navigationStrings.LOGIN);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackgroundImages />
          <ShadowCardComponent
            paddingHorizonatal={24}
            paddingVertical={40}
            marginVertical={16}
          >
            <Image source={imagePath.success} style={{ alignSelf: "center" }} />

            <AuthTitleTextComponent
              text={strings.password_successfully_created}
              textStyle={{ marginTop: moderateVerticalScale(30) }}
            />

            <AuthSubTitleTextComponent
              text={strings.now_you_can_securely_access_your_accout}
              textStyle={{
                marginTop: moderateVerticalScale(10),
                marginBottom: moderateVerticalScale(10),
              }}
            />

            <CustomButton title={strings.login} onPress={onLoginClick} />
          </ShadowCardComponent>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PasswordCreated;
