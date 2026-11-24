import { StyleSheet, Dimensions, Platform } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import colors from "../../../res/colors";
import AppConstants from "../../../constant/AppConstants";
import fonts from "../../../res/fonts";
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    // iOS ignores StatusBar backgroundColor; the top safe-area inset paints it
    backgroundColor:
      Platform.OS === "ios" ? colors.welcomeBgColor : colors.white,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.appThemeColor,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
    height: scale(55),
  },
  selectedContainer: {
    backgroundColor: colors.containerSelected,
  },
  iconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(6),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(16),
    marginLeft: moderateScale(6),
  },
  optionContainerIcon: {
    width: scale(32),
    height: scale(32),
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.loginTypeTextColor,
    fontWeight: "400",
    fontFamily: fonts.regular,
  },
  rbSelectedIconStyle: {
    width: scale(18),
    height: scale(18),
    alignSelf: "center",
    marginRight: moderateScale(16),
    flex: 1,
  },
  radioCircle: {
    width: scale(18),
    height: scale(18),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(16),
  },
  radioDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: moderateScale(6),
    backgroundColor: colors.appThemeColor,
  },
  continueBtn: {
    marginTop: verticalScale(24),
    backgroundColor: colors.appThemeColor,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    alignItems: "center",
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(250),
  },
    authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: 'stretch',
    backgroundColor: colors.white
  },
});

export default styles;
