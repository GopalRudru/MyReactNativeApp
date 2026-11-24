import React from "react";
import { Text, StyleSheet, Image, TouchableOpacity, View } from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";
import imagePath from "../constant/imagePath";
import strings from "../res/strings";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import * as NavigationService from "../navigation/NavigationService";
import { RootState } from "../services/redux/store";
import AppConstants from "../constant/AppConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cleardisbursementButtonSlice,
  setdisbursementButtonValue,
} from "../services/redux/slices/disbursementButtonSlice";
import { decrypt } from "../utils/crypto";
import { createModuleLogger } from "../utils/logger";
import navigationStrings from "../constant/navigationStrings";

const DisbursementFormThanksPage: React.FC = () => {
  const dispatch = useDispatch();
  const emailId: any = useSelector(
    (state: RootState) => state?.auth?.userProfile?.email,
  );
  const logger = createModuleLogger("DisbursementFormThanksPage");

  return (
    <View style={styles.container}>
      <Image
        source={imagePath.disbursementSuccess}
        style={styles.icon}
        resizeMode="contain"
      />

      <Text style={styles.title}>{strings.Thank_You}</Text>

      <Text style={styles.subTitle}>{strings.Disbursement_placed}</Text>

      <Text style={styles.message}>
        {strings.We_sent_an_email_to}
        {"\n"}
        <Text style={styles.email}>{decrypt(emailId)}</Text>{" "}
        {strings.disbursement_description}
      </Text>

      <TouchableOpacity
        style={styles.linkButton}
        activeOpacity={AppConstants.buttonActiveOpacity}
        onPress={() => {
          AsyncStorage.removeItem("activeFormStep");
          dispatch(cleardisbursementButtonSlice());
          dispatch(setdisbursementButtonValue(""));
          NavigationService.navigate(
            navigationStrings.REQUEST_FOR_DISBURSEMENT,
            {
              showFeedback: true,
            },
          );
          // NavigationService.goBack();
        }}
      >
        <Text style={styles.linkText}>{strings.Back_to_Dashboard}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DisbursementFormThanksPage;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.subHeaderTextColor,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  email: {
    fontSize: 14,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
    color: colors.subHeaderTextColor,
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.appThemeColor,
  },
});
