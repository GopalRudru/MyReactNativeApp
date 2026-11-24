import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import imagePath from "../../constant/imagePath";
import AppConstants from "../../constant/AppConstants";

const SmallButtonComponent = ({ title, disabled, onPress, imageNotNeeded }) => {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.buttonDisabled,
          {
            backgroundColor: disabled
              ? colors.disabledBackGroundColor
              : colors.appThemeColor,
            borderColor: disabled
              ? colors.disabledBackGroundColor
              : colors.appThemeColor,
          },
        ]}
        activeOpacity={AppConstants.buttonActiveOpacity}
        onPress={() => {
          if (disabled) return;
          onPress();
        }}
      >
        <Text
          style={
            disabled
              ? styles.buttonDisabledTextStyle
              : styles.buttonEbanledTextStyle
          }
        >
          {title}
        </Text>
        {!imageNotNeeded && (
          <Image
            source={imagePath.forwardArrow}
            style={{
              height: 10,
              width: 20,
              marginLeft: 5,
              tintColor: disabled ? "#BBBBBB" : colors.white,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SmallButtonComponent;

const styles = StyleSheet.create({
  buttonDisabled: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.appThemeColor,
  },
  buttonDisabledTextStyle: {
    color: "#BBBBBB",
    fontFamily: fonts.regular,
  },
  buttonEbanledTextStyle: {
    color: colors.white,
    fontFamily: fonts.regular,
  },
});
