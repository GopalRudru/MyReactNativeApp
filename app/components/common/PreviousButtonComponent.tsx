import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import imagePath from "../../constant/imagePath";
import strings from "../../res/strings";
import AppConstants from "../../constant/AppConstants";

const PreviousButtonComponent = ({ title, disabled, onPress }) => {
  const handlePreviousPress = () => {};
  return (
    <View>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={AppConstants.buttonActiveOpacity}
        onPress={() => onPress()}
      >
        <Image
          source={imagePath.backArrow}
          style={{
            height: 10,
            width: 20,
            marginRight: 10,
            tintColor: colors.appThemeColor,
          }}
        />
        <Text
          style={{
            color: colors.appThemeColor,
            fontFamily: fonts.regular,
          }}
        >
          {strings.previous}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PreviousButtonComponent;

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 20,
  },
});
