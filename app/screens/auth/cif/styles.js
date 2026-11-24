import { Dimensions, Platform, StyleSheet } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import colors from "../../../res/colors";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  backTextStyle: {
    fontSize: moderateScale(18),
    color: colors.colorTextBlue,
  },
  safeArea: {
    flex: 1,
    // iOS ignores StatusBar backgroundColor; the top safe-area inset paints it
    backgroundColor:
      Platform.OS === "ios" ? colors.welcomeBgColor : colors.white,
  },
  backArrowStyle: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(300),
    //backgroundColor: colors.appThemeColor,
  },
  container: {
    backgroundColor: colors.white,
    height: 264
  },
    authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: 'stretch',
  },
});

export default styles;
