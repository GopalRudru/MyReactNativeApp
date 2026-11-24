import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, Dimensions } from "react-native";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import { moderateVerticalScale } from "react-native-size-matters";
import fonts from "../../res/fonts";
import AppConstants from "../../constant/AppConstants";
const { width, height } = Dimensions.get("window");
// const isSmallWidth = width < 400;
const isSmallHeight = height < 820;

const DEFAULT_HEIGHT = 54;

const AppStyleButton = ({
  title,
  onPress,
  btnStyle,
  textStyle,
  textColor = "white",
  imageNeeded = false,
  btnHeight = DEFAULT_HEIGHT,
  isDisabled = false,
  fontFamily = fonts.regular,
  marginTop = moderateVerticalScale(20),
  marginHorizontal = 0,
  accessibilityLabel,
  testID,
}) => {
  const handlePress = () => {
    if (typeof onPress === "function") {
      onPress(title);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { marginTop, marginHorizontal, height: btnHeight },
        btnStyle,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={AppConstants.buttonActiveOpacity}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          { color: isDisabled ? colors.colorDarkSolidBlack : textColor, fontFamily },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {imageNeeded && (
        <Image
          style={[
            styles.arrowImage,
            { tintColor: isDisabled ? colors.darkGreyTextColor : "white" },
          ]}
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
    borderRadius: 16,
    paddingHorizontal: 20,
    height: DEFAULT_HEIGHT,
  },
  text: {
    fontSize: isSmallHeight ? 14 : 16,
    marginRight: 8,
  },
  arrowImage: {
    height: 20,
    width: 20,
  },
});

export default React.memo(AppStyleButton);
