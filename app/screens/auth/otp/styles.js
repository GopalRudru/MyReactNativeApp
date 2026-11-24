import { Dimensions, Platform, StyleSheet } from "react-native";
import colors from "../../../res/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import fonts from "../../../res/fonts";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContentContainer: {
    justifyContent: 'space-between',
    flex: 1, 
    paddingTop: 0
  },
  safeArea: {
    flex: 1,
    // iOS ignores StatusBar backgroundColor; the top safe-area inset paints it
    backgroundColor:
      Platform.OS === "ios" ? colors.welcomeBgColor : colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heading: {
    fontSize: moderateScale(18),
    fontWeight: 600,
    marginBottom: verticalScale(10),
    color: colors.headerTextColor,
  },
  subheading: {
    fontSize: moderateScale(13),
    color: colors.subHeaderTextColor,
    marginBottom: verticalScale(20),
    fontWeight: 400,
  },
  link: {
    color: colors.appThemeColor,
    fontWeight: 500,
  },
  label: {
    fontSize: moderateScale(15),
    marginBottom: verticalScale(8),
    //fontWeight: '400',
    color: colors.headerTextColor,
    fontFamily: fonts.regular,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  otpInput: {
    fontSize: moderateScale(16),
    fontWeight: "400",
    fontFamily: fonts.regular,
  },
  filledInput: {
    borderColor: colors.appThemeColor,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timerText: {
    fontSize: 16,
    color: colors.timerTextColor,
    //fontWeight: '500',
    fontFamily: fonts.medium,
  },
  resendText: {
    fontSize: 14,
    color: colors.appThemeColor,
    //fontWeight: '500',
    fontFamily: fonts.medium,
  },
  disabledText: {
    color: colors.disabledTextColor,
  },
  changeCIF: {
    fontSize: 14,
    color: colors.appThemeColor,
    //fontWeight: 'bold',
    fontFamily: fonts.medium,
    textAlign: "center",
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(300),
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },
  descriptionText: {
    fontSize: 14,
    color: "#757575", // text.secondary equivalent
    // marginBottom: 16,
  },
  highlightText: {
    fontWeight: "600",
    color: "#00b3b5",
  },
});

export default styles;
