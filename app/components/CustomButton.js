import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import { moderateVerticalScale, scale } from "react-native-size-matters";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";
// import {IMAGE_CONTANT_RES} from '../utils/constant/ImageConstant';

const CustomButton = ({
  title,
  onPress,
  backgroundColor,
  textColor = "white",
  imageNeeded,
  logoutImage,
  isDisabled,
  fontFamily = fonts.regular,
  marginTop = moderateVerticalScale(20),
  marginHorizontal = 0,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? colors.disabledBackGroundColor
            : colors.appThemeColor,
          marginTop: marginTop,
          marginHorizontal: marginHorizontal,
        },
      ]}
      onPress={() => onPress(title)}
      disabled={isDisabled || false}
      activeOpacity={AppConstants.buttonActiveOpacity}
    >
      <View style={styles.imageView}>
        <Text
          style={[
            styles.text,
            {
              color: isDisabled ? colors.darkGreyTextColor : textColor,
              fontFamily: fontFamily,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      {imageNeeded && (
        <Image
          style={{
            height: 20,
            width: 20,
            tintColor: isDisabled ? colors.darkGreyTextColor : "white",
          }}
          resizeMode={"contain"}
          source={imagePath.forwardArrow}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateVerticalScale(10),
    borderRadius: 6,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    marginRight: 8,
  },
  imageView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowView: {
    height: 11,
    width: 12,
  },
});

export default CustomButton;
